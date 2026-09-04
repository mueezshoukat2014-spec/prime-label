"use client";
import Link from "next/link";
import { Marquee } from "@/components/anim";
import Logo from "@/components/Logo";
import { normalizeWaLink, WHATSAPP_URL } from "@/lib/whatsapp";

const COLS = [
  {
    title: "Products",
    links: [
      { label: "Woven Labels", href: "/products/woven-labels" },
      { label: "Satin Labels", href: "/products/satin-labels" },
      { label: "Hang Tags", href: "/products/hang-tags" },
      { label: "Brand Packaging", href: "/products/brand-packaging" },
      { label: "Zipper Bags", href: "/products/zipper-bags" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "Our Work", href: "/gallery" },
      { label: "Case Studies", href: "/work" },
      { label: "Process", href: "/#process" },
      { label: "About", href: "/about" },
      { label: "FAQs", href: "/faq" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Blog", href: "/blog" },
      { label: "GCC Custom Labels", href: "/gcc-custom-labels" },
    ],
  },
  {
    title: "Markets",
    links: [
      { label: "Saudi Arabia", href: "/custom-labels-saudi-arabia" },
      { label: "UAE", href: "/custom-labels-uae" },
      { label: "Qatar", href: "/custom-labels-qatar" },
      { label: "Kuwait", href: "/custom-labels-kuwait" },
      { label: "United Kingdom", href: "/custom-clothing-labels-uk" },
      { label: "United States", href: "/custom-clothing-labels-usa" },
      { label: "العربية", href: "/ar" },
    ],
  },
  {
    title: "Get in touch",
    links: [
      { label: "Customize Your Order", href: "/quote" },
      { label: "Request a Sample", href: "/samples" },
      { label: "Contact", href: "/contact" },
      { label: "WhatsApp", href: WHATSAPP_URL },
      { label: "Instagram", href: "https://www.instagram.com/primelabels_intl" },
    ],
  },
];

export default function Footer({ whatsapp, instagram, email }: { whatsapp?: string; instagram: string; email: string }) {
  const waHref = normalizeWaLink(whatsapp);
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink-2">
      <Marquee speed={45} className="border-b border-line py-7">
        {["Prime Labels International", "Custom Branding Studio", "Made for clothing brands", "Shipped worldwide"].map(
          (t, i) => (
            <span key={i} className="mx-10 display text-3xl text-cream-dim sm:text-5xl">
              {t}
              <span className="mx-10 text-champagne">✦</span>
            </span>
          )
        )}
      </Marquee>

      <div className="container-lux grid gap-10 py-14 sm:gap-12 sm:py-20 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Logo size={42} />
            <span className="display text-2xl text-cream">Prime Labels</span>
          </Link>
          <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-cream-muted">
            Premium custom labels, hang tags and packaging for clothing brands in
            Saudi Arabia, the GCC and worldwide.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-cream-muted transition-colors hover:border-champagne/50 hover:text-champagne"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-cream-muted transition-colors hover:border-champagne/50 hover:text-champagne"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z"/></svg>
            </a>
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h3 className="text-[11px] uppercase tracking-widest2 text-cream-dim">
              {col.title}
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {col.links.map((l) => {
                const external = /^https?:/i.test(l.href);
                return (
                  <li key={l.label}>
                    {external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] text-cream-muted transition-colors hover:text-champagne"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-[14px] text-cream-muted transition-colors hover:text-champagne"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-lux flex flex-col items-center justify-between gap-3 py-7 text-[12px] text-cream-dim sm:flex-row">
          <span>© {new Date().getFullYear()} Prime Labels International. All rights reserved.</span>
          <span className="flex items-center gap-4">
            <Link href="/privacy-policy" className="transition-colors hover:text-champagne">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-champagne">
              Terms
            </Link>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-champagne animate-pulse-soft" />
            Crafted for premium brands worldwide
          </span>
        </div>
      </div>
    </footer>
  );
}
