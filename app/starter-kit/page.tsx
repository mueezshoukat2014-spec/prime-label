import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import QuickQuote from "@/components/QuickQuote";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Brand Starter Kit — Everything a New Fashion Brand Needs | ${BRAND_NAME}`,
  description:
    "Launch your clothing brand with one order: woven labels, hang tags, care labels and brand packaging — matched design, one supplier, one shipment. From MOQ 100.",
  alternates: {
    canonical: `${SITE_URL}/starter-kit`,
    languages: { en: `${SITE_URL}/starter-kit`, "x-default": `${SITE_URL}/starter-kit` },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/starter-kit`,
    title: "Brand Starter Kit — Prime Labels",
    description:
      "Woven labels + hang tags + care labels + packaging in one matched order. Built for new fashion brands.",
    siteName: BRAND_NAME,
    images: [{ url: "/starter/starter-box-hero.jpg", width: 1536, height: 1024, alt: "Brand Starter Kit" }],
  },
};

const INCLUDES = [
  {
    t: "Woven brand labels",
    d: "High-density damask neck labels with your logo — the signature of a serious brand. Any size, from slim 1×5 cm tapes to statement labels.",
    href: "/products/woven-labels",
  },
  {
    t: "Hang tags",
    d: "Premium board hang tags with foil, emboss or matte finishes — strung and ready to attach.",
    href: "/products/hang-tags",
  },
  {
    t: "Satin care labels",
    d: "Soft satin wash-care labels with your size runs and care symbols, compliant for retail.",
    href: "/products/satin-labels",
  },
  {
    t: "Brand packaging",
    d: "Tissue paper, stickers and zipper garment bags that turn every parcel into an unboxing moment.",
    href: "/products/brand-packaging",
  },
];

const WHY = [
  {
    t: "One matched design language",
    d: "Your logo, colours and finish are kept consistent across every piece — labels, tags and packaging are designed together, not sourced from four different vendors.",
  },
  {
    t: "One shipment, one duty payment",
    d: "Everything produced under one roof and shipped together DDP — you pay one express shipping charge instead of three or four.",
  },
  {
    t: "Launch-friendly quantities",
    d: "Woven labels and packaging start at MOQ 100 — sized for a first drop, not a warehouse. Scale quantities per item as you grow.",
  },
  {
    t: "Free proofs for every item",
    d: "You approve a digital proof for each piece in the kit before anything is produced. Unlimited revisions, no surprises.",
  },
];

const STEPS = [
  { n: "01", t: "Send your logo", d: "Any format — even a photo of a sketch. Tell us your brand's vibe and what you're launching." },
  { n: "02", t: "Get your kit proposal", d: "Within 24 hours: a tailored kit recommendation with proofs of each item and one combined quote." },
  { n: "03", t: "Approve & produce", d: "Production starts after your written approval on every proof. 7–12 working days for the full kit." },
  { n: "04", t: "One DDP delivery", d: "The complete kit ships together, duties prepaid, tracked to your door in the GCC, UK, USA or worldwide." },
];

const FAQS = [
  {
    q: "What exactly is in the Brand Starter Kit?",
    a: "A typical kit combines woven brand labels, hang tags, satin care labels and brand packaging (tissue, stickers and zipper bags) in one matched order — but it's fully modular. Take exactly the items you need.",
  },
  {
    q: "What quantities does the kit start at?",
    a: "Woven labels and brand packaging start at MOQ 100 pieces; hang tags, satin labels and stickers at 500. We size the kit to your first production run so nothing sits unused.",
  },
  {
    q: "Is a bundled kit cheaper than ordering items separately?",
    a: "Yes — combining items into one production slot and one shipment reduces setup and delivery costs, and that saving is reflected in your combined quote.",
  },
  {
    q: "Do you produce rigid boxes?",
    a: "No — we focus on labels, tags and soft packaging (tissue, stickers, zipper bags). This keeps international shipping affordable; rigid boxes make courier costs impractical.",
  },
  {
    q: "How long does the full kit take?",
    a: "Free digital proofs in 24 hours, production in 7–12 working days after approval, then express DDP shipping (3–8 days depending on your country).",
  },
];

export default async function StarterKitPage() {
  const site = await getSiteContent();

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
    breadcrumbJsonLd([{ name: "Brand Starter Kit", path: "/starter-kit" }]),
  ];

  const waHref = waLink(
    "Hi Prime Labels! I'm launching a fashion brand and I'm interested in the Brand Starter Kit 👇\n\n▪ Brand name: ____\n▪ Launching: (t-shirts / abayas / streetwear / other) ____\n▪ Items I need: (labels / hang tags / care labels / packaging) ____\n▪ Rough quantity: ____\n▪ City & Country: ____\n\n(I'll attach my logo here)"
  );

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* hero */}
      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-20">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="h-px w-8 bg-champagne/60" />
                  Brand starter kit
                </span>
                <h1 className="display mt-5 text-4xl leading-[1.05] tracking-tight sm:text-6xl">
                  Launch your brand with <span className="gradient-text italic">one order.</span>
                </h1>
                <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream-muted">
                  Woven labels, hang tags, care labels and packaging — designed as one matched set,
                  produced under one roof, delivered in one DDP shipment. Everything a new fashion
                  brand needs to look established from day one.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/quote" className="btn-primary !py-3.5 px-7 text-[13px] shadow-glow-sm">
                    Get My Kit Quote
                  </Link>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-[13px] font-medium text-cream-muted transition-all hover:border-champagne/60 hover:text-champagne"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                    </svg>
                    Plan it on WhatsApp
                  </a>
                </div>
                <p className="mt-5 text-[12px] text-cream-dim">
                  From MOQ 100 · Free digital proofs in 24h · DDP worldwide shipping
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-3xl border border-line shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/starter/starter-box-hero.jpg"
                  alt="Brand starter kit — woven labels, hang tags, care labels and packaging as one matched set"
                  className="aspect-[3/2] w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* what's inside */}
      <section className="relative pb-14 sm:pb-20">
        <div className="container-lux">
          <Reveal>
            <h2 className="display text-3xl sm:text-4xl">What&apos;s in the kit</h2>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-cream-muted">
              Fully modular — take the full set or exactly the pieces your launch needs.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUDES.map((it, i) => (
              <Reveal key={it.t} delay={i * 0.05}>
                <Link
                  href={it.href}
                  className="group block h-full rounded-2xl border border-line bg-surface/30 p-5 transition-all duration-300 hover:border-champagne/40"
                >
                  <h3 className="text-[14.5px] font-semibold text-cream group-hover:text-champagne">
                    {it.t}
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-cream-muted">{it.d}</p>
                  <span className="mt-3 inline-block text-[11.5px] text-champagne/80">
                    View product →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* why bundle */}
      <section className="relative border-t border-line/60 py-14 sm:py-20">
        <div className="container-lux">
          <Reveal>
            <h2 className="display text-3xl sm:text-4xl">Why brands bundle their launch</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {WHY.map((w, i) => (
              <Reveal key={w.t} delay={i * 0.05}>
                <div className="h-full rounded-2xl border border-line bg-surface/30 p-6">
                  <h3 className="text-[15px] font-semibold text-cream">{w.t}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-cream-muted">{w.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* how it works + quick quote */}
      <section className="relative border-t border-line/60 py-14 sm:py-20">
        <div className="container-lux">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
            <div>
              <Reveal>
                <h2 className="display text-3xl sm:text-4xl">How it works</h2>
              </Reveal>
              <div className="mt-8 space-y-4">
                {STEPS.map((s, i) => (
                  <Reveal key={s.n} delay={i * 0.05}>
                    <div className="flex gap-5 rounded-2xl border border-line bg-surface/30 p-5 sm:p-6">
                      <span className="display shrink-0 text-3xl text-champagne/50">{s.n}</span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-cream">{s.t}</h3>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-cream-muted">{s.d}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.15}>
                <div className="mt-10">
                  <h2 className="display text-2xl">Starter kit questions</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {FAQS.map((f) => (
                      <div key={f.q} className="rounded-2xl border border-line bg-surface/30 p-4">
                        <h3 className="text-[13.5px] font-semibold text-cream">{f.q}</h3>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream-muted">{f.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:sticky lg:top-28">
              <Reveal delay={0.1}>
                <QuickQuote
                  products={["Brand Starter Kit"]}
                  heading="Start your kit"
                  sub="Name + WhatsApp — we'll plan your full launch kit with you."
                />
                <p className="mt-4 text-center text-[12px] text-cream-dim">
                  or try the{" "}
                  <Link href="/designer" className="text-champagne underline underline-offset-4">
                    Live Label Designer
                  </Link>{" "}
                  first
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
