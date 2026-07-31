"use client";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { TextReveal, Magnetic, Marquee, EASE } from "@/components/anim";
import Link from "next/link";

type FloaterItem = {
  src: string;
  alt: string;
  cls: string;
  depth: number;
  rot: number;
  delay: number;
};

const FLOATERS: FloaterItem[] = [
  { src: "/photos/DaNaYhvEwXS_0.jpg", alt: "Woven labels", cls: "top-[16%] right-[8%] w-[230px] h-[300px]", depth: 1.4, rot: -6, delay: 0 },
  { src: "/photos/DZRwirYjDE__0.jpg", alt: "Hang tags", cls: "top-[44%] right-[26%] w-[190px] h-[250px]", depth: 0.8, rot: 5, delay: 0.15 },
  { src: "/photos/DYQ2pCbjHoE_0.jpg", alt: "Custom stickers", cls: "bottom-[12%] right-[12%] w-[170px] h-[170px]", depth: 1.1, rot: -3, delay: 0.05 },
];

function Floater({ f, sx, sy }: { f: FloaterItem; sx: MotionValue<number>; sy: MotionValue<number> }) {
  const tx = useTransform(sx, (v) => v * 60 * f.depth);
  const ty = useTransform(sy, (v) => v * 60 * f.depth);
  return (
    <motion.div
      className={`absolute ${f.cls}`}
      style={{ x: tx, y: ty }}
      initial={{ opacity: 0, scale: 0.85, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.2, ease: EASE, delay: 0.15 + f.delay }}
    >
      <motion.div
        className="relative h-full w-full overflow-hidden rounded-3xl border border-cream/10 shadow-soft"
        style={{ rotate: f.rot }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7 + f.delay, ease: "easeInOut", repeat: Infinity, delay: f.delay }}
      >
        <Image
          src={f.src}
          alt={f.alt}
          fill
          sizes="240px"
          quality={58}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
      </motion.div>
    </motion.div>
  );
}


function VerifiedBadgeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.75l2.16 1.73 2.76-.18 1.02 2.57 2.34 1.47-.68 2.68.68 2.68-2.34 1.47-1.02 2.57-2.76-.18L12 21.25l-2.16-1.73-2.76.18-1.02-2.57-2.34-1.47.68-2.68-.68-2.68 2.34-1.47L7.08 4.3l2.76.18L12 2.75z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M8.7 12.25l2.05 2.05 4.75-5.05"
        stroke="#08080A"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeliveryVanIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 7.5h10.2v7.6H3.5V7.5zM13.7 10.1h3.2l2.5 2.8v2.2h-5.7v-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5.6 17.2a1.7 1.7 0 103.4 0 1.7 1.7 0 00-3.4 0zM15.7 17.2a1.7 1.7 0 103.4 0 1.7 1.7 0 00-3.4 0z" fill="currentColor" />
      <path d="M2.5 15.1h18.7M6 5.6h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      mx.set(px);
      my.set(py);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <section id="hero" className="relative min-h-[100svh] w-full overflow-hidden">
      {/* background gradients */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          x: useTransform(sx, (v) => v * 40),
          y: useTransform(sy, (v) => v * 40),
        }}
      >
        <div className="absolute -left-[10%] top-[8%] h-[460px] w-[460px] rounded-full bg-champagne/12 blur-[55px] md:blur-[120px]" />
        <div className="absolute right-[6%] top-[20%] h-[520px] w-[520px] rounded-full bg-[#3a4a5a]/20 blur-[55px] md:blur-[140px]" />
        <div className="absolute bottom-[-6%] left-[30%] h-[420px] w-[420px] rounded-full bg-champagne-deep/10 blur-[55px] md:blur-[130px]" />
      </motion.div>

      {/* rotating ring */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]">
        <div className="absolute inset-0 animate-spin-slow rounded-full border border-champagne/60" />
        <div className="absolute inset-[120px] animate-spin-slow rounded-full border border-champagne/40" style={{ animationDirection: "reverse" }} />
      </div>

      {/* grain */}
      <div className="grain-bg pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-soft-light" />

      {/* floating product cluster (desktop) */}
      <div className="hero-floaters pointer-events-none absolute inset-0 hidden lg:block">
        {FLOATERS.map((f, i) => (
          <Floater key={i} f={f} sx={sx} sy={sy} />
        ))}
      </div>

      {/* content */}
      <div className="container-lux relative z-10 flex min-h-[100svh] flex-col justify-center pt-28 pb-40">
        <div className="hero-content max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
            className="mb-7 flex items-center gap-3"
          >
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              Custom Branding Studio
            </span>
          </motion.div>

          <h1 className="hero-title display text-[13vw] leading-[1.04] tracking-tightest sm:text-[11vw] sm:leading-[0.95] lg:text-[8.2rem]">
            <TextReveal text="Every great" delay={0.04} />
            <TextReveal text="brand starts" delay={0.1} />
            <span className="block overflow-hidden">
              <TextReveal text="with a label." className="gradient-text italic" delay={0.16} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.24 }}
            className="hero-copy mt-8 max-w-xl text-balance text-[15px] leading-relaxed text-cream-muted sm:text-base"
          >
            High-density woven and satin labels, premium hang tags, custom
            packaging and the finishing details that clothing brands trust to
            look this good. Made with care, shipped worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.32 }}
            className="hero-actions mt-10 flex flex-wrap items-center gap-4"
          >
            <Link href="/quote" data-cursor="Quote">
              <Magnetic strength={0.4}>
                <span className="btn-primary">
                  Customize Your Order
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Magnetic>
            </Link>
            <Link href="/#gallery" data-cursor="View">
              <Magnetic strength={0.3}>
                <span className="btn-ghost">View the Work</span>
              </Magnetic>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
            className="mt-4 text-[12px] text-cream-dim"
          >
            Every order is custom-priced. Get a tailored quote within one business day.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="hero-stats mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-wide2 text-cream-dim"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-champagne animate-pulse-soft" />
              Worldwide shipping
            </span>
            <span className="flex items-center gap-2">
              <VerifiedBadgeIcon className="text-champagne" />
              <span>Trusted by clothing brands</span>
            </span>
            <span className="hidden items-center gap-2 sm:flex">
              <DeliveryVanIcon className="text-champagne" />
              Fast express delivery
            </span>
          </motion.div>
        </div>
      </div>

      {/* bottom marquee */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-line py-4">
        <Marquee speed={36} className="mask-fade-x">
          {["Woven Labels", "Hang Tags", "Satin Labels", "Custom Stickers", "Brand Packaging", "Zipper Bags", "Woven Patches", "Steel Logo Tags"].map(
            (t) => (
              <span key={t} className="mx-8 flex items-center gap-8 text-[12px] uppercase tracking-widest2 text-cream-muted">
                {t}
                <span className="text-champagne">✦</span>
              </span>
            )
          )}
        </Marquee>
      </div>
    </section>
  );
}
