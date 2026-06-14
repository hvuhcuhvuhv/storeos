"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  Shield,
  Package,
  ShoppingCart,
  BarChart3,
  ExternalLink,
  Eye,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreStore } from "@/store/useStoreStore";
import { usePlatformStore } from "@/store/usePlatformStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { cn, formatDate } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const ADMIN_NAV: NavItem[] = [
  { label: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
  { label: "إدارة المتاجر", href: "/admin/stores", icon: Store },
  { label: "المستخدمون", href: "/admin/users", icon: Users },
  { label: "الإحصائيات", href: "/admin/analytics", icon: BarChart3 },
  { label: "الإعدادات", href: "/admin/settings", icon: Settings },
];

const STORE_NAV: NavItem[] = [
  { label: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  { label: "المنتجات", href: "/dashboard/products", icon: Package },
  { label: "الطلبات", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "العملاء", href: "/dashboard/customers", icon: Users },
  { label: "الإحصائيات", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "الإعدادات", href: "/dashboard/settings", icon: Settings },
];

function NotificationsBell({ align = "left" }: { align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { stores } = useStoreStore();
  const { orders } = useOrdersStore();

  const isAdmin = user?.role === "admin";

  const notifications = isAdmin
    ? stores
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6)
        .map((s) => ({
          id: s.id,
          title: `متجر جديد: ${s.name}`,
          subtitle: s.ownerName,
          date: s.createdAt,
        }))
    : orders
        .filter((o) => o.storeId === user?.storeId)
        .slice(0, 6)
        .map((o) => ({
          id: o.id,
          title: `طلب جديد من ${o.customerName}`,
          subtitle: o.id,
          date: o.createdAt,
        }));

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all relative"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl bg-gray-900 border border-gray-700/60 shadow-2xl z-50",
              align === "left" ? "left-0" : "right-0"
            )}
          >
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">الإشعارات</span>
              <span className="text-xs text-gray-500">{notifications.length}</span>
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/60">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 hover:bg-gray-800/40 transition-colors">
                    <p className="text-sm text-white truncate">{n.title}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-500 truncate" dir="ltr">{n.subtitle}</p>
                      <p className="text-xs text-gray-600 shrink-0">{formatDate(n.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { getStoreById, stores } = useStoreStore();
  const platformName = usePlatformStore((s) => s.settings.platformName);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navItems = isAdmin ? ADMIN_NAV : STORE_NAV;

  const store = !isAdmin && user?.storeId ? getStoreById(user.storeId) : null;
  const displayName = store ? (store.brandName || store.name) : platformName;
  const displaySubtitle = isAdmin ? "لوحة الأدمن" : "لوحة المتجر";

  const activeStore = stores.find((s) => s.status === "active");
  const storePreviewUrl = !isAdmin && store
    ? `/store/${store.slug}`
    : isAdmin && activeStore
    ? `/store/${activeStore.slug}`
    : isAdmin
    ? "/admin/stores"
    : null;
  const storePreviewLabel = "عرض المتجر";
  const storePreviewHint = !isAdmin && store
    ? `/store/${store.slug}`
    : isAdmin && activeStore
    ? activeStore.name
    : isAdmin
    ? "لا يوجد متجر نشط"
    : null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3">
          {store?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo} alt={displayName} className="w-10 h-10 rounded-xl object-cover shadow-lg" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShoppingBag size={20} className="text-white" />
            </div>
          )}
          <div>
            <span className="text-lg font-bold text-white truncate max-w-[140px] block">{displayName}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", isAdmin ? "bg-purple-400" : "bg-emerald-400")} />
              <span className="text-xs text-gray-500">{displaySubtitle}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  isActive
                    ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                )}
              >
                <item.icon size={18} className={cn(isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300")} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-auto" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* View Store CTA */}
      {storePreviewUrl && (
        <div className="px-4 pb-2">
          <a
            href={storePreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative overflow-hidden rounded-xl p-3.5 flex items-center gap-3 group cursor-pointer",
                isAdmin
                  ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 hover:border-indigo-400/50"
                  : "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-400/50"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-lg",
                isAdmin
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
              )}>
                <Eye size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-white/90">
                  {storePreviewLabel}
                </p>
                {storePreviewHint && (
                  <p className="text-xs text-gray-500 truncate" dir="ltr">
                    {storePreviewHint}
                  </p>
                )}
              </div>
              <ExternalLink
                size={14}
                className={cn(
                  "shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                  isAdmin ? "text-indigo-400" : "text-emerald-400"
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            </motion.div>
          </a>
        </div>
      )}

      {/* User info + logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-800/50 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
            {isAdmin ? <Shield size={16} className="text-indigo-400" /> : <Store size={16} className="text-emerald-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
        >
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-gray-900/80 backdrop-blur-xl border-l border-gray-800 flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
          {store?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo} alt={displayName} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
          )}
          <span className="font-bold text-white truncate max-w-[120px]">{displayName}</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationsBell align="left" />
          <button
            onClick={() => setIsMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-gray-900 z-50 lg:hidden"
            >
              <div className="absolute left-4 top-4">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-30 hidden lg:flex">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <NotificationsBell align="left" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800/50 border border-gray-700/50 cursor-pointer hover:bg-gray-800 transition-all">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-400">{user?.name?.[0] || "م"}</span>
          </div>
          <span className="text-sm text-gray-300 font-medium">{user?.name}</span>
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}
