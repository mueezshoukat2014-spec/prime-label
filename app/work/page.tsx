import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { CASE_STUDIES } from "@/lib/case-studies";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Case Studies — How Brands Launch with ${BRAND_NAME}`,
  description:
    "Real production stories: how streetwear brands and abaya houses use our woven labels, satin labels, hang tags and packaging to launch and scale.",
  alternates: {
    canonical: `${SITE_URL}/work`,
    languages: { en: `${SITE_URL}/work`, "x-default": `${SITE_URL}/work` },
  },
};

export default async function WorkPage() {
  const site = await getSiteContent();
  const jsonLd = breadcrumbJsonLd([{ name: "Case Studies", path: "/work" }]);

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-24">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              Case studies
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              How brands <span className="gradient-text italic">launch with us.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">
              Real production stories — the challenge, the exact spec we produced, and what happened
              after delivery. Client names are shared privately on request.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {CASE_STUDIES.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.08}>
                <Link
                  href={`/work/${c.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface/30 transition-all duration-300 hover:border-champagne/40"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={c.cover}
                      alt={`${c.title} — production photos`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                    <span className="absolute bottom-4 left-5 rounded-full bg-ink/80 px-3.5 py-1.5 text-[11px] uppercase tracking-wide2 text-champagne backdrop-blur">
                      {c.flag} {c.market}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h2 className="display text-2xl leading-snug text-cream group-hover:text-champagne">{c.title}</h2>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-cream-muted">{c.summary}</p>
                    <span className="mt-auto pt-5 text-[12px] uppercase tracking-wide2 text-champagne">
                      Read the full story →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-14 rounded-3xl border border-champagne/25 bg-surface/40 p-8 text-center sm:p-12">
              <h2 className="display text-3xl sm:text-4xl">Your brand could be next.</h2>
              <p className="mx-auto mt-3 max-w-xl text-[14px] text-cream-muted">
                Send your design and quantity — a tailored quote with a free digital proof lands within 24 hours.
              </p>
              <Link href="/quote" className="btn-primary mt-7 !py-3.5 !px-7 text-[13px] shadow-glow-sm">
                Customize Your Order
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
