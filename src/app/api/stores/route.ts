import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { serializeStore } from "@/lib/serialize";
import { getAuthUser, getStatsMap, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getAuthUser();
  if (!me || me.role !== "admin") return jsonError("غير مصرّح", 403);

  const [stores, stats] = await Promise.all([
    prisma.store.findMany({ orderBy: { createdAt: "desc" } }),
    getStatsMap(),
  ]);

  const data = stores.map((s) =>
    serializeStore(
      s,
      stats.get(s.id) ?? { productsCount: 0, ordersCount: 0, revenue: 0 }
    )
  );
  return Response.json({ stores: data });
}

export async function POST(request: NextRequest) {
  const me = await getAuthUser();
  if (!me || me.role !== "admin") return jsonError("غير مصرّح", 403);

  const allowed = await prisma.platformSettings.findUnique({ where: { id: 1 } });
  if (allowed && !allowed.allowNewStores) {
    return jsonError("إنشاء المتاجر الجديدة معطّل حالياً", 403);
  }

  let body: Record<string, string | undefined>;
  try {
    body = await request.json();
  } catch {
    return jsonError("طلب غير صالح");
  }

  const name = body.name?.trim();
  const ownerName = body.ownerName?.trim();
  const ownerEmail = body.ownerEmail?.trim().toLowerCase();
  const ownerPassword = body.ownerPassword ?? "";

  if (!name || !ownerName || !ownerEmail || !ownerPassword) {
    return jsonError("الاسم وبيانات صاحب المتجر مطلوبة");
  }

  const existing = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (existing) return jsonError("البريد الإلكتروني مسجل مسبقاً");

  // توليد slug فريد
  const base = generateSlug(name);
  let slug = base;
  let i = 1;
  while (await prisma.store.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  const hash = await bcrypt.hash(ownerPassword, 10);

  const store = await prisma.$transaction(async (tx) => {
    const owner = await tx.user.create({
      data: {
        name: ownerName,
        email: ownerEmail,
        password: hash,
        role: "store_owner",
      },
    });

    return tx.store.create({
      data: {
        name,
        slug,
        brandName: body.brandName?.trim() || null,
        description: body.description?.trim() || "",
        logo: body.logo || null,
        ownerId: owner.id,
        ownerName,
        ownerEmail,
        ownerPhone: body.ownerPhone?.trim() || null,
        category: body.category?.trim() || "",
        bankName: body.bankName?.trim() || null,
        bankAccountName: body.bankAccountName?.trim() || null,
        bankIban: body.bankIban?.replace(/\s+/g, "").toUpperCase() || null,
        bankAccountNumber: body.bankAccountNumber?.trim() || null,
        bankEnabled: Boolean(body.bankIban && body.bankAccountName),
      },
    });
  });

  return Response.json({
    store: serializeStore(store, {
      productsCount: 0,
      ordersCount: 0,
      revenue: 0,
    }),
  });
}
