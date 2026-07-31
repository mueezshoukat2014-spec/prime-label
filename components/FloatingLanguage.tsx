"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function FloatingLanguage() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.25, type: "spring", stiffness: 220, damping: 18 }}
      className="fixed bottom-6 left-6 z-[100] rounded-full border border-champagne/30 bg-ink/85 p-1.5 shadow-[0_0_34px_-16px_rgba(201,168,106,0.9)] backdrop-blur-sm sm:bottom-7 sm:left-7"
    >
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-champagne/15 via-transparent to-champagne-deep/10" />
      <div className="group relative">
        <span className="pointer-events-none absolute bottom-full left-0 mb-3 whitespace-nowrap rounded-full border border-champagne/25 bg-ink/95 px-3 py-1.5 text-[11px] font-medium text-cream opacity-0 shadow-soft backdrop-blur transition-all duration-300 group-hover:-translate-y-1 group-hover:opacity-100 group-focus-within:-translate-y-1 group-focus-within:opacity-100">
          Change language
        </span>
        <LanguageSwitcher />
      </div>
    </motion.div>
  );
}
