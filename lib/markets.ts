/**
 * Geo landing page content — one entry per target market.
 * URLs are top-level keyword slugs (e.g. /custom-labels-saudi-arabia).
 */

export type MarketFaq = { q: string; a: string };

export type Market = {
  slug: string;
  country: string;
  flag: string;
  /** <title> — keyword-first. */
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  /** Cities called out in copy for local relevance. */
  cities: string[];
  /** Express delivery window. */
  delivery: string;
  /** Extra keywords (Arabic for GCC). */
  keywords: string[];
  /** Who we serve there — persona bullets. */
  personas: string[];
  faqs: MarketFaq[];
};

export const MARKETS: Market[] = [
  {
    slug: "custom-labels-saudi-arabia",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    metaTitle: "Custom Clothing Labels Saudi Arabia | Woven Labels Riyadh & Jeddah",
    metaDescription:
      "Premium custom woven labels, satin labels, hang tags & brand packaging for Saudi fashion brands. Low MOQ, free 24h digital proof, DDP express delivery to Riyadh, Jeddah & Dammam.",
    h1: "Custom Clothing Labels & Branding for Saudi Arabia",
    intro:
      "High-density woven labels, soft satin labels for abayas, luxury hang tags and brand packaging accessories — produced for Saudi fashion houses and delivered DDP to your door in Riyadh, Jeddah or Dammam with no surprise customs.",
    cities: ["Riyadh", "Jeddah", "Dammam", "Makkah", "Madinah"],
    delivery: "3–5 days express (DHL / Aramex), DDP — customs cleared & duties paid",
    keywords: [
      "clothing labels Saudi Arabia",
      "woven labels Riyadh",
      "custom labels Jeddah",
      "abaya labels",
      "ليبل ملابس السعودية",
      "ملصقات ملابس مخصصة",
      "بطاقات تعليق للملابس",
    ],
    personas: [
      "Abaya & modest-wear houses needing skin-soft satin labels with Arabic care text",
      "Streetwear brands in Riyadh & Jeddah launching with damask neck labels",
      "Boutiques wanting a coordinated kit — labels, hang tags, seals and ribbons",
    ],
    faqs: [
      {
        q: "Do you deliver custom labels to Riyadh and Jeddah?",
        a: "Yes — express DDP delivery to every Saudi city in 3–5 days after production. Duties are prepaid, so nothing extra is collected at your door.",
      },
      {
        q: "Can labels include Arabic text and care instructions?",
        a: "Absolutely. We weave and print full Arabic, English or bilingual text — including care symbols — at no extra setup cost.",
      },
      {
        q: "What is the minimum order for Saudi brands?",
        a: "Woven labels start at just 100 units. Satin labels and hang tags start at 500 units. Every order gets a free digital proof within 24 hours.",
      },
      {
        q: "Which label is best for abayas?",
        a: "Soft satin labels are the GCC standard for abayas — zero-itch, elegant drape and crisp printing. Request a quote and we'll include satin recommendations for your fabric.",
      },
    ],
  },
  {
    slug: "custom-labels-uae",
    country: "United Arab Emirates",
    flag: "🇦🇪",
    metaTitle: "Custom Clothing Labels UAE | Woven Labels & Hang Tags Dubai",
    metaDescription:
      "Custom woven labels, satin labels, luxury hang tags & packaging accessories for UAE fashion brands. Low MOQ, free 24h proof, DDP express delivery to Dubai, Abu Dhabi & Sharjah.",
    h1: "Custom Clothing Labels & Branding for the UAE",
    intro:
      "From Dubai streetwear drops to Abu Dhabi boutiques — high-density woven labels, satin labels, hang tags and packaging accessories delivered DDP across the Emirates in days, not weeks.",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
    delivery: "3–5 days express (DHL / Aramex), DDP — customs cleared & duties paid",
    keywords: [
      "clothing labels Dubai",
      "woven labels UAE",
      "hang tags Dubai",
      "garment labels Abu Dhabi",
      "ليبل ملابس دبي",
      "تغليف براندات الملابس",
    ],
    personas: [
      "Dubai streetwear and athleisure brands scaling their first drops",
      "Luxury boutiques needing foil hang tags and coordinated packaging",
      "E-commerce apparel sellers wanting frosted zipper bags with logo",
    ],
    faqs: [
      {
        q: "How fast can I get custom labels in Dubai?",
        a: "Production takes 7–14 working days after proof approval, then 3–5 days express delivery — roughly two to three weeks door-to-door, DDP.",
      },
      {
        q: "Do you work with small UAE brands?",
        a: "Yes — woven labels start at 100 units, perfect for first collections. Volume tiers scale as you grow.",
      },
      {
        q: "Can I get labels, tags and packaging in one order?",
        a: "That's our speciality — a coordinated brand kit (labels + hang tags + seals + zipper bags) in one consolidated DDP shipment.",
      },
      {
        q: "Do you match Pantone colors?",
        a: "Yes — thread and print colors are matched against the Pantone system and confirmed on your free digital proof before production.",
      },
    ],
  },
  {
    slug: "custom-clothing-labels-uk",
    country: "United Kingdom",
    flag: "🇬🇧",
    metaTitle: "Custom Clothing Labels UK | Low MOQ Woven Labels London",
    metaDescription:
      "Custom woven labels, satin labels & hang tags for UK clothing brands. Low MOQ from 100 units, free 24h digital proof, express DDP delivery to London, Manchester & UK-wide.",
    h1: "Custom Clothing Labels for UK Brands",
    intro:
      "Independent UK labels deserve big-brand finishing. High-density damask woven labels, satin care labels and luxury hang tags — low MOQ from 100 units, delivered DDP to London, Manchester, Birmingham and UK-wide.",
    cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow"],
    delivery: "5–8 days express (DHL / FedEx), DDP — VAT & duties handled",
    keywords: [
      "custom clothing labels UK",
      "woven labels London",
      "low MOQ clothing labels UK",
      "garment labels Manchester",
      "custom hang tags UK",
    ],
    personas: [
      "Indie fashion brands and slow-fashion startups needing low MOQs",
      "Streetwear brands wanting dense damask neck and hem labels",
      "Etsy & Depop sellers upgrading to professional branding",
    ],
    faqs: [
      {
        q: "Is there import duty or VAT hassle for UK orders?",
        a: "No — we ship DDP (Delivered Duty Paid). VAT and duties are handled in the shipping, so your parcel arrives with nothing to pay.",
      },
      {
        q: "What's the minimum order for UK brands?",
        a: "Woven labels start at 100 units — ideal for small-batch and made-to-order UK brands. A free digital proof arrives within 24 hours.",
      },
      {
        q: "How long is delivery to London?",
        a: "Production 7–14 working days after proof approval, plus 5–8 days express shipping to anywhere in the UK.",
      },
      {
        q: "Can you match UK sizing and care label standards?",
        a: "Yes — we produce wash-care labels with UK/EU care symbols and fibre content text on satin or woven bases.",
      },
    ],
  },
  {
    slug: "custom-clothing-labels-usa",
    country: "United States",
    flag: "🇺🇸",
    metaTitle: "Custom Clothing Labels USA | Woven Labels for Streetwear Brands",
    metaDescription:
      "Custom woven labels, hem tags, patches & hang tags for US clothing brands. Low MOQ from 100 units, free 24h digital proof, express DDP delivery across the USA.",
    h1: "Custom Clothing Labels for US Brands",
    intro:
      "From LA streetwear to NYC boutiques — damask woven labels, hem tags, woven patches and luxury hang tags with the density and softness your customers can feel. Low MOQ, express DDP shipping across all 50 states.",
    cities: ["Los Angeles", "New York", "Miami", "Chicago", "Houston"],
    delivery: "5–8 days express (DHL / FedEx), DDP — customs & duties handled",
    keywords: [
      "custom clothing labels USA",
      "woven labels for streetwear",
      "custom hem tags",
      "clothing labels Los Angeles",
      "woven patches USA",
    ],
    personas: [
      "Streetwear founders launching limited drops with damask neck labels",
      "Print-on-demand upgraders moving to relabeled private-label garments",
      "Denim and workwear brands needing patches and steel logo tags",
    ],
    faqs: [
      {
        q: "Do you ship custom labels to the USA?",
        a: "Yes — express DDP shipping to all 50 states in 5–8 days after production. Customs and duties are prepaid.",
      },
      {
        q: "What MOQ do US streetwear brands usually order?",
        a: "Most start with 100–500 woven labels plus matching hem tags. The 1,000-unit tier gives noticeably better per-unit pricing.",
      },
      {
        q: "Can you make relabeling kits for private-label apparel?",
        a: "Yes — woven neck labels, size tabs and care labels as one kit, ready for your relabeling workflow.",
      },
      {
        q: "How do I get a price?",
        a: "Send your design and quantity through the quote form — a tailored quote lands in your inbox or WhatsApp within 12–24 hours.",
      },
    ],
  },
];

export function getMarket(slug: string): Market | null {
  return MARKETS.find((m) => m.slug === slug) || null;
}
