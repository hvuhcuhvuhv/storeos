import { Order } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

/** يفتح نافذة طباعة بفاتورة احترافية للطلب (RTL / درهم إماراتي) */
export function printInvoice(order: Order, storeName: string) {
  const subtotal = Math.max(0, order.total - (order.deliveryFee ?? 0));
  const rows = order.items
    .map(
      (it) => `
        <tr>
          <td>${escapeHtml(it.productName)}</td>
          <td class="center">${it.quantity}</td>
          <td class="left">${formatCurrency(it.price)}</td>
          <td class="left">${formatCurrency(it.price * it.quantity)}</td>
        </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<title>فاتورة ${escapeHtml(order.id)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Tahoma, Arial, sans-serif; color: #111; margin: 0; padding: 32px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 20px; }
  .store { font-size: 22px; font-weight: 700; color: #4f46e5; }
  .doc { text-align: left; }
  .doc h1 { font-size: 20px; margin: 0 0 4px; }
  .muted { color: #666; font-size: 13px; }
  .grid { display: flex; gap: 24px; margin-bottom: 20px; flex-wrap: wrap; }
  .box { flex: 1; min-width: 220px; background: #f8f8fb; border: 1px solid #eee; border-radius: 10px; padding: 14px 16px; }
  .box h3 { margin: 0 0 8px; font-size: 13px; color: #4f46e5; }
  .box p { margin: 3px 0; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #eee; text-align: right; }
  th { background: #4f46e5; color: #fff; }
  td.center, th.center { text-align: center; }
  td.left, th.left { text-align: left; }
  .totals { margin-top: 16px; margin-right: auto; width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .totals .grand { border-top: 2px solid #111; margin-top: 6px; padding-top: 10px; font-weight: 700; font-size: 16px; }
  .cod { margin-top: 20px; background: #fff7ed; border: 1px solid #fed7aa; color: #b45309; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; }
  .foot { margin-top: 28px; text-align: center; color: #999; font-size: 12px; }
  @media print { body { padding: 0; } .noprint { display: none; } }
</style>
</head>
<body>
  <div class="head">
    <div class="store">${escapeHtml(storeName)}</div>
    <div class="doc">
      <h1>فاتورة</h1>
      <div class="muted">رقم الطلب: ${escapeHtml(order.id)}</div>
      <div class="muted">التاريخ: ${formatDateTime(order.createdAt)}</div>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <h3>بيانات العميل</h3>
      <p><strong>الاسم:</strong> ${escapeHtml(order.customerName)}</p>
      <p><strong>الهاتف:</strong> ${escapeHtml(order.customerPhone)}</p>
      <p><strong>البريد:</strong> ${escapeHtml(order.customerEmail || "—")}</p>
    </div>
    <div class="box">
      <h3>عنوان التوصيل</h3>
      <p><strong>المدينة:</strong> ${escapeHtml(order.customerCity || "—")}</p>
      <p><strong>العنوان:</strong> ${escapeHtml(order.customerAddress || "—")}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>المنتج</th>
        <th class="center">الكمية</th>
        <th class="left">السعر</th>
        <th class="left">الإجمالي</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>المجموع الفرعي</span><span>${formatCurrency(subtotal)}</span></div>
    <div class="row"><span>رسوم التوصيل</span><span>${formatCurrency(order.deliveryFee ?? 0)}</span></div>
    <div class="row grand"><span>الإجمالي</span><span>${formatCurrency(order.total)}</span></div>
  </div>

  <div class="cod">طريقة الدفع: نقداً عند الاستلام (Cash on Delivery)</div>

  <div class="foot">شكراً لتسوقك من ${escapeHtml(storeName)}</div>

  <script>
    window.onload = function () { window.print(); };
  </script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) {
    alert("الرجاء السماح بالنوافذ المنبثقة لطباعة الفاتورة");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
