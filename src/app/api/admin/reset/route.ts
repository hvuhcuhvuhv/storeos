import { prisma } from "@/lib/prisma";
import { getAuthUser, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const me = await getAuthUser();
  if (!me || me.role !== "admin") return jsonError("غير مصرّح", 403);

  // حذف المتاجر (يحذف معها المنتجات والطلبات تلقائياً) ثم أصحاب المتاجر
  await prisma.$transaction([
    prisma.store.deleteMany({}),
    prisma.user.deleteMany({ where: { role: "store_owner" } }),
  ]);

  return Response.json({ success: true });
}
