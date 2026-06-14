import { prisma } from "@/lib/prisma";
import { getAuthUser, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getAuthUser();
  if (!me || me.role !== "admin") return jsonError("غير مصرّح", 403);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { store: { select: { id: true } } },
  });

  return Response.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      storeId: u.store?.id,
      createdAt: u.createdAt.toISOString(),
    })),
  });
}
