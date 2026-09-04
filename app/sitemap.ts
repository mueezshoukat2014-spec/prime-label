import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { MARKETS } from "@/lib/markets";
import { getPublishedPosts } from "@/lib/blog";
import { CASE_STUDIES } from "@/lib/case-studies";
import { AR_PDP } from "@/lib/pdp-content-ar";

const base = "https://primelabelsintl.com";

/**
 * Core + products sitemap. lastModified reflects the current deployment so
 * Google re-crawls after every release. Product URLs come from the live
 * catalogue (DB first, static fallback).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = (await getProducts()) as Array<{ slug: string }>;
    productUrls = products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    /* DB unreachable — core pages alone still ship */
  }

  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    blogUrls = [
      { url: `${base}/blog`, lastModified, changeFrequency: "weekly" as const, priority: 0.8 },
      ...posts.map((p) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.75,
      })),
    ];
  } catch {
    blogUrls = [{ url: `${base}/blog`, lastModified, changeFrequency: "weekly" as const, priority: 0.8 }];
  }

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/quote`, lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/gcc-custom-labels`, lastModified, changeFrequency: "weekly", priority: 0.92 },
    { url: `${base}/ar`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/ar/quote`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    ...Object.keys(AR_PDP).map((slug) => ({
      url: `${base}/ar/products/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...MARKETS.map((m) => ({
      url: `${base}/${m.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...productUrls,
    { url: `${base}/work`, lastModified, changeFrequency: "monthly", priority: 0.85 },
    ...CASE_STUDIES.map((c) => ({
      url: `${base}/work/${c.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...blogUrls,
    { url: `${base}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/samples`, lastModified, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/designer`, lastModified, changeFrequency: "monthly", priority: 0.88 },
    { url: `${base}/faq`, lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/shipping`, lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/gallery`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/contact`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
