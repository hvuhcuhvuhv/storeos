"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className={cn(
              "relative w-full glass shadow-2xl border border-gray-700/50 flex flex-col",
              "rounded-t-3xl sm:rounded-2xl",
              "max-h-[92dvh] sm:max-h-[90vh]",
              sizeMap[size]
            )}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50 shrink-0">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "warning" | "info";
  confirmLabel?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "danger",
  confirmLabel = "تأكيد",
}: ConfirmDialogProps) {
  const icons = {
    danger: <AlertTriangle size={24} className="text-red-400" />,
    warning: <AlertTriangle size={24} className="text-amber-400" />,
    info: <Info size={24} className="text-blue-400" />,
  };

  const buttonStyles = {
    danger: "bg-red-600 hover:bg-red-500",
    warning: "bg-amber-600 hover:bg-amber-500",
    info: "bg-blue-600 hover:bg-blue-500",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center">
          {icons[type]}
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-all text-sm font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-white transition-all text-sm font-medium",
              buttonStyles[type]
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", icon: <CheckCircle size={16} /> },
    error: { bg: "bg-red-500/10 border-red-500/30", text: "text-red-400", icon: <AlertTriangle size={16} /> },
    info: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", icon: <Info size={16} /> },
  };

  const style = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm",
        style.bg, style.text
      )}
    >
      {style.icon}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </motion.div>
  );
}
