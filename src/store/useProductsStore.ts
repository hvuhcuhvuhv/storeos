"use client";

import { create } from "zustand";
import { Product } from "@/types";
import { api } from "@/lib/api";

interface ProductsStore {
  products: Product[];
  loading: boolean;
  loadProducts: (storeId: string) => Promise<void>;
  getProductsByStoreId: (storeId: string) => Product[];
  addProduct: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string; product?: Product }>;
  updateProduct: (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  loading: false,

  loadProducts: async (storeId) => {
    set({ loading: true });
    try {
      const { products } = await api.getProducts(storeId);
      // استبدال منتجات هذا المتجر فقط
      set((state) => ({
        products: [
          ...products,
          ...state.products.filter((p) => p.storeId !== storeId),
        ],
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },

  getProductsByStoreId: (storeId) =>
    get().products.filter((p) => p.storeId === storeId),

  addProduct: async (data) => {
    try {
      const { product } = await api.createProduct(data);
      set((state) => ({ products: [product, ...state.products] }));
      return { success: true, product };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  updateProduct: async (id, data) => {
    try {
      const { product } = await api.updateProduct(id, data);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? product : p)),
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.deleteProduct(id);
      set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    } catch {
      /* تجاهل */
    }
  },
}));
