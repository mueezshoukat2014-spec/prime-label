"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/Toast";
import AppliedBadge from "@/components/admin/AppliedBadge";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50";
const label = "mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream-dim";

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The stored `whatsapp` setting may be a full wa.me URL (with a ?text= payload)
 * or a bare number. Show the operator just the number.
 */
function phoneFromStored(v: string): string {
  const s = (v || "").trim();
  if (!s) return "";
  const m = s.match(/wa\.me\/(\d{6,})/i);
  if (m) return m[1];
  if (/^https?:/i.test(s)) return ""; // unrecognised URL — let them retype it
  return s;
}

/** Normalise typed input to digits, keeping a leading "+". */
function digitsOnly(v: string) {
  const d = v.replace(/\D/g, "");
  return v.trim().startsWith("+") ? `+${d}` : d;
}

/**
 * Rebuild the canonical wa.me link so every WhatsApp button keeps its
 * pre-filled message. Saving a bare number must not strip that.
 */
function toWaLink(number: string): string {
  const digits = number.replace(/\D/g, "");
  const text = encodeURIComponent("Hi, I want to inquire about an order");
  return `https://wa.me/${digits}?text=${text}`;
}

type Field = {
  key: string;
  label: string;
  hint?: string;
  type?: string;
  placeholder?: string;
  wide?: boolean;
  /** Render a multi-line textarea instead of a single-line input. */
  multiline?: boolean;
};

const FIELDS: Field[] = [
  {
    key: "whatsapp",
    label: "Main WhatsApp number",
    hint: "Used by every WhatsApp button on the site. Digits and an optional + — no spaces needed.",
    placeholder: "923244999224",
  },
  {
    key: "email",
    label: "Contact email",
    type: "email",
    hint: "Shown publicly on the contact page.",
    placeholder: "primelabelsintl@gmail.com",
  },
  {
    key: "notificationEmail",
    label: "Quote alert email",
    type: "email",
    hint: "Where new quote-request alerts are sent. Not shown publicly.",
    placeholder: "you@example.com",
  },
  {
    key: "announcementText",
    label: "Announcement bar text",
    wide: true,
    hint: "Shown in a gold bar at the very top of every page. Leave empty to hide.",
    placeholder: "Free worldwide shipping on orders over 5000 pcs",
  },
  {
    key: "aboutText",
    label: "About / Studio paragraph (homepage)",
    wide: true,
    multiline: true,
    hint: "The paragraph in the homepage 'The Studio' section. Leave empty to use the standard text.",
    placeholder: "Prime Labels International is a custom branding studio for clothing and lifestyle brands...",
  },
  {
    key: "aboutStats",
    label: "Homepage stats (About section)",
    wide: true,
    multiline: true,
    hint:
      "One stat per line, format: number|label — e.g. 160+|Designs made. Use + or % after the number if needed. " +
      "2 to 4 lines. Leave empty for the standard stats (8 Product lines, 160+ Designs made, 30+ Countries shipped, 99% Reorder rate).",
    placeholder: "8|Product lines\n160+|Designs made\n30+|Countries shipped\n99%|Reorder rate",
  },
  {
    key: "aboutHeroTitle",
    label: "About page — main heading",
    wide: true,
    hint: "The big heading on /about. Leave empty for: 'The studio behind the label.'",
    placeholder: "The studio behind the label.",
  },
  {
    key: "aboutHeroSub",
    label: "About page — intro paragraph",
    wide: true,
    multiline: true,
    hint: "The paragraph under the heading on /about. Leave empty for the standard intro.",
    placeholder: "Prime Labels International is a custom garment branding studio...",
  },
  {
    key: "aboutStory",
    label: "About page — story section",
    wide: true,
    multiline: true,
    hint: "The main story text on /about. Separate paragraphs with a blank line. Leave empty for the standard story.",
    placeholder: "We started with a simple observation...",
  },
  {
    key: "aboutImg1",
    label: "About photo 1 (weaving) — image URL",
    hint: "Upload a photo in Gallery tab, copy its URL and paste here. Empty = default photo.",
    placeholder: "/about/craft-weaving.jpg",
  },
  {
    key: "aboutImg2",
    label: "About photo 2 (inspection) — image URL",
    hint: "Empty = default photo.",
    placeholder: "/about/craft-inspection.jpg",
  },
  {
    key: "aboutImg3",
    label: "About photo 3 (packing) — image URL",
    hint: "Empty = default photo.",
    placeholder: "/about/craft-packing.jpg",
  },
  {
    key: "processSteps",
    label: "Homepage — Process steps (How it works)",
    wide: true,
    multiline: true,
    hint:
      "Each step = first line is the TITLE, following lines are the description. Separate steps with a BLANK line. 2–6 steps. " +
      "Leave empty for the standard 4 steps (Share your vision / Approve the craft / Precision production / Shipped worldwide).",
    placeholder: "Share your vision\nTell us about your brand and what you need.\n\nApprove the craft\nWe prepare your artwork and you approve before production.",
  },
  {
    key: "ctaHeading",
    label: "Homepage — Final CTA heading",
    wide: true,
    hint: "The big closing heading. The LAST word automatically becomes the gold italic line. Empty = 'Make your brand unforgettable.'",
    placeholder: "Make your brand unforgettable.",
  },
  {
    key: "ctaSub",
    label: "Homepage — Final CTA subtext",
    wide: true,
    multiline: true,
    hint: "The paragraph under the closing heading. Empty = standard text.",
    placeholder: "Tell us what you need and we will put together a tailored quote...",
  },
  {
    key: "quoteProducts",
    label: "Quote form product list",
    wide: true,
    multiline: true,
    hint:
      "One product per line — this is the list customers pick from on the quote form. " +
      "\"Other\" is always added automatically at the end. Leave empty to use the standard list " +
      "(Woven Labels, Satin Labels, Tag Cards, Hang Tags, Brand Packaging, Custom Stickers, Zipper Bags, Woven Patches, Steel Logo Tags).",
    placeholder: "Woven Labels\nSatin Labels\nHang Tags\nCustom Stickers",
  },
];

export default function SiteSettings() {
  const toast = useToast();
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/site", { cache: "no-store" });
      const j = await r.json();
      if (j?.ok) {
        const c: Record<string, string> = j.content || {};
        setContent(c);
        const seeded: Record<string, string> = {};
        FIELDS.forEach((f) => (seeded[f.key] = c[f.key] ?? ""));
        // Present the WhatsApp setting as a plain number.
        seeded.whatsapp = phoneFromStored(c.whatsapp ?? "");
        setForm(seeded);
        setEnabled(String(c.announcementEnabled) === "true");
      } else {
        toast.error(j?.error || "Could not load settings.");
      }
    } catch {
      toast.error("Could not load settings.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => {
    if (!content) return [];
    const keys = FIELDS.map((f) => f.key).filter((k) => {
      const current = k === "whatsapp" ? phoneFromStored(content[k] ?? "") : (content[k] ?? "");
      return (form[k] ?? "") !== current;
    });
    if (String(content.announcementEnabled) === "true" !== enabled) {
      keys.push("announcementEnabled");
    }
    return keys;
  }, [form, content, enabled]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !content || dirty.length === 0) {
      if (dirty.length === 0) toast.toast("Nothing to save — no fields were changed.", "info");
      return;
    }

    // Validate before sending: a bad value here breaks a live feature.
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    for (const k of ["email", "notificationEmail"]) {
      if (dirty.includes(k)) {
        const v = (form[k] ?? "").trim();
        if (!v || !emailRe.test(v)) {
          toast.error(`That ${k === "email" ? "contact" : "alert"} email doesn't look right.`);
          return;
        }
      }
    }
    if (dirty.includes("whatsapp")) {
      const d = (form.whatsapp ?? "").replace(/\D/g, "");
      if (d.length < 7 || d.length > 15) {
        toast.error("That WhatsApp number doesn't look right. Use 7–15 digits.");
        return;
      }
    }
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      dirty.forEach((k) => {
        if (k === "announcementEnabled") body[k] = String(enabled);
        else if (k === "whatsapp") body[k] = toWaLink(digitsOnly(form[k] ?? ""));
        else body[k] = form[k] ?? "";
      });

      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Could not save settings.");

      toast.success(
        `${dirty.length} setting${dirty.length === 1 ? "" : "s"} updated and live on the website.`
      );
      setApplied(true);
      window.setTimeout(() => setApplied(false), 2600);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="display text-3xl">Site Settings</h1>
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/30 p-8 text-[13px] text-cream-muted">
          <Spinner /> Loading settings…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Site Settings</h1>
          <p className="mt-1 text-[13px] text-cream-muted">
            Global contact details and promo bar. Changes go live immediately.
          </p>
        </div>
        <AppliedBadge show={applied} />
      </div>

      {dirty.length > 0 && (
        <p className="rounded-xl border border-champagne/30 bg-champagne/[0.06] px-4 py-2.5 text-[12.5px] text-champagne">
          {dirty.length} unsaved change{dirty.length === 1 ? "" : "s"}
        </p>
      )}

      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const isDirty = dirty.includes(f.key);
          return (
            <label key={f.key} className={`block ${f.wide ? "sm:col-span-2" : ""}`}>
              <span className={label}>
                {f.label}
                {isDirty && <span className="ml-2 text-champagne">• edited</span>}
              </span>
              {f.multiline ? (
                <textarea
                  rows={7}
                  disabled={saving}
                  placeholder={f.placeholder}
                  className={`${input} min-h-[150px] resize-y font-mono text-[12.5px] leading-relaxed ${isDirty ? "border-champagne/50" : ""}`}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              ) : (
                <input
                  type={f.type || "text"}
                  disabled={saving}
                  placeholder={f.placeholder}
                  className={`${input} ${isDirty ? "border-champagne/50" : ""}`}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
              {f.hint && (
                <span className="mt-1.5 block text-[11.5px] leading-snug text-cream-dim">
                  {f.hint}
                </span>
              )}

              {f.key === "announcementText" && (
                <label className="mt-3 flex w-fit items-center gap-2.5 text-[12.5px] text-cream-muted">
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={saving}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="h-4 w-4 accent-[#C9A86A]"
                  />
                  Show the announcement bar
                  {String(content?.announcementEnabled) === "true" !== enabled && (
                    <span className="text-champagne">• edited</span>
                  )}
                </label>
              )}
            </label>
          );
        })}

        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving || dirty.length === 0}
            className="btn-primary mt-2 !py-2.5 !px-5 text-[12px] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Spinner /> Saving…
              </>
            ) : (
              "Save settings"
            )}
          </button>
          {dirty.length > 0 && !saving && (
            <button
              type="button"
              onClick={() => {
                if (!content) return;
                setForm({
                  ...Object.fromEntries(FIELDS.map((f) => [f.key, content[f.key] ?? ""])),
                  whatsapp: phoneFromStored(content.whatsapp ?? ""),
                });
                setEnabled(String(content.announcementEnabled) === "true");
              }}
              className="mt-2 text-[12px] text-cream-dim underline underline-offset-4 hover:text-cream"
            >
              Discard changes
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
