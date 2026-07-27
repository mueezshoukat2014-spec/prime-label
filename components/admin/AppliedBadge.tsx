"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * Celebratory "changes are live" confirmation shown after a successful save.
 * Draws a check, pulses a ring, then fades out on its own.
 */
export default function AppliedBadge({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="relative flex items-center gap-2.5 rounded-full border border-champagne/45 bg-champagne/[0.10] px-4 py-2"
        >
          {/* expanding ring */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full border border-champagne/60"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 1.1, repeat: 1, ease: "easeOut" }}
          />

          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-champagne-bright to-champagne-deep text-ink">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
              <motion.path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </svg>
          </span>

          <span className="text-[12.5px] font-medium text-champagne">
            Changes applied to website
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
