"use client";

import { useEffect } from "react";

/**
 * Jumps straight to the quote form as soon as the page loads. Visitors land
 * here after tapping "Customize Your Order", so the form should be the first
 * thing in front of them instead of sitting below long intro copy.
 */
export default function QuoteAutoScroll() {
  useEffect(() => {
    // If the visitor somehow already scrolled before hydration, don't yank
    // the page away from under them.
    if (window.scrollY > 40) return;

    const jump = () => {
      const el = document.getElementById("quote-form");
      if (!el) return;
      // Instant jump ("foran") — scroll-margin-top on the target keeps the
      // sticky navbar from covering the form.
      el.scrollIntoView({ block: "start", behavior: "auto" });
    };

    // Wait a frame + a tick so fonts/layout have settled before measuring.
    let timer: number | undefined;
    const raf = requestAnimationFrame(() => {
      timer = window.setTimeout(jump, 80);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  return null;
}
