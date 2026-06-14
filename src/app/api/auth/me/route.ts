import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return Response.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { store: { select: { id: true } } },
  });

  if (!user) {
    return Response.json({ user: null });
  }

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeId: user.store?.id,
      createdAt: user.createdAt.toISOString(),
    },
  });
}
