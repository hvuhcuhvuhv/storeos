import type {
  Store as PrismaStore,
  Product as PrismaProduct,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from "@prisma/client";
import type { Store, Product, Order } from "@/types";

export interface StoreStats {
  productsCount: number;
  ordersCount: number;
  revenue: number;
}

export function serializeStore(s: PrismaStore, stats: StoreStats): Store {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    brandName: s.brandName ?? undefined,
    description: s.description,
    logo: s.logo ?? undefined,
    ownerId: s.ownerId,
    ownerName: s.ownerName,
    ownerEmail: s.ownerEmail,
    ownerPhone: s.ownerPhone ?? undefined,
    status: s.status,
    category: s.category,
    productsCount: stats.productsCount,
    ordersCount: stats.ordersCount,
    revenue: stats.revenue,
    payments: {
      connected: Boolean(s.stripeAccountId),
      onboarded: s.stripeOnboarded,
    },
    createdAt: s.createdAt.toISOString(),
  };
}

export function serializeProduct(p: PrismaProduct): Product {
  return {
    id: p.id,
    storeId: p.storeId,
    name: p.name,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    stock: p.stock,
    image: p.images[0] ?? undefined,
    images: p.images,
    category: p.category,
    createdAt: p.createdAt.toISOString(),
  };
}

export function serializeOrder(
  o: PrismaOrder & { items: PrismaOrderItem[] }
): Order {
  return {
    id: o.id,
    storeId: o.storeId,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    customerCity: o.customerCity ?? undefined,
    customerAddress: o.customerAddress ?? undefined,
    deliveryFee: o.deliveryFee,
    total: o.total,
    status: o.status,
    items: o.items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      price: i.price,
    })),
    createdAt: o.createdAt.toISOString(),
  };
}
