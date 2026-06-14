"use client";

import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Plus,
  ExternalLink,
  Copy,
  Check,
  ArrowUpRight,
  Globe,
  Download,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useStoreStore } from "@/store/useStoreStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { exportStoreDataToExcel } from "@/lib/exportExcel";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { StatCard, Badge } from "@/components/ui/Cards";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const STATUS_MAP: Record<string, { label: string; variant: "active" | "inactive" | "pending" | "warning" | "info" }> = {
  delivered: { label: "تم التسليم", variant: "active" },
  processing: { label: "قيد المعالجة", variant: "info" },
  pending: { label: "قيد الانتظار", variant: "pending" },
  shipped: { label: "تم الشحن", variant: "info" },
  cancelled: { label: "ملغي", variant: "warning" },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { getStoreById } = useStoreStore();
  const { getOrdersByStoreId } = useOrdersStore();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const store = user?.storeId ? getStoreById(user.storeId) : null;
  const orders = store ? getOrdersByStoreId(store.id) : [];
  const recentOrders = orders.slice(0, 5);
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const copyLink = () => {
    const url = `${window.location.origin}/store/${store?.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (!store) return;
    setExporting(true);
    await new Promise((r) => setTimeout(r, 400));
    exportStoreDataToExcel(store, orders);
    setExporting(false);
  };

  if (!store) {
    return (
      <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
        <Sidebar isAdmin={false} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">لا يوجد متجر مرتبط بحسابك</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
      <Sidebar isAdmin={false} />

      <main className="flex-1 overflow-x-hidden">
        <TopBar title="لوحة التحكم" subtitle={store.brandName || store.name} />

        <div className="p-6 space-y-6 mt-16 lg:mt-0">
          {/* Store Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 p-6"
          >
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 80% 50%, white 0%, transparent 50%)`,
            }} />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-white">{store.brandName || store.name}</h2>
                  <Badge variant={store.status === "active" ? "active" : "inactive"}>
                    {store.status === "active" ? "نشط" : "موقوف"}
                  </Badge>
                </div>
                <p className="text-emerald-200 text-sm">{store.category}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2.5">
                  <Globe size={14} className="text-emerald-200" />
                  <span className="text-emerald-100 text-sm font-mono" dir="ltr">/store/{store.slug}</span>
                  <button onClick={copyLink} className="text-emerald-200 hover:text-white transition-colors ml-1">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white px-4 py-2.5 rounded-xl font-medium transition-all text-sm">
                    <ExternalLink size={14} />
                    فتح المتجر
                  </button>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي المنتجات"
              value={store.productsCount}
              change="منتج نشط"
              changeType="up"
              icon={Package}
              color="indigo"
              delay={0}
            />
            <StatCard
              title="إجمالي الطلبات"
              value={orders.length}
              change={`${orders.filter((o) => o.status === "delivered").length} تم تسليمها`}
              changeType="up"
              icon={ShoppingCart}
              color="purple"
              delay={0.1}
            />
            <StatCard
              title="الإيرادات"
              value={formatCurrency(revenue)}
              change="من الطلبات الحالية"
              changeType="up"
              icon={TrendingUp}
              color="emerald"
              delay={0.2}
            />
            <StatCard
              title="العملاء"
              value={new Set(orders.map((o) => o.customerEmail)).size}
              change="عملاء فريدون"
              changeType="up"
              icon={Users}
              color="amber"
              delay={0.3}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="xl:col-span-2 glass rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">الطلبات الأخيرة</h3>
                  <p className="text-xs text-gray-500 mt-0.5">آخر 5 طلبات</p>
                </div>
                <Link href="/dashboard/orders">
                  <button className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                    عرض الكل
                    <ArrowUpRight size={14} />
                  </button>
                </Link>
              </div>
              <div className="divide-y divide-gray-800/50">
                {recentOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                      <ShoppingCart size={15} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.id} • {formatDate(order.createdAt)}</p>
                    </div>
                    <p className="text-sm font-semibold text-white hidden sm:block">{formatCurrency(order.total)}</p>
                    <Badge variant={STATUS_MAP[order.status].variant}>
                      {STATUS_MAP[order.status].label}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions & Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              {/* Quick Actions */}
              <div className="glass rounded-2xl border border-gray-700/50 p-5">
                <h3 className="font-semibold text-white mb-4">إجراءات سريعة</h3>
                <div className="space-y-2">
                  <Link href="/dashboard/products">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-indigo-500/10 hover:border-indigo-500/20 border border-transparent transition-all group text-right">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                        <Plus size={15} className="text-indigo-400" />
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">إضافة منتج جديد</span>
                    </button>
                  </Link>
                  <Link href="/dashboard/orders">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent transition-all group text-right">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                        <ShoppingCart size={15} className="text-emerald-400" />
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">إدارة الطلبات</span>
                    </button>
                  </Link>
                  <Link href="/dashboard/settings">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent transition-all group text-right">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                        <Settings size={15} className="text-purple-400" />
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">الإعدادات والشعار</span>
                    </button>
                  </Link>
                  <button
                    onClick={handleExport}
                    disabled={exporting || orders.length === 0}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent transition-all group text-right disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                      {exporting ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                      ) : (
                        <Download size={15} className="text-emerald-400" />
                      )}
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {exporting ? "جارٍ التصدير..." : "تصدير Excel"}
                    </span>
                  </button>
                  <button onClick={copyLink} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent transition-all group text-right">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      {copied ? <Check size={15} className="text-purple-400" /> : <Copy size={15} className="text-purple-400" />}
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {copied ? "تم النسخ!" : "نسخ رابط المتجر"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Store Stats */}
              <div className="glass rounded-2xl border border-gray-700/50 p-5">
                <h3 className="font-semibold text-white mb-4">معلومات المتجر</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">الفئة</span>
                    <span className="text-white font-medium">{store.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">الحالة</span>
                    <Badge variant={store.status === "active" ? "active" : "inactive"}>
                      {store.status === "active" ? "نشط" : "موقوف"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">تاريخ الإنشاء</span>
                    <span className="text-white text-xs">{formatDate(store.createdAt)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-700/50">
                    <a
                      href={`/store/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium"
                    >
                      <ExternalLink size={14} />
                      زيارة المتجر
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
