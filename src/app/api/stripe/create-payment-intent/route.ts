import Stripe from "stripe";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PaymentIntentBody {
  amount: number;
  secretKey: string;
  currency?: string;
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  let body: PaymentIntentBody;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const { amount, secretKey, currency = "aed", metadata } = body;

  if (!secretKey || !secretKey.startsWith("sk_")) {
    return Response.json(
      { error: "المفتاح السري لـ Stripe غير صالح" },
      { status: 400 }
    );
  }

  if (!amount || amount <= 0) {
    return Response.json({ error: "المبلغ غير صالح" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: metadata ?? {},
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : "تعذر إنشاء عملية الدفع";
    return Response.json({ error: message }, { status: 502 });
  }
}
