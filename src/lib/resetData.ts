import {
  clearAllStorageKeys,
  writePersistEntry,
  getFreshAuthState,
  getFreshStoresState,
  getFreshOrdersState,
  getFreshCartState,
  getFreshPlatformState,
  getFreshProductsState,
  MIGRATION_FLAG,
} from "@/lib/defaults";

export function resetAllData() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(MIGRATION_FLAG);
  clearAllStorageKeys();

  writePersistEntry("storeos-auth", getFreshAuthState());
  writePersistEntry("storeos-stores", getFreshStoresState());
  writePersistEntry("storeos-orders", getFreshOrdersState());
  writePersistEntry("storeos-cart", getFreshCartState());
  writePersistEntry("storeos-platform", getFreshPlatformState());
  writePersistEntry("storeos-products", getFreshProductsState());

  localStorage.setItem(MIGRATION_FLAG, "1");
  window.location.href = "/login";
}
