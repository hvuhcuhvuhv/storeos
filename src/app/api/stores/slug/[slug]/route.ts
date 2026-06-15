import Stripe from "stripe";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeStore, serializeProduct } from "@/lib/serialize";
import { getStoreStatsById, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** يحدّث حالة الاستلام من Stripe إن كان الحساب مربوطاً ولم يُكتمل بعد (self-heal) */
async function refreshOnboarded(store: {
  id: string;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
}) {
  if (!store.stripeAccountId || store.stripeOnboarded) return store.stripeOnboarded;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return store.stripeOnboarded;
  try {
    const stripe = new Stripe(key);
    const account = await stripe.accounts.retrieve(store.stripeAccountId);
    const onboarded = account.capabilities?.transfers === "active";
    if (onboarded) {
      await prisma.store.update({
        where: { id: store.id },
        data: { stripeOnboarded: true },
      });
    }
    return onboarded;
  } catch {
    return store.stripeOnboarded;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });

  if (!store) return jsonError("المتجر غير موجود", 404);

  store.stripeOnboarded = await refreshOnboarded(store);

  const stats = await getStoreStatsById(store.id);

  return Response.json({
    store: serializeStore(store, stats),
    products: store.products.map(serializeProduct),
  });
}
