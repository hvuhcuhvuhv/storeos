"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet } from "lucide-react";
import { useStoreStore } from "@/store/useStoreStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { useAuthStore } from "@/store/useAuthStore";
import { exportAdminAllOrdersToExcel } from "@/lib/exportExcel";
import { ExportDateControls } from "@/components/ui/ExportDateControls";
import { formatDateTime, formatFilterDateLabel } from "@/lib/utils";

export function AdminExportOrdersBanner() {
  const [exporting, setExporting] = useState(false);
  const [lastExportedAt, setLastExportedAt] = useState<string | null>(null);
  const [lastFilterDate, setLastFilterDate] = useState<string | null>(null);
  const { stores } = useStoreStore();
  const { orders } = useOrdersStore();
  const { users } = useAuthStore();

  const storeOwners = users.filter((u) => u.role === "store_owner");

  const handleExport = async (filterDate: string) => {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 400));
    exportAdminAllOrdersToExcel(
      stores,
      orders,
      storeOwners,
      filterDate ? { filterDate } : undefined
    );
    setLastExportedAt(new Date().toISOString());
    setLastFilterDate(filterDate || null);
    setExporting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <FileSpreadsheet size={20} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">تصدير جميع الطلبات</p>
          <p className="text-xs text-gray-400">
            {orders.length} طلب • {stores.length} متجر • {storeOwners.length} صاحب متجر — العملة: درهم إماراتي
          </p>
          {lastExportedAt && (
            <p className="text-xs text-emerald-400/80 mt-1">
              آخر تصدير: {formatDateTime(lastExportedAt)}
              {lastFilterDate ? ` — ${formatFilterDateLabel(lastFilterDate)}` : ""}
            </p>
          )}
        </div>
      </div>
      <ExportDateControls
        totalOrders={orders.length}
        orders={orders}
        exporting={exporting}
        onExport={handleExport}
        variant="indigo"
      />
    </motion.div>
  );
}
