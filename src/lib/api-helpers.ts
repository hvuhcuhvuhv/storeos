import "server-only";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { StoreStats } from "@/lib/serialize";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function getAuthUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

/** يحسب إحصائيات (عدد المنتجات/الطلبات/الإيراد) لكل متجر دفعة واحدة */
export async function getStatsMap(): Promise<Map<string, StoreStats>> {
  const [productCounts, orderCounts, revenue] = await Promise.all([
    prisma.product.groupBy({ by: ["storeId"], _count: { _all: true } }),
    prisma.order.groupBy({ by: ["storeId"], _count: { _all: true } }),
    prisma.order.groupBy({
      by: ["storeId"],
      where: { status: { not: "cancelled" } },
      _sum: { total: true },
    }),
  ]);

  const map = new Map<string, StoreStats>();
  const ensure = (id: string) =>
    map.get(id) ?? { productsCount: 0, ordersCount: 0, revenue: 0 };

  for (const r of productCounts) {
    const e = ensure(r.storeId);
    e.productsCount = r._count._all;
    map.set(r.storeId, e);
  }
  for (const r of orderCounts) {
    const e = ensure(r.storeId);
    e.ordersCount = r._count._all;
    map.set(r.storeId, e);
  }
  for (const r of revenue) {
    const e = ensure(r.storeId);
    e.revenue = r._sum.total ?? 0;
    map.set(r.storeId, e);
  }

  return map;
}

export async function getStoreStatsById(storeId: string): Promise<StoreStats> {
  const [productsCount, ordersCount, revenueAgg] = await Promise.all([
    prisma.product.count({ where: { storeId } }),
    prisma.order.count({ where: { storeId } }),
    prisma.order.aggregate({
      where: { storeId, status: { not: "cancelled" } },
      _sum: { total: true },
    }),
  ]);
  return {
    productsCount,
    ordersCount,
    revenue: revenueAgg._sum.total ?? 0,
  };
}
