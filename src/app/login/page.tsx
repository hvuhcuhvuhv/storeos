"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  Store,
  Globe,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlatformStore } from "@/store/usePlatformStore";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  {
    label: "الأدمن الرئيسي",
    desc: "صلاحيات كاملة",
    email: "admin@storeos.com",
    password: "admin123",
    gradient: "from-violet-500 to-indigo-600",
    icon: Shield,
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "أدمن رئيسي",
    desc: "تحكم كامل في المنصة وجميع المتاجر",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Store,
    title: "متاجر مستقلة",
    desc: "كل متجر بلوحة تحكم خاصة به",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Globe,
    title: "رابط فريد",
    desc: "شارك رابط متجرك مع عملائك مباشرة",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: BarChart3,
    title: "إدارة شاملة",
    desc: "منتجات، طلبات، وعملاء في مكان واحد",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

const STATS = [
  { value: "∞", label: "متاجر غير محدودة" },
  { value: "24/7", label: "متاح دائماً" },
  { value: "100%", label: "آمن ومحمي" },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuthStore();
  const platformName = usePlatformStore((s) => s.settings.platformName);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");
    const result = await login(data.email, data.password);
    setIsLoading(false);

    if (result.success) {
      const { user } = useAuthStore.getState();
      router.push(user?.role === "admin" ? "/admin" : "/dashboard");
    } else {
      setError(result.error || "حدث خطأ غير متوقع");
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#030712] flex relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[100px] animate-orb" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] animate-orb" style={{ animationDelay: "-4s" }} />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-violet-500/8 rounded-full blur-[80px] animate-orb" style={{ animationDelay: "-8s" }} />
        <div className="absolute inset-0 login-grid opacity-60" />
      </div>

      {/* Hero Panel — desktop only */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[52%] relative z-10 flex-col justify-between p-12 xl:p-16"
      >
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ShoppingBag size={22} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-lg opacity-40 -z-10 scale-125" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-shimmer">{platformName}</h1>
              <p className="text-gray-500 text-xs">منصة إدارة المتاجر الإلكترونية</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              أدر متاجرك
              <br />
              <span className="text-shimmer">باحترافية</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              منصة متكاملة لإنشاء وإدارة المتاجر الإلكترونية — من لوحة تحكم واحدة للأدمن إلى متاجر مستقلة لكل صاحب متجر.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 gap-3 my-10"
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-light rounded-2xl p-4 hover:border-white/15 transition-all duration-300 group"
            >
              <div className={`w-9 h-9 rounded-xl ${feature.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <feature.icon size={18} className={feature.color} />
              </div>
              <p className="text-white text-sm font-semibold mb-1">{feature.title}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-8"
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-8">
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
              </div>
              {i < STATS.length - 1 && (
                <div className="w-px h-8 bg-gray-800" />
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Login Panel */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/25">
              <ShoppingBag size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-shimmer mb-1">{platformName}</h1>
            <p className="text-gray-500 text-sm">منصة إدارة المتاجر الإلكترونية</p>
          </div>

          {/* Form Card */}
          <div className="glass rounded-3xl p-8 shadow-2xl glow-indigo border border-white/5">
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-indigo-400" />
                <span className="text-indigo-400 text-xs font-medium">تسجيل الدخول</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">مرحباً بعودتك</h2>
              <p className="text-gray-400 text-sm">أدخل بياناتك للوصول إلى لوحة التحكم</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  البريد الإلكتروني
                </label>
                <div
                  className={`login-input relative flex items-center bg-gray-900/70 border rounded-xl transition-all duration-200 ${
                    focusedField === "email" ? "border-indigo-500/60" : "border-gray-700/60"
                  }`}
                >
                  <div className="pr-4 text-gray-500">
                    <Mail size={18} />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="admin@storeos.com"
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="flex-1 bg-transparent py-3.5 pl-4 text-white placeholder-gray-600 focus:outline-none text-sm"
                    dir="ltr"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  كلمة المرور
                </label>
                <div
                  className={`login-input relative flex items-center bg-gray-900/70 border rounded-xl transition-all duration-200 ${
                    focusedField === "password" ? "border-indigo-500/60" : "border-gray-700/60"
                  }`}
                >
                  <div className="pr-4 text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="flex-1 bg-transparent py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pl-4 pr-3 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2.5"
                  >
                    <div className="w-2 h-2 bg-red-400 rounded-full shrink-0 animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.015 }}
                whileTap={{ scale: isLoading ? 1 : 0.985 }}
                className="relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:shadow-none group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ التحقق...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Demo Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-500 text-xs whitespace-nowrap">حسابات تجريبية</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account, i) => (
                <motion.button
                  key={account.email}
                  onClick={() => fillDemo(account.email, account.password)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  whileHover={{ scale: 1.01, x: -4 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full glass-light rounded-xl p-3.5 flex items-center gap-3 hover:border-indigo-500/30 transition-all group text-right"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${account.gradient} flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                    <account.icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-indigo-200 transition-colors">
                      {account.label}
                    </p>
                    <p className="text-xs text-gray-500">{account.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 size={14} />
                    <span className="text-xs">تعبئة</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-gray-600 text-xs mt-6 flex items-center justify-center gap-1.5"
          >
            <Zap size={12} className="text-indigo-500/60" />
            {platformName} © {new Date().getFullYear()} — جميع الحقوق محفوظة
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
