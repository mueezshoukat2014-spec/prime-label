import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent, getFaqs } from "@/lib/data";
import { waGuidedOrderLink } from "@/lib/whatsapp";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `FAQs — Custom Labels, MOQs, Proofs & Delivery | ${BRAND_NAME}`,
  description:
    "Answers to the most common questions about custom woven labels, satin labels, hang tags and packaging — minimum orders, digital proofs, Pantone matching, production times and DDP delivery.",
  alternates: {
    canonical: `${SITE_URL}/faq`,
    languages: { en: `${SITE_URL}/faq`, "x-default": `${SITE_URL}/faq` },
  },
};

/** Extra questions beyond the homepage set — ordering, shipping, payments. */
const EXTRA_FAQS = [
  {
    q: "Do I need to pay before seeing anything?",
    a: "No. Your digital proof is free and arrives within 24 hours of sharing your artwork. You only proceed to payment after you approve the design and accept the quote.",
  },
  {
    q: "Which countries do you deliver to?",
    a: "We ship worldwide with express couriers (DHL, FedEx, Aramex). Most orders go to Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman, the UK and USA — typically DDP, meaning duties are prepaid and there is nothing to pay at delivery.",
  },
  {
    q: "Can I combine several products in one order?",
    a: "Yes — most brands order a coordinated kit: woven labels + hang tags + seals + zipper bags. Everything is Pantone-matched and ships together as one consolidated parcel.",
  },
  {
    q: "What happens if my order arrives damaged or wrong?",
    a: "Report it within 7 days with photos. If we produced something materially different from your approved proof, we reprint the affected quantity or refund it — at no cost to you. See our Terms for full details.",
  },
  {
    q: "Do you sign NDAs or keep designs confidential?",
    a: "Your artwork is used only for your production. If you need your work excluded from our portfolio and photos, tell us in writing and we will exclude it.",
  },
  {
    q: "How do I track my order?",
    a: "As soon as your parcel ships you receive the courier tracking number on WhatsApp. Production progress photos are shared before dispatch.",
  },
];

export default async function FaqPage() {
  const [site, faqs] = await Promise.all([getSiteContent(), getFaqs()]);
  const all = [...(faqs as { q: string; a: string }[]), ...EXTRA_FAQS];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: all.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    breadcrumbJsonLd([{ name: "FAQs", path: "/faq" }]),
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-24">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              FAQs
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              Every question, <span className="gradient-text italic">answered straight.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">
              MOQs, proofs, production, Pantone matching, shipping and payments — everything brands
              ask before their first order. Can&apos;t find yours? WhatsApp us.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {all.map((f, i) => (
              <Reveal key={f.q} delay={Math.min(i * 0.03, 0.3)}>
                <div className="h-full rounded-2xl border border-line bg-surface/30 p-5 sm:p-6">
                  <h2 className="text-[15px] font-semibold leading-snug text-cream">{f.q}</h2>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-cream-muted">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-14 rounded-3xl border border-champagne/25 bg-surface/40 p-8 text-center sm:p-10">
              <h2 className="display text-3xl">Still have a question?</h2>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] text-cream-muted">
                Message us on WhatsApp — real answers from the production team, usually within the hour.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={waGuidedOrderLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !py-3 !px-6 text-[13px] shadow-glow-sm"
                >
                  Ask on WhatsApp
                </a>
                <Link href="/quote" className="text-[13px] text-cream-muted underline underline-offset-4 hover:text-champagne">
                  or request a quote →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
