import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("طلب غير صالح");
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return jsonError("البريد الإلكتروني وكلمة المرور مطلوبان");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { store: { select: { id: true } } },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return jsonError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
  }

  await setSessionCookie({ userId: user.id, role: user.role });

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
