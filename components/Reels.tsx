"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Reveal, EASE } from "@/components/anim";
import SwipeHint from "@/components/SwipeHint";
import type { Reel } from "@/lib/content";

export default function Reels({ reels }: { reels: Reel[] }) {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [playing, setPlaying] = useState(false);
  const vidRef = useRef<HTMLVideoElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const r = reels[active];

  // detect mobile (<768px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const play = useCallback(() => {
    vidRef.current?.play().then(() => setPlaying(true)).catch(() => {});
  }, []);

  // playback control: desktop autoplays, mobile plays only when in view
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    if (!isMobile) {
      play();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            v.play().then(() => setPlaying(true)).catch(() => {});
          } else {
            v.pause();
            setPlaying(false);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [isMobile, active, play]);

  function select(i: number) {
    setActive(i);
    requestAnimationFrame(() => play());
  }

  // prev / next with wrap-around
  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((cur) => (cur + dir + reels.length) % reels.length);
      requestAnimationFrame(() => play());
    },
    [reels.length, play]
  );

  // Keep the active thumbnail visible in its own strip.
  //
  // This must never scroll the PAGE. scrollIntoView() walks every scrollable
  // ancestor up to the document, so on mount it used to drag the whole window
  // down to the reels section. We scroll the strip itself instead, and skip the
  // very first render entirely.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true; // never scroll on initial load
      return;
    }
    const list = listRef.current;
    const el = thumbRefs.current[active];
    if (!list || !el) return;

    const horizontal = list.scrollWidth > list.clientWidth;
    if (horizontal) {
      const target = el.offsetLeft - (list.clientWidth - el.clientWidth) / 2;
      list.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    } else {
      const target = el.offsetTop - (list.clientHeight - el.clientHeight) / 2;
      list.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }
  }, [active]);

  // Note: no window-level arrow-key listener here on purpose. Binding arrows
  // globally would steal normal page scrolling from the visitor. The on-screen
  // arrow buttons are proper <button>s, so keyboard users can Tab to them and
  // press Enter/Space natively.

  return (
    <section className="relative border-t border-line py-20 sm:py-28">
      <div className="container-lux">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
          <div>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              In motion
            </span>
            <h2 className="display mt-5 text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              See the <span className="gradient-text italic">craft.</span>
            </h2>
          </div>
          </Reveal>
          <p className="max-w-xs text-[14px] leading-relaxed text-cream-muted">
            Real work, real detail. A look at how our labels, tags and packaging
            come together.
          </p>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* player */}
          <Reveal className="relative aspect-[9/11] max-h-[60vh] min-w-0 overflow-hidden rounded-4xl border border-line bg-ink shadow-soft sm:aspect-[16/10] sm:max-h-none lg:aspect-auto lg:min-h-[560px]">
            <AnimatePresence mode="wait">
              <motion.video
                key={r.src}
                ref={vidRef}
                src={r.src}
                poster={r.cover}
                muted
                loop
                playsInline
                preload="none"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            {/* prev / next arrows on the player */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous reel"
              className="group absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full glass-strong text-cream transition-all duration-300 hover:scale-110 hover:text-champagne sm:right-5 sm:top-5"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next reel"
              className="group absolute right-4 top-[4.25rem] z-20 flex h-11 w-11 items-center justify-center rounded-full glass-strong text-cream transition-all duration-300 hover:scale-110 hover:text-champagne sm:right-5 sm:top-[4.75rem]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M8 3v10M8 13l-4.5-4.5M8 13l4.5-4.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* mobile play button (shown when paused) */}
            {isMobile && !playing && (
              <button
                type="button"
                onClick={play}
                aria-label="Play reel"
                className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full glass-strong text-cream transition-transform duration-300 hover:scale-110"
              >
                <svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor" aria-hidden>
                  <path d="M0 0v20l18-10L0 0z" />
                </svg>
              </button>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <span className="eyebrow !text-champagne/90">
                <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
                Reel {active + 1} of {reels.length}
              </span>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-cream">
                {r.caption}
              </p>
            </div>
          </Reveal>

          {/* reel list + arrows */}
          <div className="min-w-0">
            <div className="mb-3 flex justify-center lg:hidden">
              <SwipeHint />
            </div>
            <div className="flex min-w-0 items-center gap-2 lg:flex-col lg:items-stretch">
            {/* up / prev arrow */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous reel"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-cream-muted transition-all duration-300 hover:border-champagne/60 hover:text-champagne lg:h-9 lg:w-full lg:rounded-2xl"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="lg:hidden">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="hidden lg:block">
                <path d="M3 10l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

          <div
            ref={listRef}
            className="flex min-w-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto lg:max-h-[480px] lg:flex-none lg:snap-none lg:flex-col lg:overflow-y-auto lg:pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reels.map((reel, i) => {
              const isActive = i === active;
              return (
                <button
                  key={reel.src}
                  ref={(el) => {
                    thumbRefs.current[i] = el;
                  }}
                  onClick={() => select(i)}
                  className={`group relative aspect-[3/4] w-[88px] shrink-0 snap-start overflow-hidden rounded-2xl border transition-all duration-500 sm:w-[110px] lg:w-full ${
                    isActive ? "border-champagne/60 shadow-glow-sm" : "border-line opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={reel.cover}
                    alt={reel.caption}
                    fill
                    sizes="(max-width:1024px) 40vw, 300px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                  <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full glass-strong">
                    <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
                      <path d="M0 0v11l9-5.5L0 0z" fill="#F4F0E8" />
                    </svg>
                  </div>
                  <span className="absolute bottom-2 left-2 right-2 line-clamp-2 text-left text-[10px] leading-tight text-cream-muted">
                    {reel.caption}
                  </span>
                </button>
              );
            })}
          </div>

            {/* down / next arrow */}
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next reel"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-cream-muted transition-all duration-300 hover:border-champagne/60 hover:text-champagne lg:h-9 lg:w-full lg:rounded-2xl"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="lg:hidden">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="hidden lg:block">
                <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
