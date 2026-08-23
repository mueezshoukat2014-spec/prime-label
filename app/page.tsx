import SiteShell from "@/components/SiteShell";
import Hero from "@/components/Hero";
import LogoStrip from "@/components/LogoStrip";
import About from "@/components/About";
import ProductsShowcase from "@/components/ProductsShowcase";
import GsapFeature from "@/components/GsapFeature";
import Reels from "@/components/Reels";
import Process from "@/components/Process";
import GallerySection from "@/components/GallerySection";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import SectionDots from "@/components/SectionDots";
import ScrollToTopOnLoad from "@/components/ScrollToTopOnLoad";
import SeoMarketSection from "@/components/SeoMarketSection";
import {
  getProducts,
  getFaqs,
  getTestimonials,
  getSiteContent,
  getGallery,
  getCategoryNames,
  getReels,
} from "@/lib/data";
import { SITE_URL, BRAND_NAME, GCC_COUNTRIES, SEO_PRODUCTS, productsJsonLd } from "@/lib/seo";

// The catalogue is edited from the admin dashboard, so the homepage must read
// from Neon on each request instead of being frozen at build time. Without
// this, a newly added product would not appear until the next deploy.
export const revalidate = 0;
export const dynamic = "force-dynamic";

// Placeholder client/brand wordmarks. Replace with real { name, logoUrl } entries
// (e.g. { name: "Brand Co", logoUrl: "/logos/brand-co.svg" }). >6 entries => marquee.
const BRAND_LOGOS = [
  { name: "Maison" },
  { name: "Atelier" },
  { name: "Veil & Co" },
  { name: "Noir Label" },
  { name: "Luxe Stitch" },
  { name: "Threadworks" },
  { name: "Vestire" },
  { name: "Clothier" },
];

export default async function Home() {
  const [products, faqs, testimonials, site, gallery, reels, categoryNames] = await Promise.all([
    getProducts(),
    getFaqs(),
    getTestimonials(),
    getSiteContent(),
    getGallery(),
    getReels(),
    getCategoryNames(),
  ]);

  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${SITE_URL}/#services-list`,
      name: "Premium garment branding services",
      itemListElement: products.map((product: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: product.title,
          description: product.description,
          image: product.image?.startsWith("http") ? product.image : `${SITE_URL}${product.image}`,
          provider: { "@id": `${SITE_URL}/#organization`, name: BRAND_NAME },
          serviceType: "Garment branding accessories",
          areaServed: GCC_COUNTRIES.map((name) => ({ "@type": "Country", name })),
          url: `${SITE_URL}/quote?product=${encodeURIComponent(product.title)}`,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item: any) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${SITE_URL}/#gcc-apparel-branding-service`,
      name: "Custom clothing labels, hang tags and packaging for GCC brands",
      provider: { "@id": `${SITE_URL}/#organization` },
      serviceType: SEO_PRODUCTS,
      areaServed: GCC_COUNTRIES.map((name) => ({ "@type": "Country", name })),
    },
    // Product rich results: material, MOQ and custom-quote offers per product.
    productsJsonLd(products as any[]),
  ];

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
    <ScrollToTopOnLoad />
    <SiteShell
      footer={
        <Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />
      }
    >
      <Hero />
      <LogoStrip logos={BRAND_LOGOS} />
      <About />
      <ProductsShowcase products={products} />
      <SeoMarketSection />
      <GsapFeature />
      <Reels reels={reels} />
      <Process />
      <GallerySection items={gallery} limit={8} categoryNames={categoryNames} />
      <Testimonials items={testimonials as any} />
      <FAQ items={faqs} />
      <FinalCTA whatsapp={site.whatsapp} instagram={site.instagram} />
      <SectionDots />
    </SiteShell>
    </>
  );
}
