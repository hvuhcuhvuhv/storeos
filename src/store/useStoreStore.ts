"use client";

import { create } from "zustand";
import { Store } from "@/types";
import { api } from "@/lib/api";

interface StoreStore {
  stores: Store[];
  loading: boolean;
  loadStores: () => Promise<void>;
  loadStore: (id: string) => Promise<Store | undefined>;
  addStore: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string; store?: Store }>;
  updateStore: (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  toggleStoreStatus: (id: string) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
  getStoreById: (id: string) => Store | undefined;
  getStoreBySlug: (slug: string) => Store | undefined;
}

function upsert(stores: Store[], store: Store): Store[] {
  const idx = stores.findIndex((s) => s.id === store.id);
  if (idx === -1) return [store, ...stores];
  const next = [...stores];
  next[idx] = store;
  return next;
}

export const useStoreStore = create<StoreStore>((set, get) => ({
  stores: [],
  loading: false,

  loadStores: async () => {
    set({ loading: true });
    try {
      const { stores } = await api.getStores();
      set({ stores, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadStore: async (id) => {
    try {
      const { store } = await api.getStore(id);
      set((state) => ({ stores: upsert(state.stores, store) }));
      return store;
    } catch {
      return undefined;
    }
  },

  addStore: async (data) => {
    try {
      const { store } = await api.createStore(data);
      set((state) => ({ stores: upsert(state.stores, store) }));
      return { success: true, store };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  updateStore: async (id, data) => {
    try {
      const { store } = await api.updateStore(id, data);
      set((state) => ({ stores: upsert(state.stores, store) }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  toggleStoreStatus: async (id) => {
    const current = get().stores.find((s) => s.id === id);
    if (!current) return;
    const next = current.status === "active" ? "inactive" : "active";
    try {
      const { store } = await api.updateStore(id, { status: next });
      set((state) => ({ stores: upsert(state.stores, store) }));
    } catch {
      /* تجاهل */
    }
  },

  deleteStore: async (id) => {
    try {
      await api.deleteStore(id);
      set((state) => ({ stores: state.stores.filter((s) => s.id !== id) }));
    } catch {
      /* تجاهل */
    }
  },

  getStoreById: (id) => get().stores.find((s) => s.id === id),
  getStoreBySlug: (slug) => get().stores.find((s) => s.slug === slug),
}));
