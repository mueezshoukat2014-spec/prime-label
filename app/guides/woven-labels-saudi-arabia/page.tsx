import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const URL = `${SITE_URL}/guides/woven-labels-saudi-arabia`;

export const metadata: Metadata = {
  title: "Woven Labels Saudi Arabia — Custom Clothing Labels Supplier for KSA Brands",
  description:
    "Custom woven labels for Saudi clothing brands: damask weave, low MOQ from 100, free digital proof in 24 hours and DDP delivery to Riyadh, Jeddah & all KSA in 3–5 days. Arabic & English support on WhatsApp.",
  alternates: {
    canonical: URL,
    languages: { en: URL, "x-default": URL },
  },
  openGraph: {
    type: "article",
    url: URL,
    title: "Woven Labels Saudi Arabia — Buyer's Guide | Prime Labels",
    description:
      "Where Saudi abaya houses, boutiques and streetwear labels get their woven labels: weave types, MOQ, proofs and DDP door delivery to KSA.",
    siteName: "Prime Labels International",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Woven labels for Saudi clothing brands" }],
  },
  twitter: { card: "summary_large_image" },
};

const FAQS = [
  {
    q: "Do you deliver woven labels to Saudi Arabia?",
    a: "Yes. We ship DDP (delivery duty paid) to any address in Saudi Arabia — Riyadh, Jeddah, Dammam, Makkah, Madinah and beyond — typically in 3–5 days, with customs handled so there are no surprises at the door.",
  },
  {
    q: "What is the minimum order for custom woven labels?",
    a: "Our minimum starts at 100 pieces per design, which makes custom damask labels accessible for first collections, abaya startups and boutique drops.",
  },
  {
    q: "Can I see my label design before production?",
    a: "Always. Every order gets a free digital proof within 24 hours. Nothing goes on the looms until you approve it on WhatsApp.",
  },
  {
    q: "Can I order in Arabic?",
    a: "Yes — our team replies in both Arabic and English on WhatsApp, and Arabic brand names and care text can be woven into your labels.",
  },
  {
    q: "Woven or satin labels — which suits my garments?",
    a: "Woven (damask) labels give a crisp, textured, premium feel that never peels or fades — ideal for neck labels and hem tags. Satin labels are softer and smoother — popular for care labels and kidswear. Many Saudi brands pair both.",
  },
];

export default async function WovenLabelsSaudiArabiaGuide() {
  const site = await getSiteContent();
  const jsonLd = [
    breadcrumbJsonLd([{ name: "Guides", path: "/guides/woven-labels-saudi-arabia" }]),
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
        <div className="pointer-events-none absolute -left-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              Saudi Arabia buyer&apos;s guide
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              Woven labels for Saudi brands, <span className="gradient-text italic">without the guesswork.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">
              From abaya houses in Riyadh to streetwear drops in Jeddah, a custom woven label is the fastest way to
              make a garment feel like a brand. This guide covers what Saudi clothing brands actually order — weave,
              folds, quantities — and how ordering works when your supplier ships DDP to your door in 3–5 days.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {[
                { t: "MOQ from 100 pieces", d: "First collections and boutique drops welcome — you don't need warehouse volumes to get damask quality." },
                { t: "Free proof in 24 hours", d: "A digital proof of your exact label, on WhatsApp, before anything is produced. Approve or adjust freely." },
                { t: "DDP to KSA in 3–5 days", d: "Delivery duty paid to any Saudi city. No customs paperwork, no surprise fees at the door." },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-line bg-cream/[0.02] p-6">
                  <p className="display text-lg text-champagne">{c.t}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">{c.d}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-16 grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="display text-2xl sm:text-3xl">What Saudi brands order most</h2>
                <div className="mt-6 space-y-5 text-[14px] leading-relaxed text-cream-muted">
                  <p>
                    <b className="text-cream">Damask woven neck labels</b> — the signature finish inside the collar of
                    abayas, thobes, kidswear and streetwear. Tight weave, crisp logo, edges that never fray or fade in
                    the wash.
                  </p>
                  <p>
                    <b className="text-cream">Hem tags &amp; side-seam flags</b> — small loop-fold labels that peek
                    from hems and seams; a quiet branding detail popular with minimalist abaya and boutique lines.
                  </p>
                  <p>
                    <b className="text-cream">Satin care labels</b> — soft printed or woven care/content labels with
                    fabric composition and care symbols, paired with the main label in one order.
                  </p>
                  <p>
                    <b className="text-cream">Hang tags &amp; thank-you cards</b> — the unboxing half of the brand:
                    textured hang tags with string, and thank-you cards that turn first buyers into repeat customers.
                  </p>
                </div>
              </div>
              <div>
                <h2 className="display text-2xl sm:text-3xl">How ordering works</h2>
                <ol className="mt-6 space-y-4 text-[14px] leading-relaxed text-cream-muted">
                  {[
                    ["Send your logo", "Message us on WhatsApp (Arabic or English) or use the quote form — share your logo, sizes and quantities."],
                    ["Approve your free proof", "Within 24 hours you receive a digital proof. We adjust until it's exactly right."],
                    ["We produce & ship DDP", "Production starts only after approval. Your order ships duty-paid to your Saudi address in 3–5 days."],
                    ["Sew, tag, launch", "Labels arrive ready to sew or iron-on, with hang tags and cards to finish the set."],
                  ].map(([t, d], i) => (
                    <li key={t} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-champagne/40 text-[12px] text-champagne">{i + 1}</span>
                      <span><b className="text-cream">{t}.</b> {d}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/quote?product=Woven%20Labels" className="btn-primary">Get a free quote</Link>
                  <Link href="/products/woven-labels" className="btn-ghost">Explore woven labels</Link>
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
                <Link className="text-champagne underline-offset-4 hover:underline" href="/guides/label-folds-sizes">label fold types &amp; sizes</Link>
                {" · "}
                <Link className="text-champagne underline-offset-4 hover:underline" href="/guides/start-clothing-brand-saudi-arabia">starting a clothing brand in Saudi Arabia</Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
