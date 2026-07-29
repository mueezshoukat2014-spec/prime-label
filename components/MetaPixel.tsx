"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackContact, trackQuoteFormView } from "@/lib/fbq";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Client-side tracking for App Router navigation and high-intent clicks.
 * The initial PageView is fired by the base snippet in app/layout.tsx.
 */
export default function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const lastPageView = useRef<string | null>(null);
  const quoteViewTracked = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    if (lastPageView.current === null) {
      lastPageView.current = pathname;
    } else if (lastPageView.current !== pathname) {
      lastPageView.current = pathname;
      window.fbq?.("track", "PageView");
    }

    if (pathname.startsWith("/quote") && !quoteViewTracked.current) {
      quoteViewTracked.current = true;
      trackQuoteFormView();
    }
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.href || "";
      if (/wa\.me|whatsapp/i.test(href)) {
        trackContact("WhatsApp Click");
      } else if (/\/contact(?:$|[?#])/i.test(href)) {
        trackContact("Contact Page Click");
      } else if (/\/quote(?:$|[?#])/i.test(href)) {
        trackQuoteFormView();
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
