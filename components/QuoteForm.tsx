"use client";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/anim";
import { normalizeWaLink, waProductLink, waQuoteSubmittedLink } from "@/lib/whatsapp";
import { celebrate } from "@/lib/confetti";
import { trackLead } from "@/lib/fbq";
import { useToast } from "@/components/Toast";
import {
  ALLOWED_EXTENSIONS,
  DIRECT_UPLOAD_THRESHOLD,
  FILE_ACCEPT,
  MAX_FILE_LABEL,
  buildBlobPath,
  formatBytes,
  validateArtwork,
} from "@/lib/upload-rules";
import {
  PRODUCT_CATEGORIES,
  QUANTITY_OPTIONS,
  isQuoteReady,
  resolveCategory,
  validateCategory,
  validateEmail,
  validateName,
  validatePhone,
  validateQuote,
} from "@/lib/quote-validation";

/* ------------------------------- styling ------------------------------- */

const inputCls =
  "w-full rounded-xl border bg-surface/40 px-4 py-3.5 text-[14px] text-cream placeholder:text-cream-dim/60 outline-none transition-colors duration-300 focus:bg-surface/70";

const okBorder = "border-line focus:border-champagne/50";
const errBorder = "border-red-500/60 focus:border-red-500/80";

/** Label with an explicit required (*) or Optional marker. */
function Field({
  label,
  required,
  error,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-baseline gap-2 text-[11px] uppercase tracking-wide2 text-cream-dim"
      >
        <span>{label}</span>
        {required ? (
          <span className="text-champagne" aria-hidden>
            *
          </span>
        ) : (
          <span className="normal-case tracking-normal text-cream-dim/70">(Optional)</span>
        )}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-[12px] leading-snug text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11.5px] leading-snug text-cream-dim">{hint}</p>
      ) : null}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const TRUST = [
  {
    label: "No obligation quote",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "We reply within 1 business day",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Your details are never shared",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const COUNTRY_OPTIONS = [
  { name: "Saudi Arabia", code: "+966" },
  { name: "United Arab Emirates", code: "+971" },
  { name: "Qatar", code: "+974" },
  { name: "Kuwait", code: "+965" },
  { name: "Bahrain", code: "+973" },
  { name: "Oman", code: "+968" },
  { name: "Pakistan", code: "+92" },
  { name: "United Kingdom", code: "+44" },
  { name: "United States", code: "+1" },
  { name: "Canada", code: "+1" },
  { name: "Australia", code: "+61" },
  { name: "Germany", code: "+49" },
  { name: "France", code: "+33" },
  { name: "Italy", code: "+39" },
  { name: "Turkey", code: "+90" },
  { name: "Other", code: "" },
] as const;

const getCountryCode = (country: string) =>
  COUNTRY_OPTIONS.find((c) => c.name === country)?.code || "";

const isOnlyCountryCode = (phone: string, code: string) => {
  const cleaned = phone.trim().replace(/[\s().-]/g, "");
  return !cleaned || (code ? cleaned === code : false);
};

type FormState = {
  name: string;
  phone: string;
  product: string;
  email: string;
  quantity: string;
  details: string;
  company: string;
  country: string;
};

type TouchKey = "name" | "phone" | "product" | "email";

export default function QuoteForm({
  defaultProduct = "",
  whatsapp,
}: {
  defaultProduct?: string;
  whatsapp?: string;
}) {
  const fallbackWa = defaultProduct
    ? waProductLink(defaultProduct)
    : normalizeWaLink(whatsapp);

  // Map an incoming ?product= title onto a real dropdown category.
  const seededProduct = resolveCategory(defaultProduct);

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    product: seededProduct,
    email: "",
    quantity: "",
    details: "",
    company: "",
    country: "",
  });
  const [touched, setTouched] = useState<Record<TouchKey, boolean>>({
    name: false,
    phone: false,
    product: false,
    email: false,
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [waHref, setWaHref] = useState(fallbackWa);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const selectedCountryCode = getCountryCode(form.country);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function handleCountryChange(country: string) {
    const nextCode = getCountryCode(country);
    setForm((f) => {
      const previousCode = getCountryCode(f.country);
      const phone = f.phone.trim();
      const localDigits = phone.replace(/\D/g, "").replace(/^0+/, "");
      const shouldAutoFill =
        nextCode &&
        (!phone || isOnlyCountryCode(phone, previousCode) || !phone.startsWith("+"));
      return {
        ...f,
        country,
        phone: shouldAutoFill
          ? phone && !phone.startsWith("+") && localDigits
            ? `${nextCode} ${localDigits}`
            : `${nextCode} `
          : f.phone,
      };
    });
  }

  const markTouched = (k: TouchKey) => setTouched((t) => ({ ...t, [k]: true }));

  // Live per-field errors, shown only after the field has been touched.
  const liveErrors = useMemo(
    () => ({
      name: touched.name ? validateName(form.name) : "",
      phone: touched.phone ? validatePhone(form.phone) : "",
      product: touched.product ? validateCategory(form.product) : "",
      email: touched.email ? validateEmail(form.email) : "",
    }),
    [form.name, form.phone, form.product, form.email, touched]
  );

  // Button enables as soon as name + phone + category are valid.
  // An invalid optional email still blocks, but blank never does.
  const ready = useMemo(
    () => isQuoteReady(form) && !validateEmail(form.email),
    [form]
  );

  function acceptFile(chosen: File | null | undefined) {
    if (!chosen) return;
    const check = validateArtwork({ name: chosen.name, size: chosen.size });
    if (!check.ok) {
      toast.error(check.error);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(chosen);
    toast.success(`${chosen.name} attached (${formatBytes(chosen.size)})`);
  }

  function clearFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    // Reveal every error at once if they submit early.
    setTouched({ name: true, phone: true, product: true, email: true });

    const errors = validateQuote(form);
    if (Object.keys(errors).length > 0) {
      const first = errors.name || errors.phone || errors.product || errors.email!;
      setStatus("error");
      setErr(first);
      toast.error(first);
      return;
    }

    setStatus("loading");
    setErr("");

    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phone", form.phone.trim());
      fd.append("product", form.product);
      fd.append("email", form.email.trim());
      fd.append("quantity", form.quantity);
      fd.append("details", form.details.trim());
      fd.append("company", form.company.trim());
      fd.append("country", form.country.trim());

      // Files over the serverless body limit go straight to Blob storage.
      if (file && file.size > DIRECT_UPLOAD_THRESHOLD) {
        setUploading(true);
        try {
          const { upload } = await import("@vercel/blob/client");
          const blob = await upload(buildBlobPath(file.name), file, {
            access: "public",
            handleUploadUrl: "/api/artwork/upload",
            contentType: file.type || undefined,
          });
          fd.append("artworkUrl", blob.url);
          fd.append("artworkName", file.name);
        } catch {
          setUploading(false);
          throw new Error(
            "We could not upload your artwork. Please try a smaller file, or submit without it and send the file on WhatsApp."
          );
        }
        setUploading(false);
      } else if (file) {
        fd.append("artwork", file, file.name);
      }

      const res = await fetch("/api/leads", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}) as Record<string, unknown>);

      if (!res.ok || !data?.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Something went wrong. Please try again or message us on WhatsApp."
        );
      }

      // Meta Pixel conversion. Reached only after the API confirmed the lead
      // was written to Neon — validation failures and API errors both exit
      // above, so this can never fire on a failed submission.
      trackLead(form.product);

      const uploaded = (data.artworkUrl as string | null) ?? null;
      setArtworkUrl(uploaded);

      // Pass every field the visitor filled in, so the WhatsApp message is a
      // complete summary and nothing has to be asked for a second time.
      const link = waQuoteSubmittedLink({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        country: form.country.trim(),
        product: form.product,
        quantity: form.quantity,
        details: form.details.trim(),
        artworkUrl: uploaded,
      });
      setWaHref(link);

      setStatus("success");
      toast.success("Quote request sent. Opening WhatsApp…");
      void celebrate();

      setTimeout(() => {
        const win = window.open(link, "_blank", "noopener,noreferrer");
        if (!win) {
          toast.toast("Tap “Continue on WhatsApp” to send us your details.", "info");
        }
      }, 900);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again or message us on WhatsApp.";
      setStatus("error");
      setErr(msg);
      toast.error(msg);
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex flex-col items-center justify-center rounded-4xl border border-champagne/30 bg-surface/40 px-8 py-20 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-champagne-bright to-champagne-deep text-ink"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <h3 className="display mt-7 text-3xl text-cream">Request received</h3>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-cream-muted">
              Thank you. We have your details and will reply with a tailored quote
              very soon. WhatsApp should open automatically — if it does not, use
              the button below.
            </p>

            {artworkUrl && (
              <a
                href={artworkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-[12.5px] text-cream-muted underline decoration-champagne/40 underline-offset-4 transition-colors hover:text-champagne"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                View uploaded artwork
              </a>
            )}

            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-8">
              Continue on WhatsApp
            </a>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <p className="sm:col-span-2 -mb-1 text-[12px] text-cream-dim">
              Share your details to get your quote —{" "}
              <span className="text-champagne">*</span> marks what we need.
            </p>

            {/* ---------------- required ---------------- */}
            <Field label="Full name" required error={liveErrors.name} htmlFor="q-name">
              <input
                id="q-name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                onBlur={() => markTouched("name")}
                aria-invalid={!!liveErrors.name}
                className={`${inputCls} ${liveErrors.name ? errBorder : okBorder}`}
                placeholder="Your name"
              />
            </Field>

            <Field
              label="Country"
              hint="Selecting a country auto-fills the WhatsApp country code."
              htmlFor="q-country"
            >
              <select
                id="q-country"
                name="country"
                autoComplete="country-name"
                value={form.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className={`${inputCls} ${okBorder}`}
              >
                <option value="" className="bg-ink">
                  Select country
                </option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.name} value={c.name} className="bg-ink">
                    {c.code ? `${c.name} (${c.code})` : c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="WhatsApp number"
              required
              error={liveErrors.phone}
              hint={
                selectedCountryCode
                  ? `Country code ${selectedCountryCode} added. Complete your WhatsApp number.`
                  : "Enter your full WhatsApp number with country code, e.g. +966 5XXXXXXXX."
              }
              htmlFor="q-phone"
            >
              <input
                id="q-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                onBlur={() => markTouched("phone")}
                aria-invalid={!!liveErrors.phone}
                className={`${inputCls} ${liveErrors.phone ? errBorder : okBorder}`}
                placeholder={selectedCountryCode ? `${selectedCountryCode} 5XXXXXXXX` : "+966 5XXXXXXXX"}
              />
            </Field>

            <Field
              label="Product category"
              required
              error={liveErrors.product}
              htmlFor="q-product"
            >
              <select
                id="q-product"
                name="product"
                value={form.product}
                onChange={(e) => {
                  set("product", e.target.value);
                  markTouched("product");
                }}
                onBlur={() => markTouched("product")}
                aria-invalid={!!liveErrors.product}
                className={`${inputCls} ${liveErrors.product ? errBorder : okBorder}`}
              >
                <option value="" className="bg-ink">
                  Select a category
                </option>
                {PRODUCT_CATEGORIES.map((p) => (
                  <option key={p} value={p} className="bg-ink">
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            {/* ---------------- optional ---------------- */}
            <Field label="Quantity" htmlFor="q-quantity">
              <select
                id="q-quantity"
                name="quantity"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className={`${inputCls} ${okBorder}`}
              >
                <option value="" className="bg-ink">
                  Select a quantity
                </option>
                {QUANTITY_OPTIONS.map((q) => (
                  <option key={q} value={q} className="bg-ink">
                    {q}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Email" error={liveErrors.email} htmlFor="q-email">
              <input
                id="q-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={() => markTouched("email")}
                aria-invalid={!!liveErrors.email}
                className={`${inputCls} ${liveErrors.email ? errBorder : okBorder}`}
                placeholder="you@brand.com"
              />
            </Field>

            <Field label="Company / brand" htmlFor="q-company">
              <input
                id="q-company"
                name="company"
                autoComplete="organization"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                className={`${inputCls} ${okBorder}`}
                placeholder="Your brand"
              />
            </Field>


            <div className="sm:col-span-2">
              <Field label="Message / notes" htmlFor="q-details">
                <textarea
                  id="q-details"
                  name="details"
                  rows={3}
                  value={form.details}
                  onChange={(e) => set("details", e.target.value)}
                  className={`${inputCls} ${okBorder} resize-none`}
                  placeholder="Dimensions, fold type, colours, finish, timing — anything that helps us quote accurately."
                />
              </Field>
            </div>

            {/* ---------------- artwork ---------------- */}
            <div className="sm:col-span-2">
              <span className="mb-2 flex items-baseline gap-2 text-[11px] uppercase tracking-wide2 text-cream-dim">
                <span>Artwork / design file</span>
                <span className="normal-case tracking-normal text-cream-dim/70">(Optional)</span>
              </span>

              <input
                ref={fileInputRef}
                type="file"
                name="artwork"
                accept={FILE_ACCEPT}
                className="sr-only"
                onChange={(ev) => acceptFile(ev.target.files?.[0])}
              />

              {file ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-champagne/40 bg-surface/50 px-4 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-champagne/30 text-champagne">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path
                        d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] text-cream">{file.name}</span>
                    <span className="block text-[11.5px] text-cream-dim">
                      {formatBytes(file.size)} · ready to upload
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={clearFile}
                    disabled={status === "loading"}
                    className="rounded-full border border-line px-3 py-1.5 text-[12px] text-cream-muted transition-colors hover:border-red-400/50 hover:text-red-300 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragging(false);
                    acceptFile(ev.dataTransfer.files?.[0]);
                  }}
                  className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition-colors duration-300 ${
                    dragging
                      ? "border-champagne/70 bg-champagne/[0.06]"
                      : "border-line bg-surface/30 hover:border-champagne/45"
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/30 text-champagne">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 16V4m0 0L7 9m5-5l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 17v1a3 3 0 003 3h10a3 3 0 003-3v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="text-[13.5px] text-cream">
                    Drop your file here or <span className="text-champagne">browse</span>
                  </span>
                  <span className="text-[11.5px] text-cream-dim">
                    {ALLOWED_EXTENSIONS.map((x) => x.toUpperCase()).join(", ")} · max {MAX_FILE_LABEL}
                  </span>
                </button>
              )}
            </div>

            {err && (
              <p className="sm:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
                {err}
              </p>
            )}

            <div className="sm:col-span-2 mt-2 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {TRUST.map((t) => (
                <div key={t.label} className="flex items-center gap-3 bg-ink p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-champagne/30 text-champagne">
                    {t.icon}
                  </span>
                  <span className="text-[12.5px] leading-snug text-cream-muted">{t.label}</span>
                </div>
              ))}
            </div>

            <div className="sm:col-span-2 mt-2 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={status === "loading" || !ready}
                data-cursor="Send"
                title={ready ? undefined : "Add your name, WhatsApp number and product category"}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? (
                  <>
                    <Spinner />
                    {uploading ? "Uploading artwork…" : "Sending…"}
                  </>
                ) : (
                  <>
                    Request my quote
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>

              {!ready && status !== "loading" && (
                <span className="text-[12px] text-cream-dim">
                  Name, WhatsApp number and category required
                </span>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
