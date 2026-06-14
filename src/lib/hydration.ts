"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreStore } from "@/store/useStoreStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { useCartStore } from "@/store/useCartStore";
import { usePlatformStore } from "@/store/usePlatformStore";
import { useProductsStore } from "@/store/useProductsStore";

export const HYDRATED_EVENT = "storeos-hydrated";

let hydratePromise: Promise<void> | null = null;

export function areStoresHydrated() {
  if (typeof window === "undefined") return false;

  return (
    useAuthStore.persist.hasHydrated() &&
    useStoreStore.persist.hasHydrated() &&
    useOrdersStore.persist.hasHydrated() &&
    useCartStore.persist.hasHydrated() &&
    usePlatformStore.persist.hasHydrated() &&
    useProductsStore.persist.hasHydrated()
  );
}

export function hydrateAllStores() {
  if (hydratePromise) return hydratePromise;

  hydratePromise = Promise.all([
    useAuthStore.persist.rehydrate(),
    useStoreStore.persist.rehydrate(),
    useOrdersStore.persist.rehydrate(),
    useCartStore.persist.rehydrate(),
    usePlatformStore.persist.rehydrate(),
    useProductsStore.persist.rehydrate(),
  ]).then(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(HYDRATED_EVENT));
    }
  });

  return hydratePromise;
}

export function useAppHydration() {
  const [hydrated, setHydrated] = useState(areStoresHydrated);

  useEffect(() => {
    if (areStoresHydrated()) {
      setHydrated(true);
      return;
    }

    const onDone = () => setHydrated(true);
    window.addEventListener(HYDRATED_EVENT, onDone);
    hydrateAllStores().then(onDone);

    return () => window.removeEventListener(HYDRATED_EVENT, onDone);
  }, []);

  return hydrated;
}
