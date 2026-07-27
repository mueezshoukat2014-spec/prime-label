"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/anim";
import { normalizeWaLink } from "@/lib/whatsapp";

const inputCls =
  "w-full rounded-xl border border-line bg-surface/40 px-4 py-3.5 text-[14px] text-cream placeholder:text-cream-dim/60 outline-none transition-colors duration-300 focus:border-champagne/50 focus:bg-surface/70";

export default function ContactForm({ whatsapp }: { whatsapp?: string }) {
  const waHref = normalizeWaLink(whatsapp);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-champagne/30 bg-champagne/5 px-5 py-4 text-[14px] text-cream"
          >
            <span className="text-champagne">✓</span>
            Thank you. Your message is on its way. We will reply soon.
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={onSubmit} className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-wide2 text-cream-dim">Name</span>
            <input name="name" required className={inputCls} placeholder="Your name" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-wide2 text-cream-dim">Email</span>
            <input name="email" type="email" className={inputCls} placeholder="you@brand.com" />
          </label>
        </div>
        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-wide2 text-cream-dim">Subject</span>
          <input name="subject" className={inputCls} placeholder="How can we help?" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-wide2 text-cream-dim">Message</span>
          <textarea name="message" required rows={5} className={inputCls + " resize-none"} placeholder="Write your message..." />
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={status === "loading"} className="btn-primary disabled:opacity-60">
            {status === "loading" ? "Sending..." : "Send message"}
          </button>
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            WhatsApp instead
          </a>
        </div>
        {status === "error" && (
          <p className="text-[13px] text-red-300">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  );
}
