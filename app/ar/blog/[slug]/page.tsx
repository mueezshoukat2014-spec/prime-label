import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { AR_POSTS, getArPost } from "@/lib/blog-ar";
import { SITE_URL, BRAND_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return AR_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getArPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | برايم ليبلز`,
    description: post.excerpt,
    alternates: {
      canonical: `${SITE_URL}/ar/blog/${post.slug}`,
      languages: { ar: `${SITE_URL}/ar/blog/${post.slug}` },
    },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/ar/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      siteName: BRAND_NAME,
      locale: "ar_SA",
      images: [{ url: post.cover, width: 1200, height: 750, alt: post.title }],
    },
  };
}

/** Minimal RTL markdown: "## " headings, "- " bullet groups, paragraphs. */
function renderArBody(body: string) {
  const blocks = body.trim().split(/\n\n+/);
  return blocks.map((block, i) => {
    const lines = block.split("\n");
    if (lines[0].startsWith("## ")) {
      return (
        <h2 key={i} className="arabic-display mt-10 text-2xl font-bold leading-snug text-cream sm:text-3xl">
          {lines[0].slice(3)}
        </h2>
      );
    }
    if (lines.every((l) => l.startsWith("- "))) {
      return (
        <ul key={i} className="mt-5 space-y-3">
          {lines.map((l, j) => (
            <li key={j} className="arabic-text flex gap-3 text-[15px] leading-relaxed text-cream-muted">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne/70" />
              <span>{l.slice(2)}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="arabic-text mt-5 text-[15px] leading-loose text-cream-muted">
        {block}
      </p>
    );
  });
}

export default async function ArBlogPost({ params }: { params: { slug: string } }) {
  const post = getArPost(params.slug);
  if (!post) notFound();
  const site = await getSiteContent();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${SITE_URL}${post.cover}`,
    datePublished: post.date,
    inLanguage: "ar",
    author: { "@type": "Organization", name: BRAND_NAME },
    publisher: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/ar/blog/${post.slug}`,
  };

  const related = AR_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div dir="rtl" lang="ar" className="notranslate" translate="no">
        <article className="relative overflow-hidden pt-28 pb-16 sm:pt-40 sm:pb-24">
          <div className="pointer-events-none absolute -left-[12%] top-16 h-[420px] w-[420px] rounded-full bg-champagne/8 blur-[150px]" />
          <div className="container-lux relative max-w-3xl">
            <Reveal>
              <Link href="/ar/blog" className="arabic-text text-[12.5px] text-cream-dim transition-colors hover:text-champagne">
                → كل المقالات
              </Link>
              <h1 className="arabic-display mt-5 text-3xl font-bold leading-[1.3] tracking-tight sm:text-5xl sm:leading-[1.25]">
                {post.title}
              </h1>
              <p className="arabic-text mt-4 text-[12.5px] text-cream-dim">
                {new Date(post.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })} · فريق برايم ليبلز
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-8 overflow-hidden rounded-3xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.cover} alt={post.title} className="aspect-[16/9] w-full object-cover" />
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-4">{renderArBody(post.body)}</div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-12 rounded-3xl border border-champagne/25 bg-surface/40 p-7 text-center">
                <h2 className="arabic-display text-2xl font-bold">خذ الخطوة الأولى</h2>
                <p className="arabic-text mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-cream-muted">
                  أرسل شعارك اليوم — بروفة مجانية خلال 24 ساعة، والحد الأدنى 100 قطعة فقط.
                </p>
                <Link href="/ar/quote" className="btn-primary arabic-text mt-5 inline-flex !py-3 px-7 text-[13.5px] shadow-glow-sm">
                  اطلب تسعيرتك
                </Link>
              </div>
            </Reveal>

            {related.length > 0 && (
              <Reveal delay={0.18}>
                <div className="mt-12">
                  <h2 className="arabic-display text-xl font-bold">مقالات ذات صلة</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {related.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/ar/blog/${p.slug}`}
                        className="group rounded-2xl border border-line bg-surface/30 p-4 transition-all hover:border-champagne/40"
                      >
                        <h3 className="arabic-text text-[14px] font-bold leading-relaxed text-cream group-hover:text-champagne">
                          {p.title}
                        </h3>
                        <p className="arabic-text mt-1.5 text-[12px] leading-relaxed text-cream-dim">{p.excerpt}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </article>
      </div>
    </SiteShell>
  );
}
