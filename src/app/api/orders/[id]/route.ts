import { NextRequest } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serialize";
import { getAuthUser, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = Object.values(OrderStatus) as string[];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const me = await getAuthUser();
  if (!me) return jsonError("غير مصرّح", 401);

  const order = await prisma.order.findUnique({
    where: { id },
    include: { store: { select: { ownerId: true } } },
  });
  if (!order) return jsonError("الطلب غير موجود", 404);
  if (me.role !== "admin" && order.store.ownerId !== me.id)
    return jsonError("غير مصرّح", 403);

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("طلب غير صالح");
  }

  if (!body.status || !STATUSES.includes(body.status))
    return jsonError("حالة غير صالحة");

  const updated = await prisma.order.update({
    where: { id },
    data: { status: body.status as OrderStatus },
    include: { items: true },
  });

  return Response.json({ order: serializeOrder(updated) });
}
