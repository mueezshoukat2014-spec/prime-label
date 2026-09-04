"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/anim";
import { waLink } from "@/lib/whatsapp";

const STATUS_FLOW = [
  "Proof approved",
  "In production",
  "Quality check",
  "Packed",
  "Shipped",
  "Delivered",
];

type Order = {
  code: string;
  name: string;
  product: string | null;
  status: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  eta: string | null;
  updatedAt: string;
};

export default function OrderTracker({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  async function lookup(c: string) {
    const clean = c.trim().toUpperCase();
    if (clean.length < 4) return;
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/track?code=${encodeURIComponent(clean)}`);
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not check that code.");
      setOrder(j.order);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not check that code.");
    } finally {
      setBusy(false);
    }
  }

  // auto-lookup when arriving via /track?code=PL-1234
  useEffect(() => {
    if (initialCode) lookup(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const stepIndex = order ? STATUS_FLOW.indexOf(order.status) : -1;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(code);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Order code e.g. PL-2493"
          maxLength={24}
          className="flex-1 rounded-xl border border-line bg-surface/40 px-4 py-3.5 text-[14px] uppercase tracking-wide text-cream outline-none transition-colors focus:border-champagne/50"
          aria-label="Order code"
        />
        <button
          type="submit"
          disabled={busy || code.trim().length < 4}
          className="btn-primary justify-center !py-3.5 px-8 text-[13px] shadow-glow-sm disabled:opacity-50"
        >
          {busy ? "Checking…" : "Track Order"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-[13px] leading-relaxed text-red-300">
          {error}
        </p>
      )}

      <AnimatePresence>
        {order && (
          <motion.div
            key={order.code}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mt-8 rounded-3xl border border-champagne/25 bg-surface/40 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">Order</p>
                <p className="display mt-0.5 text-2xl text-cream">{order.code}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">For</p>
                <p className="mt-0.5 text-[14px] text-cream">{order.name}</p>
              </div>
            </div>
            {order.product && (
              <p className="mt-2 text-[13px] text-cream-muted">{order.product}</p>
            )}

            {/* status timeline */}
            <div className="mt-7 space-y-0">
              {STATUS_FLOW.map((s, i) => {
                const done = stepIndex >= 0 && i < stepIndex;
                const current = i === stepIndex;
                return (
                  <div key={s} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] transition-colors ${
                          done
                            ? "border-champagne/60 bg-champagne/20 text-champagne"
                            : current
                              ? "border-champagne bg-champagne text-ink shadow-glow-sm"
                              : "border-line text-cream-dim"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div className={`w-px flex-1 ${done ? "bg-champagne/50" : "bg-line"}`} style={{ minHeight: 22 }} />
                      )}
                    </div>
                    <div className="pb-5">
                      <p
                        className={`text-[13.5px] leading-7 ${
                          current ? "font-semibold text-champagne" : done ? "text-cream" : "text-cream-dim"
                        }`}
                      >
                        {s}
                        {current && (
                          <span className="ml-2 rounded-full border border-champagne/40 bg-champagne/10 px-2.5 py-0.5 text-[10.5px] uppercase tracking-wide2">
                            current
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {(order.eta || order.trackingNumber) && (
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {order.eta && (
                  <div className="rounded-2xl border border-line bg-ink/40 p-4">
                    <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">Estimated delivery</p>
                    <p className="mt-1 text-[14px] text-cream">{order.eta}</p>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="rounded-2xl border border-line bg-ink/40 p-4">
                    <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">Courier tracking</p>
                    {order.trackingUrl ? (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-[14px] text-champagne underline underline-offset-4"
                      >
                        {order.trackingNumber} →
                      </a>
                    ) : (
                      <p className="mt-1 text-[14px] text-cream">{order.trackingNumber}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="mt-5 text-[11.5px] text-cream-dim">
              Last updated {new Date(order.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <a
              href={waLink(`Hi Prime Labels! Quick question about my order ${order.code} 👇`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[12.5px] font-medium text-cream-muted transition-all hover:border-champagne/60 hover:text-champagne"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
              </svg>
              Ask about this order
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
