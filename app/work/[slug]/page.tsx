import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { CASE_STUDIES, getCaseStudy } from "@/lib/case-studies";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cs = getCaseStudy(params.slug);
  if (!cs) return { title: "Case study not found" };
  const url = `${SITE_URL}/work/${cs.slug}`;
  return {
    title: `${cs.title} — ${BRAND_NAME}`,
    description: cs.summary,
    alternates: { canonical: url, languages: { en: url, "x-default": url } },
    openGraph: {
      type: "article",
      url,
      title: cs.title,
      description: cs.summary,
      siteName: BRAND_NAME,
      images: [{ url: cs.cover, width: 1200, height: 675, alt: cs.title }],
    },
  };
}

export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
  const cs = getCaseStudy(params.slug);
  if (!cs) notFound();
  const site = await getSiteContent();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: cs.title,
      description: cs.summary,
      image: [`${SITE_URL}${cs.cover}`],
      url: `${SITE_URL}/work/${cs.slug}`,
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    breadcrumbJsonLd([
      { name: "Case Studies", path: "/work" },
      { name: cs.title, path: `/work/${cs.slug}` },
    ]),
  ];

  const others = CASE_STUDIES.filter((c) => c.slug !== cs.slug);

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="relative overflow-hidden pt-28 pb-14 sm:pt-40 sm:pb-24">
        <div className="pointer-events-none absolute -left-[10%] top-20 h-[400px] w-[400px] rounded-full bg-champagne/8 blur-[140px]" />
        <div className="container-lux relative">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[12px] text-cream-dim">
              <Link href="/" className="transition-colors hover:text-champagne">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/work" className="transition-colors hover:text-champagne">Case Studies</Link>
              <span aria-hidden>/</span>
              <span className="line-clamp-1 text-cream-muted">{cs.client}</span>
            </nav>

            <div className="mx-auto max-w-3xl">
              <span className="eyebrow">
                <span className="h-px w-8 bg-champagne/60" />
                {cs.flag} {cs.market} · {cs.client}
              </span>
              <h1 className="display mt-4 text-3xl leading-[1.1] tracking-tight sm:text-5xl">{cs.title}</h1>
              <p className="mt-5 text-[16px] leading-relaxed text-cream-muted">{cs.summary}</p>
            </div>

            <div className="relative mx-auto mt-10 aspect-[16/8] max-w-4xl overflow-hidden rounded-3xl border border-line shadow-soft">
              <img src={cs.cover} alt={`${cs.title} — main production photo`} className="absolute inset-0 h-full w-full object-cover" />
            </div>

            <div className="mx-auto mt-12 max-w-3xl space-y-12">
              <section>
                <h2 className="display text-3xl text-cream">The challenge</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-cream-muted">{cs.challenge}</p>
              </section>

              <section>
                <h2 className="display text-3xl text-cream">What we produced</h2>
                <ul className="mt-5 space-y-3">
                  {cs.solution.map((s) => (
                    <li key={s} className="flex gap-3 rounded-2xl border border-line bg-surface/30 p-4 text-[14px] leading-relaxed text-cream-muted">
                      <span className="mt-0.5 shrink-0 text-champagne">✦</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </section>

              {cs.gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {cs.gallery.map((g, gi) => (
                    <div key={g} className="relative aspect-square overflow-hidden rounded-2xl border border-line">
                      <img src={g} alt={`${cs.client} production detail ${gi + 1}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <section>
                <h2 className="display text-3xl text-cream">The results</h2>
                <ul className="mt-5 space-y-3">
                  {cs.results.map((r) => (
                    <li key={r} className="flex gap-3 text-[15px] leading-relaxed text-cream-muted">
                      <span className="mt-0.5 shrink-0 text-champagne">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </section>

              {cs.quote && (
                <blockquote className="rounded-3xl border border-champagne/25 bg-surface/40 p-8">
                  <p className="display text-2xl italic leading-snug text-cream">&ldquo;{cs.quote.text}&rdquo;</p>
                  <cite className="mt-4 block text-[13px] not-italic text-cream-dim">— {cs.quote.author}</cite>
                </blockquote>
              )}

              <section>
                <h2 className="display text-2xl text-cream">Products used in this project</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {cs.products.map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      className="rounded-full border border-champagne/35 bg-champagne/[0.07] px-5 py-2.5 text-[13px] text-champagne transition-colors hover:bg-champagne/15"
                    >
                      {p.name} →
                    </Link>
                  ))}
                </div>
              </section>

              <div className="rounded-3xl border border-champagne/25 bg-surface/40 p-8 text-center">
                <h2 className="display text-2xl sm:text-3xl">Want the same result?</h2>
                <p className="mx-auto mt-2 max-w-md text-[13.5px] text-cream-muted">
                  Tell us your product and quantity — a tailored quote with a free digital proof arrives within 24 hours.
                </p>
                <Link href="/quote" className="btn-primary mt-6 !py-3 !px-6 text-[13px] shadow-glow-sm">
                  Customize Your Order
                </Link>
              </div>
            </div>
          </Reveal>

          {others.length > 0 && (
            <Reveal delay={0.1}>
              <div className="mx-auto mt-16 max-w-4xl border-t border-line pt-10">
                <h2 className="display text-2xl">More case studies</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {others.map((o) => (
                    <Link key={o.slug} href={`/work/${o.slug}`} className="group rounded-2xl border border-line bg-surface/30 p-5 transition-all hover:border-champagne/40">
                      <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">{o.flag} {o.market}</p>
                      <p className="mt-2 text-[14px] font-medium leading-snug text-cream group-hover:text-champagne">{o.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </article>
    </SiteShell>
  );
}
