import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Shipping & Delivery — DDP Worldwide | ${BRAND_NAME}`,
  description:
    "Express DDP delivery for custom labels and packaging: 3–5 days to Saudi Arabia & UAE, 3–6 days across the GCC, 5–8 days to UK & USA. Duties prepaid — nothing to pay at your door.",
  alternates: {
    canonical: `${SITE_URL}/shipping`,
    languages: { en: `${SITE_URL}/shipping`, "x-default": `${SITE_URL}/shipping` },
  },
};

const DESTINATIONS = [
  { flag: "🇸🇦", place: "Saudi Arabia", cities: "Riyadh · Jeddah · Dammam", days: "3–5 days", link: "/custom-labels-saudi-arabia" },
  { flag: "🇦🇪", place: "United Arab Emirates", cities: "Dubai · Abu Dhabi · Sharjah", days: "3–5 days", link: "/custom-labels-uae" },
  { flag: "🇶🇦", place: "Qatar", cities: "Doha · Lusail", days: "3–6 days", link: "/custom-labels-qatar" },
  { flag: "🇰🇼", place: "Kuwait", cities: "Kuwait City · Hawally", days: "3–6 days", link: "/custom-labels-kuwait" },
  { flag: "🇧🇭", place: "Bahrain & Oman", cities: "Manama · Muscat", days: "4–6 days", link: "/gcc-custom-labels" },
  { flag: "🇬🇧", place: "United Kingdom", cities: "London · Manchester · UK-wide", days: "5–8 days", link: "/custom-clothing-labels-uk" },
  { flag: "🇺🇸", place: "United States", cities: "All 50 states", days: "5–8 days", link: "/custom-clothing-labels-usa" },
  { flag: "🌍", place: "Rest of the world", cities: "100+ countries", days: "5–10 days", link: "/quote" },
];

const FAQS = [
  {
    q: "What does DDP actually mean for me?",
    a: "Delivered Duty Paid: we prepay customs duties and taxes, the courier clears the parcel, and it arrives at your door with nothing extra to pay. The price on your quote is the final price.",
  },
  {
    q: "Which couriers do you use?",
    a: "DHL Express, FedEx and Aramex depending on destination and speed. You receive the tracking number on WhatsApp the moment your parcel ships.",
  },
  {
    q: "When does the delivery clock start?",
    a: "Transit times count from dispatch. Production comes first: typically 7–14 working days after you approve your free digital proof.",
  },
  {
    q: "Can labels, tags and packaging ship together?",
    a: "Yes — and they should. A consolidated kit ships as one parcel, which is cheaper and everything arrives ready for the same launch.",
  },
  {
    q: "Do you offer sea freight for bulk orders?",
    a: "For large orders (50kg+) FOB sea/air freight can be arranged with your forwarder. For everything else, express DDP air is faster and surprisingly economical for lightweight branding goods.",
  },
];

export default async function ShippingPage() {
  const site = await getSiteContent();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    breadcrumbJsonLd([{ name: "Shipping & Delivery", path: "/shipping" }]),
  ];

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-44 sm:pb-24">
        <div className="pointer-events-none absolute -left-[12%] top-16 h-[460px] w-[460px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              Shipping &amp; delivery
            </span>
            <h1 className="display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              Door to door. <span className="gradient-text italic">Duties paid.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream-muted">
              Every order ships express with DDP terms by default — customs cleared, duties prepaid,
              tracking on WhatsApp. The number on your quote is the number you pay. Nothing at the door.
            </p>
          </Reveal>

          {/* destination table */}
          <Reveal delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-3xl border border-line">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-surface/50">
                    <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-wide2 text-champagne">Destination</th>
                    <th className="hidden px-5 py-4 text-[11px] font-medium uppercase tracking-wide2 text-champagne sm:table-cell">Key cities</th>
                    <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-wide2 text-champagne">Express transit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {DESTINATIONS.map((d) => (
                    <tr key={d.place} className="transition-colors hover:bg-cream/[0.02]">
                      <td className="px-5 py-4">
                        <Link href={d.link} className="font-medium text-cream transition-colors hover:text-champagne">
                          {d.flag} {d.place}
                        </Link>
                      </td>
                      <td className="hidden px-5 py-4 text-cream-muted sm:table-cell">{d.cities}</td>
                      <td className="px-5 py-4 tabular-nums text-cream-muted">{d.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] text-cream-dim">
              Transit counts from dispatch. Production: 7–14 working days after proof approval. Rush options available on request.
            </p>
          </Reveal>

          {/* how it works strip */}
          <Reveal delay={0.15}>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                { t: "Packed & photographed", d: "Your order is checked, counted and photographed before sealing — you see what ships." },
                { t: "Tracking on WhatsApp", d: "Courier tracking number sent the moment the parcel leaves." },
                { t: "Delivered duty-paid", d: "Courier clears customs in their own system. You sign, you're done." },
              ].map((s, i) => (
                <div key={s.t} className="rounded-2xl border border-line bg-surface/30 p-5">
                  <span className="display text-3xl text-champagne/50">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="mt-2 text-[14.5px] font-semibold text-cream">{s.t}</h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-cream-muted">{s.d}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* FAQs */}
          <Reveal delay={0.2}>
            <div className="mt-14">
              <h2 className="display text-3xl">Shipping questions</h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {FAQS.map((f) => (
                  <div key={f.q} className="rounded-2xl border border-line bg-surface/30 p-5">
                    <h3 className="text-[14px] font-semibold text-cream">{f.q}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-14 rounded-3xl border border-champagne/25 bg-surface/40 p-8 text-center sm:p-10">
              <h2 className="display text-3xl">Get your DDP quote.</h2>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] text-cream-muted">
                Tell us your product, quantity and city — the quote includes delivery to your door.
              </p>
              <Link href="/quote" className="btn-primary mt-6 !py-3 !px-6 text-[13px] shadow-glow-sm">
                Customize Your Order
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
