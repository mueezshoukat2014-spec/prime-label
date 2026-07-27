"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.4,
  });
  const left = useTransform(progress, (v) => `${v * 100}%`);
  const needleOpacity = useTransform(progress, [0, 0.012, 1], [0, 1, 1]);

  return (
    <>
      {/* glowing progress line (thicker, layered glow) */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[140] h-[3px] w-full origin-left bg-gradient-to-r from-champagne-deep via-champagne to-champagne-bright shadow-[0_0_10px_rgba(201,168,106,0.7),0_0_22px_rgba(201,168,106,0.35)]"
        style={{ scaleX: progress }}
      />

      {/* glowing needle at the leading edge */}
      <motion.div
        className="pointer-events-none fixed top-0 z-[141] -translate-x-1/2"
        style={{ left, opacity: needleOpacity }}
      >
        <div className="relative flex flex-col items-center">
          {/* wide soft glow halo */}
          <div className="absolute -top-2 h-9 w-9 rounded-full bg-champagne/45 blur-[9px]" />
          {/* needle shaft with its own glow */}
          <div className="relative h-5 w-[2px] bg-gradient-to-b from-champagne-bright via-champagne to-champagne shadow-[0_0_8px_rgba(201,168,106,0.9)]" />
          {/* glowing diamond tip */}
          <div className="relative -mt-[4px] h-3.5 w-3.5 rotate-45 rounded-[3px] bg-champagne-bright shadow-[0_0_14px_4px_rgba(201,168,106,0.95),0_0_30px_8px_rgba(201,168,106,0.35)] animate-pulse-soft" />
        </div>
      </motion.div>
    </>
  );
}
