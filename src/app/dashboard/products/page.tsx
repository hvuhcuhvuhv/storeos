"use client";

import { motion } from "framer-motion";
import { Package, Plus, Search, Edit2, Trash2, ImagePlus, X, Tag } from "lucide-react";
import { useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreStore } from "@/store/useStoreStore";
import { useProductsStore } from "@/store/useProductsStore";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Cards";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { useAppHydration } from "@/lib/hydration";
import { Product } from "@/types";

const CATEGORIES = [
  "إلكترونيات", "أزياء وملابس", "منزل وديكور", "طعام ومشروبات",
  "رياضة وترفيه", "صحة وجمال", "كتب وتعليم", "سيارات", "أطفال", "أكسسوارات", "عام",
];

interface ProductForm {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  category: string;
  images: string[];
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  category: CATEGORIES[0],
  images: [],
};

const MAX_IMAGE_BYTES = 1_200_000;
const MAX_IMAGES = 6;

export default function ProductsPage() {
  const hydrated = useAppHydration();
  const { user } = useAuthStore();
  const getStoreById = useStoreStore((s) => s.getStoreById);
  const { getProductsByStoreId, addProduct, updateProduct, deleteProduct } = useProductsStore();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const store = user?.storeId ? getStoreById(user.storeId) : null;
  const products = store ? getProductsByStoreId(store.id) : [];

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      stock: String(product.stock),
      category: product.category,
      images: product.images?.length
        ? product.images
        : product.image
        ? [product.image]
        : [],
    });
    setErrors({});
    setFormOpen(true);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - form.images.length;
    if (remaining <= 0) {
      setErrors((prev) => ({ ...prev, images: `الحد الأقصى ${MAX_IMAGES} صور` }));
      e.target.value = "";
      return;
    }

    const toRead = files.slice(0, remaining);

    for (const file of toRead) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, images: "يجب أن تكون جميع الملفات صوراً" }));
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setErrors((prev) => ({ ...prev, images: "حجم إحدى الصور كبير (الحد ~1MB لكل صورة)" }));
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setForm((f) =>
          f.images.length >= MAX_IMAGES
            ? f
            : { ...f, images: [...f.images, reader.result as string] }
        );
        setErrors((prev) => ({ ...prev, images: undefined }));
      };
      reader.readAsDataURL(file);
    }

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const validate = () => {
    const next: Partial<Record<keyof ProductForm, string>> = {};
    if (form.name.trim().length < 2) next.name = "اسم المنتج مطلوب";
    const priceNum = Number(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) next.price = "أدخل سعراً صحيحاً";
    const stockNum = Number(form.stock);
    if (form.stock === "" || isNaN(stockNum) || stockNum < 0) next.stock = "أدخل كمية صحيحة";
    if (form.compareAtPrice) {
      const compareNum = Number(form.compareAtPrice);
      if (isNaN(compareNum) || compareNum <= priceNum) {
        next.compareAtPrice = "السعر قبل الخصم يجب أن يكون أكبر من السعر الحالي";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!store || !validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      stock: Number(form.stock),
      category: form.category,
      images: form.images,
    };

    if (editing) {
      await updateProduct(editing.id, payload);
    } else {
      await addProduct({ storeId: store.id, ...payload });
    }

    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget || !store) return;
    await deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

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

  return (
    <div className="flex min-h-screen bg-gray-950 flex-row-reverse">
      <Sidebar isAdmin={false} />
      <main className="flex-1 overflow-x-hidden">
        <TopBar title="المنتجات" subtitle="إدارة منتجات متجرك" />
        <div className="p-6 space-y-6 mt-16 lg:mt-0">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">المنتجات</h2>
              <p className="text-gray-400 text-sm mt-1">{products.length} منتج في متجرك</p>
            </div>
            <motion.button
              onClick={openCreate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm shadow-lg shadow-indigo-500/25"
            >
              <Plus size={18} />
              إضافة منتج
            </motion.button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في المنتجات..."
              className="w-full max-w-sm bg-gray-900/80 border border-gray-700/60 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {products.length === 0 ? (
            <div className="glass rounded-2xl border border-gray-700/50 text-center py-16">
              <Package size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 mb-1">لا توجد منتجات بعد</p>
              <p className="text-gray-600 text-sm mb-5">أضف أول منتج ليظهر في متجرك</p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm"
              >
                <Plus size={16} />
                إضافة منتج
              </button>
            </div>
          ) : (
            <div className="glass rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="border-b border-gray-700/50">
                    <tr>
                      <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">المنتج</th>
                      <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">الفئة</th>
                      <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">السعر</th>
                      <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">المخزون</th>
                      <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">الحالة</th>
                      <th className="px-5 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {filtered.map((product, i) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                              {product.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={16} className="text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{product.name}</p>
                              {product.description && (
                                <p className="text-xs text-gray-600 line-clamp-1 max-w-[220px]">{product.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-400">{product.category}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-indigo-400">{formatCurrency(product.price)}</span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <>
                                <span className="text-xs text-gray-600 line-through">{formatCurrency(product.compareAtPrice)}</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400 text-[10px] font-bold">
                                  -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-400" : product.stock < 20 ? "text-amber-400" : "text-emerald-400"}`}>
                            {product.stock === 0 ? "نفذ" : product.stock}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={product.stock > 0 ? "active" : "inactive"}>
                            {product.stock > 0 ? "متوفر" : "نفذ المخزون"}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Search size={32} className="text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">لا توجد منتجات تطابق البحث</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "تعديل المنتج" : "إضافة منتج جديد"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              صور المنتج <span className="text-gray-600">({form.images.length}/{MAX_IMAGES})</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagePick}
              className="hidden"
            />

            <div className="grid grid-cols-4 gap-2">
              {form.images.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden border border-gray-700 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold">
                      رئيسية
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {form.images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-gray-500 hover:text-indigo-400"
                >
                  <ImagePlus size={18} />
                  <span className="text-[10px]">إضافة</span>
                </button>
              )}
            </div>
            <p className="text-gray-600 text-xs mt-1.5">الصورة الأولى هي الرئيسية. الحد ~1MB لكل صورة.</p>
            {errors.images && <p className="text-red-400 text-xs mt-1">{errors.images}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">اسم المنتج *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="مثال: سماعات لاسلكية"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="وصف مختصر للمنتج..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">السعر (درهم) *</label>
              <input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                type="number"
                min="0"
                placeholder="0"
                dir="ltr"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">المخزون *</label>
              <input
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                type="number"
                min="0"
                placeholder="0"
                dir="ltr"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-2">
              <Tag size={13} className="text-red-400" />
              السعر قبل الخصم (اختياري)
            </label>
            <input
              value={form.compareAtPrice}
              onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
              type="number"
              min="0"
              placeholder="اتركه فارغاً إن لم يوجد خصم"
              dir="ltr"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
            {errors.compareAtPrice ? (
              <p className="text-red-400 text-xs mt-1">{errors.compareAtPrice}</p>
            ) : (
              <p className="text-gray-600 text-xs mt-1">عند تعبئته يظهر السعر القديم مشطوباً ونسبة الخصم في المتجر</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">الفئة</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setFormOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700/50 text-sm"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
            >
              {editing ? "حفظ التغييرات" : "إضافة المنتج"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف المنتج"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف المنتج"
      />
    </div>
  );
}
