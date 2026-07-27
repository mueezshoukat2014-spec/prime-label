"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, EASE } from "@/components/anim";
import Link from "next/link";

export default function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative border-t border-line py-20 sm:py-28">
      <div className="container-lux">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <Reveal>
              <span className="eyebrow">
                <span className="h-px w-8 bg-champagne/60" />
                Good to know
              </span>
              <h2 className="display mt-5 text-5xl leading-[0.98] tracking-tight sm:text-6xl">
                Questions, <br />
                <span className="gradient-text italic">answered.</span>
              </h2>
              <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-cream-muted">
    Still wondering about something? Send a message and we will reply personally.
              </p>
              <Link href="/contact" className="btn-ghost mt-7">
                Contact us
              </Link>
            </Reveal>
          </div>

          <div className="flex flex-col">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="border-b border-line">
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-7 text-left"
                    >
                      <span className={`display text-xl tracking-tight transition-colors duration-300 sm:text-2xl ${isOpen ? "text-champagne-bright" : "text-cream"}`}>
                        {item.q}
                      </span>
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${isOpen ? "rotate-45 border-champagne/50 text-champagne" : "border-line text-cream-muted"}`}>
                        +
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-xl pb-7 pr-12 text-[15px] leading-relaxed text-cream-muted">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
