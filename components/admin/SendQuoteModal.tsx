"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/Toast";
import { PRODUCT_CATEGORIES } from "@/lib/quote-validation";
import {
  CURRENCIES,
  type PriceMode,
  buildQuoteMessage,
  buildWhatsAppLink,
  computeTotal,
  copyText,
  formatMoney,
  isQuoteComplete,
  parseNum,
} from "@/lib/quote-message";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50";
const label = "mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream-dim";

export type QuoteLead = {
  id: number;
  name: string;
  phone: string | null;
  product: string | null;
  quantity: string | null;
  email?: string | null;
};

/**
 * "Send Quote" dialog opened from a lead card.
 *
 * Customer, item and quantity are pre-filled from the lead, so the only inputs
 * needed are price, currency and an optional note.
 */
export default function SendQuoteModal({
  lead,
  onClose,
}: {
  lead: QuoteLead;
  onClose: () => void;
}) {
  const toast = useToast();

  // Seeded from the lead — still editable in case the record is incomplete.
  const [customer, setCustomer] = useState(lead.name ?? "");
  const [item, setItem] = useState(lead.product ?? "");
  const [qty, setQty] = useState(lead.quantity ?? "");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [unit, setUnit] = useState<PriceMode>("total");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const draft = { customer, item, qty, price, currency, unit, note };
  const message = useMemo(() => buildQuoteMessage(draft), [customer, item, qty, price, currency, unit, note]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = computeTotal(draft);
  const ready = isQuoteComplete(draft);

  const waLink = useMemo(
    () => (lead.phone ? buildWhatsAppLink(lead.phone, message) : null),
    [lead.phone, message]
  );

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleCopy() {
    const ok = await copyText(message);
    if (ok) {
      setCopied(true);
      toast.success("Quote copied — paste it into WhatsApp.");
      window.setTimeout(() => setCopied(false), 2400);
    } else {
      toast.error("Could not copy automatically. Select the text and copy manually.");
    }
  }

  function handleSend() {
    if (!waLink) {
      toast.error(
        lead.phone
          ? `That phone number (${lead.phone}) isn't valid for WhatsApp.`
          : "This lead has no phone number saved."
      );
      return;
    }
    window.open(waLink, "_blank", "noopener,noreferrer");
    toast.success(`Opening WhatsApp chat with ${lead.name}…`);
  }

  return (
    <div
      className="fixed inset-0 z-[2500] flex items-start justify-center overflow-y-auto bg-ink/80 p-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Send a quote to ${lead.name}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-champagne/30 bg-surface-2 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="display text-2xl text-cream">Send quote</h2>
            <p className="mt-1 text-[12.5px] text-cream-muted">
              To <span className="text-cream">{lead.name}</span>
              {lead.phone && <span className="text-cream-dim"> · {lead.phone}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-cream-muted transition-colors hover:border-champagne/40 hover:text-champagne"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* ---------- inputs ---------- */}
          <div className="space-y-4">
            {/* prefilled from the lead */}
            <div className="rounded-xl border border-line bg-surface/30 p-4">
              <p className="mb-3 text-[10px] uppercase tracking-wide2 text-cream-dim">
                From this lead
              </p>
              <div className="grid gap-3">
                <label className="block">
                  <span className={label}>Customer name</span>
                  <input className={input} value={customer} onChange={(e) => setCustomer(e.target.value)} />
                </label>
                <label className="block">
                  <span className={label}>Item type</span>
                  <input
                    className={input}
                    list="sq-items"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    placeholder="e.g. Woven Labels"
                  />
                  <datalist id="sq-items">
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </label>
                <label className="block">
                  <span className={label}>Quantity</span>
                  <input
                    className={input}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="e.g. 1000 pcs"
                  />
                </label>
              </div>
            </div>

            {/* what you fill in */}
            <div className="rounded-xl border border-champagne/30 bg-champagne/[0.04] p-4">
              <p className="mb-3 text-[10px] uppercase tracking-wide2 text-champagne">
                Your pricing
              </p>

              <div className="grid grid-cols-[90px_1fr] gap-3">
                <label className="block">
                  <span className={label}>Currency</span>
                  <select className={input} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c} className="bg-ink">
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={label}>
                    Quoted price <span className="text-champagne">*</span>
                  </span>
                  <input
                    className={input}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 18000"
                    inputMode="decimal"
                    autoFocus
                  />
                </label>
              </div>

              <div className="mt-3 flex gap-2">
                {(
                  [
                    ["total", "Total price"],
                    ["per", "Per piece"],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setUnit(v)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-[12px] transition-colors ${
                      unit === v
                        ? "border-champagne/60 bg-champagne/[0.10] text-champagne"
                        : "border-line text-cream-muted hover:border-champagne/40"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {unit === "per" && total && (
                <p className="mt-2 text-[12px] text-champagne">
                  {parseNum(qty).toLocaleString()} × {formatMoney(parseNum(price), currency)} ={" "}
                  {formatMoney(total, currency)}
                </p>
              )}

              <label className="mt-3 block">
                <span className={label}>Extra note</span>
                <textarea
                  rows={2}
                  className={`${input} resize-none`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Includes centre-fold finishing and free artwork setup."
                />
              </label>
            </div>
          </div>

          {/* ---------- preview + actions ---------- */}
          <div className="flex flex-col">
            <span className={label}>WhatsApp preview</span>
            <div className="flex-1 rounded-xl border border-line bg-ink p-4">
              <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-cream">
                {message}
              </pre>
            </div>

            {!ready && (
              <p className="mt-2 text-[11.5px] text-cream-dim">
                Enter a quoted price to enable sending.
              </p>
            )}
            {ready && !waLink && (
              <p className="mt-2 text-[11.5px] text-red-300">
                {lead.phone
                  ? `No valid WhatsApp number on this lead (${lead.phone}) — use Copy instead.`
                  : "This lead has no phone number — use Copy instead."}
              </p>
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!ready}
                className="flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-3 text-[12.5px] text-cream transition-colors hover:border-champagne/50 hover:text-champagne disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M5 15V5a2 2 0 012-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Copy Quote Message
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={!ready || !waLink}
                className="btn-primary !py-3 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                </svg>
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
