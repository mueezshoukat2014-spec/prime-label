"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/track";

const HEARTBEAT_MS = 45_000;

/**
 * Sends an anonymous pageview ping on every route change, plus a heartbeat
 * while the tab is visible so the admin "live viewers" counter stays fresh.
 * Skips /admin entirely (your own activity is not customer activity).
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPing = useRef<string>("");

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const current = pathname + window.location.search;
    if (lastPing.current === current) return;
    lastPing.current = current;
    trackEvent();
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const beat = window.setInterval(() => {
      if (document.visibilityState === "visible") trackEvent();
    }, HEARTBEAT_MS);
    return () => window.clearInterval(beat);
  }, [pathname]);

  return null;
}
