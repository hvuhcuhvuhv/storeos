"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PERSIST_VERSION, getFreshCartState } from "@/lib/defaults";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

export const EMPTY_CART: CartItem[] = [];

interface CartStore {
  carts: Record<string, CartItem[]>;
  addItem: (storeId: string, item: Omit<CartItem, "quantity">) => void;
  removeItem: (storeId: string, productId: string) => void;
  updateQuantity: (storeId: string, productId: string, quantity: number) => void;
  clearCart: (storeId: string) => void;
  getItems: (storeId: string) => CartItem[];
  getItemCount: (storeId: string) => number;
  getTotal: (storeId: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      carts: {},

      addItem: (storeId, item) => {
        set((state) => {
          const current = state.carts[storeId] ?? EMPTY_CART;
          const existing = current.find((i) => i.productId === item.productId);

          const updated = existing
            ? current.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              )
            : [...current, { ...item, quantity: 1 }];

          return { carts: { ...state.carts, [storeId]: updated } };
        });
      },

      removeItem: (storeId, productId) => {
        set((state) => ({
          carts: {
            ...state.carts,
            [storeId]: (state.carts[storeId] ?? EMPTY_CART).filter((i) => i.productId !== productId),
          },
        }));
      },

      updateQuantity: (storeId, productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(storeId, productId);
          return;
        }
        set((state) => ({
          carts: {
            ...state.carts,
            [storeId]: (state.carts[storeId] ?? EMPTY_CART).map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          },
        }));
      },

      clearCart: (storeId) => {
        set((state) => ({
          carts: { ...state.carts, [storeId]: [] },
        }));
      },

      getItems: (storeId) => get().carts[storeId] ?? EMPTY_CART,

      getItemCount: (storeId) =>
        (get().carts[storeId] ?? EMPTY_CART).reduce((sum, i) => sum + i.quantity, 0),

      getTotal: (storeId) =>
        (get().carts[storeId] ?? EMPTY_CART).reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "storeos-cart",
      version: PERSIST_VERSION,
      migrate: () => getFreshCartState(),
      skipHydration: true,
    }
  )
);
