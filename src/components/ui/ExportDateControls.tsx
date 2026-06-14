"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Download, X } from "lucide-react";
import { filterOrdersByDate, formatFilterDateLabel } from "@/lib/utils";

type Variant = "indigo" | "emerald";

interface ExportDateControlsProps {
  totalOrders: number;
  orders: { createdAt: string }[];
  exporting: boolean;
  onExport: (filterDate: string) => void | Promise<void>;
  variant?: Variant;
}

const VARIANTS: Record<
  Variant,
  { btn: string; btnHover: string; btnDisabled: string; shadow: string; input: string }
> = {
  indigo: {
    btn: "bg-indigo-600 hover:bg-indigo-500",
    btnHover: "",
    btnDisabled: "disabled:bg-gray-700",
    shadow: "shadow-indigo-500/20",
    input: "focus:border-indigo-500",
  },
  emerald: {
    btn: "bg-emerald-600 hover:bg-emerald-500",
    btnHover: "",
    btnDisabled: "disabled:bg-gray-700",
    shadow: "shadow-emerald-500/20",
    input: "focus:border-emerald-500",
  },
};

export function ExportDateControls({
  totalOrders,
  orders,
  exporting,
  onExport,
  variant = "indigo",
}: ExportDateControlsProps) {
  const [filterDate, setFilterDate] = useState("");
  const styles = VARIANTS[variant];

  const filteredCount = filterDate ? filterOrdersByDate(orders, filterDate).length : totalOrders;
  const canExport = totalOrders > 0 && (!filterDate || filteredCount > 0);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-700/60 rounded-xl px-3 py-2">
        <Calendar size={16} className="text-gray-400 shrink-0" />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className={`bg-transparent text-white text-sm focus:outline-none ${styles.input} [color-scheme:dark] min-w-[140px]`}
          title="اختر تاريخاً لتصدير طلبات ذلك اليوم فقط"
        />
        {filterDate && (
          <button
            type="button"
            onClick={() => setFilterDate("")}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            title="عرض كل الطلبات"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {filterDate && (
        <p className="text-xs text-gray-400 sm:hidden">
          {filteredCount} طلب في {formatFilterDateLabel(filterDate)}
        </p>
      )}

      <motion.button
        onClick={() => onExport(filterDate)}
        disabled={exporting || !canExport}
        whileHover={{ scale: exporting || !canExport ? 1 : 1.02 }}
        whileTap={{ scale: exporting || !canExport ? 1 : 0.98 }}
        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl ${styles.btn} ${styles.btnDisabled} disabled:shadow-none text-white text-sm font-medium transition-all shadow-lg ${styles.shadow} whitespace-nowrap`}
      >
        {exporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            جارٍ التصدير...
          </>
        ) : (
          <>
            <Download size={16} />
            {filterDate ? `تصدير ${formatFilterDateLabel(filterDate)}` : "تصدير Excel"}
          </>
        )}
      </motion.button>
    </div>
  );
}
