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
  /** Optional: the labelling law summary for this country (with its source). */
  labelRules?: { title: string; points: string[]; source: { name: string; url: string } };
  /** Optional overrides for domestic markets (no customs / DDP wording). */
  shippingHeading?: string;
  shippingCopy?: string;
  deliveryLabel?: string;
  /** Closing CTA secondary link (defaults to the GCC guide). */
  ctaLink?: { href: string; label: string };
};

export const MARKETS: Market[] = [
  {
    slug: "custom-labels-saudi-arabia",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    metaTitle: "Clothing Labels & Hang Tags Saudi Arabia",
    metaDescription:
      "Custom woven labels, satin labels, hang tags and brand packaging for Saudi fashion brands. MOQ from 100, free 24h proof, DDP to Riyadh, Jeddah & Dammam.",
    h1: "Custom Clothing Labels & Branding for Saudi Arabia",
    intro:
      "High-density woven labels, soft satin labels for abayas, luxury hang tags and brand packaging accessories — produced for Saudi fashion houses and delivered DDP to your door in Riyadh, Jeddah or Dammam with no surprise customs.",
    cities: ["Riyadh", "Jeddah", "Dammam", "Makkah", "Madinah"],
    delivery: "3–5 days express (DHL / Aramex), DDP — customs cleared & duties paid",
    labelRules: {"title": "What Saudi labels must show", "points": ["Arabic is mandatory on the label — another language may be added alongside it", "Fibre composition with mass percentages, plus the size or dimensions", "Country of origin (“Made in …”) and care instructions as symbols or text", "The supplier’s name and commercial registration on the outer packaging"], "source": {"name": "SGS — Saudi Technical Regulation for Textile Products (2024 edition)", "url": "https://www.sgs.com/en/news/2024/05/safeguards-7024-saudi-arabia-updates-technical-regulations-for-textile-products"}},
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
    metaTitle: "Clothing Labels & Hang Tags UAE — Dubai",
    metaDescription:
      "Custom woven labels, satin labels, hang tags and packaging for UAE fashion brands. MOQ from 100, free 24h proof, DDP to Dubai, Abu Dhabi & Sharjah.",
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
    metaTitle: "Custom Woven Clothing Labels UK — MOQ 100",
    metaDescription:
      "Custom woven labels, hem tags, patches and hang tags for UK clothing brands. MOQ from 100, free 24h digital proof, DDP delivery — VAT & duties handled.",
    h1: "Custom Clothing Labels for UK Brands",
    intro:
      "Independent UK labels deserve big-brand finishing. High-density damask woven labels, satin care labels and luxury hang tags — low MOQ from 100 units, delivered DDP to London, Manchester, Birmingham and UK-wide.",
    cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow"],
    delivery: "5–8 days express (DHL / FedEx), DDP — VAT & duties handled",
    labelRules: {"title": "What UK labels must show", "points": ["Fibre composition using approved fibre names and percentages — required for textiles sold in the UK", "Care labels are voluntary in the UK, but retailers and buyers expect them (ISO 3758 symbols are the norm)", "Selling into the EU too? Its General Product Safety Regulation asks for the manufacturer’s name, postal and email address on the product or its packaging"], "source": {"name": "The Textile Products (Labelling and Fibre Composition) Regulations 2012", "url": "https://www.legislation.gov.uk/uksi/2012/1102"}},
    ctaLink: {"href": "/guides/clothing-label-requirements", "label": "Clothing label requirements by country →"},
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
    metaTitle: "Custom Woven Clothing Labels USA — MOQ 100",
    metaDescription:
      "Custom woven labels, hem tags, patches & hang tags for US clothing brands. Low MOQ from 100 units, free 24h digital proof, express DDP delivery across the USA.",
    h1: "Custom Clothing Labels for US Brands",
    intro:
      "From LA streetwear to NYC boutiques — damask woven labels, hem tags, woven patches and luxury hang tags with the density and softness your customers can feel. Low MOQ, express DDP shipping across all 50 states.",
    cities: ["Los Angeles", "New York", "Miami", "Chicago", "Houston"],
    delivery: "5–8 days express (DHL / FedEx), DDP — customs & duties handled",
    labelRules: {"title": "What US labels must show", "points": ["Fibre content: generic fibre names with percentages by weight, in descending order", "Country of origin — on garments with a neck, inside the centre of the neck", "Who is responsible: your company name or an FTC-issued RN (RNs go to US businesses only)", "Care instructions on a permanent label, under the FTC Care Labeling Rule"], "source": {"name": "FTC — Threading Your Way Through the Labeling Requirements", "url": "https://www.ftc.gov/business-guidance/resources/threading-your-way-through-labeling-requirements-under-textile-wool-acts"}},
    ctaLink: {"href": "/guides/clothing-label-requirements", "label": "Clothing label requirements by country →"},
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
  {
    slug: "custom-labels-qatar",
    country: "Qatar",
    flag: "🇶🇦",
    metaTitle: "Clothing Labels & Hang Tags Qatar — Doha",
    metaDescription:
      "Custom woven labels, satin labels, hang tags and packaging for Qatari fashion brands. MOQ from 100, free 24h proof, DDP delivery to Doha in 3–6 days.",
    h1: "Custom Clothing Labels & Branding for Qatar",
    intro:
      "From Doha boutiques to modest-wear houses — high-density woven labels, soft satin labels, luxury hang tags and packaging accessories delivered DDP across Qatar with duties prepaid and no customs surprises.",
    cities: ["Doha", "Al Rayyan", "Al Wakrah", "Lusail"],
    delivery: "3–6 days express (DHL / Aramex), DDP — customs cleared & duties paid",
    keywords: [
      "clothing labels Qatar",
      "woven labels Doha",
      "garment labels Qatar",
      "hang tags Doha",
      "abaya labels Qatar",
      "ليبل ملابس قطر",
      "بطاقات تعليق الدوحة",
    ],
    personas: [
      "Doha boutiques and concept stores building coordinated brand kits",
      "Abaya and modest-wear designers needing skin-soft satin labels with Arabic text",
      "Qatari streetwear and athleisure startups launching first drops",
    ],
    faqs: [
      {
        q: "Do you deliver custom labels to Doha?",
        a: "Yes — express DDP delivery across Qatar in 3–6 days after production. Duties are prepaid, so nothing extra is collected at your door in Doha, Lusail or anywhere in Qatar.",
      },
      {
        q: "What is the minimum order for Qatari brands?",
        a: "Woven labels start at just 100 units — ideal for boutique collections. Satin labels and hang tags start at 500 units, with tiered pricing shown on every quote.",
      },
      {
        q: "Can labels include Arabic text?",
        a: "Absolutely — we weave and print Arabic, English or bilingual text, including care instructions, at no extra setup cost. Calligraphic logos are matched carefully on your free proof.",
      },
      {
        q: "How fast can I get a full branding kit in Qatar?",
        a: "Production runs 7–14 working days after proof approval plus 3–6 days express shipping — labels, tags, seals and ribbons ship together as one consolidated DDP parcel.",
      },
    ],
  },
  {
    slug: "custom-labels-kuwait",
    country: "Kuwait",
    flag: "🇰🇼",
    metaTitle: "Clothing Labels & Hang Tags Kuwait",
    metaDescription:
      "Custom woven labels, satin labels, hang tags and packaging for Kuwaiti fashion brands. MOQ from 100, free 24h proof, DDP to Kuwait City in 3–6 days.",
    h1: "Custom Clothing Labels & Branding for Kuwait",
    intro:
      "Kuwaiti fashion brands get the same export-grade branding as global labels — damask woven labels, satin labels, foil hang tags and packaging accessories, delivered DDP to Kuwait City with duties prepaid.",
    cities: ["Kuwait City", "Hawally", "Salmiya", "Al Ahmadi"],
    delivery: "3–6 days express (DHL / Aramex), DDP — customs cleared & duties paid",
    keywords: [
      "clothing labels Kuwait",
      "woven labels Kuwait City",
      "garment labels Kuwait",
      "hang tags Kuwait",
      "abaya labels Kuwait",
      "ليبل ملابس الكويت",
      "تغليف براندات الكويت",
    ],
    personas: [
      "Kuwaiti boutiques and dessert/fashion crossover brands wanting premium packaging",
      "Modest-wear and abaya lines needing soft satin labels with bilingual care text",
      "Online sellers on Instagram/WhatsApp upgrading to professional branding",
    ],
    faqs: [
      {
        q: "Do you ship custom labels to Kuwait?",
        a: "Yes — express DDP delivery to Kuwait City and all governorates in 3–6 days after production, with customs and duties prepaid.",
      },
      {
        q: "What MOQ applies for Kuwaiti brands?",
        a: "Woven labels start at 100 units; satin labels, hang tags and stickers at 500. Every quote shows quantity tiers so you can pick the best value.",
      },
      {
        q: "Can I order labels and packaging together?",
        a: "That's our speciality — a coordinated kit (labels + hang tags + seals + ribbons + zipper bags) Pantone-matched and shipped as one parcel.",
      },
      {
        q: "How do I get a price in Kuwait?",
        a: "Send your design and quantity through the quote form or WhatsApp — a tailored DDP quote for Kuwait lands within 12–24 hours with a free digital proof.",
      },
    ],
  },
  {
    slug: "custom-clothing-labels-pakistan",
    country: "Pakistan",
    flag: "🇵🇰",
    metaTitle: "Clothing Labels & Brand Tags in Pakistan",
    metaDescription:
      "Custom woven labels, brand tags, hang tags and packaging for Pakistani clothing brands. MOQ from 100, free 24h proof, PKR invoicing, nationwide delivery.",
    h1: "Custom Clothing Labels & Brand Tags for Pakistani Brands",
    intro: "Damask woven labels, printed care labels, hang tags and packaging for clothing brands across Pakistan — from Lahore and Karachi to Islamabad and Faisalabad. Order on WhatsApp, approve a free digital proof within 24 hours, and get invoiced in PKR.",
    cities: ["Lahore", "Karachi", "Islamabad", "Faisalabad", "Rawalpindi"],
    delivery: "Nationwide courier delivery (door-to-door across Pakistan)",
    shippingHeading: "Delivered to your door across",
    shippingCopy: "Door-to-door courier delivery to Lahore, Karachi, Islamabad, Faisalabad and Rawalpindi — and every city in between.",
    deliveryLabel: "Delivery",
    ctaLink: {"href": "/guides/clothing-label-requirements", "label": "Clothing label requirements by country →"},
    keywords: ["brand tags for clothing in Pakistan", "clothing labels online in Pakistan", "woven labels manufacturer Pakistan", "label manufacturers in Pakistan", "clothing tags Lahore", "clothing tags Karachi", "hang tags Pakistan"],
    personas: ["Online and Instagram clothing brands launching their first collection", "Boutiques and eastern-wear labels upgrading to damask neck labels and satin care labels", "Brands that want labels, hang tags and packaging from one supplier, in one order"],
    faqs: [
      { q: "Do you deliver custom labels across Pakistan?", a: "Yes — orders are couriered to your door anywhere in Pakistan, from Lahore and Karachi to Islamabad and Faisalabad." },
      { q: "What is the minimum order?", a: "Woven labels start at 100 pieces per design; satin labels and hang tags start at 500, with better per-piece rates on larger runs." },
      { q: "Can I pay in Pakistani rupees?", a: "Yes — orders for Pakistani brands are invoiced in PKR." },
      { q: "How do I order?", a: "Send your logo and quantity on WhatsApp or through the quote form. You get a free digital proof within 24 hours, and production starts only after you approve it." },
      { q: "Do you make labels for brands that export?", a: "Yes — we weave and print care, size and main labels to your text. Selling abroad? Our guide covers what labels must show in the USA, UK, EU, Canada, Australia and Saudi Arabia." },
    ],
  },
  {
    slug: "custom-clothing-labels-canada",
    country: "Canada",
    flag: "🇨🇦",
    metaTitle: "Custom Woven Clothing Labels Canada",
    metaDescription:
      "Custom woven labels, bilingual care labels, hang tags and patches for Canadian clothing brands. MOQ from 100, free 24h proof, DDP delivery across Canada.",
    h1: "Custom Clothing Labels for Canadian Brands",
    intro: "Damask woven labels, bilingual English/French content labels, hem tags, patches and hang tags for Canadian clothing brands — produced to your artwork and shipped DDP, so duties are handled before your order reaches the door.",
    cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa"],
    delivery: "Express international courier (DDP — duties & taxes handled)",
    labelRules: {"title": "What Canadian labels must show", "points": ["Fibre content: the generic name and percentage of every fibre making up 5% or more — in English and French", "Dealer identity: your company name and postal address, or a CA identification number (Canadian businesses only)", "Care instructions are voluntary — but if you show them, the words or symbols must be accurate"], "source": {"name": "Competition Bureau Canada — Textile labelling requirements", "url": "https://competition-bureau.canada.ca/en/labelling/textile-labelling/textile-labelling-requirements"}},
    ctaLink: {"href": "/guides/clothing-label-requirements", "label": "Clothing label requirements by country →"},
    keywords: ["custom woven labels Canada", "custom clothing labels Canada", "woven clothing labels Canada", "bilingual clothing labels", "custom woven patches Canada", "clothing label requirements Canada"],
    personas: ["Streetwear and athleisure founders launching with damask neck labels", "Brands that need bilingual English/French content labels alongside the main label", "Makers and small studios ordering their first 100 woven labels"],
    faqs: [
      { q: "Do Canadian clothing labels need French?", a: "Yes — under the Textile Labelling Act the fibre-content information must appear in both English and French. Dealer identity and country of origin don’t have to be bilingual." },
      { q: "What is a CA number?", a: "A CA identification number is issued by the Competition Bureau to Canadian businesses and can replace your company name and postal address on the label. Without one, the label shows your name and full postal address." },
      { q: "Are care labels mandatory in Canada?", a: "Care labelling is voluntary in Canada, but if you include care instructions — words or symbols — they must be accurate. We weave and print care text and symbols to your specification." },
      { q: "What is the minimum order?", a: "Woven labels start at 100 pieces per design; satin labels and hang tags start at 500, with better per-piece rates on larger runs." },
      { q: "Do you ship to Canada?", a: "Yes — express courier shipping to Canada with DDP available, so duties and taxes are handled before delivery." },
    ],
  },
  {
    slug: "custom-clothing-labels-australia",
    country: "Australia",
    flag: "🇦🇺",
    metaTitle: "Custom Woven Clothing Labels Australia",
    metaDescription:
      "Custom woven labels, care labels with ISO symbols, hang tags and patches for Australian clothing brands. MOQ from 100, free 24h proof, DDP delivery.",
    h1: "Custom Clothing Labels for Australian Brands",
    intro: "Damask woven neck labels, care labels with English text or ISO 3758 care symbols, hem tags, patches and hang tags for Australian clothing brands — produced to your artwork and shipped DDP to your door.",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    delivery: "Express international courier (DDP — duties & taxes handled)",
    labelRules: {"title": "What Australian labels must show", "points": ["Care instructions are mandatory — permanently attached, in English, ISO 3758 care symbols, or both", "Country of origin is required in the trade description of imported clothing", "Fibre content isn’t required by the national standard, but any fibre claim must be accurate"], "source": {"name": "ACCC Product Safety Australia — Care labelling mandatory standard", "url": "https://www.productsafety.gov.au/business/search-mandatory-standards/care-labelling-for-clothing-and-textiles-mandatory-standard"}},
    ctaLink: {"href": "/guides/clothing-label-requirements", "label": "Clothing label requirements by country →"},
    keywords: ["custom woven labels Australia", "custom clothing labels Australia", "woven clothing labels Australia", "care labels Australia", "custom woven patches Australia", "clothing label requirements Australia"],
    personas: ["Streetwear, swim and activewear founders launching with damask neck labels", "Brands that need care labels in English or ISO care symbols", "Small studios ordering their first 100 woven labels"],
    faqs: [
      { q: "Are care labels mandatory in Australia?", a: "Yes — the Consumer Goods (Care Labelling) Information Standard 2023 requires adequate care instructions permanently attached to clothing. Since 5 March 2024 they can be written in English, shown with ISO 3758 care symbols, or both." },
      { q: "Do Australian labels need fibre content?", a: "Fibre content isn’t required by the national care labelling standard, but it’s widely expected — and any fibre claim must be accurate under Australian Consumer Law." },
      { q: "Is country of origin required?", a: "For imported clothing, yes — a true trade description including the country of origin is required at the border under the Commerce (Trade Descriptions) Act 1905." },
      { q: "What is the minimum order?", a: "Woven labels start at 100 pieces per design; satin labels and hang tags start at 500, with better per-piece rates on larger runs." },
      { q: "Do you ship to Australia?", a: "Yes — express courier shipping to Australia with DDP available, so duties and taxes are handled before delivery." },
    ],
  },
];

export function getMarket(slug: string): Market | null {
  return MARKETS.find((m) => m.slug === slug) || null;
}
