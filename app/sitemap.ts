import type { MetadataRoute } from "next";

const base = "https://primelabelsintl.com";

/**
 * Core sitemap. lastModified reflects the current deployment so Google
 * re-crawls after every release (each deploy regenerates this route).
 * The image sitemap is referenced separately from robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/quote`, lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/gcc-custom-labels`, lastModified, changeFrequency: "weekly", priority: 0.92 },
    { url: `${base}/gallery`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/contact`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
