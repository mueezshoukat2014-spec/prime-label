"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Reveal, EASE } from "@/components/anim";
import Link from "next/link";
import type { GalleryItem } from "@/lib/content";

const CAT_LABELS: Record<string, string> = {
  "woven-labels": "Woven",
  "hang-tags": "Hang Tags",
  stickers: "Stickers",
  packaging: "Packaging",
  patch: "Patches",
  "thank-you-cards": "Cards",
  "knitting-labels": "Knitting",
  "steel-logo": "Steel Logo",
  "fabric-labels": "Fabric",
  "printed-labels": "Printed",
  branding: "Branding",
};

export default function GallerySection({
  items,
  limit,
  showAllLink = true,
}: {
  items: GalleryItem[];
  limit?: number;
  showAllLink?: boolean;
}) {
  const cats = useMemo(() => {
    const c = Array.from(new Set(items.map((i) => i.category)));
    return ["all", ...c.filter((x) => CAT_LABELS[x]).slice(0, 7)];
  }, [items]);

  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = filter === "all" ? items : items.filter((i) => i.category === filter);
    if (limit) list = list.slice(0, limit);
    return list;
  }, [items, filter, limit]);

  const close = useCallback(() => setLightbox(null), []);
  const next = useCallback(
    () => setLightbox((i) => (i === null ? i : (i + 1) % filtered.length)),
    [filtered.length]
  );
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? i : (i - 1 + filtered.length) % filtered.length)),
    [filtered.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, next, prev]);

  return (
    <section id="gallery" className="relative border-t border-line py-20 sm:py-28">
      <div className="container-lux">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
          <div>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              The work
            </span>
            <h2 className="display mt-5 text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              A gallery of <span className="gradient-text italic">details.</span>
            </h2>
          </div>
          </Reveal>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full border px-4 py-2 text-[12px] capitalize transition-all duration-400 ${
                  filter === c
                    ? "border-champagne/50 bg-champagne/10 text-cream"
                    : "border-line text-cream-muted hover:border-cream/20 hover:text-cream"
                }`}
              >
                {c === "all" ? "All" : CAT_LABELS[c] || c}
              </button>
            ))}
          </div>
        </div>

        {/* masonry */}
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
          {filtered.map((item, i) => (
            <button
              key={item.src + i}
              onClick={() => setLightbox(i)}
              data-cursor="View"
              style={{ aspectRatio: `${item.w || 1200} / ${item.h || 1500}`, contentVisibility: "auto", containIntrinsicSize: "auto 360px" } as React.CSSProperties}
              className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl border border-line transition-[transform,border-color] duration-[220ms] ease-out hover:-translate-y-1 hover:border-cream/25"
            >
              <Image
                src={item.src}
                alt={item.caption || item.category}
                fill
                sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
                quality={55}
                className="object-cover transition-[filter] duration-[220ms] ease-out group-hover:brightness-110 group-hover:contrast-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/80 via-ink/0 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="line-clamp-2 text-left text-[12px] uppercase tracking-widest2 text-cream-muted">
                  {item.caption || CAT_LABELS[item.category] || "Custom branding by Prime Labels"}
                </span>
              </div>
              <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full glass-strong opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1h4M1 1v4M11 1H7M11 1v4M1 11h4M1 11V7M11 11H7M11 11V7" stroke="#F4F0E8" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {showAllLink && (
          <div className="mt-14 flex justify-center">
            <Link href="/gallery" data-cursor="Gallery">
              <span className="btn-ghost">View full gallery →</span>
            </Link>
          </div>
        )}
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 z-[180] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-xl sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              onClick={close}
              className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full glass text-cream"
              aria-label="Close"
            >
              ✕
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full glass text-cream sm:left-6"
              aria-label="Previous"
            >
              ←
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full glass text-cream sm:right-6"
              aria-label="Next"
            >
              →
            </button>
            <motion.figure
              key={filtered[lightbox].src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative max-h-[85vh] max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filtered[lightbox].src}
                alt={filtered[lightbox].caption || ""}
                width={filtered[lightbox].w || 1200}
                height={filtered[lightbox].h || 1500}
                sizes="(max-width:1280px) 100vw, 1024px"
                quality={70}
                className="max-h-[80vh] w-auto rounded-2xl border border-line object-contain"
              />
              <figcaption className="mt-4 flex items-center justify-between gap-4">
                <span className="text-[13px] text-cream-muted line-clamp-1">
                  {filtered[lightbox].caption || "Custom branding by Prime Labels"}
                </span>
                <span className="text-[11px] uppercase tracking-widest2 text-champagne">
                  {lightbox + 1} / {filtered.length}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
