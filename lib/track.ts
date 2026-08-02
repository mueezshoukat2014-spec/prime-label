"use client";

/**
 * Anonymous first-party analytics ping. Paired with /api/analytics/track and
 * the admin "Analytics" tab. No cookies, no personal data — a random session
 * id stored in localStorage is the only identifier.
 */

const SID_KEY = "pl_sid";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = window.localStorage.getItem(SID_KEY) || "";
    if (!sid || sid.length < 20) {
      sid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `s-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      window.localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}

export function trackEvent(event?: string, detail?: string) {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;
  const sid = getSessionId();
  if (!sid) return;

  const payload = JSON.stringify({
    sid,
    path: window.location.pathname + window.location.search,
    event: event || undefined,
    detail: detail || undefined,
    referrer: document.referrer || "",
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/track", blob)) return;
    }
  } catch {
    // fall through to fetch
  }
  try {
    void fetch("/api/analytics/track", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // analytics must never break the site
  }
}
