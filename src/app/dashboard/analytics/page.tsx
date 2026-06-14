"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  CalendarClock,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreStore } from "@/store/useStoreStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { StatCard, Badge } from "@/components/ui/Cards";
import { formatCurrency, formatDateTime, formatTime } from "@/lib/utils";
import { aggregateCustomers } from "@/lib/exportExcel";
import { useAppHydration } from "@/lib/hydration";
import { Order } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  delivered: "تم التسليم",
  processing: "قيد المعالجة",
  pending: "قيد الانتظار",
  shipped: "تم الشحن",
  cancelled: "ملغي",
};

const STATUS_VARIANT: Record<string, "active" | "inactive" | "pending" | "warning" | "info"> = {
  delivered: "active",
  processing: "info",
  pending: "pending",
  shipped: "info",
  cancelled: "warning",
};

const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function buildDailySales(orders: Order[], days = 7) {
  const result: { label: string; date: Date; revenue: number; count: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    result.push({
      label: DAY_NAMES[day.getDay()],
      date: day,
      revenue: 0,
      count: 0,
    });
  }

  for (const order of orders) {
    if (order.status === "cancelled") continue;
    const created = new Date(order.createdAt);
    created.setHours(0, 0, 0, 0);
    const bucket = result.find((d) => d.date.getTime() === created.getTime());
    if (bucket) {
      bucket.revenue += order.total;
      bucket.count += 1;
    }
  }

  return result;
}

export default function StoreAnalyticsPage() {
  const hydrated = useAppHydration();
  const { user } = useAuthStore();
  const { getStoreById } = useStoreStore();
  const { getOrdersByStoreId } = useOrdersStore();

  const store = user?.storeId ? getStoreById(user.storeId) : null;
  const orders = store ? getOrdersByStoreId(store.id) : [];
  const customers = aggregateCustomers(orders);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const delivered = orders.filter((o) => o.status === "delivered").length;

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const dailySales = buildDailySales(orders);
  const maxRevenue = Math.max(...dailySales.map((d) => d.revenue), 1);
  const weekRevenue = dailySales.reduce((sum, d) => sum + d.revenue, 0);

  const salesLog = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
        <Sidebar isAdmin={false} />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

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
        <TopBar title="الإحصائيات" subtitle={store.brandName || store.name} />
        <div className="p-6 space-y-6 mt-16 lg:mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="إجمالي الطلبات" value={orders.length} change={`${delivered} تم تسليمها`} changeType="up" icon={ShoppingCart} color="purple" delay={0} />
            <StatCard title="الإيرادات" value={formatCurrency(revenue)} change="من الطلبات" changeType="up" icon={TrendingUp} color="emerald" delay={0.1} />
            <StatCard title="العملاء" value={customers.length} change="عميل فريد" changeType="up" icon={Users} color="amber" delay={0.2} />
            <StatCard title="المنتجات" value={store.productsCount} change="منتج نشط" changeType="neutral" icon={Package} color="indigo" delay={0.3} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl border border-gray-700/50 p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CalendarClock size={18} className="text-emerald-400" />
                <h3 className="font-semibold text-white">مبيعات آخر 7 أيام</h3>
              </div>
              <span className="text-sm text-emerald-400 font-semibold">{formatCurrency(weekRevenue)}</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-44">
              {dailySales.map((day, i) => {
                const heightPct = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {day.revenue > 0 ? formatCurrency(day.revenue).replace("درهم", "").trim() : ""}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPct, day.revenue > 0 ? 6 : 2)}%` }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
                      className={`w-full rounded-t-lg ${
                        day.revenue > 0
                          ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                          : "bg-gray-800"
                      }`}
                      title={`${day.count} طلب — ${formatCurrency(day.revenue)}`}
                    />
                    <span className="text-[11px] text-gray-500">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass rounded-2xl border border-gray-700/50 p-5"
          >
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={18} className="text-indigo-400" />
              <h3 className="font-semibold text-white">توزيع حالات الطلبات</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-28">{STATUS_LABELS[status] || status}</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${orders.length ? (count / orders.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white w-8 text-left">{count}</span>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">لا توجد طلبات بعد</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="glass rounded-2xl border border-gray-700/50 overflow-hidden"
          >
            <div className="flex items-center gap-2 p-5 border-b border-gray-700/50">
              <Clock size={18} className="text-amber-400" />
              <h3 className="font-semibold text-white">سجل المبيعات</h3>
              <span className="text-xs text-gray-500">(أحدث {salesLog.length} عملية)</span>
            </div>

            {salesLog.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10">لا توجد مبيعات بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-800">
                      <th className="px-5 py-3 font-medium">رقم الطلب</th>
                      <th className="px-5 py-3 font-medium">العميل</th>
                      <th className="px-5 py-3 font-medium">المبلغ</th>
                      <th className="px-5 py-3 font-medium">التاريخ والوقت</th>
                      <th className="px-5 py-3 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesLog.map((order) => (
                      <tr key={order.id} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3 text-sm text-gray-300 font-mono">{order.id}</td>
                        <td className="px-5 py-3 text-sm text-white">{order.customerName}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-emerald-400">{formatCurrency(order.total)}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-300">{formatDateTime(order.createdAt)}</span>
                            <span className="text-[11px] text-gray-600 flex items-center gap-1">
                              <Clock size={10} /> {formatTime(order.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={STATUS_VARIANT[order.status] || "info"}>
                            {STATUS_LABELS[order.status] || order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
