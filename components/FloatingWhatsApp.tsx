"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { normalizeWaLink } from "@/lib/whatsapp";

/**
 * Floating WhatsApp action button, fixed bottom-right on every page.
 * Dark circle (site theme), WhatsApp icon, scale-up on hover, and a short
 * pulse ring on first load to draw attention once.
 */
export default function FloatingWhatsApp({ href }: { href?: string }) {
  const pathname = usePathname();
  const waHref = normalizeWaLink(href);
  const [stopPulse, setStopPulse] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStopPulse(true), 4200);
    return () => clearTimeout(t);
  }, []);

  // The admin dashboard is a work tool, not a sales page — no customer CTA.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <motion.a
      href={waHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      data-cursor="Chat"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.1, type: "spring", stiffness: 220, damping: 16 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.94 }}
      className="group fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-[#25D366]/35 bg-ink/85 shadow-soft backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-champagne/60 hover:shadow-[0_0_32px_-10px_rgba(37,211,102,0.9)] sm:bottom-7 sm:right-7"
    >
      {/* one-time pulse ring on load */}
      {!stopPulse && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full border border-champagne/50"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 1.6, repeat: 3, ease: "easeOut", repeatDelay: 0.2 }}
        />
      )}
      <span className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-full border border-champagne/25 bg-ink/95 px-3 py-1.5 text-[11px] font-medium text-cream opacity-0 shadow-soft backdrop-blur transition-all duration-300 group-hover:-translate-y-1 group-hover:opacity-100 group-focus-visible:-translate-y-1 group-focus-visible:opacity-100">
        Chat on WhatsApp
      </span>
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#35E279] to-[#128C4A] shadow-[0_0_22px_-8px_rgba(37,211,102,0.9)] transition-transform duration-500 group-hover:scale-110">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20.05 3.93A11.45 11.45 0 0 0 1.96 17.55L.75 22l4.55-1.19A11.45 11.45 0 0 0 20.05 3.93Z"
            fill="white"
            opacity="0.96"
          />
          <path
            d="M12.06 3.9a8.08 8.08 0 0 1 6.89 12.29 8.06 8.06 0 0 1-10.1 2.72l-.36-.18-2.7.71.72-2.62-.2-.38A8.08 8.08 0 0 1 12.06 3.9Z"
            fill="#128C4A"
          />
          <path
            d="M9.63 7.74c-.18-.41-.37-.42-.54-.43h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.66 2.66 4.1 3.62 2.02.8 2.43.64 2.87.6.44-.04 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.3-.73-1.78Z"
            fill="white"
          />
        </svg>
      </span>
    </motion.a>
  );
}
