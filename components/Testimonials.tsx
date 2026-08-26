"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/anim";
import ReviewForm from "@/components/ReviewForm";

export type Testimonial = {
  name: string;
  role?: string;
  company?: string;
  country?: string;
  content: string;
  rating?: number;
  avatar?: string;
};

function Stars({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <div className="flex gap-0.5 text-[12px]" aria-label={`${n} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? "text-champagne" : "text-cream/15"}>
          ★
        </span>
      ))}
    </div>
  );
}

function Avatar({ t }: { t: Testimonial }) {
  if (t.avatar) {
    return (
      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-champagne/30">
        <img
  src={typeof t.avatar === "string" ? (t.avatar) : ""}
  alt={t.name}
  loading="lazy"
  decoding="async"
  className="absolute inset-0 h-full w-full object-cover"
/>
      </span>
    );
  }
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-surface-2 to-surface text-[15px] font-medium text-champagne">
      {(t.name || "?").charAt(0)}
    </span>
  );
}

function Card({ t }: { t: Testimonial }) {
  return (
    <article className="flex h-full min-h-[300px] flex-col justify-between rounded-[1.75rem] border border-line bg-gradient-to-b from-surface/60 to-surface/20 p-7 sm:p-8">
      <div>
        <div className="flex items-start justify-between">
          <span className="display select-none text-5xl leading-[0.6] text-champagne/40">&ldquo;</span>
          <Stars n={t.rating} />
        </div>
        <p className="display mt-3 text-balance text-[1.3rem] leading-snug text-cream/95 sm:text-[1.45rem]">
          {t.content}
        </p>
      </div>
      <footer className="mt-7 flex items-center gap-3.5 border-t border-line pt-5">
        <Avatar t={t} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-medium text-cream">{t.name}</div>
          <div className="truncate text-[12px] text-cream-muted">
            {[t.role, t.company].filter(Boolean).join(", ")}
          </div>
          {t.country && (
            <div className="text-[10px] uppercase tracking-wide2 text-cream-dim">{t.country}</div>
          )}
        </div>
      </footer>
    </article>
  );
}

function EmptyCard() {
  return (
    <article className="flex min-h-[260px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-line bg-surface/20 p-8 text-center">
      <span className="display text-5xl leading-[0.6] text-champagne/30">&ldquo;</span>
      <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-cream-muted">
        Client stories will appear here. Add your testimonials from the admin
        dashboard to fill this section.
      </p>
    </article>
  );
}

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const list = items && items.length ? items : [];
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);
  const [cardStep, setCardStep] = useState(0);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPerView(w < 768 ? 1 : w < 1024 ? 2 : 3);
      const track = trackRef.current;
      if (track && track.children.length >= 2) {
        const a = (track.children[0] as HTMLElement).offsetLeft;
        const b = (track.children[1] as HTMLElement).offsetLeft;
        setCardStep(b - a);
      } else if (track && track.children.length === 1) {
        setCardStep((track.children[0] as HTMLElement).offsetWidth);
      }
    };
    calc();
    window.addEventListener("resize", calc);
    const t = setTimeout(calc, 350);
    return () => {
      window.removeEventListener("resize", calc);
      clearTimeout(t);
    };
  }, [list.length]);

  const maxIndex = Math.max(0, list.length - perView);
  const clamped = Math.min(index, maxIndex);
  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex);
  }, [index, maxIndex]);

  const next = () => setIndex((i) => Math.min(i + 1, maxIndex));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const canScroll = list.length > perView;

  return (
    <section id="testimonials" className="relative overflow-hidden border-t border-line py-14 sm:py-28 scroll-mt-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/5 blur-[90px] md:blur-[150px]" />
      <div className="container-lux relative">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              Trusted worldwide
            </span>
            <h2 className="display mt-5 text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Loved by the brands <br className="hidden sm:block" />
              <span className="gradient-text italic">we label.</span>
            </h2>
          </Reveal>
          {canScroll && (
            <div className="hidden gap-2 md:flex">
              <button
                onClick={prev}
                disabled={clamped === 0}
                aria-label="Previous testimonials"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-cream transition-all hover:border-champagne/50 hover:text-champagne disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                onClick={next}
                disabled={clamped >= maxIndex}
                aria-label="Next testimonials"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-cream transition-all hover:border-champagne/50 hover:text-champagne disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          )}
        </div>

        {/* carousel */}
        <Reveal delay={0.1}>
          <div className="overflow-hidden">
            <motion.div
              ref={trackRef}
              className="flex gap-4 md:gap-5"
              drag={canScroll ? "x" : false}
              dragConstraints={{ left: -maxIndex * cardStep, right: 0 }}
              dragElastic={0.08}
              animate={{ x: -clamped * cardStep }}
              transition={{ type: "spring", stiffness: 220, damping: 32, mass: 0.6 }}
              onDragEnd={(_, info) => {
                const threshold = cardStep / 4;
                if (info.offset.x < -threshold) next();
                else if (info.offset.x > threshold) prev();
              }}
            >
              {list.length === 0 ? (
                <div className="basis-full md:basis-1/2 lg:basis-1/3 shrink-0">
                  <EmptyCard />
                </div>
              ) : (
                list.map((t, i) => (
                  <div key={i} className="basis-full shrink-0 md:basis-1/2 lg:basis-1/3">
                    <Card t={t} />
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </Reveal>

        {/* dots */}
        {canScroll && (
          <div className="mt-8 flex items-center justify-center gap-1">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="flex h-11 min-w-11 items-center justify-center rounded-full"
              >
                <span
                  aria-hidden
                  className={`block h-1.5 rounded-full transition-all duration-400 ${
                    i === clamped ? "w-8 bg-champagne" : "w-1.5 bg-cream/20"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* leave a review */}
        <ReviewForm />
      </div>
    </section>
  );
}
