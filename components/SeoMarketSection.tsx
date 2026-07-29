import Link from "next/link";
import { Reveal } from "@/components/anim";

const markets = [
  "Saudi Arabia",
  "UAE",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "UK",
  "USA",
  "Canada",
  "Australia",
  "Europe",
];

const services = [
  "Custom woven labels",
  "Satin & printed fabric labels",
  "Hang tags and thank you cards",
  "Custom stickers and packaging sleeves",
  "Zipper bags and brand packaging",
  "Woven patches and steel logo tags",
];

export default function SeoMarketSection() {
  return (
    <section className="relative border-t border-line py-20 sm:py-28" id="gcc-branding">
      <div className="container-lux">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <div>
              <span className="eyebrow">
                <span className="h-px w-8 bg-champagne/60" />
                Global supply
              </span>
              <h2 className="display mt-5 text-4xl leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                Custom labels and packaging for
                <span className="gradient-text italic"> Gulf fashion brands.</span>
              </h2>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream-muted">
                Prime Labels International supplies premium garment branding accessories for
                clothing brands, abaya labels, modest fashion lines, streetwear labels, boutiques
                and uniform companies across Saudi Arabia, Dubai, Abu Dhabi, Doha, Kuwait,
                Bahrain, Oman and international markets.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/gcc-custom-labels" className="btn-ghost !py-3 !px-5 text-[12px]">
                  GCC custom labels guide →
                </Link>
                <Link href="/quote" className="btn-primary !py-3 !px-5 text-[12px]">
                  Customize Your Order
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="grid gap-px overflow-hidden rounded-4xl border border-line bg-line md:grid-cols-2">
              <div className="bg-ink p-6 sm:p-7">
                <h3 className="display text-2xl text-cream">High-demand products</h3>
                <ul className="mt-5 space-y-3 text-[14px] leading-relaxed text-cream-muted">
                  {services.map((service) => (
                    <li key={service} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" />
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-ink p-6 sm:p-7">
                <h3 className="display text-2xl text-cream">Markets we serve</h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {markets.map((market) => (
                    <span
                      key={market}
                      className="rounded-full border border-line bg-surface/30 px-3 py-2 text-[12px] text-cream-muted"
                    >
                      {market}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-[13px] leading-relaxed text-cream-dim">
                  Search-ready support for English and Arabic buyers looking for clothing labels,
                  hang tags, custom stickers, premium brand packaging and apparel printing
                  accessories with worldwide shipping.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
