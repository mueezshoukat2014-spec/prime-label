"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const DISMISS_KEY = "pl_announce_dismissed";

/**
 * Slim promo bar pinned above the navbar.
 *
 * Rendered only when the admin has entered text AND enabled it. Dismissal is
 * remembered per message, so editing the text shows the bar again to everyone
 * who previously closed it.
 */
export default function AnnouncementBar({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!text) return;
    try {
      const dismissed = window.localStorage.getItem(DISMISS_KEY);
      setOpen(dismissed !== text);
    } catch {
      setOpen(true); // storage blocked — still show it
    }
  }, [text]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, text);
    } catch {
      /* ignore */
    }
  }

  if (!text) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          // Sits in normal flow at the very top and scrolls away, so the
          // fixed navbar (top-0, z-120) simply takes over once it is gone.
          className="relative z-[130] overflow-hidden bg-gradient-to-r from-champagne-deep via-champagne to-champagne-deep"
        >
          <div className="container-lux flex items-center justify-center gap-3 py-2">
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
