import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Cairo } from "next/font/google";
import "./globals.css";
import TabAttention from "@/components/TabAttention";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import LeadCapture from "@/components/LeadCapture";
import FloatingLanguage from "@/components/FloatingLanguage";
import SuggestionBox from "@/components/SuggestionBox";
import { ToastProvider } from "@/components/Toast";
import AnnouncementBar from "@/components/AnnouncementBar";
import MetaPixelRouteTracker from "@/components/MetaPixel";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { cookies, headers } from "next/headers";
import { getSiteContent } from "@/lib/data";
import { BRAND_NAME, PRIMARY_KEYWORDS, SITE_URL, organizationJsonLd, websiteJsonLd, offerCatalogJsonLd, localBusinessJsonLd } from "@/lib/seo";

// The layout reads live Site Settings (announcement bar), so it must not be
// frozen at build time — otherwise those toggles only take effect on the next deploy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Fraunces: variable serif (weight, optical size, italic for gold accents)
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
});

// Manrope: clean variable sans for body, buttons and labels
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Cairo: polished Arabic support for translated mode, close to the site's clean luxury UI.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  // Admin must never inherit the public homepage metadata (title, canonical,
  // hreflang, OG) — it previously shipped "index, follow" with a canonical
  // pointing at the homepage. Keep it minimal and hard-noindex instead.
  const path = headers().get("x-pathname") ?? "";
  if (path.startsWith("/admin")) {
    return {
      title: "Admin",
      description: "Admin area.",
      robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
      alternates: { canonical: `${SITE_URL}/admin` },
    };
  }
  const s = await getSiteContent();
  const name = s.businessName;
  const url = SITE_URL;
  const title = `${name} | Custom Woven Labels, Hang Tags & Packaging for Saudi Arabia & GCC`;

  return {
    metadataBase: new URL(url),
    title: {
      default: title,
      template: `%s | ${name}`,
    },
    description:
      "Premium custom woven labels, satin labels, hang tags, stickers, packaging and garment branding accessories for fashion brands in Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman and worldwide.",
    keywords: [...PRIMARY_KEYWORDS],
    applicationName: BRAND_NAME,
    authors: [{ name: BRAND_NAME }],
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
        { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    alternates: {
      canonical: url,
      languages: {
        "en": url,
        "ar": `${url.replace(/\/$/, "")}/ar`,
        "x-default": url,
      },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description:
        "Custom woven labels, hang tags, stickers and packaging for clothing brands across Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman and worldwide.",
      siteName: name,
      locale: "en_US",
      alternateLocale: ["ar_SA", "en_GB", "en_AE"],
      images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: BRAND_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description:
        "Custom woven labels, hang tags, stickers and packaging for clothing brands across Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman and worldwide.",
      images: ["/og-banner.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

const ARABIC_COUNTRIES = new Set([
  "AE", "BH", "DJ", "DZ", "EG", "IQ", "JO", "KW", "LB", "LY", "MA",
  "MR", "OM", "PS", "QA", "SA", "SD", "SO", "SY", "TN", "YE", "KM",
]);

/**
 * Builds the site-wide JSON-LD graph.
 *
 * This used to be a module-level constant, with a SECOND Organization node
 * emitted in <body> carrying the admin overrides. Both nodes shared the same
 * @id (`/#organization`) but could disagree on `name` and `slogan`, so every page
 * shipped two conflicting definitions of the same entity and Google had to guess
 * which was authoritative. One node now, built after site content is loaded.
 */
function buildGlobalJsonLd(site: { businessName?: string | null; heroHeadline?: string | null }) {
  return [
    {
      ...organizationJsonLd,
      name: site.businessName || BRAND_NAME,
      slogan: site.heroHeadline,
    },
    websiteJsonLd,
    offerCatalogJsonLd,
    localBusinessJsonLd,
  ];
}
const META_PIXEL_ID = "1554256332856113";


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteContent();

  const headerStore = headers();
  const cookieStore = cookies();
  const currentPath = headerStore.get("x-pathname") ?? "";
  const isAdmin = currentPath.startsWith("/admin");
  // /ar URLs are natively written Arabic pages. They must always declare
  // lang="ar" dir="rtl" regardless of cookies or geo, because Googlebot (and
  // any visitor without the Arabic cookies) previously received these pages as
  // lang="en" dir="ltr". That contradicted the hreflang="ar" annotations and
  // let search engines cluster the Arabic pages as duplicates of their English
  // counterparts ("Duplicate without user-selected canonical" in Search
  // Console). The path is the authoritative signal here; cookies only drive
  // auto-detection on the English pages.
  const isArabicPath = currentPath === "/ar" || currentPath.startsWith("/ar/");
  const country = (headerStore.get("x-country") || "").toUpperCase();
  const langPreference = cookieStore.get("pl_lang_pref")?.value;
  const storedLang = cookieStore.get("pl_lang")?.value;
  const autoArabic = headerStore.get("x-auto-arabic") === "1" || ARABIC_COUNTRIES.has(country);
  const isInitialArabic =
    isArabicPath ||
    langPreference === "ar" ||
    (!langPreference && (storedLang === "ar" || autoArabic));
  const initialLang = isAdmin ? "en" : isInitialArabic ? "ar" : "en";
  const initialDir = isAdmin ? "ltr" : isInitialArabic ? "rtl" : "ltr";

  return (
    <html
      lang={initialLang}
      dir={initialDir}
      data-lang={initialLang}
      className={`${fraunces.variable} ${manrope.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google-site-verification" content="ZSEoUgZtRotzOKKlF9dBnpJBwRd2bFtDAfKHA3tPrJc" />
        {/* Self-hosted font preloads: next/font does not emit preload links on
            these force-dynamic pages, so the hero text painted with fallback
            metrics until the woff2 arrived (a late font swap re-recorded LCP).
            Hashes below are the latin (and arabic, for /ar) subsets emitted by
            next/font for the current build; if the fonts or Next version
            change, refresh them from .next/static/css. */}
        {initialLang === "ar" ? (
          <>
            <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href="/_next/static/media/01f0c602c274ea55-s.p.woff2" />
            <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href="/_next/static/media/350b852752f8489d-s.p.woff2" />
          </>
        ) : (
          <>
            <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href="/_next/static/media/4c9affa5bc8f420e-s.p.woff2" />
            <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href="/_next/static/media/af4bf8399d1aacdf-s.p.woff2" />
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildGlobalJsonLd(s)) }} />

        {/* Pixel preconnects removed: the analytics scripts now load ~5s after
            window load (or on first interaction), so warming those sockets
            during the critical path only wasted early-connection budget. */}
        {/* Google Ads tag (AW-18430949817) — deferred like the Meta Pixel:
            events queue immediately, the network script loads on first
            interaction or ~5s after window load, so LCP/TBT are unaffected. */}
        <script
          id="google-ads-base"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
gtag('config','AW-18430949817',{send_page_view:true});
(function(){var loaded=0;var go=function(){if(loaded)return;loaded=1;
var t=document.createElement('script');t.async=true;
t.src='https://www.googletagmanager.com/gtag/js?id=AW-18430949817';
var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(t,s)};
if(document.readyState==='complete'){setTimeout(go,5000)}
else{window.addEventListener('load',function(){setTimeout(go,5000)},{once:true})}
['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){
window.addEventListener(ev,go,{once:true,passive:true})});})();`,
          }}
        />
        <link rel="preconnect" href="https://pf7ehmyjhm559fb0.public.blob.vercel-storage.com" crossOrigin="anonymous" />
        {META_PIXEL_ID && (
          <script
            id="meta-pixel-base"
            dangerouslySetInnerHTML={{
              __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
f.__plLoadPixel=function(){if(f.__plPixelLoaded)return;f.__plPixelLoaded=1;
t=b.createElement(e);t.async=!0;t.src=v;
s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
(function(){var go=function(){window.__plLoadPixel&&window.__plLoadPixel()};
if(document.readyState==='complete'){setTimeout(go,5000)}
else{window.addEventListener('load',function(){setTimeout(go,5000)},{once:true})}
['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){
window.addEventListener(ev,go,{once:true,passive:true})});})();`,
            }}
          />
        )}

      </head>
      <body>
        {/* The legacy <noscript> 1x1 Meta pixel image was removed: Next was
            hoisting it into a <link rel="preload" as="image">, forcing every
            visitor to open a request to facebook.com inside the critical
            path. JS-disabled visitors are an edge case not worth that cost. */}
        <ToastProvider>
          <MetaPixelRouteTracker />
          <AnalyticsTracker />
          <AnnouncementBar
            text={
              String(s.announcementEnabled) === "true"
                ? String(s.announcementText || "").trim()
                : ""
            }
          />
          <TabAttention />
          {children}
          <FloatingLanguage />
          <SuggestionBox />
          <FloatingWhatsApp href={s.whatsapp} />
          <LeadCapture whatsapp={s.whatsapp} />
        </ToastProvider>
      </body>
    </html>
  );
}
