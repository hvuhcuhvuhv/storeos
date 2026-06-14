"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ImageIcon,
  Type,
  CreditCard,
  Save,
  CheckCircle,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Store,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreStore } from "@/store/useStoreStore";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { StripeConfig } from "@/types";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { getStoreById, updateStore } = useStoreStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const store = user?.storeId ? getStoreById(user.storeId) : null;

  const [brandName, setBrandName] = useState("");
  const [logo, setLogo] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [stripe, setStripe] = useState<StripeConfig>({ publishableKey: "", secretKey: "", enabled: false });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!store) return;
    setBrandName(store.brandName || store.name);
    setLogo(store.logo || "");
    setOwnerPhone(store.ownerPhone || "");
    setStripe(store.stripe || { publishableKey: "", secretKey: "", enabled: false });
  }, [store]);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("حجم الصورة يجب أن لا يتجاوز 2 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    updateStore(store.id, {
      brandName: brandName.trim() || store.name,
      logo: logo || undefined,
      ownerPhone: ownerPhone.trim(),
      stripe: {
        ...stripe,
        connectedAt: stripe.enabled && stripe.publishableKey
          ? stripe.connectedAt || new Date().toISOString()
          : undefined,
      },
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const displayBrand = brandName || store.name;

  return (
    <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
      <Sidebar isAdmin={false} />
      <main className="flex-1 overflow-x-hidden">
        <TopBar title="الإعدادات" subtitle="تخصيص متجرك وبوابة الدفع" />

        <div className="p-6 max-w-3xl space-y-6 mt-16 lg:mt-0">
          {/* Brand Preview */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-gray-700/50 p-6"
          >
            <p className="text-xs text-gray-500 mb-4">معاينة الهوية البصرية</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700/50 flex items-center justify-center overflow-hidden shrink-0">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={displayBrand} className="w-full h-full object-cover" />
                ) : (
                  <Store size={28} className="text-gray-500" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{displayBrand}</h3>
                <p className="text-gray-500 text-sm">{store.name}</p>
                <a
                  href={`/store/${store.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 text-xs mt-1 hover:text-emerald-300 transition-colors"
                >
                  <ExternalLink size={12} />
                  معاينة المتجر
                </a>
              </div>
            </div>
          </motion.div>

          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl border border-gray-700/50 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-700/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <ImageIcon size={18} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">الشعار واسم البراند</h3>
                <p className="text-xs text-gray-500">خصّص هوية متجرك أمام العملاء</p>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">شعار المتجر</label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-700 hover:border-indigo-500/50 flex items-center justify-center cursor-pointer transition-colors overflow-hidden bg-gray-900/50 group"
                  >
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload size={20} className="text-gray-600 mx-auto group-hover:text-indigo-400 transition-colors" />
                        <span className="text-xs text-gray-600 mt-1 block">رفع صورة</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 text-sm transition-all"
                    >
                      <Upload size={14} />
                      اختيار صورة
                    </button>
                    {logo && (
                      <button
                        type="button"
                        onClick={() => setLogo("")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-all"
                      >
                        <Trash2 size={14} />
                        حذف الشعار
                      </button>
                    )}
                    <p className="text-xs text-gray-600">PNG, JPG, WebP — حتى 2MB</p>
                  </div>
                </div>
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Type size={14} />
                  اسم البراند
                </label>
                <input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder={store.name}
                  className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                />
                <p className="text-xs text-gray-600 mt-1.5">يظهر في واجهة المتجر العامة والتقارير</p>
              </div>

              {/* Owner Phone */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">رقم هاتف صاحب المتجر</label>
                <input
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="+971501234567"
                  dir="ltr"
                  className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                />
              </div>
            </div>
          </motion.div>

          {/* Stripe */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl border border-gray-700/50 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <CreditCard size={18} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">بوابة الدفع Stripe</h3>
                  <p className="text-xs text-gray-500">بوابة دفع خاصة بمتجرك</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStripe((s) => ({ ...s, enabled: !s.enabled }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  stripe.enabled ? "bg-emerald-500" : "bg-gray-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    stripe.enabled ? "right-0.5" : "right-6"
                  }`}
                />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                stripe.enabled && stripe.publishableKey
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-gray-800/30 border-gray-700/30"
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  stripe.enabled && stripe.publishableKey ? "bg-emerald-400" : "bg-gray-600"
                }`} />
                <span className="text-sm text-gray-300">
                  {stripe.enabled && stripe.publishableKey
                    ? "Stripe متصل — جاهز لاستقبال المدفوعات"
                    : stripe.enabled
                    ? "أدخل مفاتيح Stripe لتفعيل الدفع"
                    : "بوابة الدفع معطّلة"}
                </span>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Publishable Key</label>
                <input
                  value={stripe.publishableKey}
                  onChange={(e) => setStripe((s) => ({ ...s, publishableKey: e.target.value }))}
                  placeholder="pk_live_..."
                  dir="ltr"
                  className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Secret Key</label>
                <div className="relative">
                  <input
                    value={stripe.secretKey}
                    onChange={(e) => setStripe((s) => ({ ...s, secretKey: e.target.value }))}
                    type={showSecretKey ? "text" : "password"}
                    placeholder="sk_live_..."
                    dir="ltr"
                    className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1.5">
                  كل متجر له مفاتيح Stripe مستقلة — لا تشارك Secret Key مع أحد
                </p>
              </div>
            </div>
          </motion.div>

          {/* Save */}
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.01 }}
            whileTap={{ scale: saving ? 1 : 0.99 }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-xl py-3.5 transition-all shadow-lg shadow-indigo-500/20"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جارٍ الحفظ...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle size={18} />
                <span>تم الحفظ بنجاح!</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>حفظ الإعدادات</span>
              </>
            )}
          </motion.button>
        </div>
      </main>
    </div>
  );
}
