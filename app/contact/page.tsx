import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { Reveal, Magnetic } from "@/components/anim";
import { getSiteContent } from "@/lib/data";
import { normalizeWaLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Prime Labels International",
  description:
    "Contact Prime Labels International for custom woven labels, hang tags, stickers and packaging for clothing brands in Saudi Arabia, UAE, GCC countries and worldwide.",
  keywords: ["contact woven label supplier", "custom labels Saudi Arabia", "packaging supplier GCC", "clothing label manufacturer"],
  alternates: { canonical: "https://primelabelsintl.com/contact" },
};

export default async function ContactPage() {
  const site = await getSiteContent();
  const channels = [
    { label: "Instagram", value: "@primelabels_intl", href: site.instagram },
    { label: "WhatsApp", value: "Chat with us", href: normalizeWaLink(site.whatsapp) },
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
    { label: "Service area", value: site.serviceArea, href: null },
  ];

  return (
    <SiteShell
      footer={
        <Footer whatsapp={site.whatsapp} instagram={site.instagram} email={site.email} />
      }
    >
      <section className="relative overflow-hidden pt-36 pb-28 sm:pt-44">
        <div className="pointer-events-none absolute right-0 top-10 h-[420px] w-[420px] rounded-full bg-champagne/8 blur-[150px]" />
        <div className="container-lux relative">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <Reveal>
                <span className="eyebrow">
                  <span className="h-px w-8 bg-champagne/60" />
                  Contact
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="display mt-6 text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
                  Let us <span className="gradient-text italic">talk.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-7 max-w-md text-[15px] leading-relaxed text-cream-muted">
                  Questions, ideas, or ready to order. Reach out through whatever
                  suits you best and we will get back to you personally.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line">
                  {channels.map((c) => (
                    <div key={c.label} className="bg-ink p-6">
                      <div className="text-[11px] uppercase tracking-wide2 text-cream-dim">
                        {c.label}
                      </div>
                      {c.href ? (
                        <a href={c.href} target="_blank" rel="noopener noreferrer" className="mt-2 block text-[15px] text-cream transition-colors hover:text-champagne">
                          {c.value}
                        </a>
                      ) : (
                        <div className="mt-2 text-[15px] text-cream">{c.value}</div>
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.4}>
                <a href={normalizeWaLink(site.whatsapp)} target="_blank" rel="noopener noreferrer">
                  <Magnetic strength={0.3}>
                    <span className="btn-primary mt-8">Start on WhatsApp</span>
                  </Magnetic>
                </a>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <div className="glass rounded-4xl p-7 sm:p-10">
                <ContactForm whatsapp={site.whatsapp} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
