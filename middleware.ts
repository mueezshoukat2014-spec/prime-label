import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ARABIC_COUNTRIES = new Set([
  "AE", "BH", "DJ", "DZ", "EG", "IQ", "JO", "KW", "LB", "LY", "MA",
  "MR", "OM", "PS", "QA", "SA", "SD", "SO", "SY", "TN", "YE", "KM",
]);

/**
 * Exposes request metadata to Server Components and sets a lightweight country
 * cookie used by the client language switcher.
 *
 * Vercel provides the visitor country in x-vercel-ip-country. If a visitor is
 * from an Arabic-speaking country and has not manually chosen English/Arabic,
 * we prime Google Translate cookies so the site opens in Arabic by default.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country") ||
    "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const browserPrefersArabic = /(^|,)\s*ar(?:-|;|,|$)/i.test(acceptLanguage);
  const regionPrefersArabic =
    ARABIC_COUNTRIES.has(country.toUpperCase()) || browserPrefersArabic;

  headers.set("x-pathname", pathname);
  if (country) headers.set("x-country", country.toUpperCase());
  if (regionPrefersArabic) headers.set("x-auto-arabic", "1");

  const response = NextResponse.next({ request: { headers } });

  // Baseline security hardening headers. A strict Content-Security-Policy is
  // intentionally left out for now — Meta Pixel, Google Translate and Vercel
  // Blob video sources all need whitelisting before one can be enforced.
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  if (country) {
    response.cookies.set("pl_country", country.toUpperCase(), {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });
  }

  const manualPreference = request.cookies.get("pl_lang_pref")?.value;
  const alreadySelected = request.cookies.get("pl_lang")?.value;
  const shouldAutoArabic =
    !pathname.startsWith("/admin") &&
    !manualPreference &&
    !alreadySelected &&
    regionPrefersArabic;

  if (shouldAutoArabic) {
    response.cookies.set("pl_lang", "ar", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    response.cookies.set("googtrans", "/en/ar", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  // Skip static assets and image optimisation — only page requests matter.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|photos|videos).*)"],
};
