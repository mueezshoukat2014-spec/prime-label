"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, EASE } from "@/components/anim";
import { waProductLink } from "@/lib/whatsapp";
import { volumeTiersFor, type PdpContent } from "@/lib/pdp-content";

type PdpProduct = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  gallery: string[];
  moq?: number | null;
  turnaround?: number | null;
};

/* ---------- weekly production batch countdown (real recurring deadline) ---------- */
/** Batch locks every Sunday 23:59 site time; slots decrease as the week progresses. */
function useBatchClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return { label: "—", slots: 5 };
  const cutoff = new Date(now);
  const day = cutoff.getDay(); // 0 = Sunday
  const daysLeft = (7 - day) % 7; // days until Sunday
  cutoff.setDate(cutoff.getDate() + daysLeft);
  cutoff.setHours(23, 59, 59, 999);
  let ms = cutoff.getTime() - now.getTime();
  if (ms < 0) ms = 0;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const label = d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  // Slots tighten through the week: Mon 6 → Sat/Sun 2.
  const slots = Math.max(2, 7 - ((day + 6) % 7) - 1);
  return { label, slots };
}

const chip = (active: boolean) =>
  `rounded-full border px-4 py-2 text-[12.5px] transition-all duration-300 ${
    active
      ? "border-champagne bg-champagne/15 text-champagne shadow-glow-sm"
      : "border-line text-cream-muted hover:border-champagne/50 hover:text-cream"
  }`;

export default function ProductPdp({
  product,
  content,
}: {
  product: PdpProduct;
  content: PdpContent;
}) {
  const images = useMemo(() => {
    const list = [product.image, ...(product.gallery || [])].filter(Boolean);
    return list.filter((v, i) => list.indexOf(v) === i).slice(0, 6);
  }, [product]);

  const [activeImg, setActiveImg] = useState(0);
  const [fold, setFold] = useState("");
  const [finish, setFinish] = useState("");
  const [tier, setTier] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<"mm" | "cm" | "inch">("mm");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openSpec, setOpenSpec] = useState(true);

  // zoom lens — desktop (fine pointer) only; touch devices get a plain gallery
  const imgWrap = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [canZoom, setCanZoom] = useState(false);
  useEffect(() => {
    setCanZoom(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const { label: countdown, slots } = useBatchClock();

  /** Build the details text passed into the quote form. */
  const detailsText = useMemo(() => {
    const parts: string[] = [];
    if (fold) parts.push(`Fold: ${fold}`);
    if (finish) parts.push(`Finish: ${finish}`);
    if (width || height) parts.push(`Size: ${width || "?"} x ${height || "?"} ${unit}`);
    if (tier) parts.push(`Quantity: ${tier}`);
    return parts.join(" · ");
  }, [fold, finish, width, height, unit, tier]);

  const quoteHref = `/quote?product=${encodeURIComponent(product.title)}${
    detailsText ? `&details=${encodeURIComponent(detailsText)}` : ""
  }`;
  const waHref = waProductLink(
    detailsText ? `${product.title} (${detailsText})` : product.title
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      {/* ---------------- gallery ---------------- */}
      <Reveal>
        <div className="lg:sticky lg:top-28">
          <div
            ref={imgWrap}
            className={`relative aspect-[4/5] overflow-hidden rounded-3xl border border-line shadow-soft ${canZoom ? "cursor-zoom-in" : ""}`}
            onMouseEnter={canZoom ? () => setZoom(true) : undefined}
            onMouseLeave={canZoom ? () => setZoom(false) : undefined}
            onMouseMove={
              canZoom
                ? (e) => {
                    const r = imgWrap.current?.getBoundingClientRect();
                    if (!r) return;
                    setZoomPos({
                      x: ((e.clientX - r.left) / r.width) * 100,
                      y: ((e.clientY - r.top) / r.height) * 100,
                    });
                  }
                : undefined
            }
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={images[activeImg]}
                src={images[activeImg]}
                alt={`${product.title} — view ${activeImg + 1}`}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: zoom ? 1.9 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: zoom ? 0.15 : 0.6, ease: EASE }}
                style={zoom ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            {canZoom && (
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1 text-[10px] uppercase tracking-wide2 text-cream-dim backdrop-blur">
                Hover to inspect texture
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((g, i) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`relative aspect-square overflow-hidden rounded-xl border transition-all ${
                    i === activeImg ? "border-champagne shadow-glow-sm" : "border-line opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={g} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* ---------------- conversion column ---------------- */}
      <div className="min-w-0">
        {/* trust bar */}
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-cream-muted">
            <span className="text-champagne" aria-label="5 star rated">★★★★★</span>
            <span>Produced for fashion brands across the GCC, UK, USA &amp; worldwide</span>
          </div>
          <h1 className="display mt-3 text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            {content.h1}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-cream-muted">{content.intro}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              product.moq ? `Low MOQ ${product.moq} pcs` : "Low MOQ",
              "Free 24h digital proof",
              "DDP express delivery",
            ].map((t) => (
              <span key={t} className="rounded-full border border-champagne/30 bg-champagne/[0.07] px-3.5 py-1.5 text-[11.5px] uppercase tracking-wide2 text-champagne">
                {t}
              </span>
            ))}
          </div>
        </Reveal>

        {/* batch urgency */}
        <Reveal delay={0.05}>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-champagne/25 bg-surface/40 px-5 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">This week&apos;s production batch closes in</p>
              <p className="notranslate mt-1 font-medium tabular-nums text-champagne" translate="no" dir="ltr">{countdown}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">Batch capacity</p>
              <p className="mt-1 text-[13px] text-cream">{slots} slots remaining</p>
            </div>
          </div>
        </Reveal>

        {/* ---------------- configurator ---------------- */}
        <Reveal delay={0.1}>
          <div className="mt-8 space-y-6">
            {content.folds.length > 0 && (
              <div>
                <p className="mb-2.5 text-[11px] uppercase tracking-wide2 text-cream-dim">Fold type</p>
                <div className="flex flex-wrap gap-2">
                  {content.folds.map((f) => (
                    <button key={f} type="button" onClick={() => setFold(fold === f ? "" : f)} className={chip(fold === f)}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {content.finishes.length > 0 && (
              <div>
                <p className="mb-2.5 text-[11px] uppercase tracking-wide2 text-cream-dim">Material &amp; finish</p>
                <div className="flex flex-wrap gap-2">
                  {content.finishes.map((f) => (
                    <button key={f} type="button" onClick={() => setFinish(finish === f ? "" : f)} className={chip(finish === f)}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2.5 text-[11px] uppercase tracking-wide2 text-cream-dim">Size (optional)</p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  inputMode="decimal"
                  value={width}
                  onChange={(e) => setWidth(e.target.value.replace(/[^\d.]/g, "").slice(0, 6))}
                  placeholder="Width"
                  className="w-24 rounded-xl border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50"
                />
                <span className="text-cream-dim">×</span>
                <input
                  inputMode="decimal"
                  value={height}
                  onChange={(e) => setHeight(e.target.value.replace(/[^\d.]/g, "").slice(0, 6))}
                  placeholder="Height"
                  className="w-24 rounded-xl border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50"
                />
                <div className="flex overflow-hidden rounded-xl border border-line">
                  {(["mm", "cm", "inch"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`px-3 py-2.5 text-[12px] transition-colors ${
                        unit === u ? "bg-champagne/15 text-champagne" : "text-cream-dim hover:text-cream"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-[11px] uppercase tracking-wide2 text-cream-dim">Volume requirement</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {volumeTiersFor(product.moq).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(tier === t ? "" : t)}
                    className={`rounded-2xl border px-3 py-3 text-center text-[12px] leading-snug transition-all duration-300 ${
                      tier === t
                        ? "border-champagne bg-champagne/15 text-champagne shadow-glow-sm"
                        : "border-line text-cream-muted hover:border-champagne/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-1">
              <Link
                href={quoteHref}
                data-cursor="Quote"
                className="btn-primary w-full justify-center !py-4 text-[13px] shadow-glow-sm sm:w-auto sm:!px-8"
              >
                Get Tailored Quote in 24 Hours
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-[13px] font-medium text-cream-muted transition-all duration-300 hover:border-champagne/60 hover:text-champagne sm:w-auto"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                </svg>
                Chat on WhatsApp for Instant Design Help
              </a>
              {detailsText && (
                <p className="text-[12px] text-cream-dim">
                  Your selection — <span className="text-cream-muted">{detailsText}</span> — will be attached to your quote.
                </p>
              )}
            </div>

            {/* pre-order + proof guarantee */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-surface/30 p-4">
                <p className="text-[12px] font-medium uppercase tracking-wide2 text-champagne">Seasonal batch booking</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream-muted">
                  Launching a collection? Reserve an upcoming production run and lock your delivery date.
                </p>
                <Link
                  href={`/quote?product=${encodeURIComponent(product.title)}&details=${encodeURIComponent("Pre-order: reserve seasonal production slot")}`}
                  className="mt-2 inline-block text-[12px] text-champagne underline underline-offset-4 hover:text-champagne-bright"
                >
                  Reserve a production slot →
                </Link>
              </div>
              <div className="rounded-2xl border border-line bg-surface/30 p-4">
                <p className="text-[12px] font-medium uppercase tracking-wide2 text-champagne">Free digital mockup</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream-muted">
                  An accurate digital proof lands in your inbox within 24 hours. Production only starts after your approval.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ---------------- specs accordion ---------------- */}
        <Reveal delay={0.12}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-line">
            <button
              type="button"
              onClick={() => setOpenSpec((v) => !v)}
              className="flex w-full items-center justify-between bg-surface/40 px-5 py-4 text-left"
            >
              <span className="text-[13px] font-medium uppercase tracking-wide2 text-cream">
                Technical specifications &amp; logistics
              </span>
              <svg className={`shrink-0 text-cream-dim transition-transform ${openSpec ? "rotate-180" : ""}`} width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {openSpec && (
              <dl className="divide-y divide-line">
                {content.specs.map((s) => (
                  <div key={s.label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[200px_1fr] sm:gap-4">
                    <dt className="text-[11.5px] uppercase tracking-wide2 text-cream-dim">{s.label}</dt>
                    <dd className="text-[13px] leading-relaxed text-cream-muted">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Reveal>

        {/* ---------------- FAQ accordion ---------------- */}
        <Reveal delay={0.14}>
          <div className="mt-8">
            <h2 className="display text-2xl">Common questions</h2>
            <div className="mt-4 divide-y divide-line rounded-2xl border border-line">
              {content.faqs.map((f, i) => (
                <div key={f.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-[13.5px] font-medium text-cream">{f.q}</span>
                    <svg className={`shrink-0 text-cream-dim transition-transform ${openFaq === i ? "rotate-180" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <p className="px-5 pb-4 text-[13px] leading-relaxed text-cream-muted">{f.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
