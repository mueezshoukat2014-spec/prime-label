import type { MetadataRoute } from "next";

const base = "https://primelabelsintl.com";
const lastModified = new Date("2026-08-01T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/quote`, lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/gcc-custom-labels`, lastModified, changeFrequency: "weekly", priority: 0.92 },
    { url: `${base}/gallery`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/contact`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
