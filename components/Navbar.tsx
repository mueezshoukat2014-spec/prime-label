"use client";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Magnetic } from "@/components/anim";
import Link from "next/link";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LINKS = [
  { label: "Products", href: "/#products" },
  { label: "Work", href: "/#gallery" },
  { label: "Process", href: "/#process" },
  { label: "Studio", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  return (
    <>
      <motion.header
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed inset-x-0 z-[120]"
        style={{ top: "var(--announce-offset, 0px)" }}
      >
        <div
          className={`transition-all duration-500 ${
            scrolled ? "py-3" : "py-5"
          }`}
        >
          <div className="container-lux">
            <div
              className={`relative flex items-center justify-between overflow-hidden rounded-full border border-champagne/35 px-5 py-3 ring-1 ring-champagne/10 transition-all duration-500 ${
                scrolled
                  ? "glass-strong shadow-[0_0_36px_-16px_rgba(201,168,106,0.85),0_20px_60px_-28px_rgba(0,0,0,0.9)]"
                  : "border border-champagne/10 bg-ink/20 shadow-[0_0_28px_-18px_rgba(201,168,106,0.75)] backdrop-blur-md"
              }`}
            >
              <Link href="/" className="group flex items-center gap-3" data-cursor="Home">
                <Logo size={38} />
                <span className="hidden flex-col leading-none sm:flex">
                  <span className="text-[13px] font-medium tracking-tight text-cream">
                    Prime Labels
                  </span>
                  <span className="text-[9px] uppercase tracking-widest2 text-cream-dim">
                    International
                  </span>
                </span>
              </Link>

              <nav className="hidden items-center gap-9 lg:flex">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="link-underline text-[13px] text-cream-muted transition-colors hover:text-cream"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <Link
                  href="/quote"
                  className="hidden sm:inline-flex"
                  data-cursor="Quote"
                >
                  <Magnetic strength={0.4}>
                    <span className="btn-primary !py-3 !px-6 text-[12px]">
                      Customize Your Order
                    </span>
                  </Magnetic>
                </Link>
                <button
                  onClick={() => setOpen(true)}
                  aria-label="Open menu"
                  className="flex h-11 w-11 items-center justify-center rounded-full glass lg:hidden"
                >
                  <div className="flex flex-col gap-[5px]">
                    <span className="block h-px w-5 bg-cream" />
                    <span className="block h-px w-5 bg-cream" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[160] flex flex-col bg-ink/95 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between px-6 py-6">
              <span className="display text-2xl gradient-text">Prime Labels</span>
              <div className="flex items-center gap-3">
                <LanguageSwitcher compact />
                <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full glass text-cream"
              >
                ✕
                </button>
              </div>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="display block border-b border-line py-5 text-5xl text-cream"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/quote"
                onClick={() => setOpen(false)}
                className="btn-primary mt-8 w-full justify-center"
              >
                Customize Your Order
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
