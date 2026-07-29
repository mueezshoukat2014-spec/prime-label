"use client";
import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GsapFeature() {
  const root = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const words = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // parallax + ken-burns on the background image
      gsap.fromTo(
        bg.current,
        { yPercent: -12, scale: 1.18 },
        {
          yPercent: 12,
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
      // highlight sweep across the statement words
      if (words.current) {
        const spans = words.current.querySelectorAll("span[data-w]");
        gsap.fromTo(
          spans,
          { color: "rgba(165,157,142,0.35)" },
          {
            color: "rgba(244,240,232,1)",
            stagger: 0.4,
            ease: "none",
            scrollTrigger: {
              trigger: words.current,
              start: "top 80%",
              end: "bottom 40%",
              scrub: true,
            },
          }
        );
      }
    }, root);
    return () => ctx.revert();
  }, []);

  const phrase = "Detail is the difference between a good brand and a great one.".split(" ");

  return (
    <section ref={root} className="relative flex min-h-[88vh] items-center overflow-hidden border-y border-line">
      <div ref={bg} className="absolute inset-0">
        <Image
          src="/photos/philosophy-bg.jpg"
          alt="Premium woven label detail"
          fill
          sizes="100vw"
          quality={60}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/60" />
      </div>

      <div className="container-lux relative">
        <div className="max-w-5xl">
          <span className="eyebrow mb-6 inline-flex !text-champagne/90">
            <span className="h-px w-8 bg-champagne/60" />
            The philosophy
          </span>
          <h2
            ref={words}
            className="display text-4xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {phrase.map((w, i) => (
              <span key={i} data-w className="inline-block">
                {w}
                {i < phrase.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h2>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-cream-muted">
            A label is the quiet signature of everything you make. We obsess over
            the weave, the weight and the finish so your brand is felt before it
            is read.
          </p>
          <Link href="/quote" className="btn-primary mt-9 inline-flex">
            Start your order
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
