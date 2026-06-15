import Stripe from "stripe";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function originOf(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    new URL(request.url).origin
  );
}

/** حالة ربط حساب الاستلام للمتجر الحالي (يُحدّث من Stripe) */
export async function GET() {
  const me = await getAuthUser();
  if (!me) return jsonError("غير مصرّح", 401);

  const store = await prisma.store.findUnique({ where: { ownerId: me.id } });
  if (!store) return jsonError("لا يوجد متجر مرتبط بحسابك", 404);

  if (!store.stripeAccountId) {
    return Response.json({ connected: false, onboarded: false });
  }

  const stripe = getStripe();
  if (!stripe) return jsonError("الدفع غير مفعّل على المنصة", 503);

  try {
    const account = await stripe.accounts.retrieve(store.stripeAccountId);
    // حساب المتجر "مستلِم" (transfers فقط)، لذا نعتمد على تفعيل صلاحية التحويل
    const onboarded = account.capabilities?.transfers === "active";

    if (onboarded !== store.stripeOnboarded) {
      await prisma.store.update({
        where: { id: store.id },
        data: { stripeOnboarded: onboarded },
      });
    }

    return Response.json({
      connected: true,
      onboarded,
      detailsSubmitted: Boolean(account.details_submitted),
    });
  } catch {
    return Response.json({ connected: true, onboarded: store.stripeOnboarded });
  }
}

/** إنشاء/متابعة تسجيل حساب الاستلام عبر Stripe Connect (Express)
 *  - صاحب المتجر: يربط متجره الخاص
 *  - الأدمن: يمرّر storeId ليولّد رابط الربط لأي متجر */
export async function POST(request: NextRequest) {
  const me = await getAuthUser();
  if (!me) return jsonError("غير مصرّح", 401);

  let reqBody: { storeId?: string } = {};
  try {
    reqBody = await request.json();
  } catch {
    /* لا body */
  }

  const store =
    me.role === "admin" && reqBody.storeId
      ? await prisma.store.findUnique({ where: { id: reqBody.storeId } })
      : await prisma.store.findUnique({ where: { ownerId: me.id } });

  if (!store) return jsonError("المتجر غير موجود", 404);

  const stripe = getStripe();
  if (!stripe) return jsonError("الدفع غير مفعّل على المنصة", 503);

  try {
    let accountId = store.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: process.env.STRIPE_CONNECT_COUNTRY || "AE",
        email: store.ownerEmail || me.email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: { storeId: store.id },
      });
      accountId = account.id;
      await prisma.store.update({
        where: { id: store.id },
        data: { stripeAccountId: accountId },
      });
    }

    const origin = originOf(request);
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/settings?connect=refresh`,
      return_url: `${origin}/dashboard/settings?connect=done`,
      type: "account_onboarding",
    });

    return Response.json({ url: link.url });
  } catch (err) {
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : "تعذر بدء ربط حساب الاستلام";
    return jsonError(message, 502);
  }
}
