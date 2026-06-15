import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serialize";
import { getAuthUser, jsonError } from "@/lib/api-helpers";
import { DELIVERY_FEE } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const me = await getAuthUser();
  if (!me) return jsonError("غير مصرّح", 401);

  const storeId = request.nextUrl.searchParams.get("storeId");

  // الأدمن يرى كل الطلبات؛ صاحب المتجر يرى متجره فقط
  const where =
    me.role === "admin"
      ? storeId
        ? { storeId }
        : {}
      : { store: { ownerId: me.id } };

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ orders: orders.map(serializeOrder) });
}

// إنشاء طلب (عام — من صفحة المتجر عند الدفع)
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("طلب غير صالح");
  }

  const storeId = String(body.storeId ?? "");
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return jsonError("المتجر غير موجود", 404);

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems
    .map((it) => it as Record<string, unknown>)
    .filter((it) => it.productId && it.productName)
    .map((it) => ({
      productId: String(it.productId),
      productName: String(it.productName),
      quantity: Math.max(1, Number(it.quantity) || 1),
      price: Number(it.price) || 0,
    }));

  if (items.length === 0) return jsonError("لا توجد منتجات في الطلب");

  const customerName = String(body.customerName ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  if (!customerName || !customerPhone)
    return jsonError("اسم العميل ورقم الهاتف مطلوبان");

  // نحسب المجموع على الخادم لمنع التلاعب: مجموع المنتجات + رسوم التوصيل
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const order = await prisma.order.create({
    data: {
      storeId,
      customerName,
      customerEmail: String(body.customerEmail ?? "").trim(),
      customerPhone,
      customerCity: String(body.customerCity ?? "").trim() || null,
      customerAddress: String(body.customerAddress ?? "").trim() || null,
      deliveryFee,
      total,
      status: "pending",
      items: { create: items },
    },
    include: { items: true },
  });

  return Response.json({ order: serializeOrder(order) });
}
