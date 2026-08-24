import "server-only";
import { sql } from "@/lib/db";

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

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const rows = await sql`
      SELECT id, slug, title, excerpt, cover, body, published, created_at, updated_at
      FROM blog_posts WHERE published = TRUE ORDER BY created_at DESC
    `;
    return rows as BlogPost[];
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
    return (rows[0] as BlogPost) ?? null;
  } catch {
    return null;
  }
}

/** Rough reading time from word count. */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
