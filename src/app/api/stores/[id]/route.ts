import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { serializeStore } from "@/lib/serialize";
import { getAuthUser, getStoreStatsById, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const me = await getAuthUser();
  if (!me) return jsonError("غير مصرّح", 401);

  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return jsonError("المتجر غير موجود", 404);
  if (me.role !== "admin" && store.ownerId !== me.id)
    return jsonError("غير مصرّح", 403);

  const stats = await getStoreStatsById(id);
  return Response.json({ store: serializeStore(store, stats) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const me = await getAuthUser();
  if (!me) return jsonError("غير مصرّح", 401);

  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return jsonError("المتجر غير موجود", 404);
  if (me.role !== "admin" && store.ownerId !== me.id)
    return jsonError("غير مصرّح", 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("طلب غير صالح");
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim();
    const base = generateSlug(body.name);
    let slug = base;
    let i = 1;
    while (
      await prisma.store.findFirst({
        where: { slug, NOT: { id } },
      })
    ) {
      slug = `${base}-${i++}`;
    }
    data.slug = slug;
  }
  if (typeof body.brandName === "string") data.brandName = body.brandName.trim() || null;
  if (typeof body.description === "string") data.description = body.description;
  if (body.logo === null || typeof body.logo === "string") data.logo = body.logo || null;
  if (typeof body.category === "string") data.category = body.category.trim();
  if (typeof body.ownerPhone === "string") data.ownerPhone = body.ownerPhone.trim() || null;
  if (body.status === "active" || body.status === "inactive") data.status = body.status;

  const updated = await prisma.store.update({ where: { id }, data });
  const stats = await getStoreStatsById(id);
  return Response.json({ store: serializeStore(updated, stats) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const me = await getAuthUser();
  if (!me || me.role !== "admin") return jsonError("غير مصرّح", 403);

  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return jsonError("المتجر غير موجود", 404);

  await prisma.$transaction([
    prisma.store.delete({ where: { id } }),
    prisma.user.delete({ where: { id: store.ownerId } }),
  ]);

  return Response.json({ success: true });
}
