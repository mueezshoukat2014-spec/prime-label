import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Cairo } from "next/font/google";
import "./globals.css";
import TabAttention from "@/components/TabAttention";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { ToastProvider } from "@/components/Toast";
import AnnouncementBar from "@/components/AnnouncementBar";
import MetaPixelRouteTracker from "@/components/MetaPixel";
import { cookies, headers } from "next/headers";
import { getSiteContent } from "@/lib/data";
import { BRAND_NAME, PRIMARY_KEYWORDS, SITE_URL, organizationJsonLd, websiteJsonLd, offerCatalogJsonLd } from "@/lib/seo";

// The layout reads live Site Settings (Meta Pixel ID, announcement bar), so it
// must not be frozen at build time — otherwise those toggles only take effect
// on the next deploy.
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
    authors: [{ name }],
    creator: name,
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
      images: [{ url: "/photos/brand-logo.jpg", width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description:
        "Custom woven labels, hang tags, stickers and packaging for clothing brands across Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman and worldwide.",
      images: ["/photos/brand-logo.jpg"],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  };
}

const ARABIC_COUNTRIES = new Set([
  "AE", "BH", "DJ", "DZ", "EG", "IQ", "JO", "KW", "LB", "LY", "MA",
  "MR", "OM", "PS", "QA", "SA", "SD", "SO", "SY", "TN", "YE", "KM",
]);

const globalJsonLd = [organizationJsonLd, websiteJsonLd, offerCatalogJsonLd];
const META_PIXEL_ID = "1220558943557267";


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
  const initialLang = isInitialArabic ? "ar" : "en";

  return (
    <html
      lang={initialLang}
      dir={isInitialArabic ? "rtl" : "ltr"}
      data-lang={initialLang}
      className={`${fraunces.variable} ${manrope.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }} />

        {!isAdmin && META_PIXEL_ID && (
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
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`,
            }}
          />
        )}

      </head>
      <body>
        <ToastProvider>
          <MetaPixelRouteTracker />
          <AnnouncementBar
            text={
              String(s.announcementEnabled) === "true"
                ? String(s.announcementText || "").trim()
                : ""
            }
          />
          <TabAttention />
          {children}
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
