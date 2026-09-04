"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { waLink } from "@/lib/whatsapp";

/**
 * Per-piece cost band calculator. Deliberately shows RELATIVE bands, not
 * prices — pricing stays in the quote conversation, but the customer sees
 * the economics of ordering more ("volume pricing is real") and lands on
 * the quote form with product + quantity preselected.
 */

export type CalcProduct = {
  slug: string;
  title: string;
  moq: number;
};

/** Quantity ladder derived from the product MOQ. */
function ladderFor(moq: number): number[] {
  const base = Math.max(1, moq);
  return [base, base * 2, base * 5, base * 10, base * 25, base * 50];
}

/**
 * Typical per-piece saving vs the MOQ price as quantity grows. These are
 * conservative industry-typical bands (setup cost amortization), shown as
 * "up to X%" — the exact quote always comes from the team.
 */
function savingFor(multiple: number): number {
  if (multiple >= 50) return 60;
  if (multiple >= 25) return 50;
  if (multiple >= 10) return 40;
  if (multiple >= 5) return 30;
  if (multiple >= 2) return 15;
  return 0;
}

function bandLabel(multiple: number): { symbol: string; label: string } {
  if (multiple >= 25) return { symbol: "$", label: "Lowest per-piece band" };
  if (multiple >= 10) return { symbol: "$$", label: "Low band" };
  if (multiple >= 5) return { symbol: "$$$", label: "Mid band" };
  if (multiple >= 2) return { symbol: "$$$$", label: "Upper band" };
  return { symbol: "$$$$$", label: "Starting band (MOQ)" };
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default function CostCalculator({ products }: { products: CalcProduct[] }) {
  const [slug, setSlug] = useState(products[0]?.slug ?? "");
  const product = useMemo(
    () => products.find((p) => p.slug === slug) ?? products[0],
    [products, slug]
  );
  const ladder = useMemo(() => ladderFor(product?.moq ?? 100), [product]);
  const [step, setStep] = useState(2); // default: 5× MOQ — the sweet spot

  const qty = ladder[step] ?? ladder[0];
  const multiple = qty / (product?.moq || 1);
  const saving = savingFor(multiple);
  const band = bandLabel(multiple);

  const quoteHref = `/quote?product=${encodeURIComponent(product?.title ?? "")}&quantity=${encodeURIComponent(
    `${fmt(qty)} pcs`
  )}`;
  const waHref = waLink(
    `Hi Prime Labels! I used the cost calculator 👇\n\n▪ Product: ${product?.title}\n▪ Quantity: ${fmt(qty)} pcs\n▪ City/Country: ____\n\nPlease send me the exact per-piece quote.`
  );

  if (!product) return null;

  return (
    <div className="rounded-3xl border border-champagne/25 bg-surface/40 p-6 sm:p-8">
      {/* product picker */}
      <p className="mb-2.5 text-[11px] uppercase tracking-wide2 text-cream-dim">Product</p>
      <div className="flex flex-wrap gap-2">
        {products.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => {
              setSlug(p.slug);
              setStep(2);
            }}
            className={`rounded-full border px-4 py-2 text-[12px] transition-all duration-300 ${
              slug === p.slug
                ? "border-champagne bg-champagne/15 text-champagne shadow-glow-sm"
                : "border-line text-cream-muted hover:border-champagne/50 hover:text-cream"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* quantity slider */}
      <div className="mt-7">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">Quantity</p>
          <p className="display text-3xl text-cream">
            {fmt(qty)} <span className="text-base text-cream-muted">pcs</span>
          </p>
        </div>
        <input
          type="range"
          min={0}
          max={ladder.length - 1}
          step={1}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className="mt-3 w-full accent-[#C9A86A]"
          aria-label="Quantity"
        />
        <div className="mt-1.5 flex justify-between text-[10.5px] text-cream-dim">
          {ladder.map((n, i) => (
            <button
              key={n}
              type="button"
              onClick={() => setStep(i)}
              className={`transition-colors ${i === step ? "text-champagne" : "hover:text-cream-muted"}`}
            >
              {n >= 1000 ? `${n / 1000}k` : n}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11.5px] text-cream-dim">
          MOQ for {product.title}: {fmt(product.moq)} pcs
        </p>
      </div>

      {/* result */}
      <motion.div
        key={`${slug}-${step}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-7 rounded-2xl border border-line bg-ink/40 p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">Per-piece cost band</p>
            <p className="display mt-1 text-2xl text-champagne">{band.symbol}</p>
            <p className="mt-0.5 text-[12px] text-cream-muted">{band.label}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">vs MOQ pricing</p>
            <p className="display mt-1 text-2xl text-cream">
              {saving > 0 ? `up to −${saving}%` : "baseline"}
            </p>
            <p className="mt-0.5 text-[12px] text-cream-muted">typical per-piece saving</p>
          </div>
        </div>

        {/* visual band scale */}
        <div className="mt-5 flex gap-1.5" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                i <= step ? "bg-champagne/80" : "bg-line"
              }`}
            />
          ))}
        </div>
        <p className="mt-4 text-[11.5px] leading-relaxed text-cream-dim">
          Setup, weaving programs and shipping are spread across more pieces as quantity grows —
          that&apos;s where the saving comes from. Exact pricing depends on size, finish and
          destination; your tailored quote arrives within 24 hours.
        </p>
      </motion.div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={quoteHref} className="btn-primary flex-1 justify-center !py-3.5 text-[13px] shadow-glow-sm">
          Get Exact Quote for {fmt(qty)} pcs
        </Link>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-[13px] font-medium text-cream-muted transition-all hover:border-champagne/60 hover:text-champagne"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
          </svg>
          Ask on WhatsApp
        </a>
      </div>
    </div>
  );
}
