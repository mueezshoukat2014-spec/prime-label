"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/anim";
import { waLink } from "@/lib/whatsapp";

/**
 * Live Label Designer.
 *
 * Everything happens in the browser: the visitor's logo is composited onto a
 * photographic blank-label template on a <canvas>, with a light weave overlay
 * + blend so it reads as "woven", not "pasted". The finished snapshot +
 * selections are attached to the quote request.
 */

type Style = {
  id: string;
  name: string;
  src: string;
  /** Label face area within the template image (fractions of width/height). */
  area: { x: number; y: number; w: number; h: number; rotate: number };
  /** Whether the label face is dark (invert pale logos hint). */
  dark: boolean;
  productTitle: string;
  /** Shape family — used to suggest the right template for a chosen size. */
  shape: "standard" | "slim" | "compact";
};

const STYLES: Style[] = [
  {
    id: "damask-black",
    name: "Damask — Black",
    src: "/designer/base-black.jpg",
    area: { x: 0.115, y: 0.17, w: 0.775, h: 0.62, rotate: -3.4 },
    dark: true,
    productTitle: "Woven Labels",
    shape: "standard",
  },
  {
    id: "damask-cream",
    name: "Damask — Cream",
    src: "/designer/base-cream.jpg",
    area: { x: 0.12, y: 0.18, w: 0.76, h: 0.6, rotate: -2.5 },
    dark: false,
    productTitle: "Woven Labels",
    shape: "standard",
  },
  {
    id: "damask-navy",
    name: "Damask — Navy",
    src: "/designer/base-navy.jpg",
    area: { x: 0.12, y: 0.18, w: 0.76, h: 0.6, rotate: -2.5 },
    dark: true,
    productTitle: "Woven Labels",
    shape: "standard",
  },
  {
    id: "satin-white",
    name: "Satin — White",
    src: "/designer/base-satin.jpg",
    area: { x: 0.13, y: 0.2, w: 0.74, h: 0.56, rotate: -1.5 },
    dark: false,
    productTitle: "Satin Labels",
    shape: "standard",
  },
  {
    id: "slim-black",
    name: "Slim Tape — Black",
    src: "/designer/base-black-slim.jpg",
    area: { x: 0.115, y: 0.345, w: 0.7, h: 0.235, rotate: 2.6 },
    dark: true,
    productTitle: "Woven Labels",
    shape: "slim",
  },
  {
    id: "slim-cream",
    name: "Slim Tape — Cream",
    src: "/designer/base-cream-slim.jpg",
    area: { x: 0.13, y: 0.325, w: 0.66, h: 0.26, rotate: 1.0 },
    dark: false,
    productTitle: "Woven Labels",
    shape: "slim",
  },
  {
    id: "compact-tan",
    name: "Compact — Tan Cotton",
    src: "/designer/base-tan-compact.jpg",
    area: { x: 0.225, y: 0.25, w: 0.51, h: 0.37, rotate: -6.3 },
    dark: false,
    productTitle: "Woven Labels",
    shape: "compact",
  },
];

const FOLDS = ["Straight Cut", "Center Fold", "End Fold", "Manhattan Fold"];

type SizeOption = { id: string; label: string; shape: Style["shape"] };
/** Real production sizes (height × width). Shape drives which template previews best. */
const SIZES: SizeOption[] = [
  { id: "1x5", label: "1 × 5 cm", shape: "slim" },
  { id: "1x6", label: "1 × 6 cm", shape: "slim" },
  { id: "1.5x4", label: "1.5 × 4 cm", shape: "compact" },
  { id: "1.5x7", label: "1.5 × 7 cm", shape: "slim" },
  { id: "2x5", label: "2 × 5 cm", shape: "standard" },
  { id: "2x6", label: "2 × 6 cm", shape: "standard" },
  { id: "2.5x6", label: "2.5 × 6 cm", shape: "standard" },
  { id: "3x7", label: "3 × 7 cm", shape: "standard" },
  { id: "custom", label: "Custom size", shape: "standard" },
];

const chip = (active: boolean) =>
  `rounded-full border px-4 py-2 text-[12px] transition-all duration-300 ${
    active
      ? "border-champagne bg-champagne/15 text-champagne shadow-glow-sm"
      : "border-line text-cream-muted hover:border-champagne/50 hover:text-cream"
  }`;

export default function LabelDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [logoName, setLogoName] = useState("");
  const [styleId, setStyleId] = useState(STYLES[0].id);
  const [fold, setFold] = useState("End Fold");
  const [size, setSize] = useState("2x5");
  const [scale, setScale] = useState(0.62); // logo width as fraction of label face
  const [brandText, setBrandText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const templates = useRef<Record<string, HTMLImageElement>>({});

  const style = useMemo(() => STYLES.find((s) => s.id === styleId)!, [styleId]);
  const sizeOption = useMemo(() => SIZES.find((s) => s.id === size)!, [size]);

  /** Picking a size switches the preview to a template of the matching shape
   *  (keeps the same colour family where possible). */
  function pickSize(opt: SizeOption) {
    setSize(opt.id);
    if (style.shape === opt.shape) return;
    const current = STYLES.find((s) => s.id === styleId)!;
    const candidates = STYLES.filter((s) => s.shape === opt.shape);
    if (!candidates.length) return;
    const sameTone = candidates.find((s) => s.dark === current.dark);
    setStyleId((sameTone || candidates[0]).id);
  }

  // preload template images once
  useEffect(() => {
    STYLES.forEach((s) => {
      if (templates.current[s.id]) return;
      const img = new Image();
      img.src = s.src;
      img.onload = () => {
        templates.current[s.id] = img;
        draw();
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const tpl = templates.current[styleId];
    if (!canvas || !tpl) return;
    const W = 1120;
    const H = Math.round((tpl.height / tpl.width) * W);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(tpl, 0, 0, W, H);

    if (!logo) {
      // hint text on the empty label
      const a = style.area;
      ctx.save();
      ctx.translate(W * (a.x + a.w / 2), H * (a.y + a.h / 2));
      ctx.rotate((a.rotate * Math.PI) / 180);
      ctx.fillStyle = style.dark ? "rgba(244,240,232,0.35)" : "rgba(8,8,10,0.3)";
      ctx.font = "500 34px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Your logo appears here", 0, 0);
      ctx.restore();
      return;
    }

    // composite the logo onto the label face
    const a = style.area;
    const faceW = W * a.w;
    const faceH = H * a.h;
    const cx = W * (a.x + a.w / 2);
    const cy = H * (a.y + a.h / 2) - (brandText ? faceH * 0.06 : 0);

    let lw = faceW * scale;
    let lh = (logo.height / logo.width) * lw;
    const maxH = faceH * (brandText ? 0.52 : 0.66);
    if (lh > maxH) {
      lh = maxH;
      lw = (logo.width / logo.height) * lh;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((a.rotate * Math.PI) / 180);

    // "woven" treatment: slight blur + overlay blend picks up fabric texture
    ctx.globalAlpha = 0.92;
    ctx.filter = "blur(0.4px) saturate(0.9)";
    ctx.drawImage(logo, -lw / 2, -lh / 2, lw, lh);
    ctx.filter = "none";
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.25;
    ctx.drawImage(tpl, 0, 0, tpl.width, tpl.height, -cx, -cy, W, H);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    // optional brand text under the logo
    if (brandText.trim()) {
      ctx.fillStyle = style.dark ? "rgba(244,240,232,0.88)" : "rgba(20,20,24,0.85)";
      ctx.font = `600 ${Math.max(22, faceH * 0.09)}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.letterSpacing = "6px";
      ctx.fillText(brandText.trim().toUpperCase().slice(0, 26), 0, lh / 2 + faceH * 0.16);
    }
    ctx.restore();
  }, [logo, styleId, style, scale, brandText]);

  useEffect(() => {
    draw();
  }, [draw]);

  function acceptFile(f: File | null | undefined) {
    if (!f) return;
    setError("");
    if (!/image\/(png|jpe?g|webp|svg)/i.test(f.type)) {
      setError("Please upload a PNG, JPG, WEBP or SVG logo.");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError("Logo must be under 8 MB.");
      return;
    }
    const img = new Image();
    img.onload = () => {
      setLogo(img);
      setLogoName(f.name);
    };
    img.onerror = () => setError("Could not read that image — try a PNG or JPG.");
    img.src = URL.createObjectURL(f);
  }

  const selections = useMemo(
    () =>
      `Designer: ${style.name} · Fold: ${fold} · Size: ${sizeOption.label}${
        brandText.trim() ? ` · Text: ${brandText.trim()}` : ""
      }`,
    [style, fold, sizeOption, brandText]
  );

  /** Attach the canvas snapshot + selections to a quote request. */
  async function requestQuote(form: { name: string; phone: string }) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    setError("");
    try {
      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("snapshot failed"))), "image/jpeg", 0.85)
      );
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phone", form.phone.trim().startsWith("+") ? form.phone.trim() : `+${form.phone.replace(/\D/g, "")}`);
      fd.append("product", style.productTitle);
      fd.append("details", `${selections} — designed in the Live Label Designer`);
      fd.append("artwork", blob, "label-design-preview.jpg");
      const res = await fetch("/api/leads", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not send — try WhatsApp instead.");
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not send — try WhatsApp instead.");
    } finally {
      setBusy(false);
    }
  }

  const waHref = waLink(
    `Hi Prime Labels! I designed a label on your website 👇\n\n▪ ${selections}\n▪ Quantity: ____\n▪ City/Country: ____\n\n(I'll attach my logo & the preview screenshot here)`
  );

  // mini quote form state
  const [qName, setQName] = useState("");
  const [qPhone, setQPhone] = useState("");
  const qReady =
    qName.trim().length >= 2 && qPhone.replace(/\D/g, "").length >= 8 && !!logo;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
      {/* ---------------- preview ---------------- */}
      <div>
        <div className="relative overflow-hidden rounded-3xl border border-line shadow-soft">
          <canvas ref={canvasRef} className="block w-full" aria-label="Live label preview" />
          {!logo && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-ink/30 transition-colors hover:bg-ink/20"
              aria-label="Upload your logo"
            >
              <span className="rounded-full border border-champagne/50 bg-ink/80 px-6 py-3 text-[13px] font-medium text-champagne backdrop-blur">
                ↑ Upload your logo to start
              </span>
            </button>
          )}
        </div>
        <p className="mt-3 text-center text-[11.5px] leading-relaxed text-cream-dim">
          Preview for visualization — your free digital proof shows the exact production result.
          Gradient logos are simulated with stitch density in real weaving.
        </p>

        {/* logo controls */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => acceptFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-line px-5 py-2.5 text-[12.5px] text-cream-muted transition-all hover:border-champagne/50 hover:text-champagne"
          >
            {logo ? `Change logo (${logoName.slice(0, 18)}${logoName.length > 18 ? "…" : ""})` : "Upload logo"}
          </button>
          {logo && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-wide2 text-cream-dim">Logo size</span>
              <input
                type="range"
                min={0.3}
                max={0.85}
                step={0.01}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-32 accent-[#C9A86A]"
                aria-label="Logo size"
              />
            </div>
          )}
        </div>
      </div>

      {/* ---------------- controls ---------------- */}
      <div className="min-w-0">
        <div className="space-y-6">
          <div>
            <p className="mb-2.5 text-[11px] uppercase tracking-wide2 text-cream-dim">Label style</p>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStyleId(s.id);
                    // keep the size chip consistent with the chosen shape
                    if (sizeOption.shape !== s.shape && sizeOption.id !== "custom") {
                      const match = SIZES.find((z) => z.shape === s.shape);
                      if (match) setSize(match.id);
                    }
                  }}
                  className={`overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                    styleId === s.id ? "border-champagne shadow-glow-sm" : "border-line hover:border-champagne/40"
                  }`}
                >
                  <img src={s.src} alt={s.name} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                  <span className={`block px-3 py-2 text-[11.5px] ${styleId === s.id ? "text-champagne" : "text-cream-muted"}`}>
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2.5 text-[11px] uppercase tracking-wide2 text-cream-dim">Fold type</p>
            <div className="flex flex-wrap gap-2">
              {FOLDS.map((f) => (
                <button key={f} type="button" onClick={() => setFold(f)} className={chip(fold === f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2.5 text-[11px] uppercase tracking-wide2 text-cream-dim">
              Label size <span className="normal-case tracking-normal">(height × width)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button key={s.id} type="button" onClick={() => pickSize(s)} className={chip(size === s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-cream-dim">
              Preview switches to the closest label shape — any exact dimension is produced to spec.
            </p>
          </div>

          <div>
            <p className="mb-2.5 text-[11px] uppercase tracking-wide2 text-cream-dim">
              Brand text under logo (optional)
            </p>
            <input
              value={brandText}
              onChange={(e) => setBrandText(e.target.value)}
              placeholder="e.g. EST. 2026 or yourbrand.com"
              maxLength={26}
              className="w-full rounded-xl border border-line bg-surface/40 px-3.5 py-3 text-[13.5px] text-cream outline-none transition-colors focus:border-champagne/50"
            />
          </div>

          {/* ---------------- get it made ---------------- */}
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="rounded-3xl border border-champagne/30 bg-surface/40 p-6 text-center"
              >
                <p className="display text-2xl text-cream">Design received ✦</p>
                <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">
                  Your preview and selections are with our team — tailored quote lands on WhatsApp within 12–24 hours.
                </p>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-champagne/40 bg-champagne/10 px-5 py-2.5 text-[12.5px] font-medium text-champagne transition-colors hover:bg-champagne/20"
                >
                  Faster? Message us now →
                </a>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl border border-champagne/25 bg-surface/40 p-6"
              >
                <p className="display text-xl text-cream">Get this made</p>
                <p className="mt-1 text-[12px] text-cream-dim">
                  Your design + selections go straight to our team.
                </p>
                <div className="mt-4 space-y-3">
                  <input
                    value={qName}
                    onChange={(e) => setQName(e.target.value)}
                    placeholder="Your name *"
                    disabled={busy}
                    className="w-full rounded-xl border border-line bg-surface/40 px-3.5 py-3 text-[13.5px] text-cream outline-none transition-colors focus:border-champagne/50"
                  />
                  <input
                    value={qPhone}
                    onChange={(e) => setQPhone(e.target.value)}
                    inputMode="tel"
                    placeholder="WhatsApp with country code * e.g. +966…"
                    disabled={busy}
                    className="w-full rounded-xl border border-line bg-surface/40 px-3.5 py-3 text-[13.5px] text-cream outline-none transition-colors focus:border-champagne/50"
                  />
                </div>
                {!logo && (
                  <p className="mt-3 text-[12px] text-champagne/90">↑ Upload your logo first to enable sending.</p>
                )}
                {error && <p className="mt-3 text-[12.5px] text-red-300">{error}</p>}
                <button
                  type="button"
                  disabled={!qReady || busy}
                  onClick={() => requestQuote({ name: qName, phone: qPhone })}
                  className="btn-primary mt-4 w-full justify-center !py-3.5 text-[13px] shadow-glow-sm disabled:opacity-50"
                >
                  {busy ? "Sending design…" : "Get Tailored Quote in 24 Hours"}
                </button>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-[12.5px] font-medium text-cream-muted transition-all hover:border-champagne/60 hover:text-champagne"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                  </svg>
                  Or send via WhatsApp
                </a>
                <p className="mt-3 text-center text-[11px] text-cream-dim">
                  Free digital proof in 24h · MOQ from 100 units ·{" "}
                  <Link href="/samples" className="underline underline-offset-2 hover:text-champagne">
                    sample options
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
