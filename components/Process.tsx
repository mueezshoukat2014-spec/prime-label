"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal, EASE } from "@/components/anim";

const STEPS = [
  {
    n: "01",
    title: "Share your vision",
    body: "Tell us about your brand and the product you need. Send your logo or artwork, the quantity you have in mind, and any finish you are after. No design file ready? We will help you get there.",
  },
  {
    n: "02",
    title: "Approve the craft",
    body: "We prepare your artwork for the right product and confirm the details that matter, size, colours, materials and finish. You approve before a single piece is made.",
  },
  {
    n: "03",
    title: "Precision production",
    body: "Your order moves into production on the right machines, high-density weaving, fine printing, or hand-finished tags. Every detail is checked for consistency and quality.",
  },
  {
    n: "04",
    title: "Shipped worldwide",
    body: "Finished, checked, and carefully packed. We ship to brands across the globe and get your branding to you on time, ready to apply to every piece you make.",
  },
];

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 60%", "end 60%"],
  });
  const lineH = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // scroll progress for the vertical timeline next to the steps
  const { scrollYProgress: stepsProgress } = useScroll({
    target: stepsRef,
    offset: ["start 85%", "end 65%"],
  });
  const fillH = useSpring(stepsProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const fillHeight = useTransform(fillH, (v) => `${v * 100}%`);
  const headOpacity = useTransform(fillH, [0, 0.02, 0.99, 1], [0, 1, 1, 0]);

  return (
    <section id="process" className="relative border-t border-line py-20 sm:py-28">
      <div className="container-lux">
        <div ref={ref} className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          {/* sticky title */}
            <div className="lg:sticky lg:top-28 lg:h-fit">
            <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              How it works
            </span>
            <h2 className="display mt-5 text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              From idea to <br />
              <span className="gradient-text italic">finished brand.</span>
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-cream-muted">
              A simple, considered process. You stay in control of the design,
              we handle the craft.
            </p>
            </Reveal>
            <div className="mt-10 hidden items-center gap-4 lg:flex">
              <span className="text-[11px] uppercase tracking-widest2 text-cream-dim">
                Process
              </span>
              <span className="h-px flex-1 bg-line">
                <motion.span
                  className="block h-full bg-champagne"
                  style={{ height: "2px", width: lineH }}
                />
              </span>
            </div>
          </div>

          {/* steps */}
          <div ref={stepsRef} className="relative">
            {/* timeline track */}
            <div className="absolute left-[27px] top-2 bottom-2 w-px bg-line lg:left-0">
              {/* golden neon fill that grows on scroll */}
              <motion.div
                style={{ height: fillHeight }}
                className="absolute left-1/2 top-0 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-champagne-bright via-champagne to-champagne-deep shadow-[0_0_10px_rgba(201,168,106,0.9),0_0_22px_rgba(201,168,106,0.55),0_0_40px_rgba(230,203,140,0.3)]"
              >
                {/* glowing head at the tip */}
                <motion.span
                  style={{ opacity: headOpacity }}
                  className="absolute -bottom-[5px] left-1/2 h-[10px] w-[10px] -translate-x-1/2 rounded-full bg-champagne-bright shadow-[0_0_10px_rgba(230,203,140,1),0_0_24px_rgba(201,168,106,0.85),0_0_48px_rgba(201,168,106,0.5)]"
                />
                <motion.span
                  style={{ opacity: headOpacity }}
                  className="absolute -bottom-[13px] left-1/2 h-[26px] w-[26px] -translate-x-1/2 rounded-full bg-champagne/25 blur-[7px]"
                />
              </motion.div>
            </div>
            <div className="flex flex-col gap-4">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.05}>
                  <div className="group relative flex gap-6 rounded-3xl border border-transparent p-5 pl-0 transition-colors duration-500 hover:border-line hover:bg-cream/[0.02] lg:p-7 lg:pl-0">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line bg-ink">
                      <span className="display text-lg text-champagne">{s.n}</span>
                    </div>
                    <div className="pt-1">
                      <h3 className="display text-2xl text-cream sm:text-3xl">
                        {s.title}
                      </h3>
                      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-cream-muted">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
