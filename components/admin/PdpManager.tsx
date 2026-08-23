"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import AppliedBadge from "@/components/admin/AppliedBadge";

type PdpItem = {
  slug: string;
  title: string;
  customised: boolean;
  h1: string;
  intro: string;
  folds: string;
  finishes: string;
  specs: string;
  faqs: string;
};

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50";
const area = `${input} min-h-[110px] resize-y font-mono text-[12.5px] leading-relaxed`;
const label = "mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream-dim";

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function PdpManager() {
  const toast = useToast();
  const [items, setItems] = useState<PdpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState<PdpItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [applied, setApplied] = useState(false);

  const flash = useCallback(() => {
    setApplied(true);
    window.setTimeout(() => setApplied(false), 2600);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/pdp", { cache: "no-store" });
      const j = await r.json();
      if (j?.ok) setItems(j.items || []);
      else toast.error(j?.error || "Could not load product pages.");
    } catch {
      toast.error("Could not load product pages.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openEditor(item: PdpItem) {
    setOpen(item.slug);
    setForm({ ...item });
  }

  async function save() {
    if (!form || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pdp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not save.");
      toast.success(`${form.title} page updated and live.`);
      flash();
      await load();
      setOpen(null);
      setForm(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefault() {
    if (!form || resetting) return;
    setResetting(true);
    try {
      const res = await fetch("/api/admin/pdp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: form.slug }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not reset.");
      toast.success(`${form.title} page reset to the standard copy.`);
      flash();
      await load();
      setOpen(null);
      setForm(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not reset.");
    } finally {
      setResetting(false);
    }
  }

  const set = (k: keyof PdpItem, v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Product Pages</h1>
          <p className="mt-1 text-[13px] text-cream-muted">
            Edit the content of each product detail page — heading, intro, options, specs and FAQs.
            Changes go live immediately.
          </p>
        </div>
        <AppliedBadge show={applied} />
      </div>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/30 p-8 text-[13px] text-cream-muted">
          <Spinner /> Loading product pages…
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <button
              key={it.slug}
              type="button"
              onClick={() => openEditor(it)}
              className="rounded-2xl border border-line bg-surface/30 p-4 text-left transition-all hover:border-champagne/40"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-medium text-cream">{it.title}</p>
                {it.customised && (
                  <span className="rounded bg-champagne/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-champagne">
                    Edited
                  </span>
                )}
              </div>
              <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-cream-dim">{it.h1}</p>
              <p className="mt-2 text-[11px] text-champagne/80">/products/{it.slug} →</p>
            </button>
          ))}
        </div>
      )}

      {/* -------- editor modal -------- */}
      {open && form && (
        <div
          className="fixed inset-0 z-[2500] flex items-start justify-center overflow-y-auto bg-ink/85 p-4 backdrop-blur-sm sm:py-10"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-champagne/25 bg-surface-2 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="display text-2xl text-cream">{form.title} — page content</h3>
                <a
                  href={`/products/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-[12px] text-champagne underline underline-offset-4"
                >
                  View live page ↗
                </a>
              </div>
              <button
                type="button"
                onClick={() => { setOpen(null); setForm(null); }}
                disabled={saving || resetting}
                aria-label="Close"
                className="rounded-full border border-line p-2 text-cream-dim transition-colors hover:border-champagne/40 hover:text-cream"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className={label}>Page heading (H1)</span>
                <input className={input} value={form.h1} onChange={(e) => set("h1", e.target.value)} disabled={saving} />
              </label>

              <label className="block">
                <span className={label}>Intro paragraph</span>
                <textarea className={area} rows={3} value={form.intro} onChange={(e) => set("intro", e.target.value)} disabled={saving} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={label}>Fold / style options — one per line</span>
                  <textarea className={area} value={form.folds} onChange={(e) => set("folds", e.target.value)} disabled={saving} placeholder={"Straight Cut\nCenter Fold"} />
                  <span className="mt-1 block text-[11px] text-cream-dim">Leave empty to hide the fold selector.</span>
                </label>
                <label className="block">
                  <span className={label}>Material &amp; finish options — one per line</span>
                  <textarea className={area} value={form.finishes} onChange={(e) => set("finishes", e.target.value)} disabled={saving} placeholder={"High-Density Damask\nSoft Satin Weave"} />
                  <span className="mt-1 block text-[11px] text-cream-dim">Leave empty to hide the finish selector.</span>
                </label>
              </div>

              <label className="block">
                <span className={label}>Technical specifications — one per line, format: Label | Value</span>
                <textarea className={`${area} min-h-[150px]`} value={form.specs} onChange={(e) => set("specs", e.target.value)} disabled={saving} placeholder={"Weave | High-density damask\nWash durability | 50+ washes"} />
              </label>

              <label className="block">
                <span className={label}>FAQs — blocks of Q: / A: separated by a blank line</span>
                <textarea className={`${area} min-h-[190px]`} value={form.faqs} onChange={(e) => set("faqs", e.target.value)} disabled={saving} placeholder={"Q: What is the minimum order?\nA: MOQ starts at 100 units.\n\nQ: Do I get a proof?\nA: Yes, within 24 hours."} />
                <span className="mt-1 block text-[11px] text-cream-dim">
                  These also power the FAQ rich results Google shows for this page.
                </span>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetToDefault}
                disabled={saving || resetting || !form.customised}
                title={form.customised ? "Remove your edits and restore the standard copy" : "This page is already using the standard copy"}
                className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-[12.5px] text-cream-muted transition-colors hover:border-red-500/40 hover:text-red-300 disabled:opacity-40"
              >
                {resetting && <Spinner size={13} />}
                Reset to standard copy
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setOpen(null); setForm(null); }}
                  disabled={saving || resetting}
                  className="rounded-lg border border-line px-4 py-2 text-[12.5px] text-cream-muted hover:border-champagne/40 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || resetting}
                  className="btn-primary !py-2.5 !px-5 text-[12px] disabled:opacity-50"
                >
                  {saving ? (<><Spinner /> Saving…</>) : "Save & publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
