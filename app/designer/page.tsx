import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import LabelDesigner from "@/components/designer/LabelDesigner";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Design Your Label Live — See Your Logo Woven | ${BRAND_NAME}`,
  description:
    "Upload your logo and see it on a woven or satin label instantly. Choose style, fold and size — then get a tailored quote with a free digital proof in 24 hours.",
  alternates: {
    canonical: `${SITE_URL}/designer`,
    languages: { en: `${SITE_URL}/designer`, "x-default": `${SITE_URL}/designer` },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/designer`,
    title: "Design Your Label Live — Prime Labels",
    description: "Upload your logo, see it woven in seconds, and get a quote in 24 hours.",
    siteName: BRAND_NAME,
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: BRAND_NAME }],
  },
};

export default async function DesignerPage() {
  const site = await getSiteContent();
  const jsonLd = breadcrumbJsonLd([{ name: "Label Designer", path: "/designer" }]);

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-40 sm:pb-24">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              Live label designer
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              See your logo <span className="gradient-text italic">woven. Right now.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">
              Upload your logo, pick a style and watch your label come to life — then send the design
              straight to our team for a tailored quote with a free production-accurate proof.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12">
              <LabelDesigner />
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
