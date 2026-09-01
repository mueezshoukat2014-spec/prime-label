"use client";
import { motion } from "framer-motion";
import { Reveal, Counter, EASE } from "@/components/anim";

const DEFAULT_STATS = [
  { value: 8, suffix: "", label: "Product lines" },
  { value: 24, suffix: "h", label: "Free digital proof" },
  { value: 100, suffix: "", label: "Units low MOQ" },
  { value: 50, suffix: "+", label: "Wash durability" },
];

/**
 * Admin-editable stats: site_content.aboutStats holds one "number|label" per
 * line, e.g. "160+|Designs made". Invalid lines are skipped; empty setting
 * falls back to the defaults.
 */
export function parseStats(raw?: string) {
  const lines = String(raw ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.includes("|"));
  const parsed = lines
    .map((l) => {
      const [num, ...rest] = l.split("|");
      const label = rest.join("|").trim();
      const m = String(num).trim().match(/^(\d+)\s*([+%]?)$/);
      if (!m || !label) return null;
      return { value: Number(m[1]), suffix: m[2] || "", label };
    })
    .filter(Boolean) as typeof DEFAULT_STATS;
  return parsed.length >= 2 ? parsed.slice(0, 4) : DEFAULT_STATS;
}

const lineUp = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.8, ease: EASE, delay: i * 0.09 },
});

export default function About({
  statsRaw,
  aboutText,
}: {
  /** site_content.aboutStats — "number|label" per line. */
  statsRaw?: string;
  /** site_content.aboutText — the studio paragraph. */
  aboutText?: string;
}) {
  const STATS = parseStats(statsRaw);
  const paragraph =
    aboutText?.trim() ||
    "Prime Labels International is a custom branding studio for clothing and lifestyle brands. From high-density woven labels to packaging that turns an unboxing into a moment, we obsess over the details most people never notice, but every customer feels.";
  return (
    <section id="about" className="relative overflow-hidden border-t border-line py-14 sm:py-28">
      <div className="pointer-events-none absolute -right-[20%] top-0 h-[500px] w-[500px] rounded-full bg-champagne/8 blur-[55px] md:blur-[140px]" />
      <div className="container-lux relative">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="h-px w-8 bg-champagne/60" />
                The studio
              </span>
            </Reveal>
            <h2 className="display mt-6 text-[1.95rem] leading-[1.14] tracking-tight sm:text-4xl lg:text-[2.9rem]">
              <motion.span {...lineUp(0)} className="sm:block">We believe a label is where a </motion.span>
              <motion.span {...lineUp(1)} className="sm:block">brand is truly felt. The thread, </motion.span>
              <motion.span {...lineUp(2)} className="sm:block">the weight, the finish. It is the </motion.span>
              <motion.span {...lineUp(3)} className="gradient-text italic sm:block">last thing your customer touches, </motion.span>
              <motion.span {...lineUp(4)} className="gradient-text italic sm:block">and the first thing they remember.</motion.span>
            </h2>
          </div>

          <div className="flex flex-col justify-end gap-8">
            <Reveal delay={0.2}>
              <p className="text-[15px] leading-relaxed text-cream-muted">
                {paragraph}
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line">
                {STATS.map((s) => (
                  <div key={s.label} className="bg-ink p-6 sm:p-7">
                    <div className="display tabular-nums text-4xl text-cream sm:text-5xl">
                      <Counter to={s.value} suffix={s.suffix} />
                    </div>
                    <div className="mt-2 text-[12px] uppercase tracking-wide2 text-cream-dim">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
