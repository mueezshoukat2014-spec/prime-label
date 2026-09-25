import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent, getProducts } from "@/lib/data";
import { waLink, waProductLink } from "@/lib/whatsapp";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Custom Labels, Hang Tags & Brand Packaging — All Products",
  description:
    "Browse every garment branding product we produce: custom woven labels, satin labels, hang tags, stickers, packaging sleeves, zipper bags, woven patches and steel logo tags. Low MOQs, 24h digital proofs, DDP delivery worldwide.",
  alternates: { canonical: `${SITE_URL}/products` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/products`,
    title: "Custom Labels, Hang Tags & Brand Packaging — All Products",
    description:
      "The complete Prime Labels catalogue: woven & satin labels, hang tags, stickers, packaging and more — low MOQ, DDP delivery to the GCC, UK, USA and worldwide.",
    siteName: BRAND_NAME,
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: BRAND_NAME }],
  },
  twitter: { card: "summary_large_image" },
};

export default async function ProductsCatalogue() {
  const [site, products] = await Promise.all([getSiteContent(), getProducts()]);
  const url = `${SITE_URL}/products`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${url}#catalogue`,
      name: "Custom clothing labels and brand packaging products",
      itemListElement: (products as any[]).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: `${SITE_URL}/products/${p.slug}`,
      })),
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" },
    ]),
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-40 sm:pb-24">
        <div className="pointer-events-none absolute -left-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-wide2 text-cream-dim">
              <Link href="/" className="transition-colors hover:text-champagne">Home</Link>
              <span aria-hidden>/</span>
              <span className="text-cream-muted">Products</span>
            </nav>
            <h1 className="display text-4xl sm:text-5xl">
              Every piece of <span className="gradient-text italic">your brand</span>,<br className="hidden sm:block" />
              produced under one roof.
            </h1>
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-cream-muted">
              From high-density woven labels to steel logo tags — pick a product to see
              folds, finishes and specs, or ask for a tailored quote. Every order ships
              DDP with a free digital proof within 24 hours.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(products as any[]).map((p, i) => (
              <Reveal key={p.slug} delay={0.05 * (i % 4)}>
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line transition-all duration-300 hover:border-champagne/40">
                  <Link href={`/products/${p.slug}`} className="relative block aspect-square overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading={i < 4 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <Link href={`/products/${p.slug}`} className="text-[15px] font-medium text-cream transition-colors hover:text-champagne">
                      {p.title}
                    </Link>
                    {p.tagline && <p className="mt-1 line-clamp-2 text-[12.5px] text-cream-muted">{p.tagline}</p>}
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wide2 text-cream-dim">
                      {p.moq != null && <span className="rounded-full border border-cream/10 px-2 py-0.5">MOQ {p.moq}</span>}
                      {p.turnaround != null && <span className="rounded-full border border-cream/10 px-2 py-0.5">{p.turnaround}-day make</span>}
                      <span className="rounded-full border border-champagne/25 px-2 py-0.5 text-champagne">{p.priceFrom || "On request"}</span>
                    </div>
                    <div className="mt-auto flex gap-2 pt-4">
                      <Link href={`/products/${p.slug}`} className="btn-ghost flex-1 justify-center !py-2 text-[12px]">
                        Details
                      </Link>
                      <a
                        href={waProductLink(p.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex-1 justify-center !py-2 text-[12px]"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-champagne/20 bg-champagne/[0.04] p-8 text-center">
              <p className="display text-2xl">Not sure which product fits your brand?</p>
              <p className="max-w-xl text-[13.5px] text-cream-muted">
                Tell us what you are launching and we will recommend the right label,
                tag and packaging mix — with a tailored quote within 24 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/quote" className="btn-primary">Get a free quote</Link>
                <a
                  href={waLink("Hi Prime Labels! Please help me choose the right labels & packaging for my brand.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
