import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://primelabelsintl.com";
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/quote`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/gcc-custom-labels`, lastModified: now, changeFrequency: "weekly", priority: 0.92 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
