import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { SITE_URL, BRAND_NAME, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Privacy Policy — ${BRAND_NAME}`,
  description:
    "How Prime Labels International collects, uses and protects your information when you request quotes, upload artwork or contact us.",
  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
    languages: { en: `${SITE_URL}/privacy-policy`, "x-default": `${SITE_URL}/privacy-policy` },
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

export default async function PrivacyPolicyPage() {
  const site = await getSiteContent();
  const jsonLd = breadcrumbJsonLd([{ name: "Privacy Policy", path: "/privacy-policy" }]);

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
              <h1 className="display mt-5 text-4xl leading-[1.05] tracking-tight sm:text-5xl">Privacy Policy</h1>
              <p className="mt-4 text-[13px] text-cream-dim">Last updated: August 2026</p>

              <P>
                Prime Labels International (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates{" "}
                <Link href="/" className="text-champagne underline underline-offset-4">primelabelsintl.com</Link>. This
                policy explains what information we collect when you use our website, request a quote, upload artwork
                or contact us — and how we use and protect it.
              </P>

              <H2>1. Information we collect</H2>
              <ul className="mt-4 space-y-2.5">
                <LI><strong className="text-cream">Quote &amp; contact details:</strong> name, WhatsApp/phone number, email address, company name, country, and the order details you share (products, quantities, notes).</LI>
                <LI><strong className="text-cream">Artwork files:</strong> logos and design files you upload with a quote request, used solely to prepare your proof and production.</LI>
                <LI><strong className="text-cream">Reviews:</strong> the name, company, country, rating and text you choose to submit.</LI>
                <LI><strong className="text-cream">Usage data:</strong> anonymised page views and interactions collected via our own analytics, and advertising events via Meta (Facebook) Pixel — see section 4.</LI>
              </ul>

              <H2>2. How we use your information</H2>
              <ul className="mt-4 space-y-2.5">
                <LI>To respond to your enquiry and send you a tailored quotation.</LI>
                <LI>To prepare digital proofs and produce your order.</LI>
                <LI>To communicate with you about your order via WhatsApp, email or phone.</LI>
                <LI>To improve our website and understand which pages are useful.</LI>
                <LI>To measure the effectiveness of our advertising.</LI>
              </ul>
              <P>We do not sell your personal information to anyone.</P>

              <H2>3. WhatsApp communication</H2>
              <P>
                Many of our buttons open WhatsApp with a pre-filled message. When you contact us on WhatsApp, your use
                of WhatsApp is governed by WhatsApp&apos;s own terms and privacy policy. We use your WhatsApp number only
                to discuss your enquiry and orders.
              </P>

              <H2>4. Cookies &amp; tracking</H2>
              <P>
                We use the Meta (Facebook) Pixel to measure advertising performance. It may set cookies and receive
                standard event data (such as page views) from your browser. You can control advertising cookies through
                your browser settings and through Meta&apos;s ad preferences. Our own analytics are first-party and used
                for aggregate statistics only.
              </P>

              <H2>5. Where your data lives</H2>
              <P>
                Our website and databases are hosted on secure cloud infrastructure (Vercel and Neon). Uploaded artwork
                is stored in access-controlled cloud storage. Reasonable technical measures — HTTPS everywhere, access
                controls and server-side validation — protect your information.
              </P>

              <H2>6. How long we keep data</H2>
              <P>
                Quote requests, messages and order details are kept while they are commercially relevant so we can
                support reorders and warranty queries. You may ask us to delete your information at any time (section 8).
              </P>

              <H2>7. Sharing</H2>
              <P>
                We share information only with service providers needed to run our business — hosting, cloud storage,
                email delivery and shipping carriers (e.g. DHL, FedEx, Aramex) who receive the delivery details required
                to deliver your order. Each provider processes data under its own privacy commitments.
              </P>

              <H2>8. Your rights</H2>
              <P>
                Depending on your location (including the UK/EU under GDPR), you may have the right to access, correct,
                export or delete your personal information, and to object to certain processing. To exercise any right,
                contact us at{" "}
                <a href={`mailto:${site.email}`} className="text-champagne underline underline-offset-4">{site.email}</a>{" "}
                or on WhatsApp — we respond within a reasonable time.
              </P>

              <H2>9. Children</H2>
              <P>Our services are for businesses and adults. We do not knowingly collect information from children.</P>

              <H2>10. Changes to this policy</H2>
              <P>
                We may update this policy from time to time. The &ldquo;Last updated&rdquo; date above reflects the
                latest version. Significant changes will be visible on this page.
              </P>

              <H2>Contact</H2>
              <P>
                Prime Labels International ·{" "}
                <a href={`mailto:${site.email}`} className="text-champagne underline underline-offset-4">{site.email}</a>{" "}
                · WhatsApp via the buttons across this website ·{" "}
                <Link href="/contact" className="text-champagne underline underline-offset-4">Contact page</Link>
              </P>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
