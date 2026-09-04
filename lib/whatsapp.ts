// Central WhatsApp link builder.
// One number, one place. Every WhatsApp link on the site comes from here so
// the number can never drift out of sync again.

/** Business WhatsApp number in international format, digits only (no "+", no spaces). */
export const WHATSAPP_NUMBER = "923244999224";

/** Default message used by generic "chat with us" buttons. */
export const WHATSAPP_DEFAULT_MESSAGE = "Hi, I want to inquire about an order";

/** Message used by buttons attached to a specific product. */
export const WHATSAPP_PRODUCT_MESSAGE = "Hi, I am interested in this item";

/**
 * Build a wa.me deep link with a URL-encoded pre-filled message.
 *
 * waLink()                      -> https://wa.me/923244999224?text=Hi%2C%20I%20want%20to%20inquire%20about%20an%20order
 * waLink("Hi, I am interested") -> https://wa.me/923244999224?text=Hi%2C%20I%20am%20interested
 */
export function waLink(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Build a product-specific WhatsApp link.
 * waProductLink("Woven Labels")
 *   -> ...?text=Hi%2C%20I%20am%20interested%20in%20this%20item%20-%20Woven%20Labels
 */
export function waProductLink(productTitle?: string): string {
  const msg = productTitle
    ? `${WHATSAPP_PRODUCT_MESSAGE} - ${productTitle}`
    : WHATSAPP_PRODUCT_MESSAGE;
  return waLink(msg);
}

/** The canonical default link, ready to use. */
export const WHATSAPP_URL = waLink();

/**
 * Guided order message: a structured template the customer completes in
 * WhatsApp. Gives us complete info in the first message instead of "hi".
 */
export function waGuidedOrderLink(productTitle?: string): string {
  const msg = [
    "Hi Prime Labels! I'd like a quote 👇",
    "",
    `▪ Product: ${productTitle || "____"}`,
    "▪ Quantity: ____",
    "▪ City / Country: ____",
    "▪ Logo ready? (yes/no): ____",
    "",
    "(I can attach my logo after sending this)",
  ].join("\n");
  return waLink(msg);
}

/**
 * Link used right after a quote form is submitted. Carries the visitor's name,
 * their message and the uploaded artwork URL so the chat opens with full context.
 */
export function waQuoteSubmittedLink(input: {
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  country?: string | null;
  product?: string | null;
  quantity?: string | null;
  details?: string | null;
  artworkUrl?: string | null;
}): string {
  const clean = (v: string | null | undefined) => String(v ?? "").trim();

  const lines: string[] = [];
  lines.push("*New Quote Request*");
  lines.push("");
  lines.push("Hi! I just submitted a quote request on your website.");
  lines.push("");

  // A row is only added when the visitor actually filled that field in, so
  // the message never carries "Not provided" filler for optional fields.
  const row = (emoji: string, label: string, value: string) => {
    if (value) lines.push(`${emoji} *${label}:* ${value}`);
  };

  row("👤", "Name", clean(input.name));
  row("📱", "WhatsApp", clean(input.phone));
  row("✉️", "Email", clean(input.email));
  row("🏢", "Brand", clean(input.company));
  row("🌍", "Country", clean(input.country));
  row("🏷️", "Product", clean(input.product));
  row("🔢", "Quantity", clean(input.quantity));

  const details = clean(input.details);
  if (details) {
    lines.push("");
    lines.push("📝 *Requirements:*");
    lines.push(details);
  }

  lines.push("");
  const artwork = clean(input.artworkUrl);
  lines.push(artwork ? `🎨 *Artwork:* ${artwork}` : "🎨 *Artwork:* not uploaded");

  lines.push("");
  lines.push("Please share pricing and lead time. Thank you!");

  return waLink(lines.join("\n"));
}

/**
 * Normalise any stored/legacy WhatsApp value into a proper wa.me link with a
 * pre-filled message. Old shortlinks (wa.me/message/XXXX) and bare numbers are
 * all converted to the canonical format.
 */
export function normalizeWaLink(
  value: string | undefined | null,
  message: string = WHATSAPP_DEFAULT_MESSAGE
): string {
  if (!value) return waLink(message);

  // Legacy shortlink (wa.me/message/ABC123) -> rebuild from the real number.
  if (/wa\.me\/message\//i.test(value)) return waLink(message);

  // A wa.me link that already targets a number: keep the number, ensure a text param.
  const numeric = value.match(/wa\.me\/(\d{6,})/i);
  if (numeric) {
    return `https://wa.me/${numeric[1]}?text=${encodeURIComponent(message)}`;
  }

  // A bare phone number.
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length >= 6 && !/^https?:/i.test(value)) {
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }

  // Anything unrecognised: fall back to the canonical link.
  return waLink(message);
}
