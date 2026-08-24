import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { getPublishedPosts, readingTime } from "@/lib/blog";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Label & Branding Guides for Clothing Brands — ${BRAND_NAME}`,
  description:
    "Practical guides on woven labels, satin labels, hang tags, MOQs and garment branding — written for fashion founders in the GCC, UK, USA and worldwide.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
    languages: { en: `${SITE_URL}/blog`, "x-default": `${SITE_URL}/blog` },
  },
};

export default async function BlogPage() {
  const [site, posts] = await Promise.all([getSiteContent(), getPublishedPosts()]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${SITE_URL}/blog#blog`,
      name: `${BRAND_NAME} — Label & Branding Guides`,
      url: `${SITE_URL}/blog`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: `${SITE_URL}/blog/${p.slug}`,
        datePublished: p.created_at,
        dateModified: p.updated_at,
      })),
    },
    breadcrumbJsonLd([{ name: "Blog", path: "/blog" }]),
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
              The Journal
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              Guides for brands that <span className="gradient-text italic">sweat the details.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">
              Label types, MOQs, packaging and branding — practical answers from a studio
              that produces for fashion brands across the GCC, UK, USA and worldwide.
            </p>
          </Reveal>

          {posts.length === 0 ? (
            <Reveal delay={0.1}>
              <div className="mt-14 rounded-3xl border border-line bg-surface/30 p-12 text-center">
                <p className="text-[15px] text-cream">New guides are on the way.</p>
                <p className="mt-2 text-[13px] text-cream-dim">
                  Meanwhile, explore our <Link href="/#products" className="text-champagne underline underline-offset-4">products</Link> or{" "}
                  <Link href="/quote" className="text-champagne underline underline-offset-4">request a quote</Link>.
                </p>
              </div>
            </Reveal>
          ) : (
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.05}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface/30 transition-all duration-300 hover:border-champagne/40"
                  >
                    {p.cover && (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={p.cover}
                          alt={p.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">
                        {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}{readingTime(p.body)} min read
                      </p>
                      <h2 className="display mt-3 text-xl leading-snug text-cream group-hover:text-champagne">
                        {p.title}
                      </h2>
                      <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-cream-muted">{p.excerpt}</p>
                      <span className="mt-auto pt-5 text-[12px] uppercase tracking-wide2 text-champagne">
                        Read guide →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
