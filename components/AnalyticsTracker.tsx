"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/track";

/**
 * Anonymous usage pings for the admin Analytics tab.
 *
 * Quota-friendly design (Neon free plan suspends the database when compute
 * never gets to sleep): a ping is sent on route change, at most once every
 * 5 minutes while the tab stays visible, and once when the tab is hidden or
 * closed. The old 45-second heartbeat kept the database awake 24/7 and was
 * the main reason the Neon free quota was exhausted.
 *
 * Skips /admin entirely (owner activity is not customer activity).
 */
const ENGAGEMENT_MS = 5 * 60_000;

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPing = useRef<string>("");

  // Pageview on every route change.
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const current = pathname + window.location.search;
    if (lastPing.current === current) return;
    lastPing.current = current;
    trackEvent();
  }, [pathname]);

  // Slow engagement ping so "time on site" stays measurable, without
  // keeping the database awake (5 min >> Neon's 5 min autosuspend only
  // matters between pings; a single ping lets it sleep again right after).
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const beat = window.setInterval(() => {
      if (document.visibilityState === "visible") trackEvent("engagement");
    }, ENGAGEMENT_MS);
    return () => window.clearInterval(beat);
  }, [pathname]);

  // One final ping when the visitor leaves or switches tabs — this is the
  // most valuable "they were here until X" signal and costs one request.
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const onVis = () => {
      if (document.visibilityState === "hidden") trackEvent();
    };
    const onHide = () => trackEvent();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onHide);
    };
  }, [pathname]);

  return null;
}
