"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      getState?: () => unknown;
    };
    _fbq?: unknown;
  }
}

/**
 * Fires a PageView on client-side route changes.
 *
 * The base snippet lives in the server-rendered <head> (see app/layout.tsx) and
 * reports the first page itself. This component only covers subsequent
 * App Router navigations, which don't reload the document.
 */
export default function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    // The inline <head> snippet already reported the initial page.
    if (lastTracked.current === null) {
      lastTracked.current = pathname;
      return;
    }
    if (lastTracked.current === pathname) return;

    lastTracked.current = pathname;
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
      console.log("Meta Pixel PageView Fired:", pathname);
    }
  }, [pathname]);

  return null;
}
