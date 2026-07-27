/**
 * Shared estimate formatting.
 *
 * Used by both the standalone Quote Generator tab and the "Send Quote" modal
 * on each lead card, so the wording can never drift between the two.
 */

export const CURRENCIES = ["PKR", "USD", "GBP", "EUR", "AED"] as const;

export type PriceMode = "total" | "per";

export type QuoteInput = {
  customer: string;
  item: string;
  qty: string;
  price: string;
  currency: string;
  unit: PriceMode;
  note: string;
};

/** Strip formatting characters and parse a number, or NaN. */
export function parseNum(v: string): number {
  return Number(String(v ?? "").replace(/[^0-9.]/g, ""));
}

export function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

/**
 * Total for a per-piece rate, or null when it can't be computed
 * (mode is "total", or either value is missing/invalid).
 */
export function computeTotal(input: Pick<QuoteInput, "qty" | "price" | "unit">): number | null {
  if (input.unit !== "per") return null;
  const q = parseNum(input.qty);
  const p = parseNum(input.price);
  if (!Number.isFinite(q) || !Number.isFinite(p)) return null;
  if (q <= 0 || p <= 0) return null;
  return q * p;
}

/** Build the WhatsApp-ready estimate. `*text*` renders bold in WhatsApp. */
export function buildQuoteMessage(input: QuoteInput): string {
  const { customer, item, qty, price, currency, unit, note } = input;
  const priceNum = parseNum(price);
  const total = computeTotal(input);
  const money = (n: number) => formatMoney(n, currency);

  const lines: string[] = [];
  lines.push("*Prime Labels International*");
  lines.push("_Custom Branding Studio_");
  lines.push("");
  lines.push(`Hi ${customer.trim() || "there"},`);
  lines.push("");
  lines.push("Thank you for your enquiry. Here is your estimate:");
  lines.push("");

  if (item.trim()) lines.push(`*Item:* ${item.trim()}`);
  if (qty.trim()) lines.push(`*Quantity:* ${qty.trim()}`);

  if (price.trim()) {
    if (unit === "per" && Number.isFinite(priceNum) && priceNum > 0) {
      lines.push(`*Rate:* ${money(priceNum)} per piece`);
      if (total) lines.push(`*Estimated total:* ${money(total)}`);
    } else {
      lines.push(
        `*Quoted price:* ${
          Number.isFinite(priceNum) && priceNum > 0 ? money(priceNum) : price.trim()
        }`
      );
    }
  }

  if (note.trim()) {
    lines.push("");
    lines.push(note.trim());
  }

  lines.push("");
  lines.push(
    "This estimate is valid for 14 days. Prices may vary with final artwork, size and finish."
  );
  lines.push("");
  lines.push("Shall we go ahead?");

  return lines.join("\n");
}

/** All three required fields present. */
export function isQuoteComplete(input: QuoteInput): boolean {
  return !!(input.customer.trim() && input.item.trim() && input.price.trim());
}

/**
 * Copy text to the clipboard.
 *
 * navigator.clipboard needs a secure context, so fall back to a hidden
 * textarea + execCommand for older or non-HTTPS setups.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Build a wa.me deep link to a specific lead, carrying the estimate.
 * Returns null when the number can't be dialled internationally.
 *
 * wa.me requires a full international number. A local one — typically short
 * and/or starting with a trunk "0" — opens WhatsApp and then fails with
 * "phone number shared via url is invalid", which looks like a broken button.
 * Better to disable Send and let the operator use Copy.
 */
export function buildWhatsAppLink(phone: string, message: string): string | null {
  const raw = String(phone ?? "").trim();
  const digits = raw.replace(/\D/g, "");

  // ITU E.164: a country code plus subscriber number is at least 8 digits.
  if (digits.length < 8 || digits.length > 15) return null;

  // A leading 0 (and no leading +) means a national trunk prefix, i.e. the
  // country code is missing.
  if (!raw.startsWith("+") && digits.startsWith("0")) return null;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
