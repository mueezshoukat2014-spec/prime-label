import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/QuoteForm";
import QuoteAutoScroll from "@/components/QuoteAutoScroll";
import { Reveal, Magnetic } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { parseQuoteProducts } from "@/lib/quote-validation";
import { normalizeWaLink, waProductLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Request a Quote for Custom Labels, Hang Tags & Packaging",
  description:
    "Get a tailored quote for custom woven labels, satin labels, hang tags, stickers and brand packaging for Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman and worldwide shipping.",
  keywords: ["custom labels quote", "woven labels Saudi Arabia", "hang tags UAE", "brand packaging GCC", "clothing labels quote"],
  alternates: {
    canonical: "https://primelabelsintl.com/quote",
    languages: {
      en: "https://primelabelsintl.com/quote",
      ar: "https://primelabelsintl.com/ar/quote",
      "x-default": "https://primelabelsintl.com/quote",
    },
  },
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: { product?: string; details?: string; quantity?: string };
}) {
  const site = await getSiteContent();
  const product = searchParams?.product || "";
  const details = searchParams?.details || "";
  const quantity = searchParams?.quantity || "";

  return (
    <SiteShell
      footer={
        <Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />
      }
    >
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-44 sm:pb-28">
        <QuoteAutoScroll />
        <div className="pointer-events-none absolute -left-[10%] top-20 h-[400px] w-[400px] rounded-full bg-champagne/10 blur-[140px]" />
        <div className="container-lux relative">
          <Reveal>
            <div className="mb-10 flex justify-center sm:mb-12">
              <a
                href="#quote-form"
                className="group inline-flex items-center gap-2.5 rounded-full border border-champagne/40 bg-champagne/10 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-champagne backdrop-blur-md transition hover:border-champagne hover:bg-champagne/20 sm:text-[13px]"
              >
                <svg
                  className="h-4 w-4 animate-bounce"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
                Swipe to place an order
                <svg
                  className="h-4 w-4 animate-bounce"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </a>
            </div>
          </Reveal>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="h-px w-8 bg-champagne/60" />
                  Customize your order
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="display mt-6 text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
                  Let us price <br />
                  <span className="gradient-text italic">your branding.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-7 max-w-md text-[15px] leading-relaxed text-cream-muted">
                  Every order is custom, so every quote is too. Share a few
                  details and we will put together pricing that fits your brand,
                  your quantity and your timeline.
                </p>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line">
                  {[
                    { t: "Tailored pricing", d: "Built around your exact product and quantity." },
                    { t: "Fast reply", d: "We usually respond within 12 hours." },
                    { t: "Worldwide shipping", d: "We deliver to brands across the globe." },
                  ].map((f) => (
                    <div key={f.t} className="bg-ink p-6">
                      <div className="text-[14px] font-medium text-cream">{f.t}</div>
                      <div className="mt-1 text-[13px] text-cream-muted">{f.d}</div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.4}>
                <div className="mt-8">
                  <p className="text-[12px] uppercase tracking-widest2 text-cream-dim">
                    Prefer to talk first?
                  </p>
                  <a
                    href={product ? waProductLink(product) : normalizeWaLink(site.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Magnetic strength={0.3}>
                      <span className="btn-ghost mt-3">Chat on WhatsApp →</span>
                    </Magnetic>
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <div id="quote-form" className="glass scroll-mt-24 rounded-4xl p-7 sm:scroll-mt-28 sm:p-10">
                <QuoteForm
                  defaultProduct={product}
                  defaultDetails={details}
                  defaultQuantity={quantity}
                  whatsapp={site.whatsapp}
                  productChoices={parseQuoteProducts((site as Record<string, string>).quoteProducts)}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
