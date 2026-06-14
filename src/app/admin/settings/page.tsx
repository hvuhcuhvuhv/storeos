"use client";

import { motion } from "framer-motion";
import { Shield, Globe, Bell, Save, CheckCircle, RotateCcw, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { ConfirmDialog } from "@/components/ui/Modal";
import { resetAllData } from "@/lib/resetData";
import { usePlatformStore, DEFAULT_PLATFORM_SETTINGS } from "@/store/usePlatformStore";
import { useAppHydration } from "@/lib/hydration";

export default function AdminSettingsPage() {
  const hydrated = useAppHydration();
  const { settings, updateSettings } = usePlatformStore();
  const [platformName, setPlatformName] = useState<string>(DEFAULT_PLATFORM_SETTINGS.platformName);
  const [supportEmail, setSupportEmail] = useState<string>(DEFAULT_PLATFORM_SETTINGS.supportEmail);
  const [allowNewStores, setAllowNewStores] = useState<boolean>(DEFAULT_PLATFORM_SETTINGS.allowNewStores);
  const [notifications, setNotifications] = useState<boolean>(DEFAULT_PLATFORM_SETTINGS.notifications);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setPlatformName(settings.platformName);
    setSupportEmail(settings.supportEmail);
    setAllowNewStores(settings.allowNewStores);
    setNotifications(settings.notifications);
  }, [hydrated, settings]);

  const handleSave = async () => {
    setSaving(true);
    updateSettings({
      platformName: platformName.trim() || DEFAULT_PLATFORM_SETTINGS.platformName,
      supportEmail: supportEmail.trim() || DEFAULT_PLATFORM_SETTINGS.supportEmail,
      allowNewStores,
      notifications,
    });
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetAll = () => {
    setResetting(true);
    resetAllData();
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
      <Sidebar isAdmin={true} />
      <main className="flex-1 overflow-x-hidden">
        <TopBar title="الإعدادات" subtitle="إعدادات المنصة العامة" />
        <div className="p-6 max-w-2xl space-y-6 mt-16 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-gray-700/50 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-700/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Globe size={18} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">إعدادات المنصة</h3>
                <p className="text-xs text-gray-500">التحكم في إعدادات {settings.platformName} العامة</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">اسم المنصة</label>
                <input
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="StoreOS"
                  className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <p className="text-xs text-gray-600 mt-1.5">يظهر في الشريط الجانبي، صفحة الدخول، وتذييل المتاجر</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">بريد الدعم</label>
                <input
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  dir="ltr"
                  className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl border border-gray-700/50 p-5 space-y-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield size={18} className="text-purple-400" />
              <h3 className="font-semibold text-white">الصلاحيات والإشعارات</h3>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 cursor-pointer">
              <div>
                <p className="text-sm text-white">السماح بإنشاء متاجر جديدة</p>
                <p className="text-xs text-gray-500">يمكن للأدمن إنشاء متاجر جديدة</p>
              </div>
              <button
                type="button"
                onClick={() => setAllowNewStores(!allowNewStores)}
                className={`relative w-12 h-6 rounded-full transition-colors ${allowNewStores ? "bg-emerald-500" : "bg-gray-700"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${allowNewStores ? "right-0.5" : "right-6"}`} />
              </button>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 cursor-pointer">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-400" />
                <div>
                  <p className="text-sm text-white">إشعارات المنصة</p>
                  <p className="text-xs text-gray-500">تنبيهات المتاجر والطلبات الجديدة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? "bg-emerald-500" : "bg-gray-700"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? "right-0.5" : "right-6"}`} />
              </button>
            </label>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl border border-red-500/20 overflow-hidden"
          >
            <div className="p-5 border-b border-red-500/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">منطقة خطرة</h3>
                <p className="text-xs text-gray-500">إجراءات لا يمكن التراجع عنها</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-400 mb-4">
                إعادة تعيين جميع البيانات: المتاجر، الطلبات، المستخدمين، السلات — منصة فارغة مع حساب الأدمن فقط.
              </p>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={resetting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 hover:text-red-300 text-sm font-medium transition-all disabled:opacity-50"
              >
                {resetting ? (
                  <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                ) : (
                  <RotateCcw size={16} />
                )}
                تصفير جميع البيانات
              </button>
            </div>
          </motion.div>

          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.01 }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl py-3.5 transition-all"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle size={18} />
                تم الحفظ!
              </>
            ) : (
              <>
                <Save size={18} />
                حفظ الإعدادات
              </>
            )}
          </motion.button>
        </div>
      </main>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetAll}
        title="تصفير جميع البيانات"
        message="هل أنت متأكد؟ سيتم حذف جميع المتاجر والطلبات والمستخدمين المضافين وإعادة البيانات للحالة الافتراضية. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، صفّر البيانات"
      />
    </div>
  );
}
