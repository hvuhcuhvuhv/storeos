"use client";

import { useEffect } from "react";
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
import { hydrateAllStores } from "@/lib/hydration";

function applyFreshDataToStorage() {
  clearAllStorageKeys();
  writePersistEntry("storeos-auth", getFreshAuthState());
  writePersistEntry("storeos-stores", getFreshStoresState());
  writePersistEntry("storeos-orders", getFreshOrdersState());
  writePersistEntry("storeos-cart", getFreshCartState());
  writePersistEntry("storeos-platform", getFreshPlatformState());
  writePersistEntry("storeos-products", getFreshProductsState());
}

export function StoreHydration() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!localStorage.getItem(MIGRATION_FLAG)) {
      applyFreshDataToStorage();
      localStorage.setItem(MIGRATION_FLAG, "1");
      window.location.reload();
      return;
    }

    hydrateAllStores();
  }, []);

  return null;
}
