"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/anim";

const input =
  "w-full rounded-xl border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50";

export default function ReviewForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, country, content, rating, website }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not submit your review.");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not submit your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mx-auto flex items-center gap-2 rounded-full border border-champagne/40 bg-champagne/[0.07] px-6 py-3 text-[13px] font-medium text-champagne transition-all duration-300 hover:bg-champagne/15"
        >
          <span aria-hidden>★</span> Worked with us? Share your experience
        </button>
      ) : (
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mx-auto max-w-lg rounded-3xl border border-champagne/30 bg-surface/40 p-8 text-center"
            >
              <p className="display text-2xl text-cream">Shukran — thank you! ✦</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-cream-muted">
                Your review has been received. It appears on the website once our team verifies it.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mx-auto max-w-2xl rounded-3xl border border-line bg-surface/30 p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="display text-2xl text-cream">Share your experience</p>
                  <p className="mt-1 text-[12.5px] text-cream-dim">
                    Reviews are verified by our team before they appear on the site.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close review form"
                  className="rounded-full border border-line p-2 text-cream-dim transition-colors hover:border-champagne/40 hover:text-cream"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* rating stars */}
              <div className="mt-5 flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={rating === s}
                    aria-label={`${s} star${s > 1 ? "s" : ""}`}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    className={`text-2xl transition-colors ${
                      s <= (hover || rating) ? "text-champagne" : "text-cream/20"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <input className={input} placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} disabled={busy} required />
                <input className={input} placeholder="Brand / company" value={company} onChange={(e) => setCompany(e.target.value)} disabled={busy} />
                <input className={input} placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} disabled={busy} />
              </div>
              <textarea
                className={`${input} mt-3 min-h-[110px] resize-y`}
                placeholder="What did you order, and how was the quality? *"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={busy}
                required
              />
              {/* honeypot — hidden from real users */}
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              {error && <p className="mt-3 text-[12.5px] text-red-300">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="btn-primary mt-5 !py-3 !px-6 text-[12.5px] shadow-glow-sm disabled:opacity-60"
              >
                {busy ? "Submitting…" : "Submit review"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
