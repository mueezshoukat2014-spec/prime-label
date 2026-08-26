"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/anim";

const SEEN_KEY = "pl_leadcap_seen";

/**
 * Gentle lead-capture prompt: appears once per session after meaningful
 * scroll (60%) or 45s on page — NOT an aggressive instant popup. Routes the
 * visitor to the quote form / WhatsApp instead of collecting emails we'd
 * then have to nurture manually.
 */
export default function LeadCapture({ whatsapp }: { whatsapp?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SEEN_KEY) === "1") return;
    } catch {}
    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setOpen(true);
    };
    const onScroll = () => {
      const scrolled = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.6) trigger();
    };
    const timer = window.setTimeout(trigger, 45000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed bottom-4 left-4 right-4 z-[140] mx-auto max-w-md rounded-3xl border border-champagne/30 bg-ink/95 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:left-auto sm:right-6 sm:bottom-6"
          role="dialog"
          aria-label="Get a quote reminder"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-cream-dim transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <p className="pr-8 text-[15px] font-medium text-cream">
            Planning your label order? <span className="text-champagne">Quotes take 60 seconds to request.</span>
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream-muted">
            Free digital proof within 24 hours · MOQ from 100 units · DDP express delivery.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link
              href="/quote"
              onClick={() => setOpen(false)}
              className="btn-primary !py-2.5 !px-5 text-[12px] shadow-glow-sm"
            >
              Get my quote
            </Link>
            <a
              href={whatsapp || "https://wa.me/923244999224"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-[12px] text-cream-muted transition-colors hover:border-champagne/50 hover:text-champagne"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
