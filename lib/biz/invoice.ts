import { sql } from "@/lib/db";
import { ensureBizSchema } from "@/lib/biz/schema";

export * from "@/lib/biz/invoice-types";
import { INV_CURRENCIES, PAYMENT_STATUSES, DELIVERY_STATUSES, PAYMENT_TERMS_TYPES, DEFAULT_TERMS_AND_CONDITIONS } from "@/lib/biz/invoice-types";

/* ------------------------------------------------------------------ */
/* Settings + numbering (server-only)                                  */
/* ------------------------------------------------------------------ */
export interface InvoiceSettings {
  prefix: string;
  nextSeq: number;
  pad: number;
  defaultCurrency: string;
  defaultPaymentTerms: string;
  defaultTax: number;
  defaultDelivery: number;
  defaultNotes: string;
  footer: string;
  paymentInstructions: string;
  termsAndConditions: string;
  address: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  taxNumber: string;
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  prefix: "PL-INV",
  nextSeq: 1,
  pad: 6,
  defaultCurrency: "PKR",
  defaultPaymentTerms: "ADVANCE_50",
  defaultTax: 0,
  defaultDelivery: 0,
  defaultNotes: "",
  footer: "Thank you for your business.",
  paymentInstructions: "",
  termsAndConditions: DEFAULT_TERMS_AND_CONDITIONS,
  address: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  iban: "",
  taxNumber: "",
};

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  await ensureBizSchema();
  const [row] = await sql`SELECT value FROM biz_settings WHERE key = 'invoice_settings'`;
  if (!row) return { ...DEFAULT_INVOICE_SETTINGS };
  try {
    return { ...DEFAULT_INVOICE_SETTINGS, ...JSON.parse(String(row.value)) };
  } catch {
    return { ...DEFAULT_INVOICE_SETTINGS };
  }
}

export async function saveInvoiceSettings(s: InvoiceSettings): Promise<void> {
  await ensureBizSchema();
  await sql`
    INSERT INTO biz_settings (key, value) VALUES ('invoice_settings', ${JSON.stringify(s)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}

/**
 * Persistent, unique invoice numbers (PL-INV-000001…). The sequence lives in
 * biz_settings and is bumped on every issue; the UNIQUE constraint on
 * inv_number is the final safety net. Historical INV-2026-NNNN numbers are
 * never touched or renumbered.
 */
export async function nextInvoiceNumber(): Promise<string> {
  const st = await getInvoiceSettings();
  const seq = Math.max(1, Number(st.nextSeq) || 1);
  const number = `${st.prefix}-${String(seq).padStart(st.pad || 6, "0")}`;
  await saveInvoiceSettings({ ...st, nextSeq: seq + 1 });
  return number;
}

/* ------------------------------------------------------------------ */
/* Calculations + server-side validation                               */
/* ------------------------------------------------------------------ */
export interface CleanItem {
  product: string;
  description: string;
  size: string;
  shape: string;
  color: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

const finite = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
};
const money = (v: unknown) => Math.round(finite(v) * 100) / 100;
const str = (v: unknown, max = 500) => String(v ?? "").slice(0, max).trim();

/** Drivers differ: Neon HTTP returns "2026-10-05" strings, postgres.js returns
 *  Date objects. String(Date).slice(0,10) yields garbage like "Mon Oct 05"
 *  which Postgres then mangles into a wrong year. Always normalise to YYYY-MM-DD. */
const dateOnly = (v: unknown): string | null => {
  if (v == null || v === "") return null;
  if (v instanceof Date) {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  }
  const s = String(v).slice(0, 10).trim();
  // Strict: anything that is not YYYY-MM-DD would be mangled by Postgres's
  // permissive date parser (e.g. "Mon Oct 05" -> year 2001). Drop it instead.
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

export function validateInvoiceBody(b: any):
  | { error: string }
  | {
      items: CleanItem[];
      subtotal: number;
      discount: number;
      delivery: number;
      tax: number;
      grandTotal: number;
      amountPaid: number;
      balanceDue: number;
      fields: Record<string, any>;
    } {
  const rawItems: any[] = Array.isArray(b?.items) ? b.items : [];
  if (!rawItems.length) return { error: "Add at least one item." };

  const items: CleanItem[] = [];
  for (const it of rawItems) {
    const product = str(it?.product, 200);
    if (!product) return { error: "Every item needs a product / service name." };
    const quantity = money(it?.quantity);
    if (quantity <= 0) return { error: `Invalid quantity for "${product}".` };
    // The admin UI asks for the line TOTAL and derives the unit price; the
    // legacy unit_price path is kept for API/mirrored-order compatibility.
    const lineTotalIn = money(it?.line_total);
    let unitPrice: number;
    let lineDiscount = 0;
    let lineTotal: number;
    if (lineTotalIn > 0) {
      lineTotal = lineTotalIn;
      unitPrice = Math.round((lineTotal / quantity) * 10000) / 10000;
    } else {
      unitPrice = money(it?.unit_price);
      if (unitPrice < 0) return { error: `Invalid unit price for "${product}".` };
      lineDiscount = money(it?.discount);
      if (lineDiscount < 0) return { error: `Invalid discount for "${product}".` };
      const gross = money(quantity * unitPrice);
      if (lineDiscount > gross) return { error: `Discount exceeds line total for "${product}".` };
      lineTotal = money(gross - lineDiscount);
    }
    items.push({
      product,
      description: str(it?.description, 2000),
      size: str(it?.size, 100),
      shape: str(it?.shape, 100),
      color: str(it?.color, 100),
      quantity,
      unit: str(it?.unit, 20) || "pcs",
      unitPrice,
      discount: lineDiscount,
      lineTotal,
    });
  }

  const subtotal = money(items.reduce((s, i) => s + i.lineTotal, 0));
  const discount = money(b?.discount);
  if (discount < 0 || discount > subtotal) return { error: "Invoice discount must be between 0 and subtotal." };
  const delivery = money(b?.delivery);
  if (delivery < 0) return { error: "Delivery charge cannot be negative." };
  const deliveryPaidBy = String(b?.delivery_paid_by || "CLIENT").toUpperCase() === "SELLER" ? "SELLER" : "CLIENT";
  const tax = money(b?.tax);
  if (tax < 0) return { error: "Tax cannot be negative." };
  const grandTotal = money(subtotal - discount + (deliveryPaidBy === "CLIENT" ? delivery : 0) + tax);
  const amountPaid = money(b?.amount_paid);
  if (amountPaid < 0) return { error: "Amount paid cannot be negative." };
  const balanceDue = money(grandTotal - amountPaid);

  const currency = str(b?.currency, 10);
  if (!(INV_CURRENCIES as readonly string[]).includes(currency)) return { error: "Unsupported currency." };
  const paymentStatus = str(b?.payment_status, 30) || "UNPAID";
  if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) return { error: "Invalid payment status." };
  const deliveryStatus = str(b?.delivery_status, 30) || "PENDING";
  if (!(DELIVERY_STATUSES as readonly string[]).includes(deliveryStatus)) return { error: "Invalid delivery status." };
  const termsType = str(b?.payment_terms_type, 20) || "ADVANCE_50";
  if (!(PAYMENT_TERMS_TYPES as readonly string[]).includes(termsType)) return { error: "Invalid payment terms." };

  return {
    items,
    subtotal,
    discount,
    delivery,
    tax,
    grandTotal,
    amountPaid,
    balanceDue,
    fields: {
      currency,
      paymentStatus,
      deliveryStatus,
      termsType,
      paymentMethod: str(b?.payment_method, 40),
      deliveryPaidBy,
      pdfName: str(b?.pdf_name, 120),
      paymentTermsCustom: str(b?.payment_terms_custom, 2000),
      paymentDate: dateOnly(b?.payment_date),
      paymentReference: str(b?.payment_reference, 200),
      paymentNotes: str(b?.payment_notes, 2000),
      deliveryMethod: str(b?.delivery_method, 100),
      courier: str(b?.courier, 40),
      trackingNumber: str(b?.tracking_number, 100),
      estimatedDelivery: dateOnly(b?.estimated_delivery),
      deliveryNotes: str(b?.delivery_notes, 2000),
      dueDate: dateOnly(b?.due_date),
      date: b?.date === undefined ? new Date().toISOString().slice(0, 10) : dateOnly(b?.date),
      notes: str(b?.notes, 4000),
      terms: str(b?.terms, 8000),
      orderRef: str(b?.order_ref, 60),
      customerSnapshot: {
        name: str(b?.customer?.name, 200),
        company: str(b?.customer?.company, 200),
        phone: str(b?.customer?.phone, 40),
        whatsapp: str(b?.customer?.whatsapp, 40),
        email: str(b?.customer?.email, 200),
        address: str(b?.customer?.address, 600),
        city: str(b?.customer?.city, 100),
        country: str(b?.customer?.country, 100),
        reference: str(b?.customer?.reference, 100),
      },
    },
  };
}
