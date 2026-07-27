"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/Toast";
import { PRODUCT_CATEGORIES } from "@/lib/quote-validation";
import {
  CURRENCIES,
  type PriceMode,
  buildQuoteMessage,
  computeTotal,
  copyText,
  formatMoney,
  isQuoteComplete,
  parseNum,
} from "@/lib/quote-message";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50";
const label = "mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream-dim";

/**
 * Internal estimate builder.
 *
 * Produces a WhatsApp-ready quote from four inputs. Nothing is stored — this is
 * a formatting tool, so there is no DB write and no lead created.
 */
export default function QuoteGenerator() {
  const toast = useToast();

  const [customer, setCustomer] = useState("");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [unit, setUnit] = useState<PriceMode>("total");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const draft = { customer, item, qty, price, currency, unit, note };
  const message = useMemo(() => buildQuoteMessage(draft), [customer, item, qty, price, currency, unit, note]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = computeTotal(draft);

  const ready = isQuoteComplete(draft);

  async function copy() {
    const ok = await copyText(message);
    if (ok) {
      setCopied(true);
      toast.success("Estimate copied — paste it into WhatsApp.");
      window.setTimeout(() => setCopied(false), 2400);
    } else {
      toast.error("Could not copy automatically. Select the text and copy manually.");
    }
  }

  function reset() {
    setCustomer("");
    setItem("");
    setQty("");
    setPrice("");
    setNote("");
    setUnit("total");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-3xl">Quote Generator</h1>
        <p className="mt-1 text-[13px] text-cream-muted">
          Build a WhatsApp-ready estimate. Nothing is saved — this is a formatting tool.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ---------- inputs ---------- */}
        <div className="rounded-2xl border border-line bg-surface/30 p-5">
          <div className="grid gap-4">
            <label className="block">
              <span className={label}>
                Customer name <span className="text-champagne">*</span>
              </span>
              <input
                className={input}
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g. Ayesha Khan"
              />
            </label>

            <label className="block">
              <span className={label}>
                Item type <span className="text-champagne">*</span>
              </span>
              <input
                className={input}
                list="qg-items"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="e.g. Damask Woven Labels"
              />
              <datalist id="qg-items">
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

            <div className="grid grid-cols-[90px_1fr] gap-3">
              <label className="block">
                <span className={label}>Currency</span>
                <select
                  className={input}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
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
                />
              </label>
            </div>

            <div className="flex gap-2">
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
                      ? "border-champagne/60 bg-champagne/[0.08] text-champagne"
                      : "border-line text-cream-muted hover:border-champagne/40"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {unit === "per" && total && (
              <p className="-mt-1 text-[12px] text-champagne">
                {parseNum(qty).toLocaleString()} × {formatMoney(parseNum(price), currency)} = {formatMoney(total, currency)}
              </p>
            )}

            <label className="block">
              <span className={label}>Extra note</span>
              <textarea
                rows={2}
                className={`${input} resize-none`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Includes centre-fold finishing and free artwork setup."
              />
            </label>

            <button
              type="button"
              onClick={reset}
              className="w-fit text-[12px] text-cream-dim underline underline-offset-4 hover:text-cream"
            >
              Clear form
            </button>
          </div>
        </div>

        {/* ---------- preview ---------- */}
        <div className="rounded-2xl border border-line bg-surface/30 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className={label + " !mb-0"}>WhatsApp preview</span>
            {!ready && (
              <span className="text-[11px] text-cream-dim">
                Add name, item and price
              </span>
            )}
          </div>

          {/* chat bubble mock */}
          <div className="rounded-xl border border-line bg-ink p-4">
            <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-cream">
              {message}
            </pre>
          </div>

          <button
            type="button"
            onClick={copy}
            disabled={!ready}
            className="btn-primary mt-4 w-full !py-3 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied to clipboard
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M5 15V5a2 2 0 012-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Copy to clipboard
              </>
            )}
          </button>

          <p className="mt-2 text-center text-[11px] text-cream-dim">
            Bold markers (*text*) render as bold inside WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
