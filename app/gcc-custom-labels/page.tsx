import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import GallerySection from "@/components/GallerySection";
import { Reveal } from "@/components/anim";
import { getGallery, getSiteContent } from "@/lib/data";
import { GCC_COUNTRIES, SEO_PRODUCTS, SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Custom Woven Labels & Packaging for Saudi Arabia, UAE & GCC",
  description:
    "Premium custom woven labels, satin labels, hang tags, stickers and clothing brand packaging for fashion brands in Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman and worldwide.",
  alternates: {
    canonical: `${SITE_URL}/gcc-custom-labels`,
    languages: { en: `${SITE_URL}/gcc-custom-labels`, "x-default": `${SITE_URL}/gcc-custom-labels` },
  },
  keywords: [
    "custom woven labels Saudi Arabia",
    "clothing labels Riyadh",
    "hang tags Jeddah",
    "custom labels Dubai",
    "brand packaging UAE",
    "garment labels Qatar",
    "custom stickers Kuwait",
    "woven labels Bahrain",
    "packaging Oman",
    "GCC clothing labels",
    "ليبل ملابس السعودية",
    "بطاقات تعليق للملابس",
    "تغليف براندات الملابس",
  ],
  openGraph: {
    title: "Custom Labels & Brand Packaging for Saudi Arabia, UAE & GCC",
    description:
      "High-end garment labels, hang tags, stickers and packaging accessories for Gulf fashion brands and global apparel businesses.",
    url: `${SITE_URL}/gcc-custom-labels`,
    siteName: BRAND_NAME,
    images: [{ url: "/photos/brand-logo.jpg", width: 1200, height: 630, alt: BRAND_NAME }],
  },
};

const industries = [
  "Abaya and modest fashion brands",
  "Streetwear and luxury apparel labels",
  "Uniform, sportswear and workwear companies",
  "Boutiques, designers and ecommerce clothing stores",
  "Perfume, gift and lifestyle packaging projects",
];

const arabicTerms = [
  "ليبل ملابس مخصص",
  "ليبل منسوج",
  "بطاقات تعليق للملابس",
  "تغليف براندات الملابس",
  "ستيكرات مخصصة",
  "إكسسوارات براند الملابس",
];

export default async function GccCustomLabelsPage() {
  const [site, gallery] = await Promise.all([getSiteContent(), getGallery()]);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${SITE_URL}/gcc-custom-labels#service`,
      name: "Custom clothing labels and brand packaging for GCC fashion brands",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: GCC_COUNTRIES.map((name) => ({ "@type": "Country", name })),
      serviceType: SEO_PRODUCTS,
      description:
        "Premium woven labels, satin labels, hang tags, stickers and brand packaging accessories for clothing brands in Saudi Arabia, UAE, Qatar, Kuwait, Bahrain and Oman.",
    },
    breadcrumbJsonLd([{ name: "GCC Custom Labels", path: "/gcc-custom-labels" }]),
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28">
        <div className="pointer-events-none absolute -right-[15%] top-10 h-[520px] w-[520px] rounded-full bg-champagne/10 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              GCC apparel branding
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="display mt-6 max-w-5xl text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-8xl">
              Custom woven labels, hang tags and packaging for
              <span className="gradient-text italic"> Saudi Arabia & GCC brands.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-7 max-w-3xl text-[15px] leading-relaxed text-cream-muted sm:text-[16px]">
              We help fashion, abaya, streetwear, boutique and ecommerce brands across Riyadh,
              Jeddah, Dammam, Dubai, Abu Dhabi, Doha, Kuwait City, Manama and Muscat create
              premium clothing labels and packaging details that look finished, durable and ready
              for retail.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/quote" className="btn-primary">
                Request GCC pricing
              </Link>
              <Link href="/gallery" className="btn-ghost">
                View product quality →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line py-16">
        <div className="container-lux grid gap-8 md:grid-cols-3">
          {[
            ["Products", "Woven labels, satin labels, hang tags, stickers, cards, zipper bags, packaging sleeves and patches."],
            ["Markets", "Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman and worldwide fashion export markets."],
            ["Best for", "Premium apparel, modest fashion, uniforms, sportswear, streetwear, boutiques and ecommerce brands."],
          ].map(([title, copy]) => (
            <Reveal key={title}>
              <div className="glass h-full rounded-3xl p-6">
                <h2 className="display text-2xl text-cream">{title}</h2>
                <p className="mt-4 text-[14px] leading-relaxed text-cream-muted">{copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-14 sm:py-28">
        <div className="container-lux grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="eyebrow">
                <span className="h-px w-8 bg-champagne/60" />
                Search terms we serve
              </span>
              <h2 className="display mt-5 text-4xl sm:text-5xl">
                Built for English and Arabic buyers.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-cream-muted">
                Gulf buyers search in both English and Arabic. This page is written to help serious
                customers find the right supplier for garment labels, hang tags and premium printing
                accessories without keyword stuffing or low-quality doorway content.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="grid gap-px overflow-hidden rounded-4xl border border-line bg-line sm:grid-cols-2">
              <div className="bg-ink p-6">
                <h3 className="text-[11px] uppercase tracking-widest2 text-champagne">Arabic</h3>
                <ul className="mt-4 space-y-3 text-[15px] text-cream-muted" dir="rtl">
                  {arabicTerms.map((term) => <li key={term}>{term}</li>)}
                </ul>
              </div>
              <div className="bg-ink p-6">
                <h3 className="text-[11px] uppercase tracking-widest2 text-champagne">Industries</h3>
                <ul className="mt-4 space-y-3 text-[14px] text-cream-muted">
                  {industries.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <GallerySection items={gallery} limit={12} showAllLink />
    </SiteShell>
  );
}
