/**
 * SEO helpers for <title> / meta description lengths.
 *
 * Google shows roughly 60 characters of a title and ~155 of a description.
 * The root layout appends " | Prime Labels" (15 chars) to every page title,
 * so a page title should be ≤ 45 chars to fit with the brand.
 */

export const TITLE_SUFFIX_LEN = " | Prime Labels".length;
export const MAX_TITLE = 60;

/** Keep the brand suffix when it fits; otherwise render the title on its own. */
export function fitTitle(title: string): string | { absolute: string } {
  return title.length + TITLE_SUFFIX_LEN <= MAX_TITLE ? title : { absolute: title };
}

/**
 * Shorter search titles for blog posts whose headline runs past ~60
 * characters (Google cuts the rest off in results). Only <title> changes —
 * the article headline (H1) and social title stay exactly as written.
 */
const BLOG_SEO_TITLES: Record<string, string> = {
  "woven-vs-printed-vs-satin-labels": "Woven vs Printed vs Satin Labels: Which Should You Choose?",
  "ddp-shipping-gcc-apparel-brands": "Import Duties & DDP Shipping for GCC Apparel Brands",
  "streetwear-branding-101": "Streetwear Branding 101: Neck Labels, Hem Tags & Patches",
  "clothing-label-moq-guide": "What MOQ to Expect for Custom Clothing Labels in 2026",
};

export function blogSeoTitle(slug: string, title: string): string {
  return title.length > MAX_TITLE ? BLOG_SEO_TITLES[slug] ?? title : title;
}

/** Trim to `max` characters on a word boundary (never mid-word). */
export function fitDescription(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:—–-]+$/, "") + "…";
}

/**
 * Keyword-first product titles/descriptions (from keyword research: what
 * buyers actually type, e.g. "custom woven labels for clothing", "custom hang
 * tags for clothing"). `{moq}` is filled from the live catalogue so it never
 * drifts from the admin-managed MOQ. Facts only — every finish/option named
 * here is listed in lib/pdp-content.ts.
 */
const PRODUCT_SEO: Record<string, { title: string; description: string }> = {
  "woven-labels": {
    title: "Custom Woven Labels for Clothing — MOQ {moq}",
    description:
      "Custom damask woven labels for clothing brands — neck, care & size labels in center, end or Manhattan folds. MOQ {moq}, free 24h proof, DDP worldwide.",
  },
  "satin-labels": {
    title: "Custom Satin Labels for Clothing — MOQ {moq}",
    description:
      "Soft printed or woven satin labels for abayas, kidswear and care text in Arabic or English. MOQ {moq}, free 24h digital proof, DDP delivery worldwide.",
  },
  "hang-tags": {
    title: "Custom Hang Tags for Clothing — MOQ {moq}",
    description:
      "Luxury custom hang tags with your logo — foil, embossing, soft-touch or kraft, pre-strung with cotton, ribbon or elastic. MOQ {moq}, free 24h proof.",
  },
  stickers: {
    title: "Custom Logo Stickers & Seals for Brands",
    description:
      "Custom die-cut logo stickers and seals for clothing packaging — matte, gloss, clear, foil or holographic, on rolls or sheets. MOQ {moq}, free 24h proof.",
  },
  "brand-packaging": {
    title: "Custom Brand Packaging for Clothing Brands",
    description:
      "Thank-you cards, satin ribbons, sticker seals, tissue and paper bags matched to your labels in one brand kit. MOQ {moq} per item, DDP delivery.",
  },
  "zipper-bags": {
    title: "Custom Frosted Zipper Bags with Logo",
    description:
      "Frosted, clear or tinted zipper bags printed with your logo — slider or press-seal zip, metallic inks available. MOQ {moq} on standard sizes.",
  },
  patch: {
    title: "Custom Woven & Embroidered Patches — MOQ {moq}",
    description:
      "Custom woven, embroidered, chenille and PVC patches for clothing, jackets and caps — sew-on or iron-on. MOQ {moq}, free 24h proof, DDP worldwide.",
  },
  "steel-logo": {
    title: "Custom Steel Logo Tags for Clothing",
    description:
      "Laser-engraved steel logo tags in brushed, mirror, matte black, gold PVD or antique finish — rivet, prong, sew-on or adhesive. MOQ {moq}.",
  },
  "tissue-paper": {
    title: "Custom Tissue Paper for Clothing Brands",
    description:
      "Custom tissue paper for clothing brand packaging, matched to your labels and tags for a coordinated unboxing. MOQ {moq}, free digital proof.",
  },
};

export function productSeo(slug: string, moq: number | null | undefined): { title: string; description: string } | null {
  const e = PRODUCT_SEO[slug];
  if (!e) return null;
  const m = String(moq ?? 100);
  return { title: e.title.replace("{moq}", m), description: fitDescription(e.description.replace("{moq}", m)) };
}
