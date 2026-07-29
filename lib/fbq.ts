"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackLead(contentCategory?: string): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {
      content_name: "Quote Request",
      content_category: contentCategory || "Custom Branding",
    });
  }
}
