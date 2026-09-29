/* Client-safe invoice constants & helpers (no server-only imports). */
export const INV_CURRENCIES = ["PKR", "SAR", "AED", "KWD", "QAR", "USD"] as const;
export const PAYMENT_STATUSES = ["UNPAID", "PARTIALLY_PAID", "PAID", "REFUNDED", "CANCELLED"] as const;
export const PAYMENT_METHODS = ["Bank Transfer", "Cash", "Online Payment", "Yet to decide", "Other"] as const;
export const DELIVERY_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
export const COURIERS = ["DHL", "Aramex", "FedEx", "Other"] as const;
export const PAYMENT_TERMS_TYPES = ["ADVANCE_100", "ADVANCE_50", "ADVANCE_50_PHOTOS", "CUSTOM"] as const;

export const DEFAULT_TERMS_AND_CONDITIONS = [
  "Payment must be made according to the payment terms stated on the invoice.",
  "For 50% advance orders, production will begin after receipt of the advance payment.",
  "The remaining balance must be paid before dispatch unless otherwise agreed in writing.",
  "Production timelines are estimated from confirmation of the final design and receipt of the required payment.",
  "Changes to the design, quantity, size or specifications after production approval may result in additional charges or revised timelines.",
  "Delivery timelines may vary depending on the courier and destination.",
  "Customers are responsible for providing accurate shipping and contact information.",
  "Custom-made products are produced according to the approved specifications.",
  "Any applicable taxes, customs duties or destination charges are the responsibility of the customer unless otherwise stated on the invoice.",
  "Any special agreement between Prime Labels and the customer should be confirmed in writing.",
].join("\n");


/** Human-readable payment terms block for preview + PDF. */
export function paymentTermsText(type: string, custom: string): string {
  if (type === "ADVANCE_100")
    return "100% Advance Payment:\nFull payment must be received before production starts.";
  if (type === "ADVANCE_50")
    return "50% Advance Payment:\n50% payment is required before production starts.\n\nRemaining 50%:\nThe remaining balance must be paid before dispatch.";
  if (type === "ADVANCE_50_PHOTOS")
    return "50% Advance Payment:\n50% payment is required before production starts.\n\nRemaining 50%:\nThe remaining balance must be paid before dispatch, after showing you your product photos/videos.";
  return custom || "As agreed between Prime Labels and the customer.";
}
