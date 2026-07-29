"use client";
import Image from "next/image";
import { Reveal, Magnetic, TextReveal } from "@/components/anim";
import Link from "next/link";
import { normalizeWaLink } from "@/lib/whatsapp";

export default function FinalCTA({ whatsapp, instagram }: { whatsapp?: string; instagram: string }) {
  const waHref = normalizeWaLink(whatsapp);
  return (
    <section className="relative overflow-hidden border-t border-line py-24 sm:py-36">
      {/* soft background image + treatments */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.24]">
          <Image
            src="/photos/atelier-bg.jpg"
            alt=""
            fill
            sizes="100vw"
            quality={55}
            className="scale-105 object-cover blur-[2px]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/55 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_5%,rgba(8,8,10,0.7)_75%)]" />
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 animate-pulse-soft rounded-full bg-champagne/12 blur-[60px] md:blur-[160px]" />
        <div className="absolute inset-0 grain-bg opacity-[0.03]" />
      </div>

      <div className="container-lux relative text-center">
        <Reveal>
          <span className="eyebrow justify-center">
            <span className="h-px w-8 bg-champagne/60" />
            Let us begin
            <span className="h-px w-8 bg-champagne/60" />
          </span>
        </Reveal>
        <h2 className="display mx-auto mt-8 max-w-4xl text-5xl leading-[1.04] tracking-tight sm:text-7xl lg:text-[5.5rem]">
          <TextReveal text="Make your brand" />
          <span className="gradient-text italic">
            <TextReveal text="unforgettable." delay={0.15} />
          </span>
        </h2>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-7 max-w-xl text-balance text-[15px] leading-relaxed text-cream-muted">
            Tell us what you need and we will put together a tailored quote. No
            pressure, no jargon, just premium branding made for your label.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link href="/quote" data-cursor="Quote">
              <Magnetic strength={0.4}>
                <span className="btn-primary text-[13px]">
                  Customize Your Order
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Magnetic>
            </Link>
            <a href={waHref} target="_blank" rel="noopener noreferrer" data-cursor="Chat">
              <Magnetic strength={0.3}>
                <span className="btn-ghost">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm5.49-7.526c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  Chat on WhatsApp
                </span>
              </Magnetic>
            </a>
          </div>
          <p className="mt-5 text-center text-[12px] text-cream-dim">
            Every order is custom-priced. Get a tailored quote within one business day.
          </p>
        </Reveal>
        <Reveal delay={0.4}>
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 text-[12px] uppercase tracking-widest2 text-cream-dim transition-colors hover:text-champagne"
          >
            or follow the work on Instagram →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
