import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { getAuthUser, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorizeProduct(productId: string) {
  const me = await getAuthUser();
  if (!me) return { error: jsonError("غير مصرّح", 401) };
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: { select: { ownerId: true } } },
  });
  if (!product) return { error: jsonError("المنتج غير موجود", 404) };
  if (me.role !== "admin" && product.store.ownerId !== me.id)
    return { error: jsonError("غير مصرّح", 403) };
  return { product };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeProduct(id);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("طلب غير صالح");
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.description === "string") data.description = body.description;
  if (body.price != null && Number.isFinite(Number(body.price)))
    data.price = Number(body.price);
  if (body.compareAtPrice === null) data.compareAtPrice = null;
  else if (body.compareAtPrice != null && Number.isFinite(Number(body.compareAtPrice)))
    data.compareAtPrice = Number(body.compareAtPrice);
  if (body.stock != null && Number.isFinite(Number(body.stock)))
    data.stock = Number(body.stock);
  if (Array.isArray(body.images))
    data.images = (body.images as unknown[]).filter(
      (x): x is string => typeof x === "string"
    );
  if (typeof body.category === "string") data.category = body.category.trim();

  const product = await prisma.product.update({ where: { id }, data });
  return Response.json({ product: serializeProduct(product) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeProduct(id);
  if ("error" in auth) return auth.error;

  await prisma.product.delete({ where: { id } });
  return Response.json({ success: true });
}
