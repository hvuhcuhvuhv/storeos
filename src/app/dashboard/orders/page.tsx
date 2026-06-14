"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Search, Eye, FileSpreadsheet, User, Phone, Mail, MapPin, Home } from "lucide-react";
import { useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/Cards";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreStore } from "@/store/useStoreStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { exportStoreDataToExcel } from "@/lib/exportExcel";
import { ExportDateControls } from "@/components/ui/ExportDateControls";
import { Order } from "@/types";

const STATUS_OPTIONS: Order["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_MAP: Record<string, { label: string; variant: "active" | "inactive" | "pending" | "warning" | "info" }> = {
  delivered: { label: "تم التسليم", variant: "active" },
  processing: { label: "قيد المعالجة", variant: "info" },
  pending: { label: "قيد الانتظار", variant: "pending" },
  shipped: { label: "تم الشحن", variant: "info" },
  cancelled: { label: "ملغي", variant: "warning" },
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [exporting, setExporting] = useState(false);

  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const { user } = useAuthStore();
  const { getStoreById } = useStoreStore();
  const { getOrdersByStoreId, updateOrderStatus } = useOrdersStore();

  const store = user?.storeId ? getStoreById(user.storeId) : null;
  const orders = store ? getOrdersByStoreId(store.id) : [];

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customerName.includes(search) ||
      o.id.includes(search) ||
      o.customerPhone.includes(search) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleExport = async (filterDate: string) => {
    if (!store) return;
    setExporting(true);
    await new Promise((r) => setTimeout(r, 400));
    exportStoreDataToExcel(store, orders, filterDate ? { filterDate } : undefined);
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
        <TopBar title="الطلبات" subtitle={`${orders.length} طلب — ${store.brandName || store.name}`} />
        <div className="p-6 space-y-6 mt-16 lg:mt-0">
          {/* Export Banner */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <FileSpreadsheet size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">تصدير البيانات إلى Excel</p>
                <p className="text-xs text-gray-400">
                  الطلبات، العملاء مع أرقام الهواتف، وبيانات صاحب المتجر
                </p>
              </div>
            </div>
            <ExportDateControls
              totalOrders={orders.length}
              orders={orders}
              exporting={exporting}
              onExport={handleExport}
              variant="emerald"
            />
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث برقم الطلب أو اسم العميل أو الهاتف..."
                className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="all">جميع الطلبات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="processing">قيد المعالجة</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          <div className="glass rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-gray-700/50">
                  <tr>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase">رقم الطلب</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase">العميل</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase">الهاتف</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase">المنتجات</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase">المبلغ</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase">الحالة</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase">التاريخ</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filtered.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-mono text-indigo-400">{order.id}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{order.customerName}</p>
                          <p className="text-xs text-gray-500" dir="ltr">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-300 font-mono" dir="ltr">{order.customerPhone}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-400">
                          {order.items.reduce((s, item) => s + item.quantity, 0)} منتج
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-white">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={STATUS_MAP[order.status].variant}>
                          {STATUS_MAP[order.status].label}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد طلبات تطابق البحث</p>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={viewOrder ? `تفاصيل الطلب ${viewOrder.id}` : "تفاصيل الطلب"}
        size="lg"
      >
        {viewOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800/40">
                <User size={15} className="text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">العميل</p>
                  <p className="text-sm text-white truncate">{viewOrder.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800/40">
                <Phone size={15} className="text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">الهاتف</p>
                  <p className="text-sm text-white truncate" dir="ltr">{viewOrder.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800/40">
                <Mail size={15} className="text-purple-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                  <p className="text-sm text-white truncate" dir="ltr">{viewOrder.customerEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800/40">
                <MapPin size={15} className="text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">المدينة</p>
                  <p className="text-sm text-white truncate">{viewOrder.customerCity || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800/40 sm:col-span-2">
                <Home size={15} className="text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">العنوان</p>
                  <p className="text-sm text-white">{viewOrder.customerAddress || "—"}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-white mb-2">المنتجات</p>
              <div className="rounded-xl border border-gray-700/50 overflow-hidden divide-y divide-gray-800/60">
                {viewOrder.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-gray-300">{item.productName}</span>
                    <span className="text-gray-500">
                      {item.quantity} × {formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-sm text-gray-400">الإجمالي</span>
                <span className="text-lg font-bold text-indigo-400">{formatCurrency(viewOrder.total)}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1 px-1">تاريخ الطلب: {formatDateTime(viewOrder.createdAt)}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white mb-2">حالة الطلب</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      updateOrderStatus(viewOrder.id, status);
                      setViewOrder({ ...viewOrder, status });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      viewOrder.status === status
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600"
                    }`}
                  >
                    {STATUS_MAP[status].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
