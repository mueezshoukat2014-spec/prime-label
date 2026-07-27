import "server-only";
import { sql } from "@/lib/db";
import { products as staticProducts, gallery, reels, STATIC_CONTENT } from "@/lib/content";

export async function getProducts() {
  try {
    const rows = await sql`SELECT slug, title, tagline, description, image, gallery, price_from, moq, turnaround, category FROM products WHERE active = TRUE ORDER BY sort`;
    if (rows.length) {
      return rows.map((r: any) => {
        const norm = (s: string) => (s && !s.startsWith("/") ? "/" + s : s);
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

export async function getSiteContent() {
  try {
    const rows = await sql`SELECT key, value FROM site_content`;
    const map: Record<string, string> = {};
    rows.forEach((r: any) => (map[r.key] = r.value));
    return { ...STATIC_CONTENT, ...map };
  } catch {}
  return STATIC_CONTENT;
}

export async function getFaqs() {
  try {
    const rows = await sql`SELECT question, answer FROM faqs ORDER BY sort`;
    if (rows.length) return rows.map((r: any) => ({ q: r.question, a: r.answer }));
  } catch {}
  const { faqs } = await import("@/lib/content");
  return faqs;
}

export async function getTestimonials() {
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
export async function getGallery() {
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
      return [...uploaded, ...gallery];
    }
  } catch {
    /* fall through to the static set */
  }
  return gallery;
}

export { gallery, reels };
