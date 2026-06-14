"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreStore } from "@/store/useStoreStore";
import { useProductsStore } from "@/store/useProductsStore";
import { useOrdersStore } from "@/store/useOrdersStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuthStore();
  const loadStore = useStoreStore((s) => s.loadStore);
  const loadProducts = useProductsStore((s) => s.loadProducts);
  const loadOrders = useOrdersStore((s) => s.loadOrders);
  const router = useRouter();
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "store_owner") {
      router.replace("/admin");
      return;
    }
    const sid = user.storeId;
    Promise.all([
      sid ? loadStore(sid) : Promise.resolve(),
      sid ? loadProducts(sid) : Promise.resolve(),
      loadOrders(),
    ]).finally(() => setDataReady(true));
  }, [loading, isAuthenticated, user, router, loadStore, loadProducts, loadOrders]);

  if (loading || !isAuthenticated || user?.role !== "store_owner" || !dataReady) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
