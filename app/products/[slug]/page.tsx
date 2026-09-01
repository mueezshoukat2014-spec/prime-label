import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import ProductPdp from "@/components/pdp/ProductPdp";
import { Reveal } from "@/components/anim";
import { getProducts, getSiteContent, getPdpOverride } from "@/lib/data";
import { getPdpContent, mergePdpContent, type PdpOverrideRow } from "@/lib/pdp-content";
import { SITE_URL, BRAND_NAME, DEMAND_MARKETS, breadcrumbJsonLd } from "@/lib/seo";
import { AR_PDP } from "@/lib/pdp-content-ar";

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
  if (!product) return { title: "Product not found" };
  const content = mergePdpContent(
    getPdpContent(product.slug, product.title),
    (await getPdpOverride(product.slug)) as PdpOverrideRow | null
  );
  const url = `${SITE_URL}/products/${product.slug}`;
  const title = `${content.h1} | Low MOQ ${product.moq ?? 100} — ${BRAND_NAME}`;
  const description = `${content.intro.slice(0, 140)} Free 24h digital proof, DDP express delivery to KSA, UAE, GCC, UK & USA.`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: AR_PDP[product.slug]
        ? { en: url, ar: `${SITE_URL}/ar/products/${product.slug}`, "x-default": url }
        : { en: url, "x-default": url },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: BRAND_NAME,
      images: [
        {
          url: product.image?.startsWith("http") ? product.image : `${SITE_URL}${product.image}`,
          width: 1200,
          height: 900,
          alt: product.title,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, site, allProducts, override] = await Promise.all([
    findProduct(params.slug),
    getSiteContent(),
    getProducts(),
    getPdpOverride(params.slug),
  ]);
  if (!product) notFound();

  const content = mergePdpContent(
    getPdpContent(product.slug, product.title),
    override as PdpOverrideRow | null
  );
  const url = `${SITE_URL}/products/${product.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${url}#product`,
      name: content.h1,
      description: content.intro,
      image: [product.image, ...(product.gallery || [])]
        .filter(Boolean)
        .slice(0, 4)
        .map((g: string) => (g.startsWith("http") ? g : `${SITE_URL}${g}`)),
      brand: { "@id": `${SITE_URL}/#organization` },
      url,
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/quote?product=${encodeURIComponent(product.title)}`,
        priceCurrency: "USD",
        price: "0",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: "0",
          priceCurrency: "USD",
          description: "Custom quoted per order — tailored quote within 24 hours",
        },
        availability: "https://schema.org/InStock",
        eligibleQuantity: product.moq
          ? { "@type": "QuantitativeValue", minValue: product.moq, unitText: "units" }
          : undefined,
        areaServed: DEMAND_MARKETS.map((m) => ({ "@type": "Country", name: m })),
        seller: { "@id": `${SITE_URL}/#organization` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    breadcrumbJsonLd([
      { name: "Products", path: "/#products" },
      { name: product.title, path: `/products/${product.slug}` },
    ]),
  ];

  const others = (allProducts as any[]).filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-40 sm:pb-24">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          {/* breadcrumb */}
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[12px] text-cream-dim">
              <Link href="/" className="transition-colors hover:text-champagne">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/#products" className="transition-colors hover:text-champagne">Products</Link>
              <span aria-hidden>/</span>
              <span className="text-cream-muted">{product.title}</span>
            </nav>
          </Reveal>

          <ProductPdp product={product} content={content} />

          {/* other products */}
          {others.length > 0 && (
            <Reveal delay={0.1}>
              <div className="mt-20 border-t border-line pt-12">
                <h2 className="display text-3xl">Complete the set</h2>
                <p className="mt-2 text-[13.5px] text-cream-muted">
                  Brands pairing {product.title.toLowerCase()} usually add these.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {others.map((p: any) => (
                    <Link
                      key={p.slug}
                      href={`/products/${p.slug}`}
                      className="group overflow-hidden rounded-2xl border border-line transition-all duration-300 hover:border-champagne/40"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.title}
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
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
