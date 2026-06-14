"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Store } from "@/types";
import { generateSlug } from "@/lib/utils";
import { PERSIST_VERSION, getFreshStoresState } from "@/lib/defaults";

interface StoreStore {
  stores: Store[];
  addStore: (data: Omit<Store, "id" | "slug" | "productsCount" | "ordersCount" | "revenue" | "createdAt">) => Store;
  updateStore: (id: string, data: Partial<Store>) => void;
  toggleStoreStatus: (id: string) => void;
  deleteStore: (id: string) => void;
  getStoreById: (id: string) => Store | undefined;
  getStoreBySlug: (slug: string) => Store | undefined;
  recordOrder: (storeId: string, total: number) => void;
}

export const useStoreStore = create<StoreStore>()(
  persist(
    (set, get) => ({
      stores: [],

      addStore: (data) => {
        const id = `store-${Date.now()}`;
        let slug = generateSlug(data.name);
        const existingSlugs = new Set(get().stores.map((s) => s.slug));
        while (existingSlugs.has(slug)) {
          slug = `${slug}-${existingSlugs.size + 1}`;
        }

        const newStore: Store = {
          ...data,
          id,
          slug,
          productsCount: 0,
          ordersCount: 0,
          revenue: 0,
          stripe: data.stripe || { publishableKey: "", secretKey: "", enabled: false },
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ stores: [...state.stores, newStore] }));
        return newStore;
      },

      updateStore: (id, data) => {
        set((state) => ({
          stores: state.stores.map((s) =>
            s.id === id ? { ...s, ...data, slug: data.name ? generateSlug(data.name) : s.slug } : s
          ),
        }));
      },

      toggleStoreStatus: (id) => {
        set((state) => ({
          stores: state.stores.map((s) =>
            s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s
          ),
        }));
      },

      deleteStore: (id) => {
        set((state) => ({ stores: state.stores.filter((s) => s.id !== id) }));
      },

      getStoreById: (id) => get().stores.find((s) => s.id === id),

      getStoreBySlug: (slug) => get().stores.find((s) => s.slug === slug),

      recordOrder: (storeId, total) => {
        set((state) => ({
          stores: state.stores.map((s) =>
            s.id === storeId
              ? { ...s, ordersCount: s.ordersCount + 1, revenue: s.revenue + total }
              : s
          ),
        }));
      },
    }),
    {
      name: "storeos-stores",
      version: PERSIST_VERSION,
      migrate: () => getFreshStoresState(),
      skipHydration: true,
    }
  )
);
