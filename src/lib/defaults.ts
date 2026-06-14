import { DEMO_USERS } from "@/lib/auth";
import { User } from "@/types";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/platform";

export const PERSIST_VERSION = 5;

const ADMIN_USER = DEMO_USERS.find((u) => u.role === "admin")!;

export type StoredUser = User & { password: string };

export function getFreshAuthState() {
  return {
    user: null as User | null,
    isAuthenticated: false,
    users: [{ ...ADMIN_USER }] as StoredUser[],
  };
}

export function getFreshStoresState() {
  return { stores: [] as import("@/types").Store[] };
}

export function getFreshOrdersState() {
  return { orders: [] as import("@/types").Order[] };
}

export function getFreshCartState() {
  return { carts: {} as Record<string, import("@/store/useCartStore").CartItem[]> };
}

export function getFreshPlatformState() {
  return {
    settings: { ...DEFAULT_PLATFORM_SETTINGS },
  };
}

export function getFreshProductsState() {
  return { products: [] as import("@/types").Product[] };
}

export function writePersistEntry(key: string, state: object) {
  localStorage.setItem(
    key,
    JSON.stringify({ state, version: PERSIST_VERSION })
  );
}

export const MIGRATION_FLAG = "storeos-migrated-v5";

export const STORAGE_KEYS = [
  "storeos-auth",
  "storeos-stores",
  "storeos-orders",
  "storeos-cart",
  "storeos-platform",
  "storeos-products",
  "auth-storage",
  "stores-storage",
  "orders-storage",
  "cart-storage",
] as const;

export function clearAllStorageKeys() {
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  Object.keys(localStorage).forEach((key) => {
    if (key === MIGRATION_FLAG) return;
    if (key.startsWith("storeos-")) localStorage.removeItem(key);
  });
}
