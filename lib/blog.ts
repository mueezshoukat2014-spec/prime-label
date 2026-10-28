import "server-only";
import { sql } from "@/lib/db";
import { isBlobUrl, blobReachable } from "@/lib/blob-health";

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  body: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

/** Blob store blocked (lib/blob-health.ts) → drop Blob covers instead of showing broken images. */
async function withoutBlockedCovers<T extends { cover: string }>(posts: T[]): Promise<T[]> {
  const sample = posts.map((p) => p.cover).find(isBlobUrl);
  if (!sample || (await blobReachable(sample))) return posts;
  return posts.map((p) => (isBlobUrl(p.cover) ? { ...p, cover: "" } : p));
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const rows = await sql`
      SELECT id, slug, title, excerpt, cover, body, published, created_at, updated_at
      FROM blog_posts WHERE published = TRUE ORDER BY created_at DESC
    `;
    return withoutBlockedCovers(rows as BlogPost[]);
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const rows = await sql`
      SELECT id, slug, title, excerpt, cover, body, published, created_at, updated_at
      FROM blog_posts WHERE slug = ${slug} AND published = TRUE LIMIT 1
    `;
    const post = (rows[0] as BlogPost) ?? null;
    return post ? (await withoutBlockedCovers([post]))[0] : null;
  } catch {
    return null;
  }
}

/** Rough reading time from word count. */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * Pages retired when the site was minimised (Oct 2026) are still linked from a
 * few older DB posts. Point those links straight at the live page they 301 to,
 * so readers (and Google) skip the redirect hop. Same targets as next.config.mjs.
 */
const RETIRED_LINKS: Array<[RegExp, string]> = [
  [/\/guides\/(?:label-folds-sizes|woven-labels-saudi-arabia)(?=[)\s"'#?]|$)/g, "/products/woven-labels"],
  [/\/guides\/start-clothing-brand-saudi-arabia(?=[)\s"'#?]|$)/g, "/starter-kit"],
  [/\/guides\/clothing-label-requirements(?=[)\s"'#?]|$)/g, "/products/satin-labels"],
  [
    /\/(?:custom-labels-(?:saudi-arabia|uae|qatar|kuwait)|custom-clothing-labels-(?:uk|usa|pakistan|canada|australia)|gcc-custom-labels)(?=[)\s"'#?]|$)/g,
    "/",
  ],
];

export function fixRetiredLinks(body: string): string {
  return RETIRED_LINKS.reduce((s, [re, to]) => s.replace(re, to), body || "");
}
