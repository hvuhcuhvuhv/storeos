import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULTS = {
  platformName: "منصة سند",
  supportEmail: "support@sanad.com",
  allowNewStores: true,
  notifications: true,
};

async function getSettings() {
  const s = await prisma.platformSettings.findUnique({ where: { id: 1 } });
  if (s) return s;
  return prisma.platformSettings.create({ data: { id: 1, ...DEFAULTS } });
}

export async function GET() {
  const s = await getSettings();
  return Response.json({
    settings: {
      platformName: s.platformName,
      supportEmail: s.supportEmail,
      allowNewStores: s.allowNewStores,
      notifications: s.notifications,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const me = await getAuthUser();
  if (!me || me.role !== "admin") return jsonError("غير مصرّح", 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("طلب غير صالح");
  }

  const data: Record<string, unknown> = {};
  if (typeof body.platformName === "string") data.platformName = body.platformName.trim();
  if (typeof body.supportEmail === "string") data.supportEmail = body.supportEmail.trim();
  if (typeof body.allowNewStores === "boolean") data.allowNewStores = body.allowNewStores;
  if (typeof body.notifications === "boolean") data.notifications = body.notifications;

  const s = await prisma.platformSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...DEFAULTS, ...data },
  });

  return Response.json({
    settings: {
      platformName: s.platformName,
      supportEmail: s.supportEmail,
      allowNewStores: s.allowNewStores,
      notifications: s.notifications,
    },
  });
}
