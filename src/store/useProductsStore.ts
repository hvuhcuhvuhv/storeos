"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";
import { PERSIST_VERSION } from "@/lib/defaults";

interface ProductsStore {
  products: Product[];
  getProductsByStoreId: (storeId: string) => Product[];
  addProduct: (data: Omit<Product, "id" | "createdAt">) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      products: [],

      getProductsByStoreId: (storeId) =>
        get().products.filter((p) => p.storeId === storeId),

      addProduct: (data) => {
        const newProduct: Product = {
          ...data,
          id: `prod-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ products: [newProduct, ...state.products] }));
        return newProduct;
      },

      updateProduct: (id, data) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      },
    }),
    {
      name: "storeos-products",
      version: PERSIST_VERSION,
      skipHydration: true,
    }
  )
);
