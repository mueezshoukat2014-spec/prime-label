import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { getPublishedPosts } from "@/lib/blog";
import { CASE_STUDIES } from "@/lib/case-studies";
import { AR_PDP } from "@/lib/pdp-content-ar";
import { AR_POSTS } from "@/lib/blog-ar";

const base = "https://primelabelsintl.com";

/** hreflang alternates for pages that exist in both English and Arabic. */
const langs = (en: string, ar: string) => ({
  languages: { en, ar, "x-default": en },
});

/**
 * Core + products sitemap. Product URLs come from the live catalogue (DB first,
 * static fallback).
 *
 * lastmod is only sent where it is TRUE (blog posts, Arabic posts and the two
 * blog indexes). It used to be "now" on every URL, so every deploy claimed that
 * all 55 pages had changed — Google treats such a sitemap's lastmod as
 * unreliable and then ignores it everywhere, including the real post dates.
 * Pages without a known modification date simply omit it (allowed by Google).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const arLatest = AR_POSTS.reduce((m, p) => (p.date > m ? p.date : m), "");

  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = (await getProducts()) as Array<{ slug: string }>;
    productUrls = products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      // Only slugs that have an Arabic twin get hreflang alternates.
      ...(p.slug in AR_PDP
        ? { alternates: langs(`${base}/products/${p.slug}`, `${base}/ar/products/${p.slug}`) }
        : {}),
    }));
  } catch {
    /* DB unreachable — core pages alone still ship */
  }


  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    const newest = posts.reduce((m, p) => (p.updated_at > m ? p.updated_at : m), "");
    blogUrls = [
      { url: `${base}/blog`, ...(newest ? { lastModified: new Date(newest) } : {}), changeFrequency: "weekly" as const, priority: 0.8 },
      ...posts.map((p) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.75,
      })),
    ];
  } catch {
    blogUrls = [{ url: `${base}/blog`, changeFrequency: "weekly" as const, priority: 0.8 }];
  }

  return [
    {
      url: base,
      changeFrequency: "weekly",
      priority: 1,
      alternates: langs(base, `${base}/ar`),
    },
    {
      url: `${base}/quote`,
      changeFrequency: "weekly",
      priority: 0.95,
      alternates: langs(`${base}/quote`, `${base}/ar/quote`),
    },
    {
      url: `${base}/products`,
      changeFrequency: "weekly",
      priority: 0.93,
    },
    {
      url: `${base}/ar`,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: langs(base, `${base}/ar`),
    },
    {
      url: `${base}/ar/quote`,
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: langs(`${base}/quote`, `${base}/ar/quote`),
    },
    ...Object.keys(AR_PDP).map((slug) => ({
      url: `${base}/ar/products/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: langs(`${base}/products/${slug}`, `${base}/ar/products/${slug}`),
    })),
    { url: `${base}/ar/blog`, ...(arLatest ? { lastModified: new Date(arLatest) } : {}), changeFrequency: "weekly", priority: 0.75 },
    ...AR_POSTS.map((p) => ({
      url: `${base}/ar/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...productUrls,
    { url: `${base}/work`, changeFrequency: "monthly", priority: 0.85 },
    ...CASE_STUDIES.map((c) => ({
      url: `${base}/work/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...blogUrls,
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/samples`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/designer`, changeFrequency: "monthly", priority: 0.88 },
    { url: `${base}/starter-kit`, changeFrequency: "monthly", priority: 0.88 },
    { url: `${base}/calculator`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/refer`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/track`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/shipping`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/gallery`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
