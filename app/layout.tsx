import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Cairo } from "next/font/google";
import "./globals.css";
import TabAttention from "@/components/TabAttention";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import FloatingLanguage from "@/components/FloatingLanguage";
import { ToastProvider } from "@/components/Toast";
import AnnouncementBar from "@/components/AnnouncementBar";
import MetaPixelRouteTracker from "@/components/MetaPixel";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { cookies, headers } from "next/headers";
import { getSiteContent } from "@/lib/data";
import { BRAND_NAME, PRIMARY_KEYWORDS, SITE_URL, organizationJsonLd, websiteJsonLd, offerCatalogJsonLd } from "@/lib/seo";

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
      images: [{ url: "/icon.png", width: 512, height: 512, alt: BRAND_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description:
        "Custom woven labels, hang tags, stickers and packaging for clothing brands across Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman and worldwide.",
      images: ["/icon.png"],
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

const globalJsonLd = [organizationJsonLd, websiteJsonLd, offerCatalogJsonLd];
const META_PIXEL_ID = "1554256332856113";


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteContent();

  const headerStore = headers();
  const cookieStore = cookies();
  const currentPath = headerStore.get("x-pathname") ?? "";
  const isAdmin = currentPath.startsWith("/admin");
  const country = (headerStore.get("x-country") || "").toUpperCase();
  const langPreference = cookieStore.get("pl_lang_pref")?.value;
  const storedLang = cookieStore.get("pl_lang")?.value;
  const autoArabic = headerStore.get("x-auto-arabic") === "1" || ARABIC_COUNTRIES.has(country);
  const isInitialArabic =
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }} />

        {META_PIXEL_ID && (
          <script
            id="meta-pixel-base"
            dangerouslySetInnerHTML={{
              __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`,
            }}
          />
        )}

      </head>
      <body>
        {META_PIXEL_ID && (
          <noscript id="meta-pixel-noscript">
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
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
          <FloatingWhatsApp href={s.whatsapp} />
        </ToastProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ ...organizationJsonLd, name: s.businessName || BRAND_NAME, slogan: s.heroHeadline }),
          }}
        />
      </body>
    </html>
  );
}
