import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Label Fold Types & Sizes Guide — End Fold, Center Fold, Mitre, Hem Tags",
  description:
    "How to choose the right fold for custom woven labels: end fold, center fold, loop fold, mitre fold, Manhattan and book cover — plus care label and size label sizing. A practical buyer's guide for clothing brands.",
  alternates: {
    canonical: `${SITE_URL}/guides/label-folds-sizes`,
    languages: { en: `${SITE_URL}/guides/label-folds-sizes`, "x-default": `${SITE_URL}/guides/label-folds-sizes` },
  },
  openGraph: {
    type: "article",
    url: `${SITE_URL}/guides/label-folds-sizes`,
    title: "Label Fold Types & Sizes Guide — Prime Labels",
    description:
      "End fold vs center fold vs mitre — which fold suits neck labels, hem tags and side seams, and what size care labels should be.",
    siteName: "Prime Labels International",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Woven label fold types guide" }],
  },
  twitter: { card: "summary_large_image" },
};

const FOLDS = [
  {
    name: "Straight Cut",
    best: "Patches & iron-on backing",
    note: "The label is cut flat with heat-sealed edges and no folds. Sewn on all four sides as an exterior patch, or supplied with adhesive/iron-on backing for flat application.",
  },
  {
    name: "End Fold",
    best: "Premium flat-sewn brand labels",
    note: "Both short ends fold behind the face, giving soft finished edges with no raw corners. Sewn flat on the left and right — the classic high-end look for inside-neck and chest placements.",
  },
  {
    name: "Center Fold",
    best: "Neck labels & care/content labels",
    note: "Folded in half with a crease: brand logo on the front panel, care or size information on the back. Both raw edges hide inside the neck seam. The industry-standard main label fold.",
  },
  {
    name: "Loop Fold",
    best: "Hem tags & side seam flags",
    note: "Same layout as center fold but not creased — an open loop that stands away from the garment. The go-to for hem tags and side-seam flags on delicate fabrics, because it moves with the cloth.",
  },
  {
    name: "Mitre Fold",
    best: "Hanger-loop neck labels",
    note: "Both ends fold up at 45°, forming tabs that are sewn into a seam so the label hangs down — doubling as a functional hanger loop. Suits wide, landscape logos on shirts and knitwear.",
  },
  {
    name: "Manhattan Fold",
    best: "Minimalist premium hem tags",
    note: "A center fold with the top edge tucked behind as well, leaving only one sewn edge. Lighter and thinner than a book cover — a clean, fully-finished premium hem tag.",
  },
  {
    name: "Book Cover Fold",
    best: "Reversible & exterior brand labels",
    note: "Center fold plus top and bottom edges tucked behind, so every edge is clean. Slightly more bulk — chosen when the label shows on the outside, e.g. over a cuff or sleeve hem.",
  },
];

const PLACEMENTS = [
  { use: "Inside neck label (standard)", fold: "Center Fold", why: "Industry standard — raw edges hidden in the neck seam, creased fold at the collar." },
  { use: "Inside neck label (premium)", fold: "Manhattan / Book Cover", why: "Tucked edges give a fully finished face against the skin." },
  { use: "Neck label with hanger loop", fold: "Mitre Fold", why: "The 45° tabs create a functional hanging loop." },
  { use: "Hem tag / flag label", fold: "Loop Fold or Center Fold", why: "Loop fold curves softly off the hem; center fold sits flat with a crease." },
  { use: "Side seam label", fold: "Loop Fold or Center Fold", why: "Both edges hide in the seam; loop fold feels softer on delicate garments." },
  { use: "Exterior patch / brand label", fold: "End Fold or Straight Cut", why: "End fold for clean soft edges sewn flat; straight cut for iron-on or four-side sewing." },
  { use: "Care / content label", fold: "Center Fold", why: "Front and back panels give room for care symbols, fiber content and origin." },
];

const CARE_SIZES = [
  { name: "Compact", size: "≈ 32 × 50 mm (1.25 × 2 in)", use: "3–4 lines of care info and symbols — simple care requirements." },
  { name: "Standard", size: "≈ 38 × 63 mm (1.5 × 2.5 in)", use: "Care symbols, fiber content, country of origin and brand info." },
  { name: "Extended", size: "≈ 38 × 89 mm (1.5 × 3.5 in)", use: "Multi-language care instructions, as required by many export markets." },
];

export default async function LabelFoldsSizesGuide() {
  const site = await getSiteContent();
  const jsonLd = [breadcrumbJsonLd([{ name: "Guides", path: "/guides/label-folds-sizes" }])];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-20">
        <div className="pointer-events-none absolute -left-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              Buyer&apos;s guide
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              Label fold types &amp; sizes, <span className="gradient-text italic">explained simply.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">
              End fold, center fold, loop fold, mitre, Manhattan, book cover — the fold you choose decides how a
              woven label sits on the garment, how soft it feels and where it can be sewn. This guide covers the
              seven standard folds, which placement each one suits, and the usual sizes for care and size labels,
              so you can specify your order with confidence.
            </p>
          </Reveal>

          {/* fold cards */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {FOLDS.map((f, i) => (
              <Reveal key={f.name} delay={0.05 * (i % 4)}>
                <div className="h-full rounded-3xl border border-line bg-surface/30 p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-[17px] font-semibold text-cream">{f.name}</h2>
                    <span className="rounded-full bg-champagne/10 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-wide2 text-champagne">
                      {f.best}
                    </span>
                  </div>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-cream-muted">{f.note}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* placement table */}
          <Reveal delay={0.1}>
            <h2 className="display mt-16 text-2xl tracking-tight sm:text-3xl">Which fold for which placement?</h2>
            <div className="mt-6 overflow-hidden rounded-3xl border border-line">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-surface/50">
                    <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-wide2 text-champagne">Placement</th>
                    <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-wide2 text-champagne">Recommended fold</th>
                    <th className="hidden px-5 py-4 text-[11px] font-medium uppercase tracking-wide2 text-champagne sm:table-cell">Why</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {PLACEMENTS.map((p) => (
                    <tr key={p.use} className="transition-colors hover:bg-cream/[0.02]">
                      <td className="px-5 py-4 font-medium text-cream">{p.use}</td>
                      <td className="px-5 py-4 text-champagne">{p.fold}</td>
                      <td className="hidden px-5 py-4 text-cream-muted sm:table-cell">{p.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* care label sizes */}
          <Reveal delay={0.1}>
            <h2 className="display mt-16 text-2xl tracking-tight sm:text-3xl">Care &amp; size label sizing</h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-cream-muted">
              Care labels carry wash symbols, fiber content and country of origin — export markets such as the GCC,
              UK, EU and USA each expect this information on the garment. These are the three size bands most
              brands use:
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {CARE_SIZES.map((c) => (
                <div key={c.name} className="rounded-3xl border border-line bg-surface/30 p-6">
                  <div className="text-[11px] font-medium uppercase tracking-wide2 text-champagne">{c.name}</div>
                  <div className="mt-2 text-[15px] font-semibold tabular-nums text-cream">{c.size}</div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-cream-muted">{c.use}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-cream-dim">
              Sewing tip: most folds hide a ≈6&nbsp;mm (¼&nbsp;in) seam allowance inside the garment seam — your
              finished visible size is smaller than the woven size. When in doubt, send your garment type on
              WhatsApp and we&apos;ll recommend a fold and size before you order.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.1}>
            <div className="mt-14 flex flex-wrap gap-3">
              <Link
                href="/products/woven-labels"
                className="rounded-lg border border-champagne/45 bg-champagne/[0.08] px-4 py-2.5 text-[13px] text-champagne transition-colors hover:bg-champagne/[0.16]"
              >
                Custom woven labels
              </Link>
              <Link
                href="/products/satin-labels"
                className="rounded-lg border border-line px-4 py-2.5 text-[13px] text-cream transition-colors hover:border-champagne/40"
              >
                Satin care &amp; size labels
              </Link>
              <Link
                href="/calculator"
                className="rounded-lg border border-line px-4 py-2.5 text-[13px] text-cream transition-colors hover:border-champagne/40"
              >
                Label cost calculator
              </Link>
              <Link
                href="/samples"
                className="rounded-lg border border-line px-4 py-2.5 text-[13px] text-cream transition-colors hover:border-champagne/40"
              >
                Request a sample kit
              </Link>
              <Link
                href="/quote"
                className="rounded-lg border border-line px-4 py-2.5 text-[13px] text-cream transition-colors hover:border-champagne/40"
              >
                Get a quote
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
