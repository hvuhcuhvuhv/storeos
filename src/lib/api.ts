"use client";

import type { Store, Product, Order, User } from "@/types";
import type { PlatformSettings } from "@/lib/platform";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "حدث خطأ في الخادم");
  }
  return data as T;
}

export const api = {
  // ===== Auth =====
  login: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: User | null }>("/api/auth/me"),

  // ===== Stores =====
  getStores: () => request<{ stores: Store[] }>("/api/stores"),
  getStore: (id: string) => request<{ store: Store }>(`/api/stores/${id}`),
  getStoreBySlug: (slug: string) =>
    request<{ store: Store; products: Product[] }>(
      `/api/stores/slug/${encodeURIComponent(slug)}`
    ),
  createStore: (data: Record<string, unknown>) =>
    request<{ store: Store }>("/api/stores", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStore: (id: string, data: Record<string, unknown>) =>
    request<{ store: Store }>(`/api/stores/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteStore: (id: string) =>
    request<{ success: boolean }>(`/api/stores/${id}`, { method: "DELETE" }),

  // ===== Products =====
  getProducts: (storeId: string) =>
    request<{ products: Product[] }>(`/api/products?storeId=${storeId}`),
  createProduct: (data: Record<string, unknown>) =>
    request<{ product: Product }>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    request<{ product: Product }>(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/api/products/${id}`, { method: "DELETE" }),

  // ===== Orders =====
  getOrders: (storeId?: string) =>
    request<{ orders: Order[] }>(
      `/api/orders${storeId ? `?storeId=${storeId}` : ""}`
    ),
  createOrder: (data: Record<string, unknown>) =>
    request<{ order: Order }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateOrderStatus: (id: string, status: Order["status"]) =>
    request<{ order: Order }>(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // ===== Stripe Connect (حساب استلام المتجر) =====
  connectStatus: () =>
    request<{ connected: boolean; onboarded: boolean; detailsSubmitted?: boolean }>(
      "/api/stripe/connect"
    ),
  connectOnboard: () =>
    request<{ url: string }>("/api/stripe/connect", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  // للأدمن: توليد رابط ربط Stripe لمتجر محدّد
  connectOnboardStore: (storeId: string) =>
    request<{ url: string }>("/api/stripe/connect", {
      method: "POST",
      body: JSON.stringify({ storeId }),
    }),

  // ===== Users =====
  getUsers: () => request<{ users: User[] }>("/api/users"),

  // ===== Admin =====
  resetAll: () => request<{ success: boolean }>("/api/admin/reset", { method: "POST" }),

  // ===== Platform =====
  getPlatform: () => request<{ settings: PlatformSettings }>("/api/platform"),
  updatePlatform: (data: Partial<PlatformSettings>) =>
    request<{ settings: PlatformSettings }>("/api/platform", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
