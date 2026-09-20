"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Floating "Suggest a change" box, visible on every public page.
 *
 * Visitors can tell the owner what to improve on the website (or suggest
 * anything else). Entries are stored in the `suggestions` table and shown in
 * Admin Dashboard → Suggestions, with the visitor's name/contact if given.
 *
 * Stacked above the WhatsApp float so the corner never gets crowded.
 */
export default function SuggestionBox() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  // The owner doesn't need a feedback float inside their own dashboard.
  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 5 || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, message }),
      });
      const j = await res.json().catch(() => ({}));
      setState(j?.ok ? "done" : "error");
      if (j?.ok) {
        setName("");
        setContact("");
        setMessage("");
      }
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Suggest a change to this website"
        onClick={() => {
          setOpen(true);
          setState("idle");
        }}
        className="group fixed bottom-20 right-4 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-champagne/35 bg-ink/85 shadow-soft backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-champagne/70 hover:shadow-[0_0_32px_-10px_rgba(201,168,106,0.8)] sm:bottom-[6rem] sm:right-7 sm:h-14 sm:w-14"
      >
        <span
          className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-full border border-champagne/25 bg-ink/95 px-3 py-1.5 text-[11px] font-medium text-cream opacity-0 shadow-soft backdrop-blur transition-all duration-300 group-hover:-translate-y-1 group-hover:opacity-100 group-focus-visible:-translate-y-1 group-focus-visible:opacity-100"
        >
          Suggest a change
        </span>
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-[#8a6b33] text-ink shadow-[0_0_22px_-8px_rgba(201,168,106,0.9)] transition-transform duration-500 group-hover:scale-110 sm:h-11 sm:w-11">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 18h6M10 21h4" />
            <path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1.3 1.5 1.5 2.5h5c.2-1 .7-1.8 1.5-2.5A6 6 0 0 0 12 3Z" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Suggest a change"
        >
          <div
            className="w-full max-w-md rounded-3xl border border-champagne/25 bg-ink/95 p-6 shadow-soft backdrop-blur-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            {state === "done" ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-champagne/15 text-champagne">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4 12.5 9.5 18 20 6.5" />
                  </svg>
                </div>
                <h2 className="display text-2xl text-cream">Shukriya!</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-cream-muted">
                  Your suggestion reached the owner&apos;s dashboard. We read every
                  single one — this website improves because of people like you.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-6 rounded-full bg-champagne px-6 py-2.5 text-[13px] font-semibold text-ink transition-transform hover:scale-[1.03]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-champagne">Suggestion box</p>
                  <h2 className="display mt-1 text-2xl text-cream">Help us improve this website</h2>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream-muted">
                    Spot something to change? Want a new feature or product page?
                    Tell the owner directly — it lands straight in the admin panel.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={200}
                    placeholder="Your name (optional)"
                    className="w-full rounded-xl border border-cream/15 bg-cream/[0.04] px-3.5 py-2.5 text-[13px] text-cream placeholder:text-cream-dim focus:border-champagne/60 focus:outline-none"
                  />
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    maxLength={200}
                    placeholder="Email / WhatsApp (optional)"
                    className="w-full rounded-xl border border-cream/15 bg-cream/[0.04] px-3.5 py-2.5 text-[13px] text-cream placeholder:text-cream-dim focus:border-champagne/60 focus:outline-none"
                  />
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  required
                  rows={4}
                  placeholder="e.g. Please add a page showing abaya label designs, or make the quote form shorter…"
                  className="w-full resize-none rounded-xl border border-cream/15 bg-cream/[0.04] px-3.5 py-2.5 text-[13px] text-cream placeholder:text-cream-dim focus:border-champagne/60 focus:outline-none"
                />

                {state === "error" && (
                  <p className="text-[12px] text-red-400">
                    Could not send right now — please try again in a moment.
                  </p>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full px-4 py-2.5 text-[12.5px] text-cream-muted transition-colors hover:text-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={state === "sending" || message.trim().length < 5}
                    className="rounded-full bg-champagne px-6 py-2.5 text-[13px] font-semibold text-ink transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {state === "sending" ? "Sending…" : "Send suggestion"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
