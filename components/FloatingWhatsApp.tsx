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
      className="group fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-champagne/30 bg-surface-2/90 shadow-soft backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-champagne/60 hover:shadow-glow-sm sm:bottom-7 sm:right-7"
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
      <svg
        width="27"
        height="27"
        viewBox="0 0 24 24"
        fill="#25D366"
        className="relative transition-transform duration-500 group-hover:scale-110"
        aria-hidden
      >
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm5.49-7.526c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    </motion.a>
  );
}
