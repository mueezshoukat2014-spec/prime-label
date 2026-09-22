import "server-only";
import { sql } from "@/lib/db";
import { products as staticProducts, gallery, reels as staticReels, STATIC_CONTENT, normalizeMediaUrl, type Reel } from "@/lib/content";
import { normaliseManagedVideos } from "@/lib/video";

/* Short TTL memo: serverless instances stay warm between requests, so caching
   catalogue reads for 60s removes the Neon round-trips from almost every page
   render (TTFB is on the LCP critical path). Admin edits appear within a
   minute — an acceptable delay for this catalogue. */
// 5 minutes (was 60s): content rarely changes, and every warm serverless
// instance re-queried Neon every minute per key. Admin edits go live within
// this window; a deploy always shows fresh data.
const TTL = 300_000;
const memoCache = new Map<string, { t: number; v: unknown }>();
function memo<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = memoCache.get(key);
  if (hit && now - hit.t < TTL) return Promise.resolve(hit.v as T);
  return fn().then((v) => {
    memoCache.set(key, { t: now, v });
    return v;
  });
}

async function _getProducts() {
  try {
    const rows = await sql`SELECT slug, title, tagline, description, image, gallery, price_from, moq, turnaround, category FROM products WHERE active = TRUE ORDER BY sort`;
    if (rows.length) {
      return rows.map((r: any) => {
        const norm = normalizeMediaUrl;
        const gallery: string[] =
          typeof r.gallery === "string" ? JSON.parse(r.gallery) : r.gallery || [];
        return {
          slug: r.slug,
          title: r.title,
          tagline: r.tagline,
          description: r.description,
          image: norm(r.image),
          gallery: gallery.map(norm),
          count: gallery.length,
          priceFrom: r.price_from,
          moq: r.moq,
          turnaround: r.turnaround,
          category: r.category,
        };
      });
    }
  } catch {}
  return staticProducts;
}

async function _getSiteContent() {
  try {
    const rows = await sql`SELECT key, value FROM site_content`;
    const map: Record<string, string> = {};
    rows.forEach((r: any) => (map[r.key] = r.value));
    return { ...STATIC_CONTENT, ...map };
  } catch {}
  return STATIC_CONTENT;
}

async function _getFaqs() {
  try {
    const rows = await sql`SELECT question, answer FROM faqs ORDER BY sort`;
    if (rows.length) return rows.map((r: any) => ({ q: r.question, a: r.answer }));
  } catch {}
  const { faqs } = await import("@/lib/content");
  return faqs;
}

async function _getTestimonials() {
  try {
    const rows = await sql`SELECT name, role, company, country, content, rating FROM testimonials WHERE approved = TRUE ORDER BY sort`;
    if (rows.length) return rows as any[];
  } catch {}
  const { testimonials } = await import("@/lib/content");
  return testimonials;
}

/**
 * Portfolio gallery = admin uploads first, then the original static photo set.
 *
 * The 163 static images stay exactly as they are; anything uploaded from the
 * Gallery Manager is prepended so new work leads. If the DB is unreachable the
 * static set alone is returned, so the page can never come back empty.
 */
async function _getGallery() {
  // Admin edits to the original static photos (caption/category/hidden) are
  // stored as overrides keyed by the photo's shortcode.
  let staticSet = gallery;
  try {
    const ov = await sql`SELECT shortcode, caption, category, hidden FROM gallery_overrides`;
    if (ov.length) {
      const map = new Map(ov.map((o: any) => [String(o.shortcode), o]));
      staticSet = gallery
        .map((g: any) => {
          const o = map.get(String(g.shortcode));
          if (!o) return g;
          if (o.hidden) return null;
          return {
            ...g,
            caption: o.caption ?? g.caption,
            category: o.category ?? g.category,
          };
        })
        .filter(Boolean) as typeof gallery;
    }
  } catch {
    /* overrides unavailable: show the untouched static set */
  }
  try {
    const rows = await sql`
      SELECT id, url, caption, category, width, height
      FROM gallery_images
      WHERE active = TRUE
      ORDER BY sort, id DESC
    `;
    if (rows.length) {
      const uploaded = rows.map((r: Record<string, unknown>) => ({
        src: String(r.url),
        caption: String(r.caption ?? ""),
        category: String(r.category ?? ""),
        shortcode: `db-${r.id}`,
        type: "image",
        w: (r.width as number) ?? undefined,
        h: (r.height as number) ?? undefined,
      }));
      return [...uploaded, ...staticSet];
    }
  } catch {
    /* fall through to the static set */
  }
  return staticSet;
}


/** Admin PDP override for one product (null when not customised). */
async function _getPdpOverride(slug: string) {
  try {
    const rows = await sql`SELECT slug, h1, intro, folds, finishes, specs, faqs FROM pdp_content WHERE slug = ${slug} LIMIT 1`;
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** slug -> display name map for gallery category chips. */
async function _getCategoryNames(): Promise<Record<string, string>> {
  try {
    const rows = await sql`SELECT slug, name FROM categories ORDER BY id`;
    const map: Record<string, string> = {};
    rows.forEach((r: any) => (map[String(r.slug)] = String(r.name)));
    return map;
  } catch {
    return {};
  }
}

async function _getReels(): Promise<Reel[]> {
  try {
    const rows = await sql`SELECT value FROM site_content WHERE key = 'managedVideos' LIMIT 1`;
    if (rows.length) {
      const managed = normaliseManagedVideos(JSON.parse(String(rows[0]?.value || "[]"))).filter(
        (video) => video.active
      );
      if (managed.length) {
        return managed.map((video) => ({
          kind: "uploaded" as const,
          src: video.url,
          cover: "",
          caption: video.caption,
          title: video.title,
          product: video.product,
          shortcode: `uploaded-${video.id}`,
          plays: null,
        }));
      }
    }
  } catch {
    /* fall through to bundled/local reels */
  }
  return staticReels;
}

export { gallery, staticReels as reels };

export const getProducts = () => memo("products", _getProducts);
export const getSiteContent = () => memo("site", _getSiteContent);
export const getFaqs = () => memo("faqs", _getFaqs);
export const getTestimonials = () => memo("testimonials", _getTestimonials);
export const getGallery = () => memo("gallery", _getGallery);
export const getCategoryNames = () => memo("cats", _getCategoryNames);
export const getReels = () => memo("reels", _getReels);
export const getPdpOverride = (slug: string) => memo(`pdp:${slug}`, () => _getPdpOverride(slug));
