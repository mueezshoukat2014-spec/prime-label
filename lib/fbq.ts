"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function canTrack() {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export function trackLead(contentCategory?: string): void {
  if (!canTrack()) return;
  window.fbq?.("track", "Lead", {
    content_name: "Quote Request",
    content_category: contentCategory || "Custom Branding",
  });
}

export function trackContact(contentName = "Contact"): void {
  if (!canTrack()) return;
  window.fbq?.("track", "Contact", {
    content_name: contentName,
  });
}

export function trackQuoteFormView(): void {
  if (!canTrack()) return;
  window.fbq?.("track", "ViewContent", {
    content_name: "Quote Form",
    content_category: "Lead Generation",
  });
}
