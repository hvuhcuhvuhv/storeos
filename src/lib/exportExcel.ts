import XLSX from "xlsx-js-style";
import { Store, Order, Customer } from "@/types";
import { formatCurrency, formatDate, formatDateTime, formatTime, filterOrdersByDate, formatFilterDateLabel } from "@/lib/utils";
import { getPlatformName } from "@/lib/platform";

export interface ExportOptions {
  filterDate?: string;
}

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const HEADERS = [
  "#",
  "رقم الطلب",
  "اسم المتجر",
  "صاحب المتجر",
  "هاتف صاحب المتجر",
  "اسم العميل",
  "هاتف العميل",
  "المدينة",
  "العنوان",
  "المنتجات",
  "الكميات",
  "الأسعار",
  "الإجمالي (درهم)",
  "التاريخ",
  "الحالة",
  "البريد الإلكتروني",
] as const;

const HEADER_STYLE = {
  fill: { fgColor: { rgb: "1F4E79" } },
  font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11, name: "Arial" },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: {
    top: { style: "thin", color: { rgb: "FFFFFF" } },
    bottom: { style: "thin", color: { rgb: "FFFFFF" } },
    left: { style: "thin", color: { rgb: "FFFFFF" } },
    right: { style: "thin", color: { rgb: "FFFFFF" } },
  },
};

const CELL_STYLE = {
  font: { sz: 10, name: "Arial" },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: {
    top: { style: "thin", color: { rgb: "D0D0D0" } },
    bottom: { style: "thin", color: { rgb: "D0D0D0" } },
    left: { style: "thin", color: { rgb: "D0D0D0" } },
    right: { style: "thin", color: { rgb: "D0D0D0" } },
  },
};

const ALT_ROW_STYLE = {
  ...CELL_STYLE,
  fill: { fgColor: { rgb: "F2F7FB" } },
};

const COL_WIDTHS = [
  { wch: 5 },   // #
  { wch: 14 },  // رقم الطلب
  { wch: 18 },  // اسم المتجر
  { wch: 16 },  // صاحب المتجر
  { wch: 16 },  // هاتف صاحب المتجر
  { wch: 16 },  // اسم العميل
  { wch: 14 },  // هاتف العميل
  { wch: 12 },  // المدينة
  { wch: 22 },  // العنوان
  { wch: 24 },  // المنتجات
  { wch: 10 },  // الكميات
  { wch: 14 },  // الأسعار
  { wch: 14 },  // الإجمالي
  { wch: 18 },  // التاريخ
  { wch: 14 },  // الحالة
  { wch: 22 },  // البريد
];

function joinItems(items: Order["items"], field: "name" | "qty" | "price") {
  if (field === "name") return items.map((i) => i.productName).join(" | ");
  if (field === "qty") return items.map((i) => i.quantity).join(" | ");
  return items.map((i) => i.price).join(" | ");
}

function buildOrderRow(index: number, order: Order, store?: Store): (string | number)[] {
  return [
    index,
    order.id,
    store?.name || "—",
    store?.ownerName || "—",
    store?.ownerPhone || "—",
    order.customerName,
    order.customerPhone,
    order.customerCity || "—",
    order.customerAddress || "—",
    joinItems(order.items, "name"),
    joinItems(order.items, "qty"),
    joinItems(order.items, "price"),
    order.total,
    formatDateTime(order.createdAt),
    STATUS_LABELS[order.status],
    order.customerEmail,
  ];
}

function formatExportFileStamp(date = new Date()): string {
  const dubaiOpts = { timeZone: "Asia/Dubai" as const };
  const datePart = date.toLocaleDateString("en-CA", dubaiOpts);
  const timePart = date
    .toLocaleTimeString("en-GB", {
      ...dubaiOpts,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(":", "-");
  return `${datePart}_${timePart}`;
}

function buildExportMetaRows(title: string, exportedAt: Date, filterDate?: string) {
  const exportedLabel = formatDateTime(exportedAt.toISOString());
  const rows: (string | number)[][] = [
    [title],
    ["تاريخ التصدير", exportedLabel],
    ["وقت التصدير", formatTime(exportedAt.toISOString())],
  ];

  if (filterDate) {
    rows.push(["تصفية حسب التاريخ", formatFilterDateLabel(filterDate)]);
  }

  rows.push([]);
  return rows;
}

const TITLE_STYLE = {
  font: { bold: true, sz: 13, name: "Arial", color: { rgb: "1F4E79" } },
  alignment: { horizontal: "center", vertical: "center" },
};

const META_STYLE = {
  font: { bold: true, sz: 10, name: "Arial", color: { rgb: "333333" } },
  alignment: { horizontal: "right", vertical: "center" },
};

const META_VALUE_STYLE = {
  font: { sz: 10, name: "Arial", color: { rgb: "1F4E79" } },
  alignment: { horizontal: "right", vertical: "center" },
};

function applySheetStyles(
  ws: XLSX.WorkSheet,
  rowCount: number,
  headerRow = 0,
  metaRowCount = 0
) {
  const colCount = HEADERS.length;

  for (let c = 0; c < colCount; c++) {
    const headerCell = XLSX.utils.encode_cell({ r: headerRow, c });
    if (ws[headerCell]) ws[headerCell].s = HEADER_STYLE;
  }

  if (metaRowCount > 0) {
    const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
    if (ws[titleCell]) ws[titleCell].s = TITLE_STYLE;

    for (let r = 1; r < metaRowCount - 1; r++) {
      const labelCell = XLSX.utils.encode_cell({ r, c: 0 });
      const valueCell = XLSX.utils.encode_cell({ r, c: 1 });
      if (ws[labelCell]) ws[labelCell].s = META_STYLE;
      if (ws[valueCell]) ws[valueCell].s = META_VALUE_STYLE;
    }

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }];
  }

  for (let r = headerRow + 1; r <= headerRow + rowCount; r++) {
    const dataIndex = r - headerRow;
    for (let c = 0; c < colCount; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };
      ws[cellRef].s = dataIndex % 2 === 0 ? ALT_ROW_STYLE : CELL_STYLE;
    }
  }

  ws["!cols"] = COL_WIDTHS;
  ws["!rows"] = [{ hpt: 28 }];
  ws["!freeze"] = {
    xSplit: 0,
    ySplit: headerRow + 1,
    topLeftCell: `A${headerRow + 2}`,
    activePane: "bottomLeft",
  };
}

function createOrdersSheet(
  orders: Order[],
  storeMap: Map<string, Store>,
  title: string,
  exportedAt: Date,
  filterDate?: string
) {
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const rows = sorted.map((order, i) =>
    buildOrderRow(i + 1, order, storeMap.get(order.storeId))
  );

  const metaRows = buildExportMetaRows(title, exportedAt, filterDate);
  const headerRow = metaRows.length;
  const ws = XLSX.utils.aoa_to_sheet([
    ...metaRows,
    HEADERS as unknown as string[],
    ...rows,
  ]);
  applySheetStyles(ws, rows.length, headerRow, metaRows.length);
  return ws;
}

function aggregateCustomers(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>();

  for (const order of orders) {
    const key = order.customerEmail.toLowerCase();
    const existing = map.get(key);

    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += order.total;
    } else {
      map.set(key, {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        ordersCount: 1,
        totalSpent: order.total,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.ordersCount - a.ordersCount);
}

function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  XLSX.writeFile(workbook, fileName);
}

export function exportStoreDataToExcel(
  store: Store,
  orders: Order[],
  options?: ExportOptions
) {
  const platformName = getPlatformName();
  const exportedAt = new Date();
  const filterDate = options?.filterDate;
  const exportOrders = filterDate ? filterOrdersByDate(orders, filterDate) : orders;
  const fileName = filterDate
    ? `${store.slug}-orders-${filterDate}.xlsx`
    : `${store.slug}-orders-${formatExportFileStamp(exportedAt)}.xlsx`;
  const storeMap = new Map([[store.id, store]]);
  const customers = aggregateCustomers(exportOrders);
  const revenue = exportOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const reportTitle = filterDate
    ? `تقرير الطلبات — ${store.name} (${formatFilterDateLabel(filterDate)})`
    : `تقرير الطلبات — ${store.name}`;

  const ordersSheet = createOrdersSheet(
    exportOrders,
    storeMap,
    reportTitle,
    exportedAt,
    filterDate
  );

  const infoRows: (string | number)[][] = [
    [`تقرير الطلبات — ${platformName}`],
    ["اسم المتجر", store.name],
    ["صاحب المتجر", store.ownerName],
    ["هاتف صاحب المتجر", store.ownerPhone || "—"],
    ["العملة", "درهم إماراتي (AED)"],
    ["تاريخ التصدير", formatDateTime(exportedAt.toISOString())],
    ["وقت التصدير", formatTime(exportedAt.toISOString())],
  ];

  if (filterDate) {
    infoRows.push(["تصفية حسب التاريخ", formatFilterDateLabel(filterDate)]);
  }

  infoRows.push(
    ["عدد الطلبات", exportOrders.length],
    ["إجمالي الإيرادات", formatCurrency(revenue)]
  );

  const infoSheet = XLSX.utils.aoa_to_sheet(infoRows);

  const customersSheet = XLSX.utils.json_to_sheet(
    customers.map((c, i) => ({
      "#": i + 1,
      "اسم العميل": c.name,
      "هاتف العميل": c.phone,
      "البريد الإلكتروني": c.email,
      "عدد الطلبات": c.ordersCount,
      "إجمالي المشتريات (درهم)": c.totalSpent,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ordersSheet, "الطلبات");
  XLSX.utils.book_append_sheet(workbook, customersSheet, "العملاء");
  XLSX.utils.book_append_sheet(workbook, infoSheet, "معلومات المتجر");

  downloadWorkbook(workbook, fileName);
}

export function exportAdminAllOrdersToExcel(
  stores: Store[],
  orders: Order[],
  registeredUsers: { name: string; email: string; storeId?: string; createdAt: string }[],
  options?: ExportOptions
) {
  const platformName = getPlatformName();
  const exportedAt = new Date();
  const filterDate = options?.filterDate;
  const exportOrders = filterDate ? filterOrdersByDate(orders, filterDate) : orders;
  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const fileName = filterDate
    ? `storeos-all-orders-${filterDate}.xlsx`
    : `storeos-all-orders-${formatExportFileStamp(exportedAt)}.xlsx`;
  const customers = aggregateCustomers(exportOrders);

  const reportTitle = filterDate
    ? `تقرير جميع الطلبات — ${platformName} (${formatFilterDateLabel(filterDate)})`
    : `تقرير جميع الطلبات — ${platformName}`;

  const ordersSheet = createOrdersSheet(
    exportOrders,
    storeMap,
    reportTitle,
    exportedAt,
    filterDate
  );

  const storesSheet = XLSX.utils.json_to_sheet(
    stores.map((store, i) => {
      const storeOrders = exportOrders.filter((o) => o.storeId === store.id);
      return {
        "#": i + 1,
        "اسم المتجر": store.name,
        "صاحب المتجر": store.ownerName,
        "هاتف صاحب المتجر": store.ownerPhone || "—",
        "البريد الإلكتروني": store.ownerEmail,
        "عدد الطلبات": storeOrders.length,
        "إجمالي الإيرادات (درهم)": storeOrders
          .filter((o) => o.status !== "cancelled")
          .reduce((sum, o) => sum + o.total, 0),
        "تاريخ التسجيل": formatDate(store.createdAt),
        "الحالة": store.status === "active" ? "نشط" : "موقوف",
      };
    })
  );

  const customersSheet = XLSX.utils.json_to_sheet(
    customers.map((c, i) => ({
      "#": i + 1,
      "اسم العميل": c.name,
      "هاتف العميل": c.phone,
      "البريد الإلكتروني": c.email,
      "عدد الطلبات": c.ordersCount,
      "إجمالي المشتريات (درهم)": c.totalSpent,
    }))
  );

  const ownersSheet = XLSX.utils.json_to_sheet(
    registeredUsers
      .filter((u) => u.storeId)
      .map((u, i) => {
        const store = u.storeId ? storeMap.get(u.storeId) : undefined;
        const storeOrders = u.storeId ? exportOrders.filter((o) => o.storeId === u.storeId) : [];
        return {
          "#": i + 1,
          "اسم صاحب المتجر": u.name,
          "هاتف صاحب المتجر": store?.ownerPhone || "—",
          "البريد الإلكتروني": u.email,
          "اسم المتجر": store?.name || "—",
          "عدد الطلبات": storeOrders.length,
          "تاريخ التسجيل": formatDate(u.createdAt),
        };
      })
  );

  const totalRevenue = exportOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const summaryRows: (string | number)[][] = [
    [`تقرير المنصة — ${platformName}`],
    ["الدولة", "الإمارات العربية المتحدة"],
    ["العملة", "درهم إماراتي (AED)"],
    ["تاريخ التصدير", formatDateTime(exportedAt.toISOString())],
    ["وقت التصدير", formatTime(exportedAt.toISOString())],
  ];

  if (filterDate) {
    summaryRows.push(["تصفية حسب التاريخ", formatFilterDateLabel(filterDate)]);
  }

  summaryRows.push(
    [],
    ["إجمالي المتاجر", stores.length],
    ["إجمالي الطلبات", exportOrders.length],
    ["إجمالي الإيرادات (درهم)", totalRevenue],
    ["إجمالي أصحاب المتاجر", registeredUsers.filter((u) => u.storeId).length]
  );

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ordersSheet, "الطلبات");
  XLSX.utils.book_append_sheet(workbook, storesSheet, "المتاجر");
  XLSX.utils.book_append_sheet(workbook, customersSheet, "العملاء");
  XLSX.utils.book_append_sheet(workbook, ownersSheet, "أصحاب المتاجر");
  XLSX.utils.book_append_sheet(workbook, summarySheet, "ملخص");

  downloadWorkbook(workbook, fileName);
}

export { aggregateCustomers };
