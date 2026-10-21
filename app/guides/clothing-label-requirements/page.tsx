import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PAGE_URL = `${SITE_URL}/guides/clothing-label-requirements`;
const UPDATED = "2026-10-22";

export const metadata: Metadata = {
  title: "Clothing Label Requirements by Country (2026)",
  description:
    "What must go on a clothing label in the USA, UK, EU, Canada, Australia and Saudi Arabia — fibre content, origin, care and ID — with official sources.",
  alternates: {
    canonical: PAGE_URL,
    languages: { en: PAGE_URL, "x-default": PAGE_URL },
  },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    title: "Clothing Label Requirements by Country — USA, UK, EU, Canada, Australia, KSA",
    description:
      "Fibre content, country of origin, RN/CA numbers, care symbols and language rules for clothing labels — summarised per country with official sources.",
    siteName: BRAND_NAME,
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Clothing label requirements by country" }],
  },
  twitter: { card: "summary_large_image" },
};

/** Every rule below is summarised from the linked official / primary source. */
const SRC = {
  ftc: { name: "FTC — Threading Your Way Through the Labeling Requirements Under the Textile and Wool Acts", url: "https://www.ftc.gov/business-guidance/resources/threading-your-way-through-labeling-requirements-under-textile-wool-acts" },
  ftcTopic: { name: "FTC — Apparel and labeling", url: "https://www.ftc.gov/news-events/topics/tools-consumers/apparel-labeling" },
  canada: { name: "Competition Bureau Canada — Textile labelling requirements", url: "https://competition-bureau.canada.ca/en/labelling/textile-labelling/textile-labelling-requirements" },
  uk: { name: "The Textile Products (Labelling and Fibre Composition) Regulations 2012", url: "https://www.legislation.gov.uk/uksi/2012/1102" },
  eu: { name: "EUR-Lex — Regulation (EU) No 1007/2011 on textile fibre names and labelling (summary)", url: "https://eur-lex.europa.eu/EN/legal-content/summary/textile-products-textile-fibre-names-and-labelling.html" },
  gpsr: { name: "EUR-Lex — Regulation (EU) 2023/988 on general product safety (GPSR)", url: "https://eur-lex.europa.eu/eli/reg/2023/988/oj/eng" },
  au: { name: "ACCC Product Safety Australia — Care labelling for clothing and textiles mandatory standard", url: "https://www.productsafety.gov.au/business/search-mandatory-standards/care-labelling-for-clothing-and-textiles-mandatory-standard" },
  ksa: { name: "SGS — Saudi Arabia updates Technical Regulations for Textile Products (2024)", url: "https://www.sgs.com/en/news/2024/05/safeguards-7024-saudi-arabia-updates-technical-regulations-for-textile-products" },
  hs: { name: "UK Trade Tariff — Heading 5807 (labels, badges and similar articles)", url: "https://www.trade-tariff.service.gov.uk/headings/5807" },
};

const TABLE: Array<{ market: string; fibre: string; origin: string; identity: string; care: string }> = [
  { market: "United States", fibre: "Required", origin: "Required — inside the neck on garments with a neck", identity: "Required — company name or RN", care: "Required — permanent label" },
  { market: "Canada", fibre: "Required — English and French", origin: "Not required by the Textile Labelling Act", identity: "Required — name + postal address, or CA number", care: "Voluntary (must be accurate if shown)" },
  { market: "United Kingdom", fibre: "Required", origin: "Not set by the textile rules", identity: "Not set by the textile rules", care: "Voluntary" },
  { market: "European Union", fibre: "Required — in the local language", origin: "Not covered by the textile regulation", identity: "Manufacturer details required by the GPSR", care: "Voluntary" },
  { market: "Australia", fibre: "Not mandated (claims must be accurate)", origin: "Required on imported clothing", identity: "Not set by the care standard", care: "Required — English or ISO symbols" },
  { market: "Saudi Arabia", fibre: "Required — in Arabic", origin: "Required — “Made in …”", identity: "Supplier name + CR on outer packaging", care: "Required — symbols or text" },
];

const COUNTRIES: Array<{ id: string; title: string; lead: string; points: string[]; src: Array<{ name: string; url: string }> }> = [
  {
    id: "usa",
    title: "United States (FTC)",
    lead: "Clothing sold in the US falls under the Textile Fiber Products Identification Act and the FTC Care Labeling Rule. Four things belong on the label:",
    points: [
      "Fibre content — generic fibre names (cotton, polyester, elastane…) with percentages by weight, listed in descending order.",
      "Country of origin — for example “Made in Pakistan”. On garments with a neck, origin goes on a label inside the centre of the neck, between the shoulder seams.",
      "Who is responsible — your company name or a Registered Identification Number (RN). The FTC issues RNs to US businesses only; an overseas maker uses its name or a US importer’s RN. An RN is optional.",
      "Care instructions — required on a permanent label for apparel under the Care Labeling Rule (16 CFR Part 423).",
    ],
    src: [SRC.ftc, SRC.ftcTopic],
  },
  {
    id: "canada",
    title: "Canada (Competition Bureau)",
    lead: "Canada’s Textile Labelling Act sets a bilingual disclosure label:",
    points: [
      "Fibre content — the generic name and percentage of each fibre that makes up 5% or more of the total mass, in English and French. The two languages may sit on two separate labels, as long as they are connected or touching.",
      "Dealer identity — your company name and full postal address, or a CA identification number (only Canadian businesses can get one). Identity and country of origin don’t need to be bilingual.",
      "Care instructions are voluntary. If you include them, as words or symbols, they must be accurate. Quebec has additional French-language rules.",
    ],
    src: [SRC.canada],
  },
  {
    id: "uk",
    title: "United Kingdom",
    lead: "The Textile Products (Labelling and Fibre Composition) Regulations 2012 apply the textile fibre rules in the UK:",
    points: [
      "Fibre composition is required — using the approved fibre names, with percentages by weight.",
      "Care labelling is voluntary, but buyers and retailers expect it. Most brands use the international ISO 3758 care symbols.",
      "The textile rules don’t set origin or identity labelling — but other product rules can apply, so check before you launch.",
    ],
    src: [SRC.uk],
  },
  {
    id: "eu",
    title: "European Union",
    lead: "Regulation (EU) No 1007/2011 harmonises fibre labelling across the EU, and the General Product Safety Regulation adds traceability details:",
    points: [
      "Fibre composition is mandatory — only fibre names from Annex I, percentages by weight in descending order, on a durable, legible and securely attached label.",
      "The label must be in the official language(s) of the member state where the product is sold.",
      "The textile regulation does not cover size, country of origin or care — care labelling is voluntary.",
      "Since 13 December 2024 the GPSR requires the manufacturer’s name (or registered trade name/trade mark) with a postal and an electronic address, plus a type, batch or serial number, on the product — or, where that isn’t possible, on its packaging or an accompanying document. Manufacturers outside the EU also need an EU-based responsible person.",
    ],
    src: [SRC.eu, SRC.gpsr],
  },
  {
    id: "australia",
    title: "Australia (ACCC)",
    lead: "Australia’s mandatory rule is about care, set by the Consumer Goods (Care Labelling) Information Standard 2023:",
    points: [
      "Care instructions are mandatory and must be permanently attached to clothing. Since 5 March 2024 they can be written in English, shown with ISO 3758 care symbols, or both.",
      "Fibre content isn’t required by the national standard — but it’s widely expected, and any fibre claim must be accurate under Australian Consumer Law.",
      "Imported clothing needs a true trade description that includes the country of origin, under the Commerce (Trade Descriptions) Act 1905.",
    ],
    src: [SRC.au],
  },
  {
    id: "saudi-arabia",
    title: "Saudi Arabia (SASO)",
    lead: "The SASO Technical Regulation for Textile Products (current edition adopted in January 2024) asks for a label that is sewn or securely attached, with:",
    points: [
      "Arabic text — Arabic is mandatory; another language can be added alongside it.",
      "Fibre composition with mass percentages, plus the product’s size, weight or dimensions.",
      "Country of origin (“Made in …”) and care instructions as symbols or text.",
      "The supplier’s name and commercial registration, on the outer packaging.",
    ],
    src: [SRC.ksa],
  },
];

const CARE_SYMBOLS: Array<{ name: string; icon: JSX.Element; meaning: string }> = [
  {
    name: "Washing",
    icon: (
      <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden>
        <path d="M7 17l4 23h26l4-23" />
        <path d="M7 17c3-4 5.5-4 8.5 0s5.5 4 8.5 0 5.5-4 8.5 0 5.5 4 8.5 0" />
        <text x="24" y="34" textAnchor="middle" fontSize="11" fill="currentColor" stroke="none" fontFamily="Arial, sans-serif">30</text>
      </svg>
    ),
    meaning: "The tub. A number or dots give the maximum water temperature, a hand means hand wash, and a cross means do not wash.",
  },
  {
    name: "Bleaching",
    icon: (
      <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden>
        <path d="M24 8l17 31H7z" />
      </svg>
    ),
    meaning: "The triangle. Empty means any bleach, two diagonal lines inside mean non-chlorine bleach only, and a cross means do not bleach.",
  },
  {
    name: "Drying",
    icon: (
      <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
        <rect x="8" y="8" width="32" height="32" rx="1.5" />
        <circle cx="24" cy="24" r="10.5" />
      </svg>
    ),
    meaning: "The square. A circle inside means tumble dry (dots show the heat); lines inside mean natural drying — line dry, dry flat or drip dry.",
  },
  {
    name: "Ironing",
    icon: (
      <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden>
        <path d="M6 36c4-9.5 11-13.5 21-13.5H41V36z" />
        <path d="M27 22.5V16h10v6.5" />
        <circle cx="29" cy="30" r="1.8" fill="currentColor" stroke="none" />
      </svg>
    ),
    meaning: "The iron. One, two or three dots mean low, medium or high heat; a cross means do not iron.",
  },
  {
    name: "Professional care",
    icon: (
      <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
        <circle cx="24" cy="24" r="16" />
        <text x="24" y="29.5" textAnchor="middle" fontSize="15" fill="currentColor" stroke="none" fontFamily="Arial, sans-serif">P</text>
      </svg>
    ),
    meaning: "The circle. Letters such as P or F tell the dry cleaner which process to use, W means professional wet cleaning, and a cross means do not dry clean.",
  },
];

const FAQS = [
  {
    q: "What has to be on a clothing label in the USA?",
    a: "Fibre content (generic names and percentages by weight), the country of origin, the company name or RN of the business responsible, and care instructions on a permanent label.",
  },
  {
    q: "Do I need an RN number to sell clothing in the US?",
    a: "No. An RN is optional — you can print your company name instead. The FTC only issues RNs to US businesses; overseas manufacturers use their own name or a US importer’s RN.",
  },
  {
    q: "Are care labels mandatory in the UK and EU?",
    a: "No. Fibre composition is mandatory in both; care labelling is voluntary, although buyers expect it and most brands use ISO 3758 care symbols.",
  },
  {
    q: "Do Canadian clothing labels need French?",
    a: "Yes — the fibre-content information must be in English and French. Dealer identity (name and address or CA number) and country of origin don’t have to be bilingual.",
  },
  {
    q: "Can a hang tag replace the care label?",
    a: "Not where a permanent care label is required, such as in the USA under the Care Labeling Rule and for clothing in Australia. Hang tags are removable, so care details belong on a sewn-in label.",
  },
  {
    q: "What is the HS code for woven labels?",
    a: "Woven labels fall under HS 5807.10 (labels, badges and similar articles of textile materials, woven, not embroidered). Printed fabric labels generally fall under 5807.90 and embroidered badges under 5810. National digits and duty rates vary, so confirm the full code with your customs broker.",
  },
  {
    q: "Can Prime Labels make my care and content labels?",
    a: "Yes — we weave and print care, content, size and main labels to your text, including Arabic and bilingual versions, with a free digital proof within 24 hours. You supply the information; we make it look right.",
  },
];

const linkCls = "text-champagne underline-offset-4 hover:underline";

export default async function ClothingLabelRequirementsGuide() {
  const site = await getSiteContent();
  const jsonLd = [
    breadcrumbJsonLd([{ name: "Clothing label requirements", path: "/guides/clothing-label-requirements" }]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Clothing Label Requirements by Country: USA, Canada, UK, EU, Australia and Saudi Arabia",
      description:
        "What clothing labels must show in each market — fibre content, country of origin, business identity, care instructions and language — with official sources.",
      datePublished: UPDATED,
      dateModified: UPDATED,
      mainEntityOfPage: PAGE_URL,
      image: `${SITE_URL}/og-banner.jpg`,
      author: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
      publisher: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-20">
        <div className="pointer-events-none absolute -left-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              Compliance guide · Updated October 2026
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              Clothing label requirements, <span className="gradient-text italic">country by country.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">
              Before you order labels, know what has to be on them. This guide summarises what the USA, Canada, the UK,
              the EU, Australia and Saudi Arabia require on clothing labels — fibre content, country of origin, the
              business responsible, care instructions and language — with a link to the official source for every rule.
            </p>
          </Reveal>

          {/* short answer */}
          <Reveal delay={0.06}>
            <div className="mt-12 rounded-3xl border border-champagne/25 bg-surface/40 p-6 sm:p-8">
              <h2 className="display text-2xl sm:text-3xl">The short answer: what to put on a clothing label</h2>
              <p className="mt-4 text-[14px] leading-relaxed text-cream-muted">
                Most markets ask for some mix of five things — which ones are mandatory depends on where you sell:
              </p>
              <ol className="mt-5 grid gap-3 text-[13.5px] leading-relaxed text-cream-muted sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Fibre content", "e.g. 95% cotton, 5% elastane"],
                  ["Country of origin", "e.g. Made in Pakistan"],
                  ["Business identity", "name, RN or CA number"],
                  ["Care instructions", "words or care symbols"],
                  ["The right language", "e.g. Arabic in KSA, French + English in Canada"],
                ].map(([t, d], i) => (
                  <li key={t} className="rounded-2xl border border-line bg-cream/[0.02] p-4">
                    <span className="text-[11px] uppercase tracking-wide2 text-champagne">{i + 1}</span>
                    <p className="mt-1 font-medium text-cream">{t}</p>
                    <p className="mt-1 text-[12.5px] text-cream-dim">{d}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          {/* comparison table */}
          <Reveal delay={0.08}>
            <div className="mt-14">
              <h2 className="display text-2xl sm:text-3xl">Requirements at a glance</h2>
              <p className="mt-2 text-[12.5px] text-cream-dim sm:hidden">← swipe the table →</p>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[680px] text-left text-[13px]">
                  <thead className="bg-cream/[0.04] text-[10.5px] uppercase tracking-wide2 text-cream-dim">
                    <tr>
                      {["Market", "Fibre content", "Country of origin", "Business identity", "Care instructions"].map((h) => (
                        <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TABLE.map((r) => (
                      <tr key={r.market} className="border-t border-line align-top">
                        <th scope="row" className="px-4 py-3 font-medium text-cream">
                          <a href={`#${COUNTRIES.find((c) => c.title.startsWith(r.market))?.id ?? ""}`} className="hover:text-champagne">{r.market}</a>
                        </th>
                        <td className="px-4 py-3 text-cream-muted">{r.fibre}</td>
                        <td className="px-4 py-3 text-cream-muted">{r.origin}</td>
                        <td className="px-4 py-3 text-cream-muted">{r.identity}</td>
                        <td className="px-4 py-3 text-cream-muted">{r.care}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-cream-dim">
                “Not set by the textile rules” means that specific law doesn’t require it — other product, customs or
                retailer rules may still apply.
              </p>
            </div>
          </Reveal>

          {/* country sections */}
          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {COUNTRIES.map((c, i) => (
              <Reveal key={c.id} delay={0.04 * (i % 2)}>
                <article id={c.id} className="h-full scroll-mt-28 rounded-3xl border border-line bg-cream/[0.02] p-6 sm:p-7">
                  <h2 className="display text-2xl">{c.title}</h2>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-cream-muted">{c.lead}</p>
                  <ul className="mt-4 space-y-3">
                    {c.points.map((p) => (
                      <li key={p} className="flex gap-3 text-[13.5px] leading-relaxed text-cream-muted">
                        <span className="mt-0.5 text-champagne">✦</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[12px] leading-relaxed text-cream-dim">
                    Source{c.src.length > 1 ? "s" : ""}:{" "}
                    {c.src.map((s, j) => (
                      <span key={s.url}>
                        {j > 0 && " · "}
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkCls}>{s.name}</a>
                      </span>
                    ))}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          {/* care symbols */}
          <Reveal delay={0.06}>
            <div className="mt-16 border-t border-line pt-12">
              <h2 className="display text-2xl sm:text-3xl">Care label symbols explained</h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-cream-muted">
                The international care code (ISO 3758) uses five basic symbols. Bars under a symbol ask for a gentler
                treatment — one bar is mild, two bars are very mild — and a cross through any symbol means “don’t”.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {CARE_SYMBOLS.map((c) => (
                  <div key={c.name} className="rounded-2xl border border-line bg-cream/[0.02] p-5">
                    <div className="text-champagne">{c.icon}</div>
                    <p className="mt-3 font-medium text-cream">{c.name}</p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream-muted">{c.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* which label carries what */}
          <Reveal delay={0.06}>
            <div className="mt-16 grid gap-10 border-t border-line pt-12 lg:grid-cols-2">
              <div>
                <h2 className="display text-2xl sm:text-3xl">Which label carries what</h2>
                <div className="mt-6 space-y-5 text-[14px] leading-relaxed text-cream-muted">
                  <p>
                    <b className="text-cream">Main (brand) label</b> — usually a damask{" "}
                    <Link href="/products/woven-labels" className={linkCls}>woven neck label</Link> with your logo, often
                    with the size.
                  </p>
                  <p>
                    <b className="text-cream">Care &amp; content label</b> — a soft{" "}
                    <Link href="/products/satin-labels" className={linkCls}>printed satin</Link> or woven label in the side
                    seam, carrying fibre content, care symbols, country of origin and your RN or CA number.
                  </p>
                  <p>
                    <b className="text-cream">Size label</b> — a small woven or printed tab, or combined with the main
                    label.
                  </p>
                  <p>
                    <b className="text-cream">Hang tag</b> — price, barcode and brand story on a{" "}
                    <Link href="/products/hang-tags" className={linkCls}>removable tag</Link>. Because it comes off, it
                    can’t replace a permanent care label where one is required.
                  </p>
                </div>
              </div>
              <div>
                <h2 className="display text-2xl sm:text-3xl">HS codes for importing labels</h2>
                <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-cream-muted">
                  <p>
                    <b className="text-cream">5807.10</b> — labels, badges and similar articles of textile materials,{" "}
                    <i>woven</i>, not embroidered (woven labels and woven patches).
                  </p>
                  <p>
                    <b className="text-cream">5807.90</b> — other labels of textile materials, such as printed fabric labels.
                  </p>
                  <p>
                    <b className="text-cream">5810</b> — embroidery in motifs, which covers embroidered badges and patches.
                  </p>
                  <p className="text-[12.5px] text-cream-dim">
                    The first six digits are international; national digits and duty rates vary — confirm the full code
                    with your customs broker. Source:{" "}
                    <a href={SRC.hs.url} target="_blank" rel="noopener noreferrer" className={linkCls}>{SRC.hs.name}</a>.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/quote?product=Woven%20Labels" className="btn-primary">Get a free quote</Link>
                  <Link href="/products/satin-labels" className="btn-ghost">Care &amp; content labels</Link>
                </div>
              </div>
            </div>
          </Reveal>

          {/* FAQ */}
          <Reveal delay={0.08}>
            <div className="mt-16 border-t border-line pt-10">
              <h2 className="display text-2xl sm:text-3xl">Frequently asked questions</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {FAQS.map((f) => (
                  <div key={f.q} className="rounded-2xl border border-line bg-cream/[0.02] p-5">
                    <h3 className="text-[14px] font-semibold text-cream">{f.q}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">{f.a}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-line bg-surface/30 p-5 text-[12.5px] leading-relaxed text-cream-dim">
                <b className="text-cream-muted">Please note:</b> this guide is general information, not legal advice.
                Rules change — check the official source linked in each section, or ask your importer, before production.
              </div>

              <div className="mt-8">
                <h2 className="text-[12px] uppercase tracking-wide2 text-cream-dim">Official sources</h2>
                <ul className="mt-3 space-y-1.5 text-[12.5px]">
                  {Object.values(SRC).map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkCls}>{s.name}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 text-[13px] text-cream-dim">
                More reading:{" "}
                <Link className={linkCls} href="/guides/label-folds-sizes">label fold types &amp; sizes</Link>
                {" · "}
                <Link className={linkCls} href="/blog/woven-vs-printed-vs-satin-labels">woven vs printed vs satin labels</Link>
                {" · "}
                <Link className={linkCls} href="/starter-kit">clothing brand starter kit</Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
