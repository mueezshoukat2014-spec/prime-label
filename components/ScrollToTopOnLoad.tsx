"use client";

import { useEffect } from "react";

/**
 * Guarantees the homepage opens at the hero.
 *
 * Two things can otherwise drop a visitor mid-page:
 *  1. Browser scroll restoration replaying the previous scroll position.
 *  2. A child effect calling scrollIntoView() during mount.
 *
 * We disable native restoration and pin to the top on the first frame — but
 * only when there is no #hash in the URL, so real anchor links
 * (e.g. /#products from the navbar) keep working.
 */
export default function ScrollToTopOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.hash) return; // honour genuine deep links

    const prev = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      /* not supported — ignore */
    }

    window.scrollTo(0, 0);
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));

    return () => {
      cancelAnimationFrame(raf);
      try {
        if (prev) window.history.scrollRestoration = prev;
      } catch {
        /* ignore */
      }
    };
  }, []);

  return null;
}
