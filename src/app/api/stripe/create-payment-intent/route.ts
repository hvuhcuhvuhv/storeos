import Stripe from "stripe";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PaymentIntentBody {
  amount: number;
  currency?: string;
  storeId?: string;
  storeName?: string;
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json(
      { error: "الدفع بالبطاقة غير مفعّل حالياً" },
      { status: 503 }
    );
  }

  let body: PaymentIntentBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const { amount, currency = "aed", storeId, storeName } = body;

  if (!amount || amount <= 0) {
    return Response.json({ error: "المبلغ غير صالح" }, { status: 400 });
  }
  if (!storeId) {
    return Response.json({ error: "المتجر غير محدّد" }, { status: 400 });
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    return Response.json({ error: "المتجر غير موجود" }, { status: 404 });
  }
  if (!store.stripeAccountId) {
    return Response.json(
      { error: "هذا المتجر لم يُفعّل استلام المدفوعات بعد" },
      { status: 409 }
    );
  }

  const stripe = new Stripe(secretKey);

  // تحقق حيّ من تفعيل الاستلام (self-heal للحالة القديمة في قاعدة البيانات)
  let onboarded = store.stripeOnboarded;
  if (!onboarded) {
    try {
      const account = await stripe.accounts.retrieve(store.stripeAccountId);
      onboarded = account.capabilities?.transfers === "active";
      if (onboarded) {
        await prisma.store.update({
          where: { id: store.id },
          data: { stripeOnboarded: true },
        });
      }
    } catch {
      /* تجاهل ونعتمد القيمة الحالية */
    }
  }
  if (!onboarded) {
    return Response.json(
      { error: "هذا المتجر لم يُفعّل استلام المدفوعات بعد" },
      { status: 409 }
    );
  }

  // عمولة المنصة (اختيارية) — نسبة مئوية من قيمة الطلب
  const feePercent = Number(process.env.PLATFORM_FEE_PERCENT || 0);
  const amountInCents = Math.round(amount * 100);
  const applicationFeeAmount =
    feePercent > 0 ? Math.round((amountInCents * feePercent) / 100) : 0;

  try {

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      transfer_data: { destination: store.stripeAccountId },
      ...(applicationFeeAmount > 0
        ? { application_fee_amount: applicationFeeAmount }
        : {}),
      metadata: {
        storeId,
        storeName: storeName ?? store.name,
      },
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
