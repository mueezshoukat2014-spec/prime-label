import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { MARKETS } from "@/lib/markets";

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

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/quote`, lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/gcc-custom-labels`, lastModified, changeFrequency: "weekly", priority: 0.92 },
    ...MARKETS.map((m) => ({
      url: `${base}/${m.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...productUrls,
    { url: `${base}/gallery`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/contact`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
