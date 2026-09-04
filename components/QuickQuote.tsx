"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/anim";
import { waGuidedOrderLink } from "@/lib/whatsapp";

const input =
  "w-full rounded-xl border border-line bg-surface/40 px-3.5 py-3 text-[13.5px] text-cream outline-none transition-colors focus:border-champagne/50";

/**
 * 3-field quick quote: name + WhatsApp + product. Posts to the same
 * /api/leads endpoint (details/quantity left blank — the follow-up happens
 * on WhatsApp). Designed for the mobile-first GCC visitor who won't complete
 * a long form.
 */
export default function QuickQuote({
  products,
  defaultProduct = "",
}: {
  products: string[];
  defaultProduct?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [product, setProduct] = useState(defaultProduct);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const ready = useMemo(() => {
    const digits = phone.replace(/\D/g, "");
    return name.trim().length >= 2 && digits.length >= 8 && digits.length <= 15 && !!product;
  }, [name, phone, product]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    setError("");
    setBusy(true);
    try {
      const normalized = phone.trim().startsWith("+")
        ? `+${phone.replace(/\D/g, "")}`
        : `+${phone.replace(/\D/g, "")}`;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalized,
          product,
          details: "Quick quote request — follow up on WhatsApp",
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not send. Please try WhatsApp instead.");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send. Please try WhatsApp instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-champagne/25 bg-surface/40 p-6 sm:p-7">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="py-4 text-center"
          >
            <p className="display text-2xl text-cream">Request received ✦</p>
            <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">
              We&apos;ll reply on WhatsApp within 12–24 hours with your tailored quote.
            </p>
            <a
              href={waGuidedOrderLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-champagne/40 bg-champagne/10 px-5 py-2.5 text-[12.5px] font-medium text-champagne transition-colors hover:bg-champagne/20"
            >
              Want it faster? Message us now →
            </a>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="display text-xl text-cream">Get your quote in 60 seconds</p>
            <p className="mt-1 text-[12px] text-cream-dim">
              3 fields only — we&apos;ll handle the details on WhatsApp.
            </p>
            <div className="mt-4 space-y-3">
              <input
                className={input}
                placeholder="Your name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                autoComplete="name"
              />
              <input
                className={input}
                inputMode="tel"
                placeholder="WhatsApp number with country code * e.g. +966 5X XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={busy}
                autoComplete="tel"
              />
              <select
                className={`${input} appearance-none`}
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                disabled={busy}
              >
                <option value="" className="bg-ink">
                  Which product? *
                </option>
                {products.map((p) => (
                  <option key={p} value={p} className="bg-ink">
                    {p}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="mt-3 text-[12.5px] text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={!ready || busy}
              className="btn-primary mt-4 w-full justify-center !py-3.5 text-[13px] shadow-glow-sm disabled:opacity-50"
            >
              {busy ? "Sending…" : "Request my quote"}
            </button>
            <p className="mt-3 text-center text-[11.5px] text-cream-dim">
              Free digital proof in 24h · No spam, ever
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
