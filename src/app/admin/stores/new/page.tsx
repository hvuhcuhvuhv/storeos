"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Store,
  User,
  Mail,
  Lock,
  Phone,
  Tag,
  FileText,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import { useStoreStore } from "@/store/useStoreStore";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { generateSlug } from "@/lib/utils";
import { usePlatformStore } from "@/store/usePlatformStore";
import { useAppHydration } from "@/lib/hydration";
import Link from "next/link";

const createStoreSchema = z.object({
  storeName: z.string().min(3, "اسم المتجر يجب أن يكون 3 أحرف على الأقل"),
  brandName: z.string().optional(),
  storeDescription: z.string().optional(),
  storeCategory: z.string().min(1, "الفئة مطلوبة"),
  ownerName: z.string().min(2, "اسم الصاحب يجب أن يكون حرفين على الأقل"),
  ownerEmail: z.string().email("البريد الإلكتروني غير صحيح"),
  ownerPhone: z.string().min(10, "رقم الهاتف مطلوب"),
  ownerPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type CreateStoreForm = z.infer<typeof createStoreSchema>;

const CATEGORIES = [
  "إلكترونيات", "أزياء وملابس", "منزل وديكور", "طعام ومشروبات",
  "رياضة وترفيه", "صحة وجمال", "كتب وتعليم", "سيارات", "أطفال", "عام",
];

export default function NewStorePage() {
  const hydrated = useAppHydration();
  const addStore = useStoreStore((s) => s.addStore);
  const allowNewStores = usePlatformStore((s) => s.settings.allowNewStores);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { register, handleSubmit, watch, setFocus, formState: { errors, isSubmitting } } = useForm<CreateStoreForm>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      storeCategory: CATEGORIES[0],
    },
  });

  const watchedName = watch("storeName", "");
  const previewSlug = generateSlug(watchedName);

  const onSubmit = async (data: CreateStoreForm) => {
    setSubmitError("");

    const result = await addStore({
      name: data.storeName,
      brandName: data.brandName || data.storeName,
      description: data.storeDescription || "",
      category: data.storeCategory,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone,
      ownerPassword: data.ownerPassword,
    });

    if (!result.success || !result.store) {
      setSubmitError(result.error || "تعذر إنشاء المتجر");
      return;
    }

    setCreatedSlug(result.store.slug);
    setIsSuccess(true);
  };

  const onInvalid = (fieldErrors: typeof errors) => {
    const firstError = Object.keys(fieldErrors)[0] as keyof CreateStoreForm | undefined;
    if (firstError) setFocus(firstError);
    setSubmitError("يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح");
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowNewStores) {
    return (
      <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
        <Sidebar isAdmin={true} />
        <main className="flex-1 flex items-center justify-center p-6 mt-16 lg:mt-0">
          <div className="glass rounded-2xl border border-amber-500/20 p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">إنشاء المتاجر موقوف</h2>
            <p className="text-gray-400 text-sm mb-6">تم تعطيل إنشاء متاجر جديدة من إعدادات المنصة.</p>
            <Link href="/admin/settings">
              <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm">
                الذهاب للإعدادات
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
        <Sidebar isAdmin={true} />
        <main className="flex-1 flex items-center justify-center p-6 mt-16 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-10 text-center max-w-md w-full border border-emerald-500/20"
          >
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">تم إنشاء المتجر!</h2>
            <p className="text-gray-400 text-sm mb-6">
              تم إنشاء المتجر الجديد بنجاح وهو جاهز للاستخدام
            </p>
            <div className="bg-gray-900/80 rounded-xl px-4 py-3 mb-6 border border-gray-700/50">
              <p className="text-xs text-gray-500 mb-1">رابط المتجر</p>
              <p className="text-indigo-400 font-mono text-sm" dir="ltr">/store/{createdSlug}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/stores" className="flex-1">
                <button className="w-full py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700/50 text-sm">
                  العودة للمتاجر
                </button>
              </Link>
              <a href={`/store/${createdSlug}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
                  معاينة المتجر
                </button>
              </a>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
      <Sidebar isAdmin={true} />
      <main className="flex-1 overflow-x-hidden">
        <TopBar title="إنشاء متجر جديد" />

        <div className="p-6 max-w-2xl mt-16 lg:mt-0">
          {/* Back */}
          <Link href="/admin/stores" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <ChevronLeft size={16} />
            العودة إلى المتاجر
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-gray-700/50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                  <Store size={22} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">إنشاء متجر جديد</h2>
                  <p className="text-gray-400 text-sm">أدخل معلومات المتجر وصاحبه</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="p-6 space-y-6">
              {submitError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {submitError}
                </div>
              )}
              {/* Store Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Store size={16} className="text-indigo-400" />
                  معلومات المتجر
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">اسم المتجر *</label>
                    <input
                      {...register("storeName")}
                      placeholder="مثال: متجر الإلكترونيات"
                      className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    />
                    {watchedName && (
                      <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                        <span className="text-indigo-500">رابط المتجر:</span>
                        <span dir="ltr">/store/{previewSlug}</span>
                      </p>
                    )}
                    {errors.storeName && <p className="text-red-400 text-xs mt-1">{errors.storeName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">اسم البراند</label>
                    <input
                      {...register("brandName")}
                      placeholder="مثال: TechZone"
                      className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    />
                    <p className="text-xs text-gray-600 mt-1">يظهر في واجهة المتجر — يمكن لصاحب المتجر تغييره لاحقاً</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">وصف المتجر</label>
                    <textarea
                      {...register("storeDescription")}
                      placeholder="وصف مختصر عن المتجر ومنتجاته..."
                      rows={3}
                      className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">فئة المتجر *</label>
                    <select
                      {...register("storeCategory")}
                      className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    >
                      <option value="">اختر الفئة...</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                      ))}
                    </select>
                    {errors.storeCategory && <p className="text-red-400 text-xs mt-1">{errors.storeCategory.message}</p>}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700/50" />

              {/* Owner Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <User size={16} className="text-purple-400" />
                  معلومات صاحب المتجر
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">الاسم الكامل *</label>
                    <div className="relative">
                      <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        {...register("ownerName")}
                        placeholder="أحمد محمد"
                        className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                      />
                    </div>
                    {errors.ownerName && <p className="text-red-400 text-xs mt-1">{errors.ownerName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">رقم الهاتف *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        {...register("ownerPhone")}
                        placeholder="+971501234567"
                        dir="ltr"
                        className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                      />
                    </div>
                    {errors.ownerPhone && <p className="text-red-400 text-xs mt-1">{errors.ownerPhone.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">البريد الإلكتروني *</label>
                      <div className="relative">
                        <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          {...register("ownerEmail")}
                          type="email"
                          placeholder="owner@store.com"
                          dir="ltr"
                          className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                      </div>
                      {errors.ownerEmail && <p className="text-red-400 text-xs mt-1">{errors.ownerEmail.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">كلمة المرور *</label>
                      <div className="relative">
                        <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          {...register("ownerPassword")}
                          type="password"
                          placeholder="••••••••"
                          dir="ltr"
                          className="w-full bg-gray-900/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                      </div>
                      {errors.ownerPassword && <p className="text-red-400 text-xs mt-1">{errors.ownerPassword.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-500/25 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ الإنشاء...</span>
                  </>
                ) : (
                  <>
                    <Store size={18} />
                    <span>إنشاء المتجر</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
