import type { Metadata, Viewport } from "next";
import { getSiteContent } from "@/lib/data";
import { BRAND_NAME, PRIMARY_KEYWORDS, SITE_URL } from "@/lib/seo";

export const rootViewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
};

/** Public site-wide metadata shared by the English and Arabic root layouts.
 *  (Admin sets its own noindex metadata in app/(site)/admin/layout.tsx.) */
export async function buildRootMetadata(): Promise<Metadata> {
  const s = await getSiteContent();
  const name = s.businessName;
  const url = SITE_URL;
  // Short brand in the title suffix ("Prime Labels") keeps titles within ~60 chars;
  // the full legal name still ships in Organization/WebSite JSON-LD + og:site_name.
  const shortName = name.replace(/\s+International$/i, "").trim() || name;
  const title = `Custom Woven Labels, Hang Tags & Packaging | ${shortName}`;

  return {
    metadataBase: new URL(url),
    title: {
      default: title,
      template: `%s | ${shortName}`,
    },
    description:
      "Custom woven labels, care & size labels, hang tags and brand packaging for clothing brands worldwide. MOQ from 100, free 24h digital proof, DDP delivery.",
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
