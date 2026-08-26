/**
 * Case studies — anonymised client stories built from real production work.
 * Brand names are withheld/generic until clients approve public naming;
 * every spec, timeline and product detail reflects real orders.
 */

export type CaseStudy = {
  slug: string;
  title: string;
  client: string;
  market: string;
  flag: string;
  summary: string;
  cover: string;
  gallery: string[];
  challenge: string;
  solution: string[];
  results: string[];
  products: { name: string; href: string }[];
  quote?: { text: string; author: string };
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "streetwear-brand-launch-kit",
    title: "A Streetwear Label's Full Launch Kit — From Blanks to Brand",
    client: "Streetwear brand (name withheld)",
    market: "GCC / International",
    flag: "🧢",
    summary:
      "A first-collection streetwear founder needed neck labels, hang tags and packaging that made relabeled blanks feel like a real brand — on a startup budget and a six-week deadline.",
    cover: "/photos/DVGwhH2jNP__0.jpg",
    gallery: ["/photos/DVGwhH2jNP__1.jpg", "/photos/DVGwhH2jNP__2.jpg", "/photos/reel_DVGwuoKjClU.jpg"],
    challenge:
      "The founder was relabeling premium blanks for a limited drop. Nothing on the garment carried the brand: no neck label, no hem tag, no unboxing moment. Big-supplier MOQs (1,000+) didn't fit a 300-piece drop, and the timeline left no room for sampling mistakes.",
    solution: [
      "High-density damask woven neck labels at the 300-unit tier — end fold, so they read premium when the collar is flipped",
      "Matching woven hem tags produced on the same weave setup (minimal extra cost)",
      "Foil-stamped hang tags on 350 GSM board with waxed cotton string",
      "Frosted zipper bags with a one-colour logo print for shipping and retail",
      "Free digital proofs for every item within 24 hours; production started only after approval",
    ],
    results: [
      "Full branding kit delivered in one consolidated DDP shipment before the drop date",
      "Per-garment branding cost stayed under a coffee's price at the 300-unit tier",
      "The drop sold out; the reorder moved to the 1,000-unit tier with better unit pricing",
    ],
    products: [
      { name: "Woven Labels", href: "/products/woven-labels" },
      { name: "Hang Tags", href: "/products/hang-tags" },
      { name: "Zipper Bags", href: "/products/zipper-bags" },
    ],
    quote: {
      text: "The labels made the blanks feel like ours. Customers flipped the collar and stopped asking if we were legit.",
      author: "Founder, streetwear label",
    },
  },
  {
    slug: "abaya-house-premium-labels",
    title: "An Abaya House Upgrades to Skin-Soft Satin & Coordinated Packaging",
    client: "Modest-wear house (name withheld)",
    market: "Saudi Arabia",
    flag: "🇸🇦",
    summary:
      "An established abaya house was getting complaints about itchy labels and wanted packaging elegant enough for gifting season — with bilingual Arabic/English branding throughout.",
    cover: "/photos/DUiJgcYDInD_1.jpg",
    gallery: ["/photos/DUiJgcYDInD_2.jpg", "/photos/DaNaYhvEwXS_0.jpg", "/photos/DbAkfVljGTR_1.jpg"],
    challenge:
      "Their previous woven labels were too stiff for crepe fabric — customers cut them out, taking the brand with them. Care text was English-only, and the unboxing was a plain poly bag. Gifting season was eight weeks away.",
    solution: [
      "Switched neck labels to soft printed satin — zero-itch, elegant drape on crepe and nida fabrics",
      "Bilingual Arabic-first care labels with proper calligraphic kerning (no machine-translated text)",
      "Pantone-matched satin ribbon, thank-you cards and logo seals as one coordinated gifting set",
      "Express DDP delivery to Riyadh — customs prepaid, no surprises",
    ],
    results: [
      "Label cut-outs stopped: satin labels stay in the garment, brand stays with the customer",
      "The gifting set became part of their Instagram content — unboxing photos tagged by customers",
      "Standing reorder placed for satin labels + packaging set each season",
    ],
    products: [
      { name: "Satin Labels", href: "/products/satin-labels" },
      { name: "Brand Packaging", href: "/products/brand-packaging" },
      { name: "Custom Stickers", href: "/products/stickers" },
    ],
    quote: {
      text: "الليبل الجديد ناعم فعلاً — العميلات لاحظن الفرق من أول قطعة.",
      author: "Owner, abaya house — Riyadh",
    },
  },
];

export function getCaseStudy(slug: string): CaseStudy | null {
  return CASE_STUDIES.find((c) => c.slug === slug) || null;
}
