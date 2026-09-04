"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/anim";

const input =
  "w-full rounded-xl border border-line bg-surface/40 px-3.5 py-3 text-[13.5px] text-cream outline-none transition-colors focus:border-champagne/50";

export default function ReferralWidget() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [existing, setExisting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"code" | "message" | "">("");

  const ready = name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 8;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), website }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not create your code.");
      setCode(j.code);
      setExisting(!!j.existing);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create your code.");
    } finally {
      setBusy(false);
    }
  }

  const shareMessage = `I order my clothing labels from Prime Labels International — quality is excellent and MOQ starts at just 100 pcs. Use my referral code ${code} when you request a quote and we BOTH get 10% off: https://primelabelsintl.com/quote`;

  async function copy(text: string, which: "code" | "message") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      /* older browsers */
    }
  }

  const waShare = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="rounded-3xl border border-champagne/25 bg-surface/40 p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {code ? (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <p className="display text-2xl text-cream">
              {existing ? "Welcome back ✦ here's your code" : "Your referral code ✦"}
            </p>
            <button
              type="button"
              onClick={() => copy(code, "code")}
              className="mt-4 flex w-full items-center justify-between rounded-2xl border border-champagne/40 bg-champagne/10 px-5 py-4 transition-colors hover:bg-champagne/15"
              aria-label="Copy referral code"
            >
              <span className="display text-3xl tracking-wide text-champagne">{code}</span>
              <span className="text-[11.5px] uppercase tracking-wide2 text-champagne/80">
                {copied === "code" ? "Copied ✓" : "Tap to copy"}
              </span>
            </button>
            <p className="mt-4 text-[12.5px] leading-relaxed text-cream-muted">
              Share it with brand-owner friends. When their first order confirms with your code,
              you both get <span className="text-champagne">10% off</span> — yours applies to your
              next order.
            </p>
            <a
              href={waShare}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-5 flex w-full items-center justify-center gap-2 !py-3.5 text-[13px] shadow-glow-sm"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
              </svg>
              Share on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => copy(shareMessage, "message")}
              className="mt-3 w-full rounded-full border border-line px-5 py-3 text-[12.5px] text-cream-muted transition-all hover:border-champagne/40 hover:text-cream"
            >
              {copied === "message" ? "Message copied ✓" : "Copy share message"}
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="display text-xl text-cream">Get your referral code</p>
            <p className="mt-1 text-[12px] text-cream-dim">
              Takes 10 seconds — we&apos;ll match the code to your WhatsApp number.
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
                placeholder="WhatsApp with country code * e.g. +966…"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={busy}
                autoComplete="tel"
              />
              {/* honeypot — hidden from humans */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
            </div>
            {error && <p className="mt-3 text-[12.5px] text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={!ready || busy}
              className="btn-primary mt-4 w-full justify-center !py-3.5 text-[13px] shadow-glow-sm disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create My Code"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
