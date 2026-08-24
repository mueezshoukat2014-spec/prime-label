// Shared validation for the customer quote form.
// Imported by BOTH the client form and the API route so the browser and the
// server can never disagree about what a valid submission looks like.

/** Product categories offered in the dropdown. Submission must match one. */
export const PRODUCT_CATEGORIES = [
  "Woven Labels",
  "Satin Labels",
  "Tag Cards",
  "Hang Tags",
  "Brand Packaging",
  "Custom Stickers",
  "Zipper Bags",
  "Woven Patches",
  "Steel Logo Tags",
  "Other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * Parse the admin-managed quote product list (stored in site_content as
 * `quoteProducts`, one product per line). Falls back to the built-in
 * PRODUCT_CATEGORIES when unset. "Other" is always appended so customers can
 * always describe something custom.
 */
export function parseQuoteProducts(raw: string | null | undefined): string[] {
  const lines = String(raw ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/,/g, " /")) // commas would break the submission list
    .filter(Boolean)
    .filter((l, i, arr) => arr.indexOf(l) === i) // dedupe
    .slice(0, 40);
  const list = lines.length > 0 ? lines : [...PRODUCT_CATEGORIES.filter((c) => c !== "Other")];
  if (!list.some((l) => l.toLowerCase() === "other")) list.push("Other");
  return list;
}

/**
 * Catalogue product titles that don't exactly match a dropdown category.
 * Lets "Request a quote for X" deep links preselect the right option instead
 * of silently falling back to "Select a category".
 */
const CATEGORY_ALIASES: Record<string, ProductCategory> = {
  "brand packaging": "Brand Packaging",
  packaging: "Brand Packaging",
  "packaging boxes": "Brand Packaging",
  stickers: "Custom Stickers",
  "custom stickers": "Custom Stickers",
  patch: "Woven Patches",
  patches: "Woven Patches",
  "woven patches": "Woven Patches",
  "steel logo": "Steel Logo Tags",
  "steel logo tags": "Steel Logo Tags",
  "hang tags": "Hang Tags",
  "tag cards": "Tag Cards",
  "zipper bags": "Zipper Bags",
  "woven labels": "Woven Labels",
  "satin labels": "Satin Labels",
};

/**
 * Resolve an arbitrary product title (e.g. from ?product=) to a valid
 * dropdown category, or "" when there is no sensible match.
 */
export function resolveCategory(raw: string | undefined | null): string {
  if (!raw) return "";
  const value = raw.trim();
  if (!value) return "";

  const exact = PRODUCT_CATEGORIES.find(
    (c) => c.toLowerCase() === value.toLowerCase()
  );
  if (exact) return exact;

  return CATEGORY_ALIASES[value.toLowerCase()] ?? "";
}

/** Optional quantity bands. */
export const QUANTITY_OPTIONS = [
  "Under 100 pcs",
  "100 – 250 pcs",
  "250 – 500 pcs",
  "500 – 1000 pcs",
  "1000 – 2500 pcs",
  "2500 – 5000 pcs",
  "5000 – 10,000 pcs",
  "10,000+ pcs",
] as const;

/* ------------------------------------------------------------------ *
 * Field validators. Each returns an error string, or "" when valid.
 * ------------------------------------------------------------------ */

/**
 * Full name — required, letters and spaces only, min 3 characters.
 * Apostrophes, hyphens and dots are permitted because real names contain
 * them (O'Brien, Jean-Luc, Md. Karim). Digits and symbols are rejected.
 */
export function validateName(raw: string): string {
  const value = raw.trim();
  if (!value) return "Please enter your full name.";
  if (value.length < 3) return "Your name must be at least 3 characters.";
  if (value.length > 80) return "That name is too long.";
  if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(value)) {
    return "Please use letters only — no numbers or symbols.";
  }
  return "";
}

/** The single error message specified for an invalid WhatsApp number. */
export const PHONE_ERROR =
  "Please enter your full WhatsApp number with country code (example: +966 5XXXXXXXX).";

/**
 * WhatsApp / phone — required and must include an international country code.
 * Spaces, hyphens, brackets and dots are accepted as separators and stripped
 * before checking, so "+966 50 000 0000" and "+971-55-000-0000" both pass.
 */
export function validatePhone(raw: string): string {
  const value = raw.trim();
  if (!value) return PHONE_ERROR;

  // Require a leading + so the customer cannot submit a local-only number.
  if (!/^\+[\d\s().-]+$/.test(value)) return PHONE_ERROR;

  const digits = value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return PHONE_ERROR; // ITU E.164 range
  return "";
}

/** Normalise a phone number for storage: keep a leading "+" and digits only. */
export function normalizePhone(raw: string): string {
  const value = raw.trim();
  const digits = value.replace(/\D/g, "");
  return value.startsWith("+") ? `+${digits}` : digits;
}

/**
 * Product(s) — required. Accepts a single category, or a comma-separated
 * list when the customer ticks several products in the form. Every entry
 * must be one of the offered categories, or a free-text "Other — ..."
 * description.
 */
export function validateCategory(raw: string, allowed?: string[]): string {
  const value = raw.trim();
  if (!value) return "Please select at least one product.";
  const items = value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  if (items.length === 0) return "Please select at least one product.";
  for (const item of items) {
    if (PRODUCT_CATEGORIES.includes(item as ProductCategory)) continue;
    if (allowed && allowed.includes(item)) continue;
    if (item.startsWith("Other — ") && item.length > 8) continue;
    // Entries are short human-readable product names; anything absurdly long
    // or scripty is rejected even when the admin list can't be loaded here.
    if (allowed === undefined && item.length >= 2 && item.length <= 80 && !/[<>{}[\]\\]/.test(item)) continue;
    return "Please choose your products from the list.";
  }
  return "";
}

/**
 * Email — OPTIONAL. Empty is always valid and must never block submission.
 * When provided, it only needs to look like an address.
 */
export function validateEmail(raw: string): string {
  const value = raw.trim();
  if (!value) return ""; // optional
  if (value.length > 200) return "That email address is too long.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    return "That email address doesn't look right.";
  }
  return "";
}

/* ------------------------------------------------------------------ */

export type QuoteInput = {
  name: string;
  phone: string;
  product: string;
  email?: string;
};

export type QuoteErrors = Partial<Record<"name" | "phone" | "product" | "email", string>>;

/**
 * Validate the whole form. Only name, phone and product can block submission;
 * email is validated but a blank value is fine.
 */
export function validateQuote(input: QuoteInput, allowedProducts?: string[]): QuoteErrors {
  const errors: QuoteErrors = {};

  const name = validateName(input.name || "");
  if (name) errors.name = name;

  const phone = validatePhone(input.phone || "");
  if (phone) errors.phone = phone;

  const product = validateCategory(input.product || "", allowedProducts);
  if (product) errors.product = product;

  const email = validateEmail(input.email || "");
  if (email) errors.email = email;

  return errors;
}

/** True when the three required fields are valid (drives the submit button). */
export function isQuoteReady(input: QuoteInput, allowedProducts?: string[]): boolean {
  return (
    !validateName(input.name || "") &&
    !validatePhone(input.phone || "") &&
    !validateCategory(input.product || "", allowedProducts)
  );
}
