"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Star,
  Package,
  Search,
  Shield,
  Truck,
  RefreshCw,
  Phone,
  MapPin,
  Store,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { usePlatformStore } from "@/store/usePlatformStore";
import { useCartStore, EMPTY_CART } from "@/store/useCartStore";
import { Badge } from "@/components/ui/Cards";
import { Modal } from "@/components/ui/Modal";
import { CartDrawer, CartToast, OrderSuccessToast } from "@/components/store/CartDrawer";
import { InstallPrompt } from "@/components/store/InstallPrompt";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Store as StoreType, Product } from "@/types";
import Link from "next/link";

interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  hasImage: boolean;
  category: string;
  stock: number;
  description: string;
}

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const platformName = usePlatformStore((s) => s.settings.platformName);
  const [store, setStore] = useState<StoreType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "notfound" | "ready">("loading");

  useEffect(() => {
    let active = true;
    api
      .getStoreBySlug(slug)
      .then(({ store, products }) => {
        if (!active) return;
        setStore(store);
        setProducts(products);
        setLoadState("ready");
      })
      .catch(() => {
        if (active) setLoadState("notfound");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const storeId = store?.id ?? "";
  const { addItem } = useCartStore();
  const cartItems = useCartStore((s) => s.carts[storeId] ?? EMPTY_CART);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("جميع الفئات");
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; name: string }>({ show: false, name: "" });
  const [orderSuccess, setOrderSuccess] = useState<{ show: boolean; orderId: string }>({
    show: false,
    orderId: "",
  });
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [detailProduct, setDetailProduct] = useState<DisplayProduct | null>(null);
  const [detailImage, setDetailImage] = useState(0);

  const openDetails = (product: DisplayProduct) => {
    setDetailProduct(product);
    setDetailImage(0);
  };

  const storeProducts: DisplayProduct[] = products
    .map((p) => {
      const gallery = p.images?.length ? p.images : p.image ? [p.image] : [];
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        image: gallery[0] || "📦",
        images: gallery,
        hasImage: gallery.length > 0,
        category: p.category,
        stock: p.stock,
        description: p.description,
      };
    });

  const CATEGORIES = ["جميع الفئات", ...Array.from(new Set(storeProducts.map((p) => p.category)))];

  const filteredProducts = storeProducts.filter((p) => {
    const matchSearch = p.name.includes(search) || p.category.includes(search);
    const matchCategory = category === "جميع الفئات" || p.category === category;
    return matchSearch && matchCategory;
  });

  const handleAddToCart = (product: DisplayProduct) => {
    if (!store || product.stock <= 0) return;

    addItem(store.id, {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });

    setAddedIds((prev) => new Set(prev).add(product.id));
    setToast({ show: true, name: product.name });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  const getProductQtyInCart = (productId: string) =>
    cartItems.find((i) => i.productId === productId)?.quantity || 0;

  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">جارٍ تحميل المتجر...</p>
      </div>
    );
  }

  if (loadState === "notfound" || !store) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <Store size={48} className="text-gray-600" />
        <h1 className="text-2xl font-bold text-white">المتجر غير موجود</h1>
        <p className="text-gray-400">لم يتم العثور على هذا المتجر</p>
        <Link href="/login">
          <button className="mt-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors">
            العودة للرئيسية
          </button>
        </Link>
      </div>
    );
  }

  if (store.status === "inactive") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center">
          <Store size={36} className="text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-white">{store.name}</h1>
        <Badge variant="inactive">المتجر موقوف مؤقتاً</Badge>
        <p className="text-gray-400 text-sm">هذا المتجر غير متاح حالياً، يرجى المحاولة لاحقاً</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Floating Cart Button */}
      <motion.button
        onClick={() => setCartOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-5 left-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/60 shadow-xl hover:border-indigo-500/40 transition-all group"
      >
        <div className="relative">
          <ShoppingBag size={20} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-gray-900"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors hidden sm:block">
          السلة
        </span>
        {cartCount > 0 && (
          <span className="text-sm font-semibold text-indigo-400 hidden sm:block">
            {formatCurrency(cartTotal)}
          </span>
        )}
      </motion.button>

      <CartDrawer
        storeId={store.id}
        storeName={store.brandName || store.name}
        bankEnabled={store.bank?.enabled}
        bank={{
          bankName: store.bank?.bankName,
          accountName: store.bank?.accountName,
          iban: store.bank?.iban,
          accountNumber: store.bank?.accountNumber,
        }}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrderSuccess={(orderId) => {
          setOrderSuccess({ show: true, orderId });
          setTimeout(() => setOrderSuccess({ show: false, orderId: "" }), 4000);
        }}
      />
      <CartToast productName={toast.name} show={toast.show} />
      <OrderSuccessToast orderId={orderSuccess.orderId} show={orderSuccess.show} />
      <InstallPrompt storeName={store.brandName || store.name} />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(148,163,184,0.8) 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 overflow-hidden">
              {store.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logo} alt={store.brandName || store.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag size={36} className="text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-white">{store.brandName || store.name}</h1>
                <Badge variant="active">متجر موثق</Badge>
                {store.bank?.enabled && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    <Shield size={12} />
                    تحويل بنكي
                  </span>
                )}
              </div>
              {store.brandName && store.brandName !== store.name && (
                <p className="text-indigo-400 text-sm mb-1">{store.name}</p>
              )}
              <p className="text-gray-400 text-sm mb-3">{store.description || "متجر إلكتروني متميز"}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Package size={14} /> {store.productsCount} منتج
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400" /> 4.8 تقييم
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> الإمارات العربية المتحدة
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-8 flex-wrap text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-indigo-400" />
              <span>شحن سريع</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-emerald-400" />
              <span>دفع آمن</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-purple-400" />
              <span>إرجاع مجاني</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-amber-400" />
              <span>دعم 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في المنتجات..."
              className="w-full bg-gray-900 border border-gray-700/60 rounded-xl pr-11 pl-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-gray-300 text-sm focus:outline-none focus:border-indigo-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product, i) => {
            const inCart = getProductQtyInCart(product.id);
            const justAdded = addedIds.has(product.id);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-gray-900/80 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all group"
              >
                <div
                  onClick={() => openDetails(product)}
                  className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-6xl relative overflow-hidden cursor-pointer"
                >
                  {product.hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    product.image
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-gray-800/80 text-gray-400 text-xs border border-gray-700/50">
                      {product.category}
                    </span>
                  </div>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold shadow-lg">
                      خصم {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                    </div>
                  )}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-medium">
                      <ImageIcon size={11} />
                      {product.images.length}
                    </div>
                  )}
                  {inCart > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium">
                      {inCart} في السلة
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3
                    onClick={() => openDetails(product)}
                    className="font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-1 min-h-[16px]">
                    {product.description || (product.stock > 0 ? `متوفر: ${product.stock} قطعة` : "")}
                  </p>
                  <button
                    onClick={() => openDetails(product)}
                    className="text-xs text-indigo-400/70 hover:text-indigo-400 mb-2 transition-colors"
                  >
                    عرض التفاصيل ←
                  </button>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-indigo-400">{formatCurrency(product.price)}</span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-xs text-gray-600 line-through">{formatCurrency(product.compareAtPrice)}</span>
                      )}
                    </div>
                    <motion.button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      whileHover={{ scale: product.stock <= 0 ? 1 : 1.05 }}
                      whileTap={{ scale: product.stock <= 0 ? 1 : 0.95 }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        product.stock <= 0
                          ? "bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed"
                          : justAdded
                          ? "bg-emerald-600 border border-emerald-500 text-white"
                          : "bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white"
                      }`}
                    >
                      {product.stock <= 0 ? (
                        "نفذ المخزون"
                      ) : justAdded ? (
                        <>
                          <Check size={13} />
                          تمت الإضافة
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={13} />
                          أضف للسلة
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Package size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد منتجات تطابق البحث</p>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      <Modal
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        title="تفاصيل المنتج"
        size="md"
      >
        {detailProduct && (
          <div className="space-y-4">
            <div className="h-56 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-7xl overflow-hidden relative">
              {detailProduct.hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={detailProduct.images[detailImage] || detailProduct.image}
                  alt={detailProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                detailProduct.image
              )}
              {detailProduct.compareAtPrice && detailProduct.compareAtPrice > detailProduct.price && (
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold shadow-lg">
                  خصم {Math.round((1 - detailProduct.price / detailProduct.compareAtPrice) * 100)}%
                </div>
              )}
            </div>

            {detailProduct.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {detailProduct.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setDetailImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      i === detailImage ? "border-indigo-500" : "border-gray-700/60 hover:border-gray-500"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 text-xs border border-gray-700/50">
                {detailProduct.category}
              </span>
              <Badge variant={detailProduct.stock > 0 ? "active" : "inactive"}>
                {detailProduct.stock > 0 ? `متوفر: ${detailProduct.stock} قطعة` : "نفذ المخزون"}
              </Badge>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-1">{detailProduct.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {detailProduct.description || "لا يوجد وصف لهذا المنتج."}
              </p>
            </div>

            <div className="flex items-end gap-3 pt-2 border-t border-gray-800">
              <span className="text-2xl font-bold text-indigo-400">{formatCurrency(detailProduct.price)}</span>
              {detailProduct.compareAtPrice && detailProduct.compareAtPrice > detailProduct.price && (
                <span className="text-sm text-gray-600 line-through mb-1">{formatCurrency(detailProduct.compareAtPrice)}</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDetailProduct(null)}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800/60 text-sm font-medium transition-all"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  handleAddToCart(detailProduct);
                  setDetailProduct(null);
                }}
                disabled={detailProduct.stock <= 0}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                {detailProduct.stock <= 0 ? "نفذ المخزون" : "أضف للسلة"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            {store.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo} alt={store.brandName || store.name} className="w-6 h-6 rounded-lg object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <ShoppingBag size={12} className="text-white" />
              </div>
            )}
            <span className="text-gray-400 text-sm">
              {store.brandName || store.name} — مدعوم بواسطة
            </span>
            <Link href="/login">
              <span className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors">{platformName}</span>
            </Link>
          </div>
          <p className="text-gray-600 text-xs">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
