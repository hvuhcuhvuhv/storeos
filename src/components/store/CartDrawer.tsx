"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  User,
  Mail,
  Phone,
  CreditCard,
  ArrowRight,
  Loader2,
  MapPin,
  Home,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCartStore, EMPTY_CART, CartItem } from "@/store/useCartStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { useStoreStore } from "@/store/useStoreStore";
import { formatCurrency } from "@/lib/utils";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  customerEmail: z.string().email("البريد الإلكتروني غير صحيح"),
  customerPhone: z.string().min(10, "رقم الهاتف غير صحيح"),
  customerCity: z.string().min(2, "المدينة مطلوبة"),
  customerAddress: z.string().min(5, "العنوان مطلوب"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

type Step = "cart" | "checkout" | "payment" | "success";

interface CartDrawerProps {
  storeId: string;
  storeName: string;
  stripeEnabled?: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: (orderId: string) => void;
}

export function CartDrawer({
  storeId,
  storeName,
  stripeEnabled = false,
  stripePublishableKey,
  stripeSecretKey,
  isOpen,
  onClose,
  onOrderSuccess,
}: CartDrawerProps) {
  const items = useCartStore((s) => s.carts[storeId] ?? EMPTY_CART);
  const { updateQuantity, removeItem, clearCart } = useCartStore();
  const { addOrder } = useOrdersStore();
  const { recordOrder } = useStoreStore();

  const [step, setStep] = useState<Step>("cart");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [pendingForm, setPendingForm] = useState<CheckoutForm | null>(null);
  const [payError, setPayError] = useState("");

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const stripeReady = Boolean(stripeEnabled && stripePublishableKey && stripeSecretKey);

  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    [stripePublishableKey]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const resetFlow = () => {
    setStep("cart");
    setCompletedOrderId("");
    setClientSecret("");
    setPendingForm(null);
    setPayError("");
    reset();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      if (step === "success") resetFlow();
    }, 300);
  };

  const finalizeOrder = (data: CheckoutForm) => {
    const order = addOrder({
      storeId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerCity: data.customerCity,
      customerAddress: data.customerAddress,
      total,
      status: "pending",
      items: items.map((item: CartItem) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    recordOrder(storeId, total);
    clearCart(storeId);
    setCompletedOrderId(order.id);
    setStep("success");
    onOrderSuccess?.(order.id);
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) return;
    setPayError("");

    if (!stripeReady) {
      setIsSubmitting(true);
      await new Promise((r) => setTimeout(r, 800));
      finalizeOrder(data);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          secretKey: stripeSecretKey,
          currency: "aed",
          metadata: { storeId, storeName },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "تعذر بدء عملية الدفع");

      setClientSecret(json.clientSecret);
      setPendingForm(data);
      setStep("payment");
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "تعذر بدء عملية الدفع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed top-0 left-0 bottom-0 w-full max-w-md bg-gray-900 border-r border-gray-800 z-50 flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                  {step === "success" ? (
                    <CheckCircle size={18} className="text-emerald-400" />
                  ) : (
                    <ShoppingBag size={18} className="text-indigo-400" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-white">
                    {step === "cart" && "سلة التسوق"}
                    {step === "checkout" && "إتمام الطلب"}
                    {step === "payment" && "الدفع الآمن"}
                    {step === "success" && "تم الطلب بنجاح!"}
                  </h2>
                  <p className="text-xs text-gray-500">{storeName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Success Step */}
            {step === "success" && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
                >
                  <CheckCircle size={40} className="text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">شكراً لطلبك!</h3>
                <p className="text-gray-400 text-sm mb-6">
                  تم استلام طلبك وسيتم معالجته قريباً
                </p>
                <div className="w-full bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
                  <p className="text-xs text-gray-500 mb-1">رقم الطلب</p>
                  <p className="text-indigo-400 font-mono font-semibold">{completedOrderId}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                >
                  متابعة التسوق
                </button>
              </div>
            )}

            {/* Checkout Step */}
            {step === "checkout" && (
              <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{itemCount} سلعة</span>
                      <span className="font-bold text-white">{formatCurrency(total)}</span>
                    </div>
                    {stripeEnabled && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-400">
                        <CreditCard size={12} />
                        الدفع عبر Stripe
                      </div>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-300">بيانات التوصيل</p>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">الاسم الكامل *</label>
                    <div className="relative">
                      <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        {...register("customerName")}
                        placeholder="محمد أحمد"
                        className="w-full bg-gray-800/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    {errors.customerName && (
                      <p className="text-red-400 text-xs mt-1">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">البريد الإلكتروني *</label>
                    <div className="relative">
                      <Mail size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        {...register("customerEmail")}
                        type="email"
                        placeholder="email@example.com"
                        dir="ltr"
                        className="w-full bg-gray-800/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    {errors.customerEmail && (
                      <p className="text-red-400 text-xs mt-1">{errors.customerEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">رقم الهاتف *</label>
                    <div className="relative">
                      <Phone size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        {...register("customerPhone")}
                        placeholder="+971501234567"
                        dir="ltr"
                        className="w-full bg-gray-800/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    {errors.customerPhone && (
                      <p className="text-red-400 text-xs mt-1">{errors.customerPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">المدينة *</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        {...register("customerCity")}
                        placeholder="دبي"
                        className="w-full bg-gray-800/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    {errors.customerCity && (
                      <p className="text-red-400 text-xs mt-1">{errors.customerCity.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">العنوان *</label>
                    <div className="relative">
                      <Home size={15} className="absolute right-3 top-3 text-gray-500" />
                      <textarea
                        {...register("customerAddress")}
                        placeholder="الشارع، المبنى، الشقة..."
                        rows={2}
                        className="w-full bg-gray-800/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                      />
                    </div>
                    {errors.customerAddress && (
                      <p className="text-red-400 text-xs mt-1">{errors.customerAddress.message}</p>
                    )}
                  </div>
                </div>

                <div className="p-5 border-t border-gray-800 space-y-2 shrink-0">
                  {payError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                      <AlertCircle size={13} className="shrink-0" />
                      {payError}
                    </div>
                  )}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {stripeReady ? "جارٍ تجهيز الدفع..." : "جارٍ تأكيد الطلب..."}
                      </>
                    ) : stripeReady ? (
                      <>
                        <CreditCard size={16} />
                        المتابعة للدفع — {formatCurrency(total)}
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        تأكيد الطلب — {formatCurrency(total)}
                      </>
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="w-full py-2 text-gray-500 hover:text-gray-300 text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowRight size={12} />
                    العودة للسلة
                  </button>
                </div>
              </form>
            )}

            {/* Payment Step */}
            {step === "payment" && clientSecret && stripePromise && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 flex justify-between text-sm">
                    <span className="text-gray-400">المبلغ المستحق</span>
                    <span className="font-bold text-white">{formatCurrency(total)}</span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                    <Lock size={13} className="shrink-0" />
                    دفع آمن عبر Stripe — بياناتك مشفّرة ولا تُحفظ لدينا
                  </div>

                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "night",
                        variables: { colorPrimary: "#6366f1" },
                      },
                    }}
                  >
                    <StripePaymentForm
                      total={total}
                      onBack={() => setStep("checkout")}
                      onPaid={() => {
                        if (pendingForm) finalizeOrder(pendingForm);
                      }}
                    />
                  </Elements>
                </div>
              </div>
            )}

            {/* Cart Step */}
            {step === "cart" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag size={40} className="text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">سلتك فارغة</p>
                      <p className="text-gray-600 text-xs mt-1">أضف منتجات من المتجر</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <motion.div
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50"
                      >
                        <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                          {item.image && (item.image.startsWith("data:") || item.image.startsWith("http")) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            item.image || "📦"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.name}</p>
                          <p className="text-indigo-400 text-sm font-semibold mt-0.5">
                            {formatCurrency(item.price)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(storeId, item.productId, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-300 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm text-white font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(storeId, item.productId, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(storeId, item.productId)}
                              className="mr-auto p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {items.length > 0 && (
                  <div className="p-5 border-t border-gray-800 space-y-3 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">الإجمالي ({itemCount} سلعة)</span>
                      <span className="text-xl font-bold text-white">{formatCurrency(total)}</span>
                    </div>
                    {stripeEnabled && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
                        <CreditCard size={13} />
                        دفع آمن عبر Stripe
                      </div>
                    )}
                    <motion.button
                      type="button"
                      onClick={() => setStep("checkout")}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20"
                    >
                      إتمام الطلب
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => clearCart(storeId)}
                      className="w-full py-2 text-gray-500 hover:text-red-400 text-xs transition-colors"
                    >
                      إفراغ السلة
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StripePaymentForm({
  total,
  onPaid,
  onBack,
}: {
  total: number;
  onPaid: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError("");

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "فشلت عملية الدفع");
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaid();
    } else {
      setError("لم تكتمل عملية الدفع، حاول مرة أخرى");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </div>
      )}

      <p className="text-[11px] text-gray-600 text-center">
        للاختبار استخدم البطاقة 4242 4242 4242 4242 — أي تاريخ مستقبلي وأي CVC
      </p>

      <motion.button
        type="button"
        onClick={handlePay}
        disabled={!stripe || processing}
        whileHover={{ scale: processing ? 1 : 1.01 }}
        whileTap={{ scale: processing ? 1 : 0.99 }}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            جارٍ معالجة الدفع...
          </>
        ) : (
          <>
            <Lock size={16} />
            ادفع {formatCurrency(total)}
          </>
        )}
      </motion.button>

      <button
        type="button"
        onClick={onBack}
        disabled={processing}
        className="w-full py-2 text-gray-500 hover:text-gray-300 text-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
      >
        <ArrowRight size={12} />
        تعديل البيانات
      </button>
    </div>
  );
}

interface CartToastProps {
  productName: string;
  show: boolean;
}

export function CartToast({ productName, show }: CartToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gray-900 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">تمت الإضافة للسلة</p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{productName}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface OrderSuccessToastProps {
  orderId: string;
  show: boolean;
}

export function OrderSuccessToast({ orderId, show }: OrderSuccessToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gray-900 border border-emerald-500/30 shadow-2xl"
        >
          <CheckCircle size={20} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">تم تأكيد طلبك!</p>
            <p className="text-xs text-gray-400 font-mono">{orderId}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
