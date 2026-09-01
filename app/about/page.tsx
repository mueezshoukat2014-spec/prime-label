import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent, getProducts } from "@/lib/data";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `About Us — ${BRAND_NAME} | Custom Label & Branding Studio`,
  description:
    "Prime Labels International is a custom garment branding studio producing woven labels, satin labels, hang tags and packaging for fashion brands across the GCC, UK, USA and worldwide.",
  alternates: {
    canonical: `${SITE_URL}/about`,
    languages: { en: `${SITE_URL}/about`, "x-default": `${SITE_URL}/about` },
  },
};

/** Defaults — every text/photo below is overridable from Site Settings. */
const DEFAULTS = {
  aboutHeroTitle: "The studio behind the label.",
  aboutHeroSub:
    "Prime Labels International is a custom garment branding studio. We produce the woven labels, satin labels, hang tags, patches and packaging accessories that make clothing brands feel finished — from first collections of 100 units to seasonal runs in the tens of thousands.",
  aboutStory:
    "We started with a simple observation: the difference between a garment and a brand is in the details most suppliers treat as an afterthought. The label your customer touches at the collar. The tag they read before they buy. The ribbon they untie at home. We built our studio around obsessing over exactly those details — high-density weaving, Pantone-matched thread, skin-soft finishes and packaging that photographs beautifully. Today we produce for streetwear founders, abaya houses, boutiques and e-commerce brands across Saudi Arabia, the GCC, the UK, the USA and beyond — every order with a free digital proof before production, and DDP delivery to the door.",
  aboutImg1: "/about/craft-weaving.jpg",
  aboutImg2: "/about/craft-inspection.jpg",
  aboutImg3: "/about/craft-packing.jpg",
};

const VALUES = [
  {
    t: "Proof before production",
    d: "A free, accurate digital proof within 24 hours — nothing is woven, printed or engraved until you approve it in writing.",
  },
  {
    t: "Low minimums, export quality",
    d: "MOQs from 100 units so new brands get the same weave density and finishing that big labels demand.",
  },
  {
    t: "One coordinated kit",
    d: "Labels, tags, seals, ribbons and bags produced together — Pantone-matched, and shipped as one consolidated DDP parcel.",
  },
  {
    t: "Straight answers",
    d: "Real tolerances, honest timelines and quotes that are the final number. If something isn't producible, we say so and propose what is.",
  },
];

export default async function AboutPage() {
  const [site, products] = await Promise.all([getSiteContent(), getProducts()]);
  const s = site as Record<string, string>;
  const c = {
    title: s.aboutHeroTitle?.trim() || DEFAULTS.aboutHeroTitle,
    sub: s.aboutHeroSub?.trim() || DEFAULTS.aboutHeroSub,
    story: s.aboutStory?.trim() || DEFAULTS.aboutStory,
    img1: s.aboutImg1?.trim() || DEFAULTS.aboutImg1,
    img2: s.aboutImg2?.trim() || DEFAULTS.aboutImg2,
    img3: s.aboutImg3?.trim() || DEFAULTS.aboutImg3,
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#page`,
      name: `About ${BRAND_NAME}`,
      url: `${SITE_URL}/about`,
      about: { "@id": `${SITE_URL}/#organization` },
      description: c.sub,
    },
    breadcrumbJsonLd([{ name: "About", path: "/about" }]),
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* hero */}
      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-20">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              About us
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              {c.title.includes(" the ") || !c.title.includes(".") ? (
                c.title
              ) : (
                <>
                  {c.title.split(".")[0].split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="gradient-text italic">
                    {c.title.split(".")[0].split(" ").slice(-1)}.
                  </span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">{c.sub}</p>
          </Reveal>
        </div>
      </section>

      {/* photos strip */}
      <section className="relative pb-14 sm:pb-20">
        <div className="container-lux">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { src: c.img1, alt: "Jacquard looms weaving custom clothing labels with gold thread" },
              { src: c.img2, alt: "Quality inspection of finished woven labels" },
              { src: c.img3, alt: "Coordinated brand packaging being prepared for shipment" },
            ].map((img, i) => (
              <Reveal key={img.src} delay={i * 0.07}>
                <div className={`relative overflow-hidden rounded-3xl border border-line shadow-soft ${i === 1 ? "sm:mt-10" : ""}`}>
                  <img src={img.src} alt={img.alt} loading={i === 0 ? "eager" : "lazy"} className="aspect-[4/3] w-full object-cover" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* story */}
      <section className="relative border-t border-line py-14 sm:py-24">
        <div className="container-lux">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <h2 className="display text-3xl sm:text-5xl">
                Details most people never notice.{" "}
                <span className="gradient-text italic">Every customer feels.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5">
                {c.story.split(/\n\s*\n|\. (?=[A-Z]We built)/).length > 1
                  ? c.story.split(/\n\s*\n/).map((p, i) => (
                      <p key={i} className="text-[15px] leading-relaxed text-cream-muted">{p}</p>
                    ))
                  : <p className="text-[15px] leading-relaxed text-cream-muted">{c.story}</p>}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="relative border-t border-line py-14 sm:py-24">
        <div className="container-lux">
          <Reveal>
            <h2 className="display text-3xl sm:text-4xl">How we work</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={i * 0.05}>
                <div className="h-full rounded-2xl border border-line bg-surface/30 p-6">
                  <span className="display text-3xl text-champagne/50">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-[16px] font-semibold text-cream">{v.t}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-cream-muted">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* what we make + CTA */}
      <section className="relative border-t border-line py-14 sm:py-24">
        <div className="container-lux">
          <Reveal>
            <h2 className="display text-3xl sm:text-4xl">What we make</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(products as any[]).slice(0, 8).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.04}>
                <Link
                  href={`/products/${p.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-line transition-all duration-300 hover:border-champagne/40"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img src={p.image} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3.5">
                    <p className="text-[13px] font-medium text-cream group-hover:text-champagne">{p.title}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-14 rounded-3xl border border-champagne/25 bg-surface/40 p-8 text-center sm:p-12">
              <h2 className="display text-3xl sm:text-4xl">Let&apos;s build your brand kit.</h2>
              <p className="mx-auto mt-3 max-w-xl text-[14px] text-cream-muted">
                Tell us what you&apos;re making — a tailored quote with a free digital proof lands within 24 hours.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                <Link href="/quote" className="btn-primary !py-3.5 !px-7 text-[13px] shadow-glow-sm">
                  Customize Your Order
                </Link>
                <Link href="/work" className="text-[13px] text-cream-muted underline underline-offset-4 transition-colors hover:text-champagne">
                  See case studies →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
