import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import ReferralWidget from "@/components/ReferralWidget";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Refer a Brand — You Both Get 10% Off | ${BRAND_NAME}`,
  description:
    "Know a designer or brand owner who needs labels, hang tags or packaging? Refer them to Prime Labels — they get 10% off their first order, you get 10% off your next one.",
  alternates: {
    canonical: `${SITE_URL}/refer`,
    languages: { en: `${SITE_URL}/refer`, "x-default": `${SITE_URL}/refer` },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/refer`,
    title: "Refer a Brand — You Both Get 10% Off",
    description: "Refer a brand-owner friend: they save 10% on their first order, you save 10% on your next.",
    siteName: BRAND_NAME,
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: BRAND_NAME }],
  },
};

const STEPS = [
  {
    n: "01",
    t: "Create your code",
    d: "Enter your name and WhatsApp number — you get a personal referral code instantly. One code, unlimited referrals.",
  },
  {
    n: "02",
    t: "Share it with brand owners",
    d: "Send it to designer friends, brand-owner groups, or your community. They mention the code when requesting their quote.",
  },
  {
    n: "03",
    t: "You both save 10%",
    d: "When their first order confirms, they get 10% off it — and your 10% discount is logged for your next order. No limit on how many friends you refer.",
  },
];

const FAQS = [
  {
    q: "How is the discount applied?",
    a: "Your friend mentions the referral code in their quote request (there's a field for it) or on WhatsApp. Their 10% is applied to the first confirmed order; your 10% is logged against your WhatsApp number for your next order.",
  },
  {
    q: "How many people can I refer?",
    a: "Unlimited. Each confirmed first order earns you another 10% credit — refer three brands and your next three orders are each 10% off.",
  },
  {
    q: "Can I refer someone if I haven't ordered yet?",
    a: "Yes — anyone can create a code. Your earned discounts simply wait until your own first order.",
  },
  {
    q: "Do the discounts expire?",
    a: "Earned referral credits stay valid for 12 months from the referred order's confirmation.",
  },
];

export default async function ReferPage() {
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
    breadcrumbJsonLd([{ name: "Refer a Brand", path: "/refer" }]),
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-24">
        <div className="pointer-events-none absolute -left-[10%] top-20 h-[420px] w-[420px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="h-px w-8 bg-champagne/60" />
                  Referral rewards
                </span>
                <h1 className="display mt-5 text-4xl leading-[1.05] tracking-tight sm:text-6xl">
                  Refer a brand, <span className="gradient-text italic">you both save 10%.</span>
                </h1>
                <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream-muted">
                  The fashion community runs on recommendations — so we reward them. Send a
                  brand-owner friend our way: they get 10% off their first order, and 10% off your
                  next order is logged for you. Unlimited referrals.
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
                <div className="mt-10">
                  <h2 className="display text-2xl">Referral questions</h2>
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
                <ReferralWidget />
                <p className="mt-4 text-center text-[12px] text-cream-dim">
                  Referred by someone? Mention their code in the{" "}
                  <Link href="/quote" className="text-champagne underline underline-offset-4">
                    quote form
                  </Link>{" "}
                  details.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
