"use client";

import { useEffect, useState } from "react";

const SOURCE_LANG = "en";
const TARGET_LANG = "ar";
const LANG_COOKIE = "pl_lang";
const LANG_PREF_COOKIE = "pl_lang_pref";
const COUNTRY_COOKIE = "pl_country";
const TRANS_COOKIE = "googtrans";

const ARABIC_COUNTRIES = new Set([
  "AE", "BH", "DJ", "DZ", "EG", "IQ", "JO", "KW", "LB", "LY", "MA",
  "MR", "OM", "PS", "QA", "SA", "SD", "SO", "SY", "TN", "YE", "KM",
]);

const ARABIC_TIMEZONES = new Set([
  "Africa/Algiers", "Africa/Cairo", "Africa/Casablanca", "Africa/Khartoum",
  "Africa/Mogadishu", "Africa/Nouakchott", "Africa/Tunis", "Asia/Aden",
  "Asia/Amman", "Asia/Baghdad", "Asia/Bahrain", "Asia/Beirut", "Asia/Damascus",
  "Asia/Dubai", "Asia/Gaza", "Asia/Hebron", "Asia/Kuwait", "Asia/Muscat",
  "Asia/Qatar", "Asia/Riyadh",
]);

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          options: Record<string, unknown>,
          elementId: string
        ) => unknown;
      };
    };
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  return (
    document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
      ?.split("=")
      .slice(1)
      .join("=") || ""
  );
}

function setCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
}

function possibleCookieDomains() {
  if (typeof window === "undefined") return [] as string[];
  const host = window.location.hostname;
  const parts = host.split(".").filter(Boolean);
  const domains = new Set<string>();
  domains.add(host);
  domains.add(`.${host}`);
  if (parts.length >= 2) {
    const root = parts.slice(-2).join(".");
    domains.add(root);
    domains.add(`.${root}`);
  }
  return Array.from(domains);
}

function clearCookieEverywhere(name: string) {
  const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `${name}=;path=/;${expires};SameSite=Lax`;
  document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax`;
  for (const domain of possibleCookieDomains()) {
    document.cookie = `${name}=;path=/;domain=${domain};${expires};SameSite=Lax`;
    document.cookie = `${name}=;path=/;domain=${domain};max-age=0;SameSite=Lax`;
  }
}

function applyDocumentLanguage(lang: "en" | "ar") {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.lang = lang;
}

function ensureGoogleTranslate() {
  if (typeof window === "undefined") return;

  if (!document.getElementById("google_translate_element")) {
    const holder = document.createElement("div");
    holder.id = "google_translate_element";
    holder.setAttribute("aria-hidden", "true");
    holder.style.display = "none";
    document.body.appendChild(holder);
  }

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) return;
    if (document.getElementById("google_translate_element")?.childNodes.length) return;

    new window.google.translate.TranslateElement(
      {
        pageLanguage: SOURCE_LANG,
        includedLanguages: TARGET_LANG,
        autoDisplay: false,
        multilanguagePage: true,
        layout: 0,
      },
      "google_translate_element"
    );
  };

  if (window.google?.translate?.TranslateElement) {
    window.googleTranslateElementInit?.();
    return;
  }

  if (document.getElementById("google-translate-script")) return;

  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

function triggerGoogleSelect(lang: "en" | "ar") {
  const select = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (!select) return false;
  select.value = lang === "ar" ? TARGET_LANG : "";
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function requestTranslation(lang: "en" | "ar") {
  ensureGoogleTranslate();
  let tries = 0;
  const tick = () => {
    tries += 1;
    if (triggerGoogleSelect(lang)) return;
    if (tries < 16) window.setTimeout(tick, 250);
  };
  window.setTimeout(tick, 250);
}

function setArabicCookies(preference?: "manual") {
  const value = `/${SOURCE_LANG}/${TARGET_LANG}`;
  setCookie(LANG_COOKIE, TARGET_LANG);
  setCookie(TRANS_COOKIE, value);
  if (preference === "manual") setCookie(LANG_PREF_COOKIE, TARGET_LANG);

  // Google Translate may read the cookie on the root domain as well. Setting
  // both is harmless and makes the switch survive www/non-www variants.
  for (const domain of possibleCookieDomains()) {
    document.cookie = `${TRANS_COOKIE}=${value};path=/;domain=${domain};max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  }
}

function clearArabicCookies(preference?: "manual") {
  // Remember manual English so Arabic-region auto-detection does not immediately
  // switch the visitor back to Arabic on the next load.
  setCookie(LANG_COOKIE, SOURCE_LANG);
  if (preference === "manual") setCookie(LANG_PREF_COOKIE, SOURCE_LANG);

  // Google Translate may create host-only and domain cookies. Clearing only one
  // copy leaves the page stuck in Arabic on refresh, so remove every variant.
  clearCookieEverywhere(TRANS_COOKIE);
}

function shouldAutoArabic() {
  const country = readCookie(COUNTRY_COOKIE).toUpperCase();
  if (country && ARABIC_COUNTRIES.has(country)) return true;

  const browserLangs = [navigator.language, ...(navigator.languages || [])]
    .filter(Boolean)
    .map((v) => v.toLowerCase());
  if (browserLangs.some((v) => v === "ar" || v.startsWith("ar-"))) return true;

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (ARABIC_TIMEZONES.has(tz)) return true;
  } catch {
    // ignore timezone detection failures
  }
  return false;
}


function SaudiFlagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="shrink-0 rounded-full shadow-sm">
      <defs>
        <clipPath id="sa-flag-clip">
          <circle cx="12" cy="12" r="11" />
        </clipPath>
      </defs>
      <g clipPath="url(#sa-flag-clip)">
        <rect width="24" height="24" fill="#006C35" />
        <path
          d="M6.2 10.2h11.6M7 8.1h10M8.1 12.1h7.8"
          stroke="#fff"
          strokeWidth="1.15"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d="M6.8 15.3h8.7c1.3 0 2.2-.35 2.8-1.05M14.7 15.3l-1.4 1.25"
          stroke="#fff"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="rgba(244,240,232,0.28)" />
    </svg>
  );
}

function UkFlagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="shrink-0 rounded-full shadow-sm">
      <defs>
        <clipPath id="uk-flag-clip">
          <circle cx="12" cy="12" r="11" />
        </clipPath>
      </defs>
      <g clipPath="url(#uk-flag-clip)">
        <rect width="24" height="24" fill="#012169" />
        <path d="M-2 0l28 24M26 0L-2 24" stroke="#fff" strokeWidth="5" />
        <path d="M-2 0l28 24M26 0L-2 24" stroke="#C8102E" strokeWidth="2.5" />
        <path d="M12 0v24M0 12h24" stroke="#fff" strokeWidth="7" />
        <path d="M12 0v24M0 12h24" stroke="#C8102E" strokeWidth="4" />
      </g>
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="rgba(244,240,232,0.28)" />
    </svg>
  );
}

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isArabic = lang === "ar";
  const targetLabel = isArabic ? "English" : "العربية";

  useEffect(() => {
    const preference = readCookie(LANG_PREF_COOKIE);
    const storedArabic =
      readCookie(LANG_COOKIE) === TARGET_LANG || readCookie(TRANS_COOKIE).includes(`/${TARGET_LANG}`);

    const initial =
      preference === SOURCE_LANG
        ? "en"
        : preference === TARGET_LANG || storedArabic || shouldAutoArabic()
          ? "ar"
          : "en";

    if (initial === "ar") {
      setArabicCookies(preference === TARGET_LANG ? "manual" : undefined);
      requestTranslation("ar");
    }

    setLang(initial);
    applyDocumentLanguage(initial);
    // Do not load Google Translate for normal English visitors. It is a heavy
    // third-party script and only needed after Arabic is selected/auto-detected.
  }, []);

  function toggle() {
    if (isArabic) {
      clearArabicCookies("manual");
      applyDocumentLanguage("en");
      setLang("en");
      triggerGoogleSelect("en");
      // Removing Google Translate cleanly requires a reload; otherwise it keeps
      // translated text nodes cached in the DOM. The cookies above are cleared
      // before reload so the fresh page returns to the original English text.
      window.setTimeout(() => window.location.reload(), 150);
      return;
    }

    setArabicCookies("manual");
    applyDocumentLanguage("ar");
    setLang("ar");
    requestTranslation("ar");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isArabic ? "Switch website language to English" : "Switch website language to Arabic"}
      title={isArabic ? "English" : "Arabic"}
      className={`notranslate group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-surface/45 px-3.5 text-cream-muted shadow-soft backdrop-blur transition-all duration-300 hover:border-champagne/55 hover:text-champagne ${
        compact ? "px-3" : "px-3.5"
      }`}
      data-cursor="Language"
      translate="no"
    >
      {isArabic ? <UkFlagIcon /> : <SaudiFlagIcon />}
      <span className="text-[11px] font-semibold tracking-[0.12em]">
        {targetLabel}
      </span>
    </button>
  );
}
