"use client";

import { useEffect, useState } from "react";

const SOURCE_LANG = "en";
const TARGET_LANG = "ar";
const LANG_COOKIE = "pl_lang";
const TRANS_COOKIE = "googtrans";

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

function clearCookie(name: string) {
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Lax`;
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

function setArabicCookies() {
  const value = `/${SOURCE_LANG}/${TARGET_LANG}`;
  setCookie(LANG_COOKIE, TARGET_LANG);
  setCookie(TRANS_COOKIE, value);

  // Google Translate may read the cookie on the root domain as well. Setting
  // both is harmless and makes the switch survive www/non-www variants.
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length > 2) {
    document.cookie = `${TRANS_COOKIE}=${value};path=/;domain=.${parts.slice(-2).join(".")};max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  }
}

function clearArabicCookies() {
  clearCookie(LANG_COOKIE);
  clearCookie(TRANS_COOKIE);
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length > 2) {
    document.cookie = `${TRANS_COOKIE}=;path=/;domain=.${parts.slice(-2).join(".")};expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Lax`;
  }
}

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isArabic = lang === "ar";

  useEffect(() => {
    const stored = readCookie(LANG_COOKIE) === TARGET_LANG || readCookie(TRANS_COOKIE).includes(`/${TARGET_LANG}`);
    const initial = stored ? "ar" : "en";
    setLang(initial);
    applyDocumentLanguage(initial);
    ensureGoogleTranslate();
  }, []);

  function toggle() {
    if (isArabic) {
      clearArabicCookies();
      applyDocumentLanguage("en");
      setLang("en");
      // Removing Google Translate cleanly requires a reload; otherwise it keeps
      // translated text nodes cached in the DOM.
      window.location.reload();
      return;
    }

    setArabicCookies();
    applyDocumentLanguage("ar");
    setLang("ar");
    ensureGoogleTranslate();

    window.setTimeout(() => {
      const changed = triggerGoogleSelect("ar");
      if (!changed) window.location.reload();
    }, 500);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isArabic ? "Switch website language to English" : "Switch website language to Arabic"}
      title={isArabic ? "English" : "Arabic"}
      className={`notranslate group inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface/45 text-cream-muted shadow-soft backdrop-blur transition-all duration-300 hover:border-champagne/55 hover:text-champagne ${
        compact ? "h-11 w-11" : "h-11 px-3.5"
      }`}
      data-cursor="Language"
      translate="no"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M5.5 7.5h13M5.5 16.5h13"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>
      {!compact && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
          {isArabic ? "EN" : "عربي"}
        </span>
      )}
    </button>
  );
}
