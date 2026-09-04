"use client";

/**
 * Google Ads (gtag.js) helpers.
 *
 * The base tag is injected in app/layout.tsx with the same deferred-load
 * strategy as the Meta Pixel (loads on first interaction or shortly after
 * window load) so Lighthouse/performance is unaffected.
 *
 * CONVERSION LABELS: Google Ads gives each conversion action a label like
 * "AbCdEfGhIj0KLMNOPQR". Once the "Submit lead form" conversion action is
 * created in Google Ads (Tools → Conversions), paste its label below and
 * redeploy — until then we still send named events (generate_lead /
 * contact) which appear in Google Ads as (unattributed) engagement and in
 * GA4 if ever linked.
 */

export const GOOGLE_ADS_ID = "AW-18430949817";

/** Conversion label for "Submit lead form" — paste from Google Ads when created. */
const LEAD_CONVERSION_LABEL = "";

/** Conversion label for WhatsApp click (optional secondary action). */
const WHATSAPP_CONVERSION_LABEL = "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function canTrack() {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/** Fire when a lead form (quote / quick quote / designer) is successfully submitted. */
export function trackAdsLead(source?: string): void {
  if (!canTrack()) return;
  window.gtag?.("event", "generate_lead", { event_category: "lead", event_label: source || "form" });
  if (LEAD_CONVERSION_LABEL) {
    window.gtag?.("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${LEAD_CONVERSION_LABEL}`,
    });
  }
}

/** Fire on WhatsApp click — the primary contact channel for this market. */
export function trackAdsWhatsApp(): void {
  if (!canTrack()) return;
  window.gtag?.("event", "contact", { event_category: "lead", event_label: "whatsapp" });
  if (WHATSAPP_CONVERSION_LABEL) {
    window.gtag?.("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${WHATSAPP_CONVERSION_LABEL}`,
    });
  }
}
