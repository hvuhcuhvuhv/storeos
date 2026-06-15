"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  ExternalLink,
  Filter,
  Package,
  ShoppingCart,
  TrendingUp,
  Eye,
  Landmark,
} from "lucide-react";
import { useStoreStore } from "@/store/useStoreStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/Cards";
import { AdminExportOrdersBanner } from "@/components/admin/ExportOrdersBanner";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { computeStoreStats, getStoreStats } from "@/lib/stats";
import Link from "next/link";
import { Store as StoreType } from "@/types";

export default function StoresPage() {
  const { stores, toggleStoreStatus, deleteStore, updateStore } = useStoreStore();
  const orders = useOrdersStore((s) => s.orders);
  const stats = computeStoreStats(orders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [editStore, setEditStore] = useState<StoreType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", category: "" });

  const filtered = stores.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openEdit = (store: StoreType) => {
    setEditStore(store);
    setEditForm({ name: store.name, description: store.description, category: store.category });
  };

  const handleEdit = () => {
    if (editStore) {
      updateStore(editStore.id, editForm);
      setEditStore(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
      <Sidebar isAdmin={true} />
      <main className="flex-1 overflow-x-hidden">
        <TopBar title="إدارة المتاجر" subtitle={`${stores.length} متجر مسجل`} />

        <div className="p-6 space-y-6 mt-16 lg:mt-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">المتاجر الإلكترونية</h2>
              <p className="text-gray-400 text-sm mt-1">إدارة وتتبع جميع المتاجر على المنصة</p>
            </div>
            <Link href="/admin/stores/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm shadow-lg shadow-indigo-500/25"
              >
                <Plus size={18} />
                إنشاء متجر جديد
              </motion.button>
            </Link>
          </div>

          <AdminExportOrdersBanner />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن متجر أو صاحب متجر..."
                className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "active", "inactive"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    filterStatus === status
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {status === "all" ? "الكل" : status === "active" ? "نشط" : "موقوف"}
                </button>
              ))}
            </div>
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((store, i) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  layout
                  className="glass rounded-2xl border border-gray-700/50 overflow-hidden hover:border-indigo-500/30 transition-colors group"
                >
                  {/* Store Header */}
                  <div className="p-5 border-b border-gray-700/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                          <Store size={20} className="text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{store.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{store.ownerName}</p>
                          <p className="text-xs text-gray-600">{store.ownerEmail}</p>
                        </div>
                      </div>
                      <Badge variant={store.status === "active" ? "active" : "inactive"}>
                        {store.status === "active" ? "نشط" : "موقوف"}
                      </Badge>
                    </div>

                    {store.description && (
                      <p className="text-xs text-gray-500 mt-3 line-clamp-2">{store.description}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-700/30 p-4">
                    <div className="text-center px-2">
                      <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                        <Package size={13} />
                      </div>
                      <p className="text-sm font-bold text-white">{store.productsCount}</p>
                      <p className="text-xs text-gray-500">منتج</p>
                    </div>
                    <div className="text-center px-2">
                      <div className="flex items-center justify-center gap-1 text-indigo-400 mb-1">
                        <ShoppingCart size={13} />
                      </div>
                      <p className="text-sm font-bold text-white">{getStoreStats(stats, store.id).ordersCount}</p>
                      <p className="text-xs text-gray-500">طلب</p>
                    </div>
                    <div className="text-center px-2">
                      <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                        <TrendingUp size={13} />
                      </div>
                      <p className="text-xs font-bold text-white">{formatCurrency(getStoreStats(stats, store.id).revenue)}</p>
                      <p className="text-xs text-gray-500">إيراد</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 pt-0 flex items-center gap-2">
                    <a
                      href={`/store/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all text-xs font-medium"
                    >
                      <ExternalLink size={13} />
                      معاينة
                    </a>
                    <button
                      onClick={() => openEdit(store)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all text-xs font-medium"
                    >
                      <Edit2 size={13} />
                      تعديل
                    </button>
                    <button
                      onClick={() => toggleStoreStatus(store.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all text-xs font-medium ${
                        store.status === "active"
                          ? "text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                          : "text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      <Power size={13} />
                      {store.status === "active" ? "إيقاف" : "تفعيل"}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(store.id)}
                      className="flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Payment method + revenue */}
                  <div className="px-4 pb-2">
                    <div className="px-3 py-2.5 rounded-lg border bg-amber-500/5 border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <Landmark size={13} className="text-amber-400" />
                        <span className="text-xs font-medium text-gray-300">
                          الدفع عند الاستلام
                        </span>
                        <span className="mr-auto text-xs font-bold text-emerald-400">
                          {formatCurrency(getStoreStats(stats, store.id).revenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Store URL */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/30">
                      <div className={`w-1.5 h-1.5 rounded-full ${store.status === "active" ? "bg-emerald-400" : "bg-gray-600"}`} />
                      <span className="text-xs text-gray-500 truncate flex-1 text-left" dir="ltr">
                        /store/{store.slug}
                      </span>
                      <span className="text-xs text-gray-600">{formatDate(store.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Store size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد متاجر تطابق البحث</p>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <Modal isOpen={!!editStore} onClose={() => setEditStore(null)} title="تعديل المتجر">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">اسم المتجر</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">الوصف</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">الفئة</label>
            <input
              value={editForm.category}
              onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditStore(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700/50 text-sm"
            >
              إلغاء
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
            >
              حفظ التغييرات
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteStore(deleteTarget); }}
        title="حذف المتجر"
        message="هل أنت متأكد من حذف هذا المتجر؟ سيتم حذف جميع البيانات المرتبطة به نهائياً."
        confirmLabel="حذف المتجر"
      />
    </div>
  );
}
