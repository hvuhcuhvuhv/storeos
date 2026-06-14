"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreStore } from "@/store/useStoreStore";
import { useOrdersStore } from "@/store/useOrdersStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuthStore();
  const loadUsers = useAuthStore((s) => s.loadUsers);
  const loadStores = useStoreStore((s) => s.loadStores);
  const loadOrders = useOrdersStore((s) => s.loadOrders);
  const router = useRouter();
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    Promise.all([loadStores(), loadOrders(), loadUsers()]).finally(() =>
      setDataReady(true)
    );
  }, [loading, isAuthenticated, user, router, loadStores, loadOrders, loadUsers]);

  if (loading || !isAuthenticated || user?.role !== "admin" || !dataReady) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
