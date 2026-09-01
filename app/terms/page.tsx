import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Terms of Service — ${BRAND_NAME}`,
  description:
    "The terms that govern quotes, digital proofs, production, shipping and payments for orders with Prime Labels International.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
    languages: { en: `${SITE_URL}/terms`, "x-default": `${SITE_URL}/terms` },
  },
  robots: { index: true, follow: true },
};

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="display mt-10 text-2xl text-cream">{children}</h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 text-[14.5px] leading-relaxed text-cream-muted">{children}</p>
);
const LI = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-3 text-[14.5px] leading-relaxed text-cream-muted">
    <span className="mt-0.5 shrink-0 text-champagne">✦</span>
    <span>{children}</span>
  </li>
);

export default async function TermsPage() {
  const site = await getSiteContent();
  const jsonLd = breadcrumbJsonLd([{ name: "Terms of Service", path: "/terms" }]);

  return (
    <SiteShell footer={<Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-40 sm:pb-24">
        <div className="container-lux relative">
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <span className="eyebrow">
                <span className="h-px w-8 bg-champagne/60" />
                Legal
              </span>
              <h1 className="display mt-5 text-4xl leading-[1.05] tracking-tight sm:text-5xl">Terms of Service</h1>
              <p className="mt-4 text-[13px] text-cream-dim">Last updated: August 2026</p>

              <P>
                These terms govern quotations, orders and deliveries by Prime Labels International
                (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By requesting a quote or placing an order you agree to these terms.
              </P>

              <H2>1. Quotations</H2>
              <ul className="mt-4 space-y-2.5">
                <LI>Every order is custom: quotes are prepared per design, quantity, size and finish, and are typically sent within 12–24 hours.</LI>
                <LI>Quotes are valid for 14 days unless stated otherwise. Material-cost changes may require requoting after that period.</LI>
                <LI>Quoted prices are DDP (delivered, duties paid) to your address unless a different shipping term is agreed in writing.</LI>
              </ul>

              <H2>2. Digital proofs &amp; approval</H2>
              <ul className="mt-4 space-y-2.5">
                <LI>A free digital proof is provided before production, normally within 24 hours of receiving your artwork.</LI>
                <LI>Production starts only after your written approval (WhatsApp or email counts as written approval).</LI>
                <LI>You are responsible for checking spelling, dimensions, colours and layout on the proof. Approved proofs define the accepted design.</LI>
                <LI>On-screen colours are indicative; thread and print colours are matched to the Pantone references agreed on the proof.</LI>
              </ul>

              <H2>3. Artwork &amp; intellectual property</H2>
              <ul className="mt-4 space-y-2.5">
                <LI>You confirm you own, or are licensed to use, all logos and artwork you send us. You are responsible for any third-party IP claims arising from your artwork.</LI>
                <LI>Your artwork remains yours. Production files we prepare (weave files, dielines) remain ours but are used exclusively for your orders.</LI>
                <LI>We may photograph finished work for our portfolio unless you ask us in writing not to.</LI>
              </ul>

              <H2>4. Production &amp; tolerances</H2>
              <ul className="mt-4 space-y-2.5">
                <LI>Typical production time is 7–14 working days after proof approval, depending on product and quantity.</LI>
                <LI>Industry-standard tolerances apply: ±5% on delivered quantity and minor dimensional variance (±1–2mm) are considered conforming.</LI>
                <LI>Minor shade variation between production batches can occur and is considered normal for textile products.</LI>
              </ul>

              <H2>5. Payment</H2>
              <P>
                Payment terms (advance percentage, balance timing and accepted methods) are confirmed on each quotation.
                Orders enter the production queue when the agreed advance is received.
              </P>

              <H2>6. Shipping &amp; delivery</H2>
              <ul className="mt-4 space-y-2.5">
                <LI>We ship via express couriers (DHL, FedEx, Aramex and similar). Transit estimates — e.g. 3–5 days to KSA/UAE, 5–8 days to UK/USA — are estimates, not guarantees.</LI>
                <LI>With DDP, duties and customs are prepaid by us. Please provide a complete, accurate delivery address and a reachable phone number.</LI>
                <LI>Risk passes to you on delivery to the stated address.</LI>
              </ul>

              <H2>7. Issues, reprints &amp; refunds</H2>
              <ul className="mt-4 space-y-2.5">
                <LI>Inspect your order on arrival and report any issue within 7 days with photos.</LI>
                <LI>If we produced something materially different from the approved proof, we will reprint the affected quantity or refund it — our choice, at no cost to you.</LI>
                <LI>Errors that existed in the approved proof (spelling, sizes, colours you approved) are not defects; we will still help find the most economical fix.</LI>
                <LI>Because every item is custom-made, orders cannot be cancelled once production has started, and correctly-produced custom goods are not returnable.</LI>
              </ul>

              <H2>8. Liability</H2>
              <P>
                Our total liability for any order is limited to the amount paid for that order. We are not liable for
                indirect losses (lost profits, delays in your own launches, etc.). Nothing in these terms limits
                liability that cannot legally be limited.
              </P>

              <H2>9. Reviews &amp; website content</H2>
              <P>
                Reviews submitted through the website are moderated before publication. By submitting a review you allow
                us to display it (with your first name/company as provided) on our website and marketing.
              </P>

              <H2>10. Governing law &amp; disputes</H2>
              <P>
                We aim to resolve any issue directly and quickly — talk to us first. These terms are governed by the
                laws of Pakistan, without affecting any mandatory consumer protections that apply in your country.
              </P>

              <H2>Contact</H2>
              <P>
                Questions about these terms:{" "}
                <a href={`mailto:${site.email}`} className="text-champagne underline underline-offset-4">{site.email}</a>{" "}
                · <Link href="/contact" className="text-champagne underline underline-offset-4">Contact page</Link> ·{" "}
                See also our <Link href="/privacy-policy" className="text-champagne underline underline-offset-4">Privacy Policy</Link>.
              </P>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
