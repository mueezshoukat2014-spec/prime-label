"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Reveal, EASE } from "@/components/anim";
import Link from "next/link";
import type { Product } from "@/lib/content";
import { waProductLink } from "@/lib/whatsapp";

export default function ProductsShowcase({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const selectorRef = useRef<HTMLDivElement>(null);
  const p = products[active];
  const selectProduct = (index: number) => setActive(index);
  const prev = () => setActive((a) => (a - 1 + products.length) % products.length);
  const next = () => setActive((a) => (a + 1) % products.length);
  const scrollSelector = (dir: -1 | 1) => {
    selectorRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });
  };

  return (
    <section id="products" className="relative py-20 sm:py-28">
      <div className="container-lux">
        {/* header */}
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
          <div className="max-w-2xl">
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              What we make
            </span>
            <h2 className="display mt-5 text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Branding, down to <br />
              <span className="gradient-text italic">the last thread.</span>
            </h2>
          </div>
          </Reveal>
          <p className="max-w-sm text-[15px] leading-relaxed text-cream-muted">
            Everything your clothing brand needs to feel finished, premium, and
            unmistakably yours.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[360px_1fr] lg:gap-16">
          {/* selector */}
          <div className="flex min-w-0 flex-col">
            <div className="relative rounded-[1.75rem] border border-champagne/20 bg-surface/35 p-2 shadow-soft backdrop-blur-xl lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0">
              <button
                type="button"
                onClick={() => scrollSelector(-1)}
                aria-label="Scroll product categories left"
                className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-champagne/25 bg-ink/75 text-champagne shadow-glow-sm backdrop-blur transition-transform active:scale-95 lg:hidden"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                type="button"
                onClick={() => scrollSelector(1)}
                aria-label="Scroll product categories right"
                className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-champagne/25 bg-ink/75 text-champagne shadow-glow-sm backdrop-blur transition-transform active:scale-95 lg:hidden"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div ref={selectorRef} className="relative flex w-full min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto px-10 pb-2 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="pointer-events-none sticky left-0 z-10 -mr-8 hidden w-8 shrink-0 bg-gradient-to-r from-ink via-ink/55 to-transparent max-lg:block" />
              <div className="pointer-events-none sticky right-0 order-last z-10 -ml-16 hidden w-16 shrink-0 bg-gradient-to-l from-ink via-ink/80 to-transparent max-lg:block" />
              {products.map((prod, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={prod.slug}
                    onClick={() => selectProduct(i)}
                    className={`group relative flex shrink-0 snap-start items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-500 lg:w-full ${
                      isActive ? "glass" : "hover:bg-cream/[0.03]"
                    }`}
                  >
                    <span
                      className={`text-[11px] tabular-nums transition-colors ${
                        isActive ? "text-champagne" : "text-cream-dim"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`whitespace-nowrap text-[15px] font-medium transition-colors lg:whitespace-normal ${
                        isActive ? "text-cream" : "text-cream-muted group-hover:text-cream"
                      }`}
                    >
                      {prod.title}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="prod-active"
                        className="absolute left-0 top-1/2 hidden h-7 w-[2px] -translate-y-1/2 bg-champagne lg:block"
                        transition={{ duration: 0.5, ease: EASE }}
                      />
                    )}
                  </button>
                );
              })}
              </div>
            </div>
            <div className="mt-6 hidden items-center gap-3 md:flex">
              <button
                onClick={prev}
                aria-label="Previous product"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-cream transition-all duration-300 hover:border-champagne/50 hover:text-champagne"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <span className="text-[12px] tabular-nums text-cream-dim">
                {String(active + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
              </span>
              <button
                onClick={next}
                aria-label="Next product"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-cream transition-all duration-300 hover:border-champagne/50 hover:text-champagne"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>

          {/* showcase */}
          <Reveal delay={0.1} className="relative min-h-[560px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={p.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="grid gap-6 sm:grid-cols-2"
              >
                {/* main image */}
                <motion.div
                  layout
                  className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line shadow-soft sm:row-span-2"
                >
                  <motion.div
                    key={p.image}
                    initial={{ scale: 1.12, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.1, ease: EASE }}
                    className="absolute inset-0"
                  >
                    <img
  src={typeof p.image === "string" ? (p.image) : ""}
  alt={p.title}
  loading="lazy"
  decoding="async"
  className="absolute inset-0 h-full w-full object-cover"
/>
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-7">
                    <h3 className="display text-4xl text-cream">{p.title}</h3>
                  </div>
                </motion.div>

                {/* text + gallery */}
                <motion.div
                  layout
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                  className="flex flex-col justify-between rounded-3xl border border-line bg-surface/40 p-7"
                >
                  <div>
                    <p className="display text-2xl italic text-champagne-bright">
                      {p.tagline}
                    </p>
                    <p className="mt-4 text-[14px] leading-relaxed text-cream-muted">
                      {p.description}
                    </p>
                  </div>
                  <div className="mt-7">
                    {(p.moq != null || p.turnaround != null) && (
                      <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wide2 text-cream-dim">
                        {p.moq != null && <span>MOQ {p.moq} units</span>}
                        {p.moq != null && p.turnaround != null && (
                          <span className="text-champagne/50">·</span>
                        )}
                        {p.turnaround != null && <span>Ships in {p.turnaround} days</span>}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <Link
                        href={`/quote?product=${encodeURIComponent(p.title)}`}
                        data-cursor="Quote"
                        className="btn-primary !py-3 !px-5 text-[12px] shadow-glow-sm"
                      >
                        Customize Your Order
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                          <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>

                      {/* product-specific WhatsApp enquiry */}
                      <a
                        href={waProductLink(p.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="Chat"
                        aria-label={`Ask about ${p.title} on WhatsApp`}
                        className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-cream-muted transition-all duration-300 hover:border-champagne/60 hover:text-champagne"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                        </svg>
                        Ask on WhatsApp
                      </a>
                    </div>
                    <p className="mt-3 text-[12px] text-cream-dim">
                      Every order is custom-priced. Get a tailored quote within 12 hours.
                    </p>
                  </div>
                </motion.div>

                {/* gallery strip (only when more than one image) */}
                {(() => {
                  // Secondary photos = everything after the main image.
                  // gallery[0] mirrors p.image, so it is skipped here.
                  const thumbs = p.gallery.filter((g) => g !== p.image).slice(0, 3);
                  if (thumbs.length === 0) return null;
                  return (
                <motion.div
                  layout
                  className={`grid gap-3 sm:col-span-2 ${
                    thumbs.length === 1
                      ? "grid-cols-1"
                      : thumbs.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                  }`}
                >
                  {thumbs.map(
                    (g, gi) => (
                      <motion.div
                        key={g}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, ease: EASE, delay: 0.2 + gi * 0.08 }}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-line transition-[transform,border-color] duration-[220ms] ease-out hover:-translate-y-1 hover:border-cream/25"
                      >
                        <img
  src={typeof g === "string" ? (g) : ""}
  alt={`${p.title} ${gi + 1}`}
  loading="lazy"
  decoding="async"
  className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-[220ms] ease-out group-hover:brightness-110 group-hover:contrast-105"
/>
                      </motion.div>
                    )
                  )}
                </motion.div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
