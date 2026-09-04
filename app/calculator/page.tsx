import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import CostCalculator from "@/components/CostCalculator";
import { Reveal } from "@/components/anim";
import { getSiteContent, getProducts } from "@/lib/data";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Label Cost Calculator — See How Volume Pricing Works | ${BRAND_NAME}`,
  description:
    "Slide the quantity and see how per-piece cost bands drop for woven labels, hang tags and packaging. Understand MOQ economics — then get your exact quote in 24 hours.",
  alternates: {
    canonical: `${SITE_URL}/calculator`,
    languages: { en: `${SITE_URL}/calculator`, "x-default": `${SITE_URL}/calculator` },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/calculator`,
    title: "Label Cost Calculator — Prime Labels",
    description: "See how per-piece costs drop with quantity — then get an exact quote in 24 hours.",
    siteName: BRAND_NAME,
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: BRAND_NAME }],
  },
};

const FAQS = [
  {
    q: "Why does the per-piece cost drop with quantity?",
    a: "Every custom order carries one-time work: weaving program setup, color matching, proof rounds and shipping. Spread over 500 pieces that overhead is significant per piece; spread over 5,000 it almost disappears.",
  },
  {
    q: "Why don't you show exact prices?",
    a: "Because two orders of the same quantity can differ 2–3× in cost depending on size, weave density, finishes (foil, emboss), folds and destination. A generic price table would mislead you — a tailored quote takes 24 hours and is exact.",
  },
  {
    q: "What's the smartest quantity for a new brand?",
    a: "Most new brands order 2–5× the MOQ: enough to reach a better cost band, small enough to avoid dead stock. For woven labels that's typically 200–500 pieces.",
  },
  {
    q: "Can I mix sizes or designs within one quantity?",
    a: "Different designs are produced as separate runs, but ordering them together still shares shipping and proof work — combining items into one order is usually cheaper than two separate orders.",
  },
];

export default async function CalculatorPage() {
  const [site, products] = await Promise.all([getSiteContent(), getProducts()]);

  const calcProducts = products
    .filter((p) => p.moq)
    .map((p) => ({ slug: p.slug, title: p.title, moq: Number(p.moq) || 100 }));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    breadcrumbJsonLd([{ name: "Cost Calculator", path: "/calculator" }]),
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-24">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="h-px w-8 bg-champagne/60" />
                  Cost calculator
                </span>
                <h1 className="display mt-5 text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                  Order more, <span className="gradient-text italic">pay less per piece.</span>
                </h1>
                <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream-muted">
                  Custom production has one-time setup work baked into every order. Slide the
                  quantity and watch the per-piece band drop — then send us the quantity for an
                  exact quote within 24 hours.
                </p>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="mt-8 space-y-3">
                  {FAQS.map((f) => (
                    <div key={f.q} className="rounded-2xl border border-line bg-surface/30 p-4">
                      <h2 className="text-[13.5px] font-semibold text-cream">{f.q}</h2>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream-muted">{f.a}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-[12px] text-cream-dim">
                  Planning a full launch? See the{" "}
                  <Link href="/starter-kit" className="text-champagne underline underline-offset-4">
                    Brand Starter Kit
                  </Link>{" "}
                  — bundling items shares shipping and proof costs too.
                </p>
              </Reveal>
            </div>

            <div className="lg:sticky lg:top-28">
              <Reveal delay={0.08}>
                <CostCalculator products={calcProducts} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
