"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Reveal, EASE } from "@/components/anim";
import SwipeHint from "@/components/SwipeHint";
import type { Reel } from "@/lib/content";

const REEL_PRODUCTS = [
  "Woven Labels",
  "Hang Tags",
  "Satin Labels",
  "Custom Stickers",
  "Brand Packaging",
  "Zipper Bags",
  "Woven Patches",
  "Steel Logo Tags",
] as const;

const productForReel = (index: number) => REEL_PRODUCTS[index % REEL_PRODUCTS.length];

export default function Reels({ reels }: { reels: Reel[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const vidRef = useRef<HTMLVideoElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const r = reels[active];
  const activeProduct = r.product || productForReel(active);

  const play = useCallback(() => {
    const video = vidRef.current;
    if (!video) return;
    video.muted = true;
    video.volume = 0;
    video.play().then(() => setPlaying(true)).catch(() => {});
  }, []);

  // Preload videos only when the section is close to viewport. Keeps the landing
  // page light while making previews ready when the visitor reaches this section.
  useEffect(() => {
    const section = listRef.current?.closest("section");
    if (!section) return;
    const links: HTMLLinkElement[] = [];
    const preload = () => {
      reels.forEach((reel) => {
        if (document.querySelector(`link[rel="preload"][href="${reel.src}"]`)) return;
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "video";
        link.href = reel.src;
        document.head.appendChild(link);
        links.push(link);
      });
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preload();
          io.disconnect();
        }
      },
      { rootMargin: "700px 0px" }
    );
    io.observe(section);
    return () => {
      io.disconnect();
      links.forEach((link) => link.remove());
    };
  }, [reels]);

  const pause = useCallback(() => {
    const video = vidRef.current;
    if (!video) return;
    video.pause();
    setPlaying(false);
  }, []);

  // No autoplay: videos start only when the visitor taps/clicks. If the
  // playing video scrolls out of view, pause it to save battery/data.
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    v.muted = true;
    v.volume = 0;
    setPlaying(false);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) {
            v.pause();
            setPlaying(false);
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [active]);

  function select(i: number) {
    // Explicit tap on a reel thumbnail — start that reel.
    setActive(i);
    requestAnimationFrame(() => play());
  }

  const go = useCallback(
    (dir: -1 | 1) => {
      // Explicit prev/next click — keep the viewing session going.
      setActive((cur) => (cur + dir + reels.length) % reels.length);
      requestAnimationFrame(() => play());
    },
    [reels.length, play]
  );

  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
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

  return (
    <section className="relative overflow-hidden border-t border-line py-14 sm:py-28">
      <div className="pointer-events-none absolute inset-y-16 left-0 hidden w-[26vw] lg:block">
        <div className="absolute left-10 top-1/2 h-[70%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-champagne/55 to-transparent shadow-[0_0_32px_rgba(201,168,106,0.6)]" />
        <div className="absolute left-4 top-[18%] h-28 w-28 rounded-full border border-champagne/15 bg-champagne/[0.035] blur-[1px]" />
        <div className="absolute left-20 bottom-[12%] h-44 w-44 rounded-full bg-champagne/[0.045] blur-[70px]" />
      </div>
      <div className="pointer-events-none absolute inset-y-16 right-0 hidden w-[26vw] lg:block">
        <div className="absolute right-10 top-1/2 h-[70%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-champagne/55 to-transparent shadow-[0_0_32px_rgba(201,168,106,0.6)]" />
        <div className="absolute right-4 top-[22%] h-28 w-28 rounded-full border border-champagne/15 bg-champagne/[0.035] blur-[1px]" />
        <div className="absolute right-20 bottom-[10%] h-44 w-44 rounded-full bg-champagne/[0.045] blur-[70px]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-champagne/10 to-transparent lg:block" />
      <div className="container-lux relative">
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

        <div className="grid min-w-0 justify-center gap-6 lg:grid-cols-[minmax(280px,460px)_300px] lg:items-start">
          <Reveal className="relative aspect-[9/16] w-full max-w-[430px] min-w-0 overflow-hidden rounded-4xl border border-line bg-ink shadow-soft sm:max-w-[460px] lg:h-[72vh] lg:max-h-[680px] lg:min-h-[520px]">
            <AnimatePresence mode="wait">
              <motion.video
                key={r.src}
                ref={vidRef}
                src={r.src}
                poster={r.cover || undefined}
                muted
                loop
                playsInline
                preload="metadata"
                controls={false}
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            <button type="button" onClick={() => go(-1)} aria-label="Previous reel" className="group absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full glass-strong text-cream transition-all duration-300 hover:scale-110 hover:text-champagne sm:right-5 sm:top-5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next reel" className="group absolute right-4 top-[4.25rem] z-20 flex h-11 w-11 items-center justify-center rounded-full glass-strong text-cream transition-all duration-300 hover:scale-110 hover:text-champagne sm:right-5 sm:top-[4.75rem]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 3v10M8 13l-4.5-4.5M8 13l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            {/* click-to-play: overlay toggles play/pause on every device */}
            <button
              type="button"
              onClick={() => (playing ? pause() : play())}
              aria-label={playing ? "Pause reel" : "Play reel"}
              className="absolute inset-0 z-10"
            />
            {!playing && (
              <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full glass-strong text-cream">
                <svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor" aria-hidden><path d="M0 0v20l18-10L0 0z" /></svg>
              </span>
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
              <Link href={`/quote?product=${encodeURIComponent(activeProduct)}`} className="pointer-events-auto mt-4 inline-flex rounded-full border border-champagne/35 bg-champagne/12 px-4 py-2 text-[12px] font-medium text-champagne backdrop-blur transition-colors hover:bg-champagne/20">
                Customize this {activeProduct} →
              </Link>
            </div>
          </Reveal>

          <div className="min-w-0">
            <div className="mb-3 flex justify-center lg:hidden">
              <SwipeHint />
            </div>
            <div className="flex min-w-0 items-center gap-2 lg:flex-col lg:items-stretch">
              <button type="button" onClick={() => go(-1)} aria-label="Previous reel" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-cream-muted transition-all duration-300 hover:border-champagne/60 hover:text-champagne lg:h-9 lg:w-full lg:rounded-2xl">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="lg:hidden"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="hidden lg:block"><path d="M3 10l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>

              <div ref={listRef} className="flex min-w-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto lg:max-h-[560px] lg:flex-none lg:snap-none lg:flex-col lg:overflow-y-auto lg:pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {reels.map((reel, i) => {
                  const isActive = i === active;
                  const product = reel.product || productForReel(i);
                  return (
                    <div key={reel.src} className="w-[88px] shrink-0 snap-start sm:w-[104px] lg:w-full">
                      <button ref={(el) => { thumbRefs.current[i] = el; }} onClick={() => select(i)} className={`group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border transition-all duration-500 ${isActive ? "border-champagne/60 shadow-glow-sm" : "border-line opacity-60 hover:opacity-100"}`}>
                        {reel.cover ? (
                          <img
  src={typeof reel.cover === "string" ? (reel.cover) : ""}
  alt={reel.caption}
  loading="lazy"
  decoding="async"
  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
/>
                        ) : (
                          <video src={reel.src} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                        <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full glass-strong">
                          <svg width="9" height="11" viewBox="0 0 9 11" fill="none"><path d="M0 0v11l9-5.5L0 0z" fill="#F4F0E8" /></svg>
                        </div>
                        <span className="absolute bottom-2 left-2 right-2 line-clamp-2 text-left text-[10px] leading-tight text-cream-muted">{reel.caption}</span>
                      </button>
                      <Link href={`/quote?product=${encodeURIComponent(product)}`} className="mt-2 block truncate rounded-full border border-champagne/25 bg-champagne/[0.06] px-2.5 py-1.5 text-center text-[10px] font-medium text-champagne transition-colors hover:bg-champagne/15">
                        {product}
                      </Link>
                    </div>
                  );
                })}
              </div>

              <button type="button" onClick={() => go(1)} aria-label="Next reel" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-cream-muted transition-all duration-300 hover:border-champagne/60 hover:text-champagne lg:h-9 lg:w-full lg:rounded-2xl">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="lg:hidden"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="hidden lg:block"><path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
