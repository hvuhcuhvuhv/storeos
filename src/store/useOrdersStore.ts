"use client";

import { create } from "zustand";
import { Order } from "@/types";
import { api } from "@/lib/api";

interface OrdersStore {
  orders: Order[];
  loading: boolean;
  loadOrders: (storeId?: string) => Promise<void>;
  getOrdersByStoreId: (storeId: string) => Order[];
  addOrder: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string; order?: Order }>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: [],
  loading: false,

  loadOrders: async (storeId) => {
    set({ loading: true });
    try {
      const { orders } = await api.getOrders(storeId);
      set({ orders, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  getOrdersByStoreId: (storeId) =>
    get().orders.filter((o) => o.storeId === storeId),

  addOrder: async (data) => {
    try {
      const { order } = await api.createOrder(data);
      set((state) => ({ orders: [order, ...state.orders] }));
      return { success: true, order };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const { order } = await api.updateOrderStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? order : o)),
      }));
    } catch {
      /* تجاهل */
    }
  },
}));
