/**
 * Multi-currency money helpers for the business management system.
 *
 * Golden rule: every stored financial row carries its own currency + exchange
 * rate + PKR equivalent snapshot. Historical records never re-convert.
 * INDICATIVE_RATES only pre-fill forms; the owner can override per entry.
 */
export const CURRENCIES = [
  "PKR", "KWD", "SAR", "AED", "QAR", "BHD", "OMR", "USD", "EUR", "GBP",
] as const;
export type Currency = (typeof CURRENCIES)[number];

export const BASE_CURRENCY: Currency = "PKR";

/** Indicative PKR-per-unit rates used only as form defaults. */
export const INDICATIVE_RATES: Record<string, number> = {
  PKR: 1,
  KWD: 416,
  SAR: 111,
  AED: 97,
  QAR: 103,
  BHD: 1100,
  OMR: 1130,
  USD: 278,
  EUR: 300,
  GBP: 350,
};

export function num(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : 0;
}

/** Convert an amount to PKR using an explicit rate (preferred) or indicative. */
export function toPkr(amount: number, currency: string, rate?: number): number {
  if (currency === "PKR") return amount;
  const r = rate && rate > 0 ? rate : INDICATIVE_RATES[currency] || 0;
  return amount * r;
}

/** Effective rate between two currencies via PKR (for WU-style entries). */
export function effectiveRate(
  orderAmount: number,
  receivedPkr: number
): number | null {
  if (!orderAmount || !receivedPkr) return null;
  return +(receivedPkr / orderAmount).toFixed(2);
}

export function fmt(n: number, ccy: string = BASE_CURRENCY): string {
  return `${ccy} ${Math.round(n).toLocaleString("en-PK")}`;
}

export const PAYMENT_METHODS = [
  "Western Union", "Bank Transfer", "Cash", "JazzCash", "EasyPaisa",
  "Card", "PayPal", "Other",
] as const;

export const ORDER_COST_CATEGORIES = [
  "Production", "Materials", "Labor", "Packaging", "Courier", "DHL",
  "Local Delivery", "Customs", "Payment Fee", "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Marketing", "Advertising", "Website", "Domain", "Hosting", "Software",
  "AI Tools", "Phone", "Internet", "Office", "Electricity", "Equipment",
  "Maintenance", "Bank Fees", "General Delivery", "Other",
] as const;

export const AD_PLATFORMS = ["Meta", "Google", "Instagram", "TikTok", "Other"] as const;

export const ORDER_STATUSES = [
  "NEW", "CONFIRMED", "ADVANCE PAID", "IN PRODUCTION", "READY", "SHIPPED",
  "DELIVERED", "CANCELLED",
] as const;

export const PAYMENT_STATUSES = ["UNPAID", "PARTIAL", "PAID", "REFUNDED"] as const;

export const LEAD_STATUSES = [
  "NEW", "CONTACTED", "QUOTE SENT", "FOLLOW-UP", "NEGOTIATING", "WON", "LOST",
] as const;

export const LEAD_SOURCES = [
  "Instagram", "WhatsApp", "Website", "Facebook", "Google", "Referral",
  "Existing Customer", "Other",
] as const;

export const QUOTE_STATUSES = [
  "DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED",
] as const;

export const INVOICE_STATUSES = [
  "DRAFT", "SENT", "PARTIALLY PAID", "PAID", "OVERDUE", "CANCELLED",
] as const;

export const CUSTOMER_TYPES = [
  "Pakistan", "International", "New Brand", "Existing Brand",
  "Repeat Customer", "Wholesale",
] as const;

export const DELIVERY_MODES = ["FREE", "PAID", "INCLUDED", "CUSTOM"] as const;
