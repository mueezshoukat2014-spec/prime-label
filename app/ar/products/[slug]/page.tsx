import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getProducts, getSiteContent } from "@/lib/data";
import { getArPdpContent, AR_PDP } from "@/lib/pdp-content-ar";
import { normalizeWaLink } from "@/lib/whatsapp";
import { SITE_URL, BRAND_NAME, DEMAND_MARKETS } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function findProduct(slug: string) {
  const products = await getProducts();
  return (products as any[]).find((p) => p.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await findProduct(params.slug);
  const ar = getArPdpContent(params.slug);
  if (!product || !ar) return { title: "الصفحة غير موجودة" };
  const url = `${SITE_URL}/ar/products/${product.slug}`;
  const enUrl = `${SITE_URL}/products/${product.slug}`;
  const title = `${ar.h1} | أقل كمية ${product.moq ?? 100} قطعة — برايم ليبلز`;
  const description = `${ar.intro.slice(0, 120)} بروفة مجانية خلال 24 ساعة وشحن سريع DDP للسعودية والخليج.`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ar: url, en: enUrl, "x-default": enUrl },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: BRAND_NAME,
      locale: "ar_SA",
      images: [
        {
          url: product.image?.startsWith("http") ? product.image : `${SITE_URL}${product.image}`,
          width: 1200,
          height: 900,
          alt: ar.name,
        },
      ],
    },
  };
}

export default async function ArProductPage({ params }: { params: { slug: string } }) {
  const [product, site, allProducts] = await Promise.all([
    findProduct(params.slug),
    getSiteContent(),
    getProducts(),
  ]);
  const ar = getArPdpContent(params.slug);
  if (!product || !ar) notFound();

  const url = `${SITE_URL}/ar/products/${product.slug}`;
  const wa = normalizeWaLink(site.whatsapp);
  const waAr = `https://wa.me/${(wa.match(/wa\.me\/(\d+)/) || [])[1] || "923244999224"}?text=${encodeURIComponent(
    `مرحباً، أرغب بالاستفسار عن ${ar.name}`
  )}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${url}#product`,
      name: ar.h1,
      description: ar.intro,
      inLanguage: "ar",
      image: [product.image, ...(product.gallery || [])]
        .filter(Boolean)
        .slice(0, 4)
        .map((g: string) => (g.startsWith("http") ? g : `${SITE_URL}${g}`)),
      brand: { "@id": `${SITE_URL}/#organization` },
      url,
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/ar/quote?product=${encodeURIComponent(product.title)}`,
        priceCurrency: "USD",
        price: "0",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: "0",
          priceCurrency: "USD",
          description: "تسعير مخصص لكل طلب — عرض سعر خلال 24 ساعة",
        },
        availability: "https://schema.org/InStock",
        eligibleQuantity: product.moq
          ? { "@type": "QuantitativeValue", minValue: product.moq, unitText: "قطعة" }
          : undefined,
        areaServed: DEMAND_MARKETS.map((m) => ({ "@type": "Country", name: m })),
        seller: { "@id": `${SITE_URL}/#organization` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: "ar",
      mainEntity: ar.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  const images = [product.image, ...(product.gallery || [])].filter(Boolean).slice(0, 4);
  const others = (allProducts as any[])
    .filter((p) => p.slug !== product.slug && AR_PDP[p.slug])
    .slice(0, 4);

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div dir="rtl" lang="ar" className="notranslate" translate="no">
        <section className="relative overflow-hidden pt-28 pb-14 sm:pt-40 sm:pb-24">
          <div className="pointer-events-none absolute -left-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
          <div className="container-lux relative">
            {/* breadcrumb */}
            <Reveal>
              <nav aria-label="Breadcrumb" className="arabic-text mb-6 flex flex-wrap items-center gap-2 text-[12px] text-cream-dim">
                <Link href="/ar" className="transition-colors hover:text-champagne">الرئيسية</Link>
                <span aria-hidden>/</span>
                <span className="text-cream-muted">{ar.name}</span>
              </nav>
            </Reveal>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
              {/* gallery */}
              <Reveal>
                <div>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line shadow-soft">
                    <img src={images[0]} alt={ar.name} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                  </div>
                  {images.length > 1 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {images.slice(1).map((g: string, i: number) => (
                        <div key={g} className="relative aspect-square overflow-hidden rounded-xl border border-line">
                          <img src={g} alt={`${ar.name} ${i + 2}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>

              {/* details */}
              <div className="min-w-0">
                <Reveal>
                  <h1 className="arabic-display text-3xl font-bold leading-[1.3] sm:text-5xl">{ar.h1}</h1>
                  <p className="arabic-text mt-4 text-[15px] leading-relaxed text-cream-muted">{ar.intro}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      product.moq ? `أقل كمية ${product.moq} قطعة` : "كميات منخفضة",
                      "بروفة مجانية خلال 24 ساعة",
                      "شحن DDP سريع",
                    ].map((t) => (
                      <span key={t} className="arabic-text rounded-full border border-champagne/30 bg-champagne/[0.07] px-3.5 py-1.5 text-[12px] text-champagne">
                        {t}
                      </span>
                    ))}
                  </div>
                </Reveal>

                {ar.finishes.length > 0 && (
                  <Reveal delay={0.05}>
                    <div className="mt-7">
                      <p className="arabic-text mb-2.5 text-[12px] text-cream-dim">الخامات والتشطيبات</p>
                      <div className="flex flex-wrap gap-2">
                        {ar.finishes.map((f) => (
                          <span key={f} className="arabic-text rounded-full border border-line px-4 py-2 text-[12.5px] text-cream-muted">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}

                <Reveal delay={0.1}>
                  <div className="mt-8 space-y-3">
                    <Link
                      href={`/ar/quote?product=${encodeURIComponent(product.title)}`}
                      className="btn-primary w-full justify-center !py-4 text-[13px] shadow-glow-sm sm:w-auto sm:!px-8"
                    >
                      اطلب تسعيرة خلال 24 ساعة
                    </Link>
                    <a
                      href={waAr}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="arabic-text inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-[13px] font-medium text-cream-muted transition-all duration-300 hover:border-champagne/60 hover:text-champagne sm:w-auto"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                        <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                      </svg>
                      استفسر على واتساب
                    </a>
                  </div>
                </Reveal>

                {/* specs */}
                <Reveal delay={0.12}>
                  <div className="mt-10 overflow-hidden rounded-2xl border border-line">
                    <div className="arabic-text bg-surface/40 px-5 py-4 text-[13px] font-semibold text-cream">
                      المواصفات والشحن
                    </div>
                    <dl className="divide-y divide-line">
                      {ar.specs.map((s) => (
                        <div key={s.label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[140px_1fr] sm:gap-4">
                          <dt className="arabic-text text-[12px] text-cream-dim">{s.label}</dt>
                          <dd className="arabic-text text-[13px] leading-relaxed text-cream-muted">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </Reveal>

                {/* FAQ */}
                <Reveal delay={0.14}>
                  <div className="mt-8">
                    <h2 className="arabic-display text-2xl font-bold">أسئلة شائعة</h2>
                    <div className="mt-4 space-y-3">
                      {ar.faqs.map((f) => (
                        <div key={f.q} className="rounded-2xl border border-line bg-surface/30 p-5">
                          <h3 className="arabic-text text-[14px] font-semibold text-cream">{f.q}</h3>
                          <p className="arabic-text mt-2 text-[13px] leading-relaxed text-cream-muted">{f.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* other products */}
            {others.length > 0 && (
              <Reveal delay={0.1}>
                <div className="mt-16 border-t border-line pt-10">
                  <h2 className="arabic-display text-2xl font-bold">أكمل طقم براندك</h2>
                  <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {others.map((p: any) => {
                      const arOther = AR_PDP[p.slug];
                      return (
                        <Link
                          key={p.slug}
                          href={`/ar/products/${p.slug}`}
                          className="group overflow-hidden rounded-2xl border border-line transition-all duration-300 hover:border-champagne/40"
                        >
                          <div className="relative aspect-square overflow-hidden">
                            <img src={p.image} alt={arOther?.name || p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                          <div className="p-3.5">
                            <p className="arabic-text text-[13px] font-semibold text-cream group-hover:text-champagne">
                              {arOther?.name || p.title}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
