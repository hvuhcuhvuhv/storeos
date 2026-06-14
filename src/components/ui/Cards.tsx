"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: "indigo" | "purple" | "emerald" | "amber" | "rose" | "cyan";
  delay?: number;
}

const colorMap = {
  indigo: {
    bg: "from-indigo-500/20 to-indigo-600/5",
    border: "border-indigo-500/20",
    icon: "bg-indigo-500/20 text-indigo-400",
    glow: "shadow-indigo-500/10",
  },
  purple: {
    bg: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/20",
    icon: "bg-purple-500/20 text-purple-400",
    glow: "shadow-purple-500/10",
  },
  emerald: {
    bg: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/20",
    icon: "bg-emerald-500/20 text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
  amber: {
    bg: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/20",
    icon: "bg-amber-500/20 text-amber-400",
    glow: "shadow-amber-500/10",
  },
  rose: {
    bg: "from-rose-500/20 to-rose-600/5",
    border: "border-rose-500/20",
    icon: "bg-rose-500/20 text-rose-400",
    glow: "shadow-rose-500/10",
  },
  cyan: {
    bg: "from-cyan-500/20 to-cyan-600/5",
    border: "border-cyan-500/20",
    icon: "bg-cyan-500/20 text-cyan-400",
    glow: "shadow-cyan-500/10",
  },
};

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, color, delay = 0 }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={cn(
        "relative rounded-2xl border p-5 bg-gradient-to-br shadow-xl overflow-hidden",
        colors.bg,
        colors.border,
        colors.glow
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className={cn(
              "text-xs mt-1.5 flex items-center gap-1",
              changeType === "up" ? "text-emerald-400" : changeType === "down" ? "text-red-400" : "text-gray-500"
            )}>
              {changeType === "up" ? "↑" : changeType === "down" ? "↓" : "—"} {change}
            </p>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", colors.icon)}>
          <Icon size={20} />
        </div>
      </div>
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10 bg-white blur-xl" />
    </motion.div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "active" | "inactive" | "pending" | "warning" | "info";
}

export function Badge({ children, variant = "info" }: BadgeProps) {
  const styles = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    inactive: "bg-gray-500/15 text-gray-400 border-gray-500/25",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    warning: "bg-red-500/15 text-red-400 border-red-500/25",
    info: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  };

  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border", styles[variant])}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-emerald-400": variant === "active",
        "bg-gray-500": variant === "inactive",
        "bg-amber-400": variant === "pending",
        "bg-red-400": variant === "warning",
        "bg-indigo-400": variant === "info",
      })} />
      {children}
    </span>
  );
}
