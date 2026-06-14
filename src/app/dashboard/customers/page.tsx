"use client";

import { motion } from "framer-motion";
import { Users, Search, Phone, Mail, Download, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreStore } from "@/store/useStoreStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { aggregateCustomers, exportStoreDataToExcel } from "@/lib/exportExcel";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const { user } = useAuthStore();
  const { getStoreById } = useStoreStore();
  const { getOrdersByStoreId } = useOrdersStore();

  const store = user?.storeId ? getStoreById(user.storeId) : null;
  const orders = store ? getOrdersByStoreId(store.id) : [];
  const customers = aggregateCustomers(orders);

  const filtered = customers.filter(
    (c) =>
      c.name.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

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
        <TopBar title="العملاء" subtitle={`${customers.length} عميل — ${store.brandName || store.name}`} />
        <div className="p-6 space-y-6 mt-16 lg:mt-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو البريد أو الهاتف..."
                className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <motion.button
              onClick={handleExport}
              disabled={exporting || customers.length === 0}
              whileHover={{ scale: exporting ? 1 : 1.02 }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white text-sm font-medium transition-all whitespace-nowrap"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={16} />
              )}
              تصدير Excel
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((customer, i) => (
              <motion.div
                key={customer.email}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl border border-gray-700/50 p-5 hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 font-bold text-sm">{customer.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{customer.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate" dir="ltr">
                      <Mail size={11} />
                      {customer.email}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5" dir="ltr">
                      <Phone size={11} />
                      {customer.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <ShoppingCart size={12} />
                    {customer.ordersCount} طلب
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">لا يوجد عملاء تطابق البحث</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
