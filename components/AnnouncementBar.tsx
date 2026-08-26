"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const DISMISS_KEY = "pl_announce_dismissed";

/**
 * Slim promo bar pinned above the navbar.
 *
 * Rendered only when the admin has entered text AND enabled it. Dismissal is
 * remembered per message, so editing the text shows the bar again to everyone
 * who previously closed it.
 *
 * The fixed navbar reads --announce-offset so it never overlaps the bar:
 * while the bar is visible the navbar sits below it, and as the bar scrolls
 * away the navbar slides back up to the top of the viewport.
 */
export default function AnnouncementBar({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!text) return;
    try {
      // Dismissal only lasts for the current browser session, so the promo
      // returns on the next visit instead of disappearing forever.
      const dismissed = window.sessionStorage.getItem(DISMISS_KEY);
      setOpen(dismissed !== text);
    } catch {
      setOpen(true); // storage blocked — still show it
    }
  }, [text]);

  // Keep --announce-offset equal to the bar's visible height below the top
  // edge, so the fixed navbar is pushed down exactly as much as needed.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const el = barRef.current;
      const offset = el ? Math.max(0, el.getBoundingClientRect().bottom) : 0;
      root.style.setProperty("--announce-offset", `${offset}px`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // AnimatePresence height animation: track it briefly after open/dismiss.
    const t = setInterval(update, 120);
    const stop = setTimeout(() => clearInterval(t), 800);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearInterval(t);
      clearTimeout(stop);
      root.style.setProperty("--announce-offset", "0px");
    };
  }, [open, text]);

  function dismiss() {
    setOpen(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, text);
    } catch {
      /* ignore */
    }
  }

  if (!text) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={barRef}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          // Sits in normal flow at the very top and scrolls away; the fixed
          // navbar follows via --announce-offset.
          className="relative z-[130] overflow-hidden bg-gradient-to-r from-champagne-deep via-champagne to-champagne-deep"
        >
          <div className="container-lux flex items-center justify-center gap-3 py-2 pr-12">
            <p className="text-center text-[12.5px] font-medium leading-snug text-ink sm:text-[13px]">
              {text}
            </p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss announcement"
              className="absolute right-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
