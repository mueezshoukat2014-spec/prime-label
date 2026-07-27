/**
 * Thin wrapper around the Meta Pixel queue.
 *
 * Tracking is decorative: if the pixel is blocked, not configured, or the
 * script hasn't loaded, these helpers must do nothing rather than throw. A
 * failed analytics call can never be allowed to break a real conversion.
 */

/** True when the pixel script has initialised in this browser. */
export function hasPixel(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

/** Fire a standard Meta Pixel event. Safe to call anywhere. */
export function trackEvent(
  event: string,
  params?: Record<string, unknown>
): void {
  try {
    if (!hasPixel()) return;
    window.fbq?.("track", event, params);
  } catch {
    /* analytics must never surface an error to the visitor */
  }
}

/**
 * Standard `Lead` event, fired once a quote request has been saved.
 *
 * Uses an explicit `window.fbq` guard so it is a no-op when the pixel is
 * blocked, still loading, or not configured.
 *
 * @param contentCategory the product category the visitor selected
 */
export function trackLead(contentCategory?: string): void {
  try {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead", {
        content_category: contentCategory || "Uncategorised",
        content_name: "Request a Quote",
      });
      console.log("Meta Pixel Lead Fired Successfully!", {
        content_category: contentCategory || "Uncategorised",
      });
    } else {
      console.warn(
        "Meta Pixel Lead NOT fired — window.fbq is unavailable (blocked by an ad blocker, or the pixel ID is empty)."
      );
    }
  } catch (e) {
    // Analytics must never surface an error to the visitor.
    console.warn("Meta Pixel Lead failed:", e);
  }
}
