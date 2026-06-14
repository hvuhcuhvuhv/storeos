import { Order } from "@/types";

export interface StoreStats {
  ordersCount: number;
  revenue: number;
}

const EMPTY_STATS: StoreStats = { ordersCount: 0, revenue: 0 };

/**
 * Computes live per-store stats from the actual orders list.
 * Cancelled orders are counted but excluded from revenue.
 */
export function computeStoreStats(orders: Order[]): Map<string, StoreStats> {
  const map = new Map<string, StoreStats>();

  for (const order of orders) {
    const entry = map.get(order.storeId) ?? { ordersCount: 0, revenue: 0 };
    entry.ordersCount += 1;
    if (order.status !== "cancelled") {
      entry.revenue += order.total;
    }
    map.set(order.storeId, entry);
  }

  return map;
}

export function getStoreStats(
  stats: Map<string, StoreStats>,
  storeId: string
): StoreStats {
  return stats.get(storeId) ?? EMPTY_STATS;
}
