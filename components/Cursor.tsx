"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 220, damping: 24, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 220, damping: 24, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
      if (t) {
        setHovering(true);
        setLabel(t.dataset.cursor || "");
      } else {
        setHovering(false);
        setLabel("");
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[150] hidden md:block">
      <motion.div
        className="absolute h-1.5 w-1.5 rounded-full bg-champagne"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="absolute flex items-center justify-center rounded-full border border-champagne/50"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 64 : 34,
          height: hovering ? 64 : 34,
          opacity: hovering ? 1 : 0.6,
          backgroundColor: hovering ? "rgba(201,168,106,0.08)" : "rgba(201,168,106,0)",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {label && (
          <span className="text-[8px] uppercase tracking-widest2 text-champagne">
            {label}
          </span>
        )}
      </motion.div>
    </div>
  );
}
