/**
 * Per-product PDP (product detail page) content: configurator options,
 * technical specs, logistics and FAQ copy. Keyed by product slug.
 * Products themselves (title, images, MOQ, turnaround) come from the DB.
 */

export type PdpSpec = { label: string; value: string };
export type PdpFaq = { q: string; a: string };

export type PdpContent = {
  /** H1 override — high-intent B2B title. */
  h1: string;
  /** Short benefit line under the H1. */
  intro: string;
  /** Fold / style options (empty = not applicable). */
  folds: string[];
  /** Material / finish options. */
  finishes: string[];
  /** Technical specification rows. */
  specs: PdpSpec[];
  faqs: PdpFaq[];
};

export const VOLUME_TIERS = [
  "100 units (Low MOQ)",
  "500 units",
  "1,000 units",
  "5,000+ units (Bulk)",
] as const;

const SHARED_LOGISTICS: PdpSpec[] = [
  { label: "Quote turnaround", value: "Tailored quote within 12–24 hours" },
  { label: "Digital proof", value: "Free digital mockup within 24h — production starts only after your approval" },
  { label: "Artwork files", value: "AI, EPS, PDF, SVG or high-res PNG" },
  { label: "Express delivery", value: "KSA / UAE 3–5 days · GCC 4–6 · UK / USA 5–8 (DHL · FedEx · Aramex)" },
  { label: "Shipping terms", value: "DDP (duties paid, door delivery) or FOB for bulk freight" },
];

export const PDP: Record<string, PdpContent> = {
  "woven-labels": {
    h1: "Custom High-Density Damask Woven Labels",
    intro:
      "Skin-soft, high-density damask weaves that survive 50+ industrial washes. The neck label your customers touch first — woven thread by thread for GCC and international fashion brands.",
    folds: ["Straight Cut", "Center Fold", "End Fold", "Manhattan Fold"],
    finishes: ["High-Density Damask", "Soft Satin Weave", "Metallic Thread (Gold / Silver)", "Organic Cotton"],
    specs: [
      { label: "Weave", value: "High-density damask, 100D polyester yarn" },
      { label: "Density", value: "Up to 340 picks — sharp fine-text reproduction" },
      { label: "Wash durability", value: "50+ industrial washes without fray" },
      { label: "Edges", value: "Heat-cut, ultrasonic or woven selvedge" },
      { label: "Skin safety", value: "OEKO-TEX® Standard 100 certified yarns" },
      ...SHARED_LOGISTICS,
    ],
    faqs: [
      { q: "What is the minimum order for custom woven labels?", a: "MOQ starts at just 100 units, ideal for new and small-batch fashion brands. Bulk tiers of 500, 1,000 and 5,000+ units get progressively better per-unit rates in your custom quote." },
      { q: "Can you match my exact brand colors?", a: "Yes — we match thread colors against the Pantone (PMS) system and confirm them on your free digital proof before weaving begins." },
      { q: "Which fold types can I choose?", a: "Straight cut, center fold, end fold and Manhattan fold. If you're unsure, send your garment type on WhatsApp and we'll recommend the right fold." },
      { q: "How long does production and delivery take?", a: "Production runs 7–14 working days after proof approval, then express shipping: 3–5 days to Saudi Arabia/UAE, 5–8 days to UK/USA." },
      { q: "Do I get to approve the design before production?", a: "Always. A free, accurate digital mockup is sent within 24 hours — nothing is woven until you approve it." },
    ],
  },
  "satin-labels": {
    h1: "Soft Satin Clothing Labels",
    intro:
      "Silky-smooth satin labels for abayas, lingerie, kidswear and premium ready-to-wear — luxury softness with crisp printed or woven branding.",
    folds: ["Straight Cut", "Center Fold", "End Fold"],
    finishes: ["Printed Satin", "Woven Satin", "Metallic Accent"],
    specs: [
      { label: "Material", value: "Premium soft satin polyester ribbon" },
      { label: "Softness", value: "Zero-itch finish — ideal for skin-contact placements" },
      { label: "Wash durability", value: "40+ washes with sharp print retention" },
      { label: "Sizes", value: "Custom width from 15mm to 76mm" },
      { label: "Skin safety", value: "OEKO-TEX® Standard 100 certified" },
      ...SHARED_LOGISTICS,
    ],
    faqs: [
      { q: "Are satin labels good for abayas and modest wear?", a: "Yes — satin is the preferred label for abaya and modest fashion houses across Saudi Arabia and the GCC because it is soft, elegant and drapes with the fabric." },
      { q: "Printed or woven satin — which should I pick?", a: "Printed satin gives ultra-fine detail for logos and care text; woven satin gives a raised premium texture. We'll show both options in your free digital proof." },
      { q: "What is the minimum order quantity?", a: "Satin label runs start at 500 units, with better per-unit rates at 1,000 and 5,000+." },
      { q: "Can you print washing/care instructions in Arabic?", a: "Yes — full Arabic, English or bilingual care text is supported at no extra setup cost." },
      { q: "How fast can I get them in Riyadh or Dubai?", a: "Production 7 working days + 3–5 days express delivery — roughly two weeks door-to-door with DDP (no surprise customs)." },
    ],
  },
  "hang-tags": {
    h1: "Luxury Custom Hang Tags",
    intro:
      "Premium board hang tags with foil detailing, embossing and custom stringing — the first thing your customer touches before they even open the garment.",
    folds: [],
    finishes: ["Matte Lamination", "Gold / Silver Foil", "Embossed / Debossed", "Kraft Natural", "Soft-Touch Velvet"],
    specs: [
      { label: "Board", value: "300–400 GSM premium art board" },
      { label: "Print", value: "Full-colour offset + spot finishes" },
      { label: "Extras", value: "Eyelets, waxed cotton string, safety pins, stickers" },
      { label: "Shapes", value: "Die-cut custom shapes at no extra design fee" },
      ...SHARED_LOGISTICS,
    ],
    faqs: [
      { q: "What is the minimum hang tag order?", a: "500 units minimum, with 1,000 and 5,000+ tiers priced sharper per unit in your custom quote." },
      { q: "Can you do gold foil and embossing together?", a: "Yes — foil, embossing, debossing and spot-UV can be combined. Your digital proof shows the exact finish placement before print." },
      { q: "Do tags come with string attached?", a: "Optional — choose pre-strung (waxed cotton, satin ribbon or elastic) or string supplied loose." },
      { q: "Which file formats do you need?", a: "Vector AI, EPS or PDF is best; a high-res PNG also works — we redraw it for print at no charge." },
      { q: "How long until delivery to the GCC?", a: "Production 7 working days after approval + 3–6 days express to KSA, UAE, Qatar, Kuwait, Bahrain and Oman." },
    ],
  },
  stickers: {
    h1: "Custom Brand Stickers & Seals",
    intro:
      "Vinyl, matte, transparent and foil stickers that finish your packaging — tissue seals, box stickers, thank-you seals and logo decals.",
    folds: [],
    finishes: ["Glossy Vinyl", "Matte", "Transparent", "Gold / Silver Foil", "Holographic"],
    specs: [
      { label: "Material", value: "Waterproof vinyl / matte / clear PET" },
      { label: "Adhesive", value: "Strong permanent or removable low-tack" },
      { label: "Cut", value: "Kiss-cut sheets, die-cut singles or rolls" },
      { label: "Sizes", value: "From 20mm seals to large box decals" },
      ...SHARED_LOGISTICS,
    ],
    faqs: [
      { q: "What sticker shapes can I order?", a: "Any die-cut shape — circles, rectangles, or fully custom outlines around your logo at no extra die fee." },
      { q: "Are the stickers waterproof?", a: "Vinyl and PET stickers are fully waterproof and scratch-resistant — safe for packaging, bottles and outdoor use." },
      { q: "What is the minimum order?", a: "500 units, mixed designs possible on request — ask on WhatsApp for combo runs." },
      { q: "Rolls or sheets?", a: "Both. Rolls suit dispensers and high-volume packing; sheets suit small studios. Tell us your packing flow and we'll advise." },
      { q: "How fast is delivery?", a: "Production 5–7 working days + express shipping 3–8 days depending on destination, DDP available." },
    ],
  },
  "brand-packaging": {
    h1: "Custom Brand Packaging & Boxes",
    intro:
      "Rigid boxes, mailers and tissue sets that turn an order into an unboxing moment — engineered for DTC fashion brands that want to be remembered.",
    folds: [],
    finishes: ["Rigid Box", "Corrugated Mailer", "Folding Carton", "Tissue + Sticker Set", "Soft-Touch Lamination + Foil"],
    specs: [
      { label: "Board", value: "Rigid greyboard / E-flute corrugated / folding carton" },
      { label: "Print", value: "Full-colour litho + foil, embossing, spot-UV" },
      { label: "Sizes", value: "Fully custom dimensions engineered to your garments" },
      { label: "Extras", value: "Custom tissue, ribbon pulls, magnetic closures, inserts" },
      ...SHARED_LOGISTICS,
    ],
    faqs: [
      { q: "What is the minimum packaging order?", a: "100 units for mailers and cartons; rigid boxes typically start at 200–300 units — your quote confirms exact tiers." },
      { q: "Can you match my box to my label set?", a: "Yes — we produce labels, tags, tissue and boxes as one coordinated brand kit with consistent Pantone colors." },
      { q: "Do you provide structural design?", a: "Yes, free — send your garment dimensions and we engineer the dieline, then send a 3D digital mockup for approval." },
      { q: "How are boxes shipped to me?", a: "Flat-packed to save freight (mailers/cartons) or protected bulk cartons for rigid boxes, DDP to your door." },
      { q: "How long does production take?", a: "10–14 working days after proof approval, plus 4–8 days express freight depending on destination." },
    ],
  },
  "zipper-bags": {
    h1: "Frosted Custom Zipper Bags",
    intro:
      "Frosted and matte zipper bags with your logo — the clean, boutique way to pack, protect and present garments in-store and in shipping.",
    folds: [],
    finishes: ["Frosted Matte", "Clear Gloss", "Colour Tinted", "Slider Zip", "Press-Seal Zip"],
    specs: [
      { label: "Material", value: "Food-grade PE / CPE / PVC, 60–120 micron" },
      { label: "Print", value: "Up to 4 colours, front and back" },
      { label: "Sizes", value: "Custom sizes from accessories to outerwear" },
      { label: "Extras", value: "Air-hole valves, hang-holes, gusseted bottoms" },
      ...SHARED_LOGISTICS,
    ],
    faqs: [
      { q: "What is the minimum zipper bag order?", a: "100 units on standard sizes; fully custom sizes typically start at 500 units — confirmed in your quote." },
      { q: "Frosted or clear — which looks more premium?", a: "Frosted matte is the boutique standard: it diffuses the garment silhouette and makes logos pop. Clear suits e-commerce QC flows." },
      { q: "Are the bags recyclable?", a: "PE and CPE bags are recyclable; we can also print recycling symbols and offer thicker reusable-grade options." },
      { q: "Can you print in metallic ink?", a: "Yes — gold, silver and custom Pantone inks are available on frosted and tinted bags." },
      { q: "Delivery time to GCC?", a: "Production 7–10 working days + 4–6 days express to the GCC, DDP available." },
    ],
  },
  patch: {
    h1: "Custom Woven & Embroidered Patches",
    intro:
      "Iron-on, sew-on and velcro patches with dense embroidered texture — built for caps, denim, workwear and streetwear drops.",
    folds: [],
    finishes: ["Embroidered", "Woven (Fine Detail)", "Chenille", "PVC Rubber", "Leather-Look"],
    specs: [
      { label: "Backing", value: "Iron-on, sew-on, velcro or adhesive" },
      { label: "Borders", value: "Merrowed edge or laser heat-cut" },
      { label: "Coverage", value: "Up to 100% embroidery coverage" },
      { label: "Wash durability", value: "50+ washes with proper application" },
      ...SHARED_LOGISTICS,
    ],
    faqs: [
      { q: "Woven or embroidered patch — what's the difference?", a: "Embroidered gives raised 3D texture; woven captures fine small text and gradients. We'll recommend based on your artwork in the free proof." },
      { q: "What is the minimum patch order?", a: "100 units, with sharper unit rates at 500 and 1,000+." },
      { q: "Do iron-on patches survive washing?", a: "Yes — properly heat-applied patches last 50+ washes. We include application instructions with every order." },
      { q: "Can you do glow-in-the-dark or metallic thread?", a: "Yes — metallic gold/silver, neon and glow threads are all available." },
      { q: "How fast can I get samples?", a: "A photo sample of your actual patch is shared before dispatch; pre-production digital proofs arrive within 24 hours." },
    ],
  },
  "steel-logo": {
    h1: "Engraved Steel Logo Tags",
    intro:
      "Laser-engraved stainless steel tags and plates — the jewellery of garment branding for luxury leather goods, denim and premium outerwear.",
    folds: [],
    finishes: ["Brushed Steel", "Polished Mirror", "Matte Black Coated", "Gold PVD", "Antique Finish"],
    specs: [
      { label: "Material", value: "304 stainless steel / zinc alloy" },
      { label: "Marking", value: "Laser engraving, deep etching or stamping" },
      { label: "Attachment", value: "Rivets, prongs, sew-holes or adhesive" },
      { label: "Finish durability", value: "PVD coatings resist tarnish and wear" },
      ...SHARED_LOGISTICS,
    ],
    faqs: [
      { q: "What is the minimum order for steel tags?", a: "500 units for standard shapes; custom die shapes are quoted per design — tiers at 1,000 and 5,000+ reduce unit cost significantly." },
      { q: "Will the finish tarnish over time?", a: "No — PVD-coated gold, black and antique finishes are wear-resistant and won't flake or tarnish in normal garment use." },
      { q: "How do the tags attach to garments?", a: "Choose rivet-back, prong-fold, sew-through holes or industrial adhesive backing — we advise based on your fabric." },
      { q: "Can you engrave very small text?", a: "Yes — laser engraving reproduces text down to 0.8mm cleanly on brushed and matte finishes." },
      { q: "Lead time for a bulk order?", a: "Tooling + production 10–14 working days, then express air freight 4–8 days worldwide with DDP available." },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Admin overrides: stored in the pdp_content table as plain text      */
/* fields and parsed with these helpers.                               */
/* ------------------------------------------------------------------ */

/** One option per line. */
export function parseLines(raw: string | null | undefined): string[] {
  return String(raw ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 20);
}

/** "Label | Value" per line. */
export function parseSpecs(raw: string | null | undefined): PdpSpec[] {
  return String(raw ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.includes("|"))
    .map((l) => {
      const i = l.indexOf("|");
      return { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() };
    })
    .filter((s) => s.label && s.value)
    .slice(0, 30);
}

/** Q: ...\nA: ... blocks separated by blank lines. */
export function parseFaqs(raw: string | null | undefined): PdpFaq[] {
  const out: PdpFaq[] = [];
  const blocks = String(raw ?? "").split(/\n\s*\n/);
  for (const b of blocks) {
    const qm = b.match(/^\s*Q:\s*([\s\S]*?)\n\s*A:\s*([\s\S]*)$/i);
    if (qm) out.push({ q: qm[1].trim(), a: qm[2].trim() });
  }
  return out.slice(0, 12);
}

export function linesToText(list: string[]): string {
  return list.join("\n");
}
export function specsToText(specs: PdpSpec[]): string {
  return specs.map((s) => `${s.label} | ${s.value}`).join("\n");
}
export function faqsToText(faqs: PdpFaq[]): string {
  return faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
}

export type PdpOverrideRow = {
  slug: string;
  h1: string | null;
  intro: string | null;
  folds: string | null;
  finishes: string | null;
  specs: string | null;
  faqs: string | null;
};

/** Merge a DB override row over the built-in defaults. Blank fields keep defaults. */
export function mergePdpContent(base: PdpContent, ov: PdpOverrideRow | null | undefined): PdpContent {
  if (!ov) return base;
  return {
    h1: ov.h1?.trim() || base.h1,
    intro: ov.intro?.trim() || base.intro,
    folds: ov.folds?.trim() ? parseLines(ov.folds) : base.folds,
    finishes: ov.finishes?.trim() ? parseLines(ov.finishes) : base.finishes,
    specs: ov.specs?.trim() ? parseSpecs(ov.specs) : base.specs,
    faqs: ov.faqs?.trim() ? parseFaqs(ov.faqs) : base.faqs,
  };
}

/** Safe accessor with a sensible generic fallback. */
export function getPdpContent(slug: string, title: string): PdpContent {
  return (
    PDP[slug] || {
      h1: `Custom ${title}`,
      intro: `Premium custom ${title.toLowerCase()} produced for fashion brands worldwide — free digital proof within 24 hours, express DDP delivery.`,
      folds: [],
      finishes: [],
      specs: SHARED_LOGISTICS,
      faqs: [
        { q: `What is the minimum order for ${title.toLowerCase()}?`, a: "Minimums vary by specification — request a quote and we'll confirm the best tier for your budget within 24 hours." },
        { q: "Do I approve a proof before production?", a: "Always — a free digital mockup is sent within 24 hours and production starts only after your approval." },
        { q: "Do you deliver to the GCC and worldwide?", a: "Yes — express DDP delivery to Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman, UK, USA and worldwide." },
      ],
    }
  );
}
