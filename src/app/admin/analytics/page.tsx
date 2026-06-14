"use client";

import { motion } from "framer-motion";
import { BarChart3, Store, TrendingUp, ShoppingCart, Package } from "lucide-react";
import { useStoreStore } from "@/store/useStoreStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/Cards";
import { AdminExportOrdersBanner } from "@/components/admin/ExportOrdersBanner";
import { formatCurrency } from "@/lib/utils";
import { computeStoreStats, getStoreStats } from "@/lib/stats";

export default function AdminAnalyticsPage() {
  const { stores } = useStoreStore();
  const orders = useOrdersStore((s) => s.orders);

  const stats = computeStoreStats(orders);

  const activeStores = stores.filter((s) => s.status === "active");
  const totalRevenue = stores.reduce((acc, s) => acc + getStoreStats(stats, s.id).revenue, 0);
  const totalOrders = stores.reduce((acc, s) => acc + getStoreStats(stats, s.id).ordersCount, 0);
  const totalProducts = stores.reduce((acc, s) => acc + s.productsCount, 0);

  const topStores = [...stores]
    .sort((a, b) => getStoreStats(stats, b.id).revenue - getStoreStats(stats, a.id).revenue)
    .slice(0, 5);

  return (
    <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
      <Sidebar isAdmin={true} />
      <main className="flex-1 overflow-x-hidden">
        <TopBar title="الإحصائيات" subtitle="تحليلات المنصة الشاملة" />
        <div className="p-6 space-y-6 mt-16 lg:mt-0">
          <AdminExportOrdersBanner />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="إجمالي المتاجر" value={stores.length} change={`${activeStores.length} نشط`} changeType="up" icon={Store} color="indigo" delay={0} />
            <StatCard title="إجمالي الإيرادات" value={formatCurrency(totalRevenue)} change="عبر جميع المتاجر" changeType="up" icon={TrendingUp} color="emerald" delay={0.1} />
            <StatCard title="إجمالي الطلبات" value={totalOrders} change="طلب مسجل" changeType="up" icon={ShoppingCart} color="purple" delay={0.2} />
            <StatCard title="إجمالي المنتجات" value={totalProducts} change={`${stores.length} متجر`} changeType="neutral" icon={Package} color="amber" delay={0.3} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl border border-gray-700/50 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-700/50 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-400" />
              <h3 className="font-semibold text-white">أعلى المتاجر إيراداً</h3>
            </div>
            <div className="divide-y divide-gray-800/50">
              {topStores.map((store, i) => (
                <div key={store.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{store.name}</p>
                    <p className="text-xs text-gray-500">{getStoreStats(stats, store.id).ordersCount} طلب • {store.productsCount} منتج</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-emerald-400">{formatCurrency(getStoreStats(stats, store.id).revenue)}</p>
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full mt-1">
                      <div
                        className="h-1.5 bg-indigo-500 rounded-full"
                        style={{ width: `${totalRevenue ? (getStoreStats(stats, store.id).revenue / totalRevenue) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
