"use client";

import { motion } from "framer-motion";
import {
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Activity,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useStoreStore } from "@/store/useStoreStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { StatCard, Badge } from "@/components/ui/Cards";
import { AdminExportOrdersBanner } from "@/components/admin/ExportOrdersBanner";
import { formatCurrency } from "@/lib/utils";
import { computeStoreStats, getStoreStats } from "@/lib/stats";
import Link from "next/link";

export default function AdminPage() {
  const { stores } = useStoreStore();
  const { user } = useAuthStore();
  const orders = useOrdersStore((s) => s.orders);

  const stats = computeStoreStats(orders);

  const activeStores = stores.filter((s) => s.status === "active");
  const totalRevenue = stores.reduce((acc, s) => acc + getStoreStats(stats, s.id).revenue, 0);
  const totalOrders = stores.reduce((acc, s) => acc + getStoreStats(stats, s.id).ordersCount, 0);
  const totalProducts = stores.reduce((acc, s) => acc + s.productsCount, 0);

  return (
    <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
      <Sidebar isAdmin={true} />

      <main className="flex-1 overflow-x-hidden">
        <TopBar
          title="لوحة التحكم"
          subtitle={`مرحباً، ${user?.name} 👋`}
        />

        <div className="p-6 space-y-6 mt-16 lg:mt-0">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 p-6"
          >
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, white 0%, transparent 50%)`,
            }} />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">مرحباً، {user?.name} 👋</h2>
                <p className="text-indigo-200 text-sm">تحكم في جميع متاجرك من مكان واحد</p>
              </div>
              <Link href="/admin/stores/new">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm"
                >
                  <Plus size={18} />
                  إنشاء متجر جديد
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <AdminExportOrdersBanner />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي المتاجر"
              value={stores.length}
              change={`${activeStores.length} متجر نشط`}
              changeType="up"
              icon={Store}
              color="indigo"
              delay={0}
            />
            <StatCard
              title="إجمالي الإيرادات"
              value={formatCurrency(totalRevenue)}
              change="هذا الشهر"
              changeType="up"
              icon={TrendingUp}
              color="emerald"
              delay={0.1}
            />
            <StatCard
              title="إجمالي الطلبات"
              value={totalOrders}
              change="+12% من الشهر الماضي"
              changeType="up"
              icon={ShoppingBag}
              color="purple"
              delay={0.2}
            />
            <StatCard
              title="إجمالي المنتجات"
              value={totalProducts}
              change={`عبر ${stores.length} متاجر`}
              changeType="neutral"
              icon={Activity}
              color="amber"
              delay={0.3}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Stores Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="xl:col-span-2 glass rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">المتاجر الأخيرة</h3>
                  <p className="text-xs text-gray-500 mt-0.5">آخر {stores.length} متاجر مسجلة</p>
                </div>
                <Link href="/admin/stores" className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                  عرض الكل
                  <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="divide-y divide-gray-800/50">
                {stores.slice(0, 5).map((store, i) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Store size={16} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{store.name}</p>
                      <p className="text-xs text-gray-500 truncate">{store.ownerName}</p>
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-semibold text-white">{formatCurrency(getStoreStats(stats, store.id).revenue)}</p>
                      <p className="text-xs text-gray-500">{getStoreStats(stats, store.id).ordersCount} طلب</p>
                    </div>
                    <Badge variant={store.status === "active" ? "active" : "inactive"}>
                      {store.status === "active" ? "نشط" : "موقوف"}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl border border-gray-700/50 p-5"
            >
              <h3 className="font-semibold text-white mb-5">نظرة عامة</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">متاجر نشطة</p>
                      <p className="text-xs text-gray-500">قيد التشغيل</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-emerald-400">{activeStores.length}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${(activeStores.length / stores.length) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-500/10 flex items-center justify-center">
                      <XCircle size={16} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">متاجر موقوفة</p>
                      <p className="text-xs text-gray-500">مؤقتاً</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-gray-400">{stores.length - activeStores.length}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe size={16} className="text-indigo-400" />
                    <p className="text-sm font-medium text-white">روابط المتاجر</p>
                  </div>
                  {stores.slice(0, 3).map((store) => (
                    <a
                      key={store.id}
                      href={`/store/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 py-2 text-gray-400 hover:text-indigo-400 transition-colors group"
                    >
                      <div className={`w-2 h-2 rounded-full ${store.status === "active" ? "bg-emerald-400" : "bg-gray-600"}`} />
                      <span className="text-xs flex-1 truncate">/store/{store.slug}</span>
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
