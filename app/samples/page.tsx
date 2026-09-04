import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import QuickQuote from "@/components/QuickQuote";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { parseQuoteProducts } from "@/lib/quote-validation";
import { waGuidedOrderLink } from "@/lib/whatsapp";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Request a Sample Kit — Feel the Quality First | ${BRAND_NAME}`,
  description:
    "See and feel our label quality before you order: photo samples of your design within 24 hours, physical swatch options for woven labels, satin labels, hang tags and packaging.",
  alternates: {
    canonical: `${SITE_URL}/samples`,
    languages: { en: `${SITE_URL}/samples`, "x-default": `${SITE_URL}/samples` },
  },
};

const STEPS = [
  {
    n: "01",
    t: "Free digital proof — 24 hours",
    d: "Send your logo and we return an accurate digital mockup of your label or tag within 24 hours. Free, unlimited revisions, no commitment.",
  },
  {
    n: "02",
    t: "Photo sample of real production",
    d: "Once your order is confirmed, we photograph your actual first pieces off the machine and send them on WhatsApp before dispatch — you approve what ships.",
  },
  {
    n: "03",
    t: "Physical swatch options",
    d: "Want to feel materials first? Ask for our swatch set — damask weave, satin, board stocks and finishes. Arranged per request with express delivery.",
  },
];

const FAQS = [
  {
    q: "Is the digital proof really free?",
    a: "Yes — every quote includes a free digital proof within 24 hours, with unlimited revision rounds. Production never starts without your written approval.",
  },
  {
    q: "Can I get a physical sample of MY design before bulk?",
    a: "Yes. A pre-production sample of your own design can be arranged — the sampling cost is typically adjusted against your bulk order when you proceed.",
  },
  {
    q: "How fast do physical swatches arrive?",
    a: "Express courier 3–8 days depending on your country, DDP with duties prepaid.",
  },
  {
    q: "What should I send to start?",
    a: "Your logo (any format), the product you're interested in, and a rough quantity. That's enough for us to prepare your first proof.",
  },
];

export default async function SamplesPage() {
  const site = await getSiteContent();
  const products = parseQuoteProducts((site as Record<string, string>).quoteProducts).filter(
    (p) => p !== "Other"
  );

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
    breadcrumbJsonLd([{ name: "Sample Kit", path: "/samples" }]),
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-24">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="h-px w-8 bg-champagne/60" />
                  Sample kit
                </span>
                <h1 className="display mt-5 text-4xl leading-[1.05] tracking-tight sm:text-6xl">
                  Feel the quality <span className="gradient-text italic">before you commit.</span>
                </h1>
                <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream-muted">
                  Ordering custom branding from abroad shouldn&apos;t feel like a gamble. Here&apos;s
                  exactly how you can verify our quality — starting free, today.
                </p>
              </Reveal>

              <div className="mt-10 space-y-4">
                {STEPS.map((s, i) => (
                  <Reveal key={s.n} delay={i * 0.06}>
                    <div className="flex gap-5 rounded-2xl border border-line bg-surface/30 p-5 sm:p-6">
                      <span className="display shrink-0 text-3xl text-champagne/50">{s.n}</span>
                      <div>
                        <h2 className="text-[15px] font-semibold text-cream">{s.t}</h2>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-cream-muted">{s.d}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.2}>
                <div className="mt-8">
                  <h2 className="display text-2xl">Common questions</h2>
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

            {/* sticky quick-quote */}
            <div className="lg:sticky lg:top-28">
              <Reveal delay={0.1}>
                <QuickQuote products={products} />
                <div className="mt-4 rounded-2xl border border-line bg-surface/30 p-5 text-center">
                  <p className="text-[12.5px] text-cream-muted">Prefer chat? Send the guided form on WhatsApp:</p>
                  <a
                    href={waGuidedOrderLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[12.5px] font-medium text-cream-muted transition-all hover:border-champagne/60 hover:text-champagne"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
                      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                    </svg>
                    Order via WhatsApp
                  </a>
                </div>
                <p className="mt-4 text-center text-[12px] text-cream-dim">
                  or use the <Link href="/quote" className="text-champagne underline underline-offset-4">full quote form</Link> with artwork upload
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
