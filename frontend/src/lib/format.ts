import { format, formatDistanceStrict } from "date-fns";
import type { Product, StockStatus } from "@/types";
import { NOW } from "@/lib/mock/seed";

const currencyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const compactCurrencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const numberFmt = new Intl.NumberFormat("en-US");
const compactFmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const formatCurrency = (n: number) => currencyFmt.format(n);
export const formatCurrencyCompact = (n: number) => compactCurrencyFmt.format(n);
export const formatNumber = (n: number) => numberFmt.format(n);
export const formatCompact = (n: number) => compactFmt.format(n);
export const formatPercent = (n: number, digits = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;

export const formatDate = (iso: string) => format(new Date(iso), "MMM d, yyyy");
export const formatDateTime = (iso: string) => format(new Date(iso), "MMM d, yyyy · h:mm a");
export const formatRelative = (iso: string) =>
  `${formatDistanceStrict(new Date(iso), NOW)} ago`;

/** "Today" in the demo data, so relative dates stay stable. */
export const today = () => NOW;

export function stockStatus(p: Pick<Product, "stock" | "reorderPoint">): StockStatus {
  if (p.stock <= 0) return "out_of_stock";
  if (p.stock <= p.reorderPoint) return "low_stock";
  return "in_stock";
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
