import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { getAuthUser, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get("storeId");
  if (!storeId) return jsonError("storeId مطلوب");

  const products = await prisma.product.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ products: products.map(serializeProduct) });
}

export async function POST(request: NextRequest) {
  const me = await getAuthUser();
  if (!me) return jsonError("غير مصرّح", 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("طلب غير صالح");
  }

  const storeId = String(body.storeId ?? "");
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return jsonError("المتجر غير موجود", 404);
  if (me.role !== "admin" && store.ownerId !== me.id)
    return jsonError("غير مصرّح", 403);

  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  if (!name || !Number.isFinite(price) || price < 0)
    return jsonError("الاسم والسعر مطلوبان");

  const images = Array.isArray(body.images)
    ? (body.images as unknown[]).filter((x): x is string => typeof x === "string")
    : [];

  const product = await prisma.product.create({
    data: {
      storeId,
      name,
      description: String(body.description ?? ""),
      price,
      compareAtPrice:
        body.compareAtPrice != null && Number.isFinite(Number(body.compareAtPrice))
          ? Number(body.compareAtPrice)
          : null,
      stock: Number.isFinite(Number(body.stock)) ? Number(body.stock) : 0,
      images,
      category: String(body.category ?? ""),
    },
  });

  return Response.json({ product: serializeProduct(product) });
}
