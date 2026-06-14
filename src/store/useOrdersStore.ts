"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order } from "@/types";
import { PERSIST_VERSION, getFreshOrdersState } from "@/lib/defaults";

interface OrdersStore {
  orders: Order[];
  getOrdersByStoreId: (storeId: string) => Order[];
  addOrder: (data: Omit<Order, "id" | "createdAt">) => Order;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

      getOrdersByStoreId: (storeId) =>
        get().orders.filter((o) => o.storeId === storeId),

      addOrder: (data) => {
        const newOrder: Order = {
          ...data,
          id: `ORD-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
        return newOrder;
      },

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        }));
      },
    }),
    {
      name: "storeos-orders",
      version: PERSIST_VERSION,
      migrate: () => getFreshOrdersState(),
      skipHydration: true,
    }
  )
);
