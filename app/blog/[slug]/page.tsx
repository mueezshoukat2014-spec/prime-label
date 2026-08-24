import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { Markdown } from "@/lib/markdown";
import { getSiteContent } from "@/lib/data";
import { getPost, getPublishedPosts, readingTime } from "@/lib/blog";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Article not found" };
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title} — ${BRAND_NAME}`,
    description: post.excerpt,
    alternates: { canonical: url, languages: { en: url, "x-default": url } },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      siteName: BRAND_NAME,
      images: post.cover ? [{ url: post.cover, width: 1200, height: 750, alt: post.title }] : undefined,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, site, all] = await Promise.all([
    getPost(params.slug),
    getSiteContent(),
    getPublishedPosts(),
  ]);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title,
      description: post.excerpt,
      image: post.cover ? [post.cover.startsWith("http") ? post.cover : `${SITE_URL}${post.cover}`] : undefined,
      url,
      datePublished: post.created_at,
      dateModified: post.updated_at,
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: url,
    },
    breadcrumbJsonLd([
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ];

  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);

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
              <Link href="/blog" className="transition-colors hover:text-champagne">Blog</Link>
              <span aria-hidden>/</span>
              <span className="line-clamp-1 text-cream-muted">{post.title}</span>
            </nav>

            <div className="mx-auto max-w-3xl">
              <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">
                {new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                {" · "}{readingTime(post.body)} min read
              </p>
              <h1 className="display mt-4 text-3xl leading-[1.1] tracking-tight sm:text-5xl">{post.title}</h1>
              <p className="mt-5 text-[16px] leading-relaxed text-cream-muted">{post.excerpt}</p>
            </div>

            {post.cover && (
              <div className="relative mx-auto mt-10 aspect-[16/8] max-w-4xl overflow-hidden rounded-3xl border border-line shadow-soft">
                <img src={post.cover} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            )}

            <div className="mx-auto mt-4 max-w-3xl">
              <Markdown source={post.body} />

              {/* CTA */}
              <div className="mt-14 rounded-3xl border border-champagne/25 bg-surface/40 p-8 text-center">
                <h2 className="display text-2xl sm:text-3xl">Ready to put this into practice?</h2>
                <p className="mx-auto mt-2 max-w-md text-[13.5px] text-cream-muted">
                  Send your design and quantity — a tailored quote lands in your inbox within 24 hours,
                  with a free digital proof before production.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <Link href="/quote" className="btn-primary !py-3 !px-6 text-[13px] shadow-glow-sm">
                    Customize Your Order
                  </Link>
                  <Link href="/#products" className="text-[13px] text-cream-muted underline underline-offset-4 hover:text-champagne">
                    Browse products →
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          {related.length > 0 && (
            <Reveal delay={0.1}>
              <div className="mx-auto mt-16 max-w-4xl border-t border-line pt-10">
                <h2 className="display text-2xl">Keep reading</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="group rounded-2xl border border-line bg-surface/30 p-5 transition-all hover:border-champagne/40"
                    >
                      <p className="text-[11px] uppercase tracking-wide2 text-cream-dim">{readingTime(r.body)} min read</p>
                      <p className="mt-2 text-[13.5px] font-medium leading-snug text-cream group-hover:text-champagne">
                        {r.title}
                      </p>
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
