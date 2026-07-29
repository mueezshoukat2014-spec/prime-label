import type { MetadataRoute } from "next";

const base = "https://primelabelsintl.com";
const lastModified = new Date("2026-07-30T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: base,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [
        `${base}/photos/brand-logo.jpg`,
        `${base}/photos/DaNaYhvEwXS_0.jpg`,
        `${base}/photos/ai-brand-packaging.jpg`,
      ],
    },
    {
      url: `${base}/quote`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
      images: [`${base}/photos/brand-logo.jpg`],
    },
    {
      url: `${base}/gcc-custom-labels`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.92,
      images: [
        `${base}/photos/DaNaYhvEwXS_0.jpg`,
        `${base}/photos/ai-hang-tags.jpg`,
        `${base}/photos/ai-zipper-bags.jpg`,
      ],
    },
    {
      url: `${base}/gallery`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
      images: [
        `${base}/photos/DaNaoG7kxUT_0.jpg`,
        `${base}/photos/DaNaYhvEwXS_1.jpg`,
        `${base}/photos/DYQ2pCbjHoE_0.jpg`,
      ],
    },
    {
      url: `${base}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [`${base}/photos/brand-logo.jpg`],
    },
  ];
}
