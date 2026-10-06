import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const URL = `${SITE_URL}/guides/start-clothing-brand-saudi-arabia`;

export const metadata: Metadata = {
  title: "How to Start a Clothing Brand in Saudi Arabia — Labels & Packaging Checklist",
  description:
    "A practical checklist for launching an abaya, boutique or streetwear brand in Saudi Arabia: woven labels, hang tags, thank-you cards and packaging — from 100 pieces, with a free 24h proof and DDP delivery to KSA.",
  alternates: {
    canonical: URL,
    languages: { en: URL, "x-default": URL },
  },
  openGraph: {
    type: "article",
    url: URL,
    title: "Start a Clothing Brand in Saudi Arabia — Branding Checklist | Prime Labels",
    description:
      "The five branding pieces every new Saudi clothing brand needs, and the order to produce them in — with low MOQs and door delivery.",
    siteName: "Prime Labels International",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Clothing brand startup checklist Saudi Arabia" }],
  },
  twitter: { card: "summary_large_image" },
};

const FAQS = [
  {
    q: "How many pieces do I need to start?",
    a: "You can start from 100 pieces per design for woven labels and most accessories. That keeps first-collection risk low while still looking fully branded.",
  },
  {
    q: "What should a first collection budget cover?",
    a: "The essentials: woven neck labels, hang tags with string, and thank-you cards. Add satin care labels and packaging sleeves once the first drop sells through.",
  },
  {
    q: "How long does it take to get my branding in KSA?",
    a: "After you approve your free digital proof (sent within 24 hours), production and DDP delivery to Saudi Arabia typically takes 3–5 days in transit.",
  },
  {
    q: "I only have a logo on my phone — is that enough?",
    a: "Yes. Send the logo over WhatsApp and we prepare a digital proof of your labels and tags within 24 hours, so you see exactly how your brand will look before ordering.",
  },
];

export default async function StartClothingBrandKsaGuide() {
  const site = await getSiteContent();
  const jsonLd = [
    breadcrumbJsonLd([{ name: "Guides", path: "/guides/start-clothing-brand-saudi-arabia" }]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-20">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              Founder&apos;s checklist
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              Starting a clothing brand in Saudi Arabia? <span className="gradient-text italic">Brand it properly.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">
              Abaya lines, boutique drops, kidswear, streetwear — the garments get the attention, but the label is
              what customers remember. Here is the five-piece branding set we produce for new Saudi brands, and the
              sensible order to produce it in, starting from just 100 pieces.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                ["1", "Woven neck labels", "Your logo, woven in damask — the permanent signature inside every garment. Start here."],
                ["2", "Satin care labels", "Fabric content and care symbols on soft satin; paired with the neck label in the same order."],
                ["3", "Hang tags", "Textured tags with string that carry your price, story and socials on the rail and in photos."],
                ["4", "Thank-you cards", "A small card in every bag that turns a first purchase into a follow on Instagram."],
                ["5", "Packaging", "Sleeves, zipper bags and ribbon that make the unboxing feel like the price tag says it should."],
              ].map(([n, t, d]) => (
                <div key={n} className="rounded-2xl border border-line bg-cream/[0.02] p-6">
                  <span className="text-[11px] uppercase tracking-wide2 text-champagne">Step {n}</span>
                  <p className="display mt-1 text-lg text-cream">{t}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">{d}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-champagne/30 bg-champagne/5 p-6">
                <p className="display text-lg text-champagne">One order, one supplier</p>
                <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">
                  All five pieces can ride on a single order with one proof approval — MOQ from 100 per design, free
                  digital proof in 24 hours, DDP delivery to your door in Saudi Arabia in 3–5 days.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-16 grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="display text-2xl sm:text-3xl">Launch in four moves</h2>
                <ol className="mt-6 space-y-4 text-[14px] leading-relaxed text-cream-muted">
                  {[
                    ["Fix your logo", "A clean single-colour version weaves best. Phone artwork is fine — we prepare the rest."],
                    ["Order the label set", "Woven labels + hang tags + thank-you cards cover 90% of first-impression branding."],
                    ["Approve the proof", "Free digital proof within 24 hours on WhatsApp, in Arabic or English."],
                    ["Sew & sell", "Your branding arrives DDP in 3–5 days; photograph, price, post."],
                  ].map(([t, d], i) => (
                    <li key={t} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-champagne/40 text-[12px] text-champagne">{i + 1}</span>
                      <span><b className="text-cream">{t}.</b> {d}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h2 className="display text-2xl sm:text-3xl">Starter set</h2>
                <p className="mt-4 text-[14px] leading-relaxed text-cream-muted">
                  We put together a starter bundle for first collections — woven labels, hang tags and thank-you cards
                  sized for a 100–300 piece drop. Tell us your product mix on the quote form and we&apos;ll propose the
                  set that fits your launch.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/starter-kit" className="btn-primary">See the starter kit</Link>
                  <Link href="/quote" className="btn-ghost">Get a free quote</Link>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-16 border-t border-line pt-10">
              <h2 className="display text-2xl sm:text-3xl">Frequently asked questions</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {FAQS.map((f) => (
                  <div key={f.q} className="rounded-2xl border border-line bg-cream/[0.02] p-5">
                    <p className="text-[14px] font-semibold text-cream">{f.q}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">{f.a}</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-[13px] text-cream-dim">
                More reading:{" "}
                <Link className="text-champagne underline-offset-4 hover:underline" href="/guides/woven-labels-saudi-arabia">woven labels Saudi Arabia buyer&apos;s guide</Link>
                {" · "}
                <Link className="text-champagne underline-offset-4 hover:underline" href="/guides/label-folds-sizes">label fold types &amp; sizes</Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
