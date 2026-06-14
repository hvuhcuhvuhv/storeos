"use client";

import { motion } from "framer-motion";
import { Users, Shield, Store, Search, Mail } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreStore } from "@/store/useStoreStore";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/Cards";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const { users } = useAuthStore();
  const { stores } = useStoreStore();
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStoreName = (storeId?: string) => {
    if (!storeId) return "—";
    return stores.find((s) => s.id === storeId)?.name || "—";
  };

  return (
    <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
      <Sidebar isAdmin={true} />
      <main className="flex-1 overflow-x-hidden">
        <TopBar title="المستخدمون" subtitle={`${users.length} مستخدم مسجل`} />
        <div className="p-6 space-y-6 mt-16 lg:mt-0">
          <div className="relative max-w-md">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد..."
              className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl border border-gray-700/50 p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    u.role === "admin" ? "bg-purple-500/10" : "bg-emerald-500/10"
                  }`}>
                    {u.role === "admin" ? (
                      <Shield size={18} className="text-purple-400" />
                    ) : (
                      <Store size={18} className="text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white truncate">{u.name}</p>
                      <Badge variant={u.role === "admin" ? "info" : "active"}>
                        {u.role === "admin" ? "أدمن" : "صاحب متجر"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate" dir="ltr">
                      <Mail size={11} />
                      {u.email}
                    </p>
                  </div>
                </div>
                {u.role === "store_owner" && (
                  <div className="pt-3 border-t border-gray-700/50 text-xs text-gray-400">
                    المتجر: <span className="text-white">{getStoreName(u.storeId)}</span>
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-2">{formatDate(u.createdAt)}</p>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">لا يوجد مستخدمون تطابق البحث</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
