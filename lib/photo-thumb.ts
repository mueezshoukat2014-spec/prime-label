import thumbs from "@/lib/photo-thumbs.json";

const READY = new Set<string>(thumbs as string[]);

/** 540px WebP thumbnail of a repo photo (built by tools/photo-thumbs.mjs), or null. */
export function photoThumb(src: string | null | undefined): string | null {
  if (!src || !READY.has(src)) return null;
  return src.replace(/^\/photos\//, "/photos/thumb/").replace(/\.[^./]+$/, ".webp");
}
