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
import {
  getProducts,
  getFaqs,
  getTestimonials,
  getSiteContent,
  getGallery,
  reels,
} from "@/lib/data";

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
  const [products, faqs, testimonials, site, gallery] = await Promise.all([
    getProducts(),
    getFaqs(),
    getTestimonials(),
    getSiteContent(),
    getGallery(),
  ]);

  return (
    <>
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
      <GsapFeature />
      <Reels reels={reels} />
      <Process />
      <GallerySection items={gallery} limit={20} />
      <Testimonials items={testimonials as any} />
      <FAQ items={faqs} />
      <FinalCTA whatsapp={site.whatsapp} instagram={site.instagram} />
      <SectionDots />
    </SiteShell>
    </>
  );
}
