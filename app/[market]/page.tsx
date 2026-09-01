import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent, getProducts } from "@/lib/data";
import { MARKETS, getMarket } from "@/lib/markets";
import { normalizeWaLink } from "@/lib/whatsapp";
import { SITE_URL, BRAND_NAME, SEO_PRODUCTS, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Only the defined market slugs resolve; everything else 404s. */
export function generateStaticParams() {
  return MARKETS.map((m) => ({ market: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { market: string };
}): Promise<Metadata> {
  const market = getMarket(params.market);
  if (!market) return { title: "Page not found" };
  const url = `${SITE_URL}/${market.slug}`;
  return {
    title: market.metaTitle,
    description: market.metaDescription,
    keywords: market.keywords,
    alternates: { canonical: url, languages: { en: url, "x-default": url } },
    openGraph: {
      type: "website",
      url,
      title: market.metaTitle,
      description: market.metaDescription,
      siteName: BRAND_NAME,
      images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: BRAND_NAME }],
    },
    twitter: { card: "summary_large_image", title: market.metaTitle, description: market.metaDescription },
  };
}

export default async function MarketPage({ params }: { params: { market: string } }) {
  const market = getMarket(params.market);
  if (!market) notFound();

  const [site, products] = await Promise.all([getSiteContent(), getProducts()]);
  const url = `${SITE_URL}/${market.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      name: `Custom clothing labels and garment branding for ${market.country}`,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: { "@type": "Country", name: market.country },
      serviceType: SEO_PRODUCTS,
      description: market.metaDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: market.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    breadcrumbJsonLd([{ name: market.country, path: `/${market.slug}` }]),
  ];

  const wa = normalizeWaLink(site.whatsapp);

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* hero */}
      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-24">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[12px] text-cream-dim">
              <Link href="/" className="transition-colors hover:text-champagne">Home</Link>
              <span aria-hidden>/</span>
              <span className="text-cream-muted">{market.country}</span>
            </nav>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              {market.flag} {market.country}
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              {market.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">{market.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/quote" data-cursor="Quote" className="btn-primary !py-3.5 !px-7 text-[13px] shadow-glow-sm">
                Customize Your Order
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-[13px] font-medium text-cream-muted transition-all duration-300 hover:border-champagne/60 hover:text-champagne"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                </svg>
                Ask on WhatsApp
              </a>
            </div>
            {/* trust strip */}
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[11px] uppercase tracking-wide2 text-cream-dim">
              <span>✦ Free 24h digital proof</span>
              <span>✦ {market.delivery.split("(")[0].trim()}</span>
              <span>✦ Low MOQ from 100 units</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* delivery + personas */}
      <section className="relative border-t border-line py-14 sm:py-24">
        <div className="container-lux">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div>
                <h2 className="display text-3xl sm:text-4xl">
                  Delivered DDP across <span className="gradient-text italic">{market.country}.</span>
                </h2>
                <p className="mt-4 text-[14px] leading-relaxed text-cream-muted">
                  Express, door-to-door and customs-cleared. We ship to {market.cities.slice(0, -1).join(", ")} and {market.cities.slice(-1)} — and everywhere in between.
                </p>
                <div className="mt-6 rounded-2xl border border-champagne/20 bg-surface/40 p-5">
                  <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">Express delivery</p>
                  <p className="mt-1.5 text-[14px] text-cream">{market.delivery}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {market.cities.map((c) => (
                    <span key={c} className="rounded-full border border-line px-3.5 py-1.5 text-[12px] text-cream-muted">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div>
                <h2 className="display text-3xl sm:text-4xl">Who we work with</h2>
                <ul className="mt-6 space-y-4">
                  {market.personas.map((p) => (
                    <li key={p} className="flex gap-3 rounded-2xl border border-line bg-surface/30 p-4">
                      <span className="mt-0.5 text-champagne">✦</span>
                      <span className="text-[13.5px] leading-relaxed text-cream-muted">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* products grid */}
      <section className="relative border-t border-line py-14 sm:py-24">
        <div className="container-lux">
          <Reveal>
            <h2 className="display text-3xl sm:text-4xl">
              Everything your brand needs, <span className="gradient-text italic">one supplier.</span>
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(products as any[]).slice(0, 8).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.04}>
                <Link
                  href={`/products/${p.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-line transition-all duration-300 hover:border-champagne/40"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={p.image}
                      alt={`${p.title} for ${market.country} clothing brands`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3.5">
                    <p className="text-[13px] font-medium text-cream group-hover:text-champagne">{p.title}</p>
                    {p.moq != null && (
                      <p className="mt-1 text-[11px] uppercase tracking-wide2 text-cream-dim">MOQ {p.moq} units</p>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative border-t border-line py-14 sm:py-24">
        <div className="container-lux">
          <Reveal>
            <h2 className="display text-3xl sm:text-4xl">Questions from {market.country} brands</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {market.faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <div className="rounded-2xl border border-line bg-surface/30 p-5">
                  <h3 className="text-[14px] font-medium text-cream">{f.q}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15}>
            <div className="mt-12 rounded-3xl border border-champagne/25 bg-surface/40 p-8 text-center sm:p-12">
              <h2 className="display text-3xl sm:text-4xl">
                Ready to brand your next collection?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[14px] text-cream-muted">
                Send your design and quantity — a tailored quote for {market.country} lands in your inbox within 24 hours.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                <Link href="/quote" className="btn-primary !py-3.5 !px-7 text-[13px] shadow-glow-sm">
                  Customize Your Order
                </Link>
                <Link
                  href="/gcc-custom-labels"
                  className="text-[13px] text-cream-muted underline underline-offset-4 transition-colors hover:text-champagne"
                >
                  GCC custom labels guide →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
