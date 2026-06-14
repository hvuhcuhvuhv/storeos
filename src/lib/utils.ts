import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug) return slug;

  return `store-${Date.now().toString(36)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-AE", {
    style: "currency",
    currency: "AED",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("ar-AE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Dubai",
  }).format(new Date(dateString));
}

export function formatTime(dateString: string): string {
  return new Intl.DateTimeFormat("ar-AE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dubai",
  }).format(new Date(dateString));
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("ar-AE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dubai",
  }).format(new Date(dateString));
}

const DUBAI_TZ = "Asia/Dubai";

/** Returns YYYY-MM-DD in Dubai timezone for comparison with <input type="date"> */
export function getDateKeyInDubai(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-CA", { timeZone: DUBAI_TZ });
}

export function formatFilterDateLabel(filterDate: string): string {
  const [y, m, d] = filterDate.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return formatDate(noonUtc.toISOString());
}

export function filterOrdersByDate<T extends { createdAt: string }>(
  items: T[],
  filterDate: string
): T[] {
  if (!filterDate) return items;
  return items.filter((item) => getDateKeyInDubai(item.createdAt) === filterDate);
}
