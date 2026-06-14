import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // إعدادات المنصة (سجل واحد)
  await prisma.platformSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      platformName: "منصة سند",
      supportEmail: "support@sanad.com",
      allowNewStores: true,
      notifications: true,
    },
  });

  // حساب الأدمن
  const adminEmail = process.env.ADMIN_EMAIL || "admin@storeos.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminName = process.env.ADMIN_NAME || "المدير العام";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, role: "admin" },
    create: {
      name: adminName,
      email: adminEmail,
      password: adminHash,
      role: "admin",
    },
  });

  // متجر تجريبي مع صاحب ومنتجات (idempotent)
  const ownerEmail = "owner@demo.com";
  const ownerHash = await bcrypt.hash("owner123", 10);

  const existingOwner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (!existingOwner) {
    const owner = await prisma.user.create({
      data: {
        name: "صاحب المتجر التجريبي",
        email: ownerEmail,
        password: ownerHash,
        role: "store_owner",
      },
    });

    const store = await prisma.store.create({
      data: {
        name: "متجر التقنية",
        slug: "tech-store",
        brandName: "TechZone",
        description: "أحدث المنتجات التقنية والإلكترونية",
        ownerId: owner.id,
        ownerName: owner.name,
        ownerEmail: owner.email,
        ownerPhone: "+971500000000",
        status: "active",
        category: "إلكترونيات",
      },
    });

    await prisma.product.createMany({
      data: [
        {
          storeId: store.id,
          name: "سماعات لاسلكية",
          description: "سماعات بلوتوث عالية الجودة مع عزل للضوضاء",
          price: 299,
          compareAtPrice: 399,
          stock: 50,
          category: "إلكترونيات",
        },
        {
          storeId: store.id,
          name: "ساعة ذكية",
          description: "ساعة ذكية بشاشة AMOLED وبطارية تدوم 7 أيام",
          price: 599,
          stock: 30,
          category: "إلكترونيات",
        },
        {
          storeId: store.id,
          name: "شاحن سريع",
          description: "شاحن 65 واط يدعم الشحن السريع لجميع الأجهزة",
          price: 120,
          compareAtPrice: 150,
          stock: 100,
          category: "ملحقات",
        },
      ],
    });
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
