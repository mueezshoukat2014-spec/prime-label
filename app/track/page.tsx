import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import OrderTracker from "@/components/OrderTracker";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Track Your Order | ${BRAND_NAME}`,
  description:
    "Enter your Prime Labels order code to see live production status — proof, weaving, quality check, packing and shipping with courier tracking.",
  alternates: {
    canonical: `${SITE_URL}/track`,
    languages: { en: `${SITE_URL}/track`, "x-default": `${SITE_URL}/track` },
  },
  robots: { index: true, follow: true },
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const site = await getSiteContent();
  const initialCode = (searchParams?.code || "").toUpperCase().slice(0, 24);
  const jsonLd = breadcrumbJsonLd([{ name: "Track Order", path: "/track" }]);

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-44 sm:pb-28">
        <div className="pointer-events-none absolute -right-[12%] top-16 h-[420px] w-[420px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative max-w-2xl">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              Order tracking
            </span>
            <h1 className="display mt-5 text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Where is my <span className="gradient-text italic">order?</span>
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-cream-muted">
              Enter the order code from your confirmation message (it looks like{" "}
              <span className="text-cream">PL-2493</span>) to see live production and shipping
              status.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10">
              <OrderTracker initialCode={initialCode} />
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-10 text-[12.5px] leading-relaxed text-cream-dim">
              Don&apos;t have an order code yet? It&apos;s shared on WhatsApp when your order is
              confirmed. Orders placed before this page launched can request a code — just message
              us.
            </p>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
