"use client";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/components/anim";
import { normalizeWaLink, waProductLink, waQuoteSubmittedLink } from "@/lib/whatsapp";
import { celebrate } from "@/lib/confetti";
import { trackLead } from "@/lib/fbq";
import { trackEvent } from "@/lib/track";
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
    label: "We reply within 12 hours",
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
  { name: "Saudi Arabia", code: "+966", bg: "#006C35" },
  { name: "United Arab Emirates", code: "+971", bg: "linear-gradient(90deg,#EF3340 0 25%,transparent 25%),linear-gradient(#009739 0 33%,#FFFFFF 33% 66%,#000000 66%)" },
  { name: "Qatar", code: "+974", bg: "linear-gradient(90deg,#FFFFFF 0 30%,#8A1538 30%)" },
  { name: "Kuwait", code: "+965", bg: "linear-gradient(90deg,#000000 0 24%,transparent 24%),linear-gradient(#007A3D 0 33%,#FFFFFF 33% 66%,#CE1126 66%)" },
  { name: "Bahrain", code: "+973", bg: "linear-gradient(90deg,#FFFFFF 0 30%,#CE1126 30%)" },
  { name: "Oman", code: "+968", bg: "linear-gradient(90deg,#DB161B 0 26%,transparent 26%),linear-gradient(#FFFFFF 0 33%,#DB161B 33% 66%,#008000 66%)" },
  { name: "Pakistan", code: "+92", bg: "linear-gradient(90deg,#FFFFFF 0 22%,#01411C 22%)" },
  { name: "United Kingdom", code: "+44", bg: "linear-gradient(90deg,#012169 0 100%)" },
  { name: "United States", code: "+1", bg: "repeating-linear-gradient(0deg,#B22234 0 2px,#FFFFFF 2px 4px)" },
  { name: "Canada", code: "+1", bg: "linear-gradient(90deg,#D52B1E 0 25%,#FFFFFF 25% 75%,#D52B1E 75%)" },
  { name: "Australia", code: "+61", bg: "#012169" },
  { name: "Germany", code: "+49", bg: "linear-gradient(#000000 0 33%,#DD0000 33% 66%,#FFCE00 66%)" },
  { name: "France", code: "+33", bg: "linear-gradient(90deg,#0055A4 0 33%,#FFFFFF 33% 66%,#EF4135 66%)" },
  { name: "Italy", code: "+39", bg: "linear-gradient(90deg,#009246 0 33%,#FFFFFF 33% 66%,#CE2B37 66%)" },
  { name: "Turkey", code: "+90", bg: "#E30A17" },
  { name: "Other", code: "", bg: "radial-gradient(circle at 35% 35%,#E6CB8C 0 14%,transparent 15%),linear-gradient(135deg,#26262E,#0D0D10)" },
] as const;

type CountryOption = (typeof COUNTRY_OPTIONS)[number];


const getCountryCode = (country: string) =>
  COUNTRY_OPTIONS.find((c) => c.name === country)?.code || "";

const isOnlyCountryCode = (phone: string, code: string) => {
  const cleaned = phone.trim().replace(/[\s().-]/g, "");
  return !cleaned || (code ? cleaned === code : false);
};

function CountryFlagIcon({ country }: { country: CountryOption }) {
  return (
    <span
      className="relative inline-flex h-5 w-7 shrink-0 overflow-hidden rounded-[0.28rem] border border-cream/20 shadow-[0_0_18px_-10px_rgba(201,168,106,0.9)]"
      style={{ background: country.bg }}
      aria-hidden
    >
      {country.name === "Saudi Arabia" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-[1.5px] w-4 rounded-full bg-white/95" />
        </span>
      )}
      {country.name === "United Kingdom" && (
        <span className="absolute inset-0">
          <span className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-white" />
          <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-white" />
          <span className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-[#C8102E]" />
          <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-[#C8102E]" />
        </span>
      )}
      {country.name === "Australia" && (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white/90" />
      )}
      {country.name === "Turkey" && (
        <span className="absolute left-2 top-1.5 h-2 w-2 rounded-full border-[2px] border-white" />
      )}
      <span className="pointer-events-none absolute inset-0 rounded-[0.28rem] ring-1 ring-inset ring-white/10" />
    </span>
  );
}

type FormState = {
  name: string;
  phone: string;
  products: string[];
  otherProduct: string;
  email: string;
  quantity: string;
  details: string;
  company: string;
  country: string;
  otherCountry: string;
};

type TouchKey = "name" | "phone" | "product" | "email";

export default function QuoteForm({
  defaultProduct = "",
  defaultDetails = "",
  defaultQuantity = "",
  whatsapp,
  productChoices,
}: {
  defaultProduct?: string;
  /** Pre-filled order details (e.g. configurator selection from a product page). */
  defaultDetails?: string;
  /** Pre-filled quantity (e.g. "2,500 pcs" from the cost calculator) — mapped to the nearest band. */
  defaultQuantity?: string;
  whatsapp?: string;
  /** Admin-managed product list; falls back to the built-in categories. */
  productChoices?: string[];
}) {
  const productList: string[] =
    productChoices && productChoices.length > 0 ? productChoices : [...PRODUCT_CATEGORIES];
  const fallbackWa = defaultProduct
    ? waProductLink(defaultProduct)
    : normalizeWaLink(whatsapp);

  // Map an incoming ?product= title onto a real dropdown option: prefer an
  // exact match in the admin-managed list, then the built-in alias mapping.
  const trimmedDefault = defaultProduct.trim();
  const exactInList = productList.find((p) => p.toLowerCase() === trimmedDefault.toLowerCase());
  const seededProduct = exactInList || resolveCategory(defaultProduct);

  // Map an incoming ?quantity= (e.g. "2,500 pcs" from the cost calculator)
  // onto the nearest quantity band offered in the dropdown.
  const seededQuantity = (() => {
    const n = parseInt(defaultQuantity.replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(n) || n <= 0) return "";
    if (n < 100) return QUANTITY_OPTIONS[0];
    if (n <= 250) return QUANTITY_OPTIONS[1];
    if (n <= 500) return QUANTITY_OPTIONS[2];
    if (n <= 1000) return QUANTITY_OPTIONS[3];
    if (n <= 2500) return QUANTITY_OPTIONS[4];
    if (n <= 5000) return QUANTITY_OPTIONS[5];
    if (n <= 10000) return QUANTITY_OPTIONS[6];
    return QUANTITY_OPTIONS[7];
  })();

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    products: seededProduct ? [seededProduct] : [],
    otherProduct: "",
    email: "",
    quantity: seededQuantity,
    details: defaultDetails.trim().slice(0, 2000),
    company: "",
    country: "",
    otherCountry: "",
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
  const [countryOpen, setCountryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [quantityOpen, setQuantityOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const selectedCountry = COUNTRY_OPTIONS.find((c) => c.name === form.country) || null;
  const selectedCountryCode = selectedCountry?.code || "";
  const countryForSubmission =
    form.country === "Other"
      ? form.otherCountry.trim()
        ? `Other — ${form.otherCountry.trim()}`
        : "Other"
      : form.country.trim();
  const customOther = form.otherProduct.trim().replace(/,/g, " /"); // commas would break the submission list
  const productForSubmission = form.products
    .map((p) => (p === "Other" ? (customOther ? `Other — ${customOther}` : "Other") : p))
    .join(", ");

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
        otherCountry: country === "Other" ? f.otherCountry : "",
        phone: shouldAutoFill
          ? phone && !phone.startsWith("+") && localDigits
            ? `${nextCode} ${localDigits}`
            : `${nextCode} `
          : f.phone,
      };
    });
  }


  function toggleProduct(item: string) {
    markTouched("product");
    setForm((f) => {
      const products = f.products.includes(item)
        ? f.products.filter((p) => p !== item)
        : [...f.products, item];
      return {
        ...f,
        products,
        otherProduct: products.includes("Other") ? f.otherProduct : "",
      };
    });
  }

  const markTouched = (k: TouchKey) => setTouched((t) => ({ ...t, [k]: true }));

  // Live per-field errors, shown only after the field has been touched.
  const liveErrors = useMemo(
    () => ({
      name: touched.name ? validateName(form.name) : "",
      phone: touched.phone ? validatePhone(form.phone) : "",
      product: touched.product ? validateCategory(productForSubmission, productList) : "",
      email: touched.email ? validateEmail(form.email) : "",
    }),
    [form.name, form.phone, productForSubmission, form.email, touched]
  );

  // Button enables as soon as name + phone + at least one product are valid.
  // An invalid optional email still blocks, but blank never does.
  const ready = useMemo(
    () => isQuoteReady({ ...form, product: productForSubmission }, productList) && !validateEmail(form.email),
    [form, productForSubmission, productList]
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

    const errors = validateQuote({ ...form, product: productForSubmission });
    if (form.country === "Other" && !form.otherCountry.trim()) {
      setStatus("error");
      const msg = "Please tell us which country you are based in.";
      setErr(msg);
      toast.error(msg);
      return;
    }
    if (form.products.includes("Other") && !form.otherProduct.trim()) {
      setStatus("error");
      const msg = "Please describe the product or custom item you need.";
      setErr(msg);
      toast.error(msg);
      return;
    }
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
      fd.append("product", productForSubmission);
      fd.append("email", form.email.trim());
      fd.append("quantity", form.quantity);
      fd.append("details", form.details.trim());
      fd.append("company", form.company.trim());
      fd.append("country", countryForSubmission);

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

      // Fire Meta Lead only after the API confirms the lead was saved.
      trackLead(productForSubmission);
      trackEvent("lead_submit", productForSubmission);

      const uploaded = (data.artworkUrl as string | null) ?? null;
      setArtworkUrl(uploaded);

      // Pass every field the visitor filled in, so the WhatsApp message is a
      // complete summary and nothing has to be asked for a second time.
      const link = waQuoteSubmittedLink({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        country: countryForSubmission,
        product: productForSubmission,
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
              hint="Choose your country for our records. The phone code is only a suggestion — you can use any valid WhatsApp country code."
              htmlFor="q-country"
            >
              <input type="hidden" name="country" value={countryForSubmission} />
              <div className="relative">
                <button
                  id="q-country"
                  type="button"
                  onClick={() => setCountryOpen((v) => !v)}
                  className={`${inputCls} ${okBorder} flex items-center justify-between gap-3 text-left`}
                  aria-haspopup="listbox"
                  aria-expanded={countryOpen}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {selectedCountry ? (
                      <CountryFlagIcon country={selectedCountry} />
                    ) : (
                      <span className="flex h-5 w-7 shrink-0 items-center justify-center rounded-[0.28rem] border border-line bg-surface-2 text-[10px] text-champagne">
                        ✦
                      </span>
                    )}
                    <span className={selectedCountry ? "truncate text-cream" : "truncate text-cream-dim/60"}>
                      {selectedCountry
                        ? `${selectedCountry.name}${selectedCountry.code ? ` (${selectedCountry.code})` : ""}`
                        : "Select country"}
                    </span>
                  </span>
                  <svg
                    className={`shrink-0 text-cream-dim transition-transform ${countryOpen ? "rotate-180" : ""}`}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {countryOpen && (
                  <div
                    className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-champagne/25 bg-ink/95 p-2 shadow-soft backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    role="listbox"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        role="option"
                        aria-selected={form.country === c.name}
                        onClick={() => {
                          handleCountryChange(c.name);
                          setCountryOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
                          form.country === c.name
                            ? "bg-champagne/12 text-cream"
                            : "text-cream-muted hover:bg-cream/[0.04] hover:text-cream"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <CountryFlagIcon country={c} />
                          <span className="truncate">{c.name}</span>
                        </span>
                        {c.code && <span className="shrink-0 text-[12px] text-champagne">{c.code}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            {form.country === "Other" && (
              <Field
                label="Country name"
                required
                hint="Tell us which country you are based in if it is not in the list."
                htmlFor="q-other-country"
              >
                <input
                  id="q-other-country"
                  value={form.otherCountry}
                  onChange={(e) => set("otherCountry", e.target.value)}
                  className={`${inputCls} ${okBorder}`}
                  placeholder="Type your country"
                />
              </Field>
            )}

            <Field
              label="WhatsApp number"
              required
              error={liveErrors.phone}
              hint={
                selectedCountryCode
                  ? `Suggested code ${selectedCountryCode} added. You can change it to any valid WhatsApp country code.`
                  : "Enter your full WhatsApp number with any country code, e.g. +966 5XXXXXXXX."
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
              label="Products"
              required
              error={liveErrors.product}
              hint="Tick as many as you need — one order can cover them all."
              htmlFor="q-product"
            >
              <input type="hidden" name="product" value={productForSubmission} />
              {form.products.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {form.products.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 rounded-full border border-champagne/40 bg-champagne/10 px-2.5 py-1 text-[11px] font-medium text-champagne"
                    >
                      {p}
                      <button
                        type="button"
                        onClick={() => toggleProduct(p)}
                        aria-label={`Remove ${p}`}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-champagne/70 transition-colors hover:bg-champagne/25 hover:text-cream"
                      >
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden>
                          <path d="M5 5l14 14M19 5L5 19" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <button
                  id="q-product"
                  type="button"
                  onClick={() => setProductOpen((v) => !v)}
                  onBlur={() => markTouched("product")}
                  aria-invalid={!!liveErrors.product}
                  aria-haspopup="listbox"
                  aria-expanded={productOpen}
                  className={`${inputCls} ${liveErrors.product ? errBorder : okBorder} flex items-center justify-between gap-3 text-left backdrop-blur-xl`}
                >
                  <span className={form.products.length ? "truncate text-cream" : "truncate text-cream-dim/60"}>
                    {form.products.length
                      ? `${form.products.length} product${form.products.length === 1 ? "" : "s"} selected`
                      : "Select products — multiple allowed"}
                  </span>
                  <svg className={`shrink-0 text-cream-dim transition-transform ${productOpen ? "rotate-180" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {productOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-champagne/25 bg-ink/95 p-2 shadow-soft backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="listbox" aria-multiselectable="true">
                    {productList.map((item) => {
                      const selected = form.products.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => toggleProduct(item)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
                            selected ? "bg-champagne/12 text-cream" : "text-cream-muted hover:bg-cream/[0.04] hover:text-cream"
                          }`}
                        >
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all ${
                              selected
                                ? "border-champagne bg-champagne text-ink shadow-glow-sm"
                                : "border-cream/25 text-transparent"
                            }`}
                            aria-hidden
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 12l5 5L20 6" />
                            </svg>
                          </span>
                          <span className="flex-1">{item}</span>
                        </button>
                      );
                    })}
                    <div className="sticky bottom-0 mt-1 border-t border-line/60 bg-ink/95 pb-0.5 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setProductOpen(false)}
                        className="w-full rounded-xl bg-champagne/15 px-3 py-2 text-[12px] font-medium text-champagne transition-colors hover:bg-champagne/25"
                      >
                        Done{form.products.length ? ` — ${form.products.length} selected` : ""}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Field>

            {form.products.includes("Other") && (
              <Field
                label="Custom product details"
                required
                hint="Tell us what product, accessory, or special branding item you need."
                htmlFor="q-other-product"
              >
                <input
                  id="q-other-product"
                  value={form.otherProduct}
                  onChange={(e) => set("otherProduct", e.target.value)}
                  className={`${inputCls} ${okBorder}`}
                  placeholder="Describe your custom item"
                />
              </Field>
            )}

            {/* ---------------- optional ---------------- */}
            <Field label="Quantity" htmlFor="q-quantity">
              <input type="hidden" name="quantity" value={form.quantity} />
              <div className="relative">
                <button
                  id="q-quantity"
                  type="button"
                  onClick={() => setQuantityOpen((v) => !v)}
                  className={`${inputCls} ${okBorder} flex items-center justify-between gap-3 text-left backdrop-blur-xl`}
                >
                  <span className={form.quantity ? "truncate text-cream" : "truncate text-cream-dim/60"}>
                    {form.quantity || "Select a quantity"}
                  </span>
                  <svg className={`shrink-0 text-cream-dim transition-transform ${quantityOpen ? "rotate-180" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {quantityOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 max-h-72 overflow-y-auto rounded-2xl border border-champagne/25 bg-ink/95 p-2 shadow-soft backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="listbox">
                    {QUANTITY_OPTIONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        role="option"
                        aria-selected={form.quantity === item}
                        onClick={() => {
                          set("quantity", item);
                          setQuantityOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
                          form.quantity === item ? "bg-champagne/12 text-cream" : "text-cream-muted hover:bg-cream/[0.04] hover:text-cream"
                        }`}
                      >
                        <span>{item}</span>
                        {form.quantity === item && <span className="text-champagne">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                title={ready ? undefined : "Add your name, WhatsApp number and at least one product"}
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
                  Name, WhatsApp number and at least one product required
                </span>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
