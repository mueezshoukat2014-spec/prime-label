import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import GallerySection from "@/components/GallerySection";
import { Reveal } from "@/components/anim";
import { getSiteContent, getGallery } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery of Custom Labels, Hang Tags & Packaging",
  description:
    "View premium custom woven labels, hang tags, stickers, packaging, patches and garment branding accessories made for fashion brands across Saudi Arabia, UAE, GCC and worldwide.",
  keywords: ["custom labels gallery", "woven labels examples", "hang tags portfolio", "packaging for clothing brands", "GCC apparel branding"],
  alternates: {
    canonical: "https://primelabelsintl.com/gallery",
    languages: { en: "https://primelabelsintl.com/gallery", "x-default": "https://primelabelsintl.com/gallery" },
  },
};

export default async function GalleryPage() {
  const [site, gallery] = await Promise.all([getSiteContent(), getGallery()]);
  return (
    <SiteShell
      footer={
        <Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />
      }
    >
      <section className="pt-36 sm:pt-44">
        <div className="container-lux">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              The work, in full
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="display mt-6 text-6xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              The <span className="gradient-text italic">gallery.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream-muted">
              Real pieces, real detail. Browse the full collection of labels,
              tags, stickers and packaging we have crafted. Tap any image to
              view it up close.
            </p>
          </Reveal>
        </div>
      </section>
      <GallerySection items={gallery} showAllLink={false} />
    </SiteShell>
  );
}
