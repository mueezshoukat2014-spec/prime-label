"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE } from "@/components/anim";
import Logo from "@/components/Logo";

export default function Loader() {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // only on first load of the session
    if (sessionStorage.getItem("pl_loaded") === "1") {
      setDone(true);
      return;
    }
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 14 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(tick);
        setTimeout(() => {
          setDone(true);
          sessionStorage.setItem("pl_loaded", "1");
        }, 480);
      }
      setProgress(Math.min(100, p));
    }, 140);
    return () => clearInterval(tick);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink"
          exit={{ y: "-100%" }}
          transition={{ duration: 1.05, ease: EASE }}
        >
          <div className="pointer-events-none absolute inset-0 bg-radial-fade opacity-60" />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative flex flex-col items-center"
          >
            <Logo size={66} />
            <div className="mt-5 h-px w-44 overflow-hidden bg-cream/10">
              <motion.div
                className="h-full bg-gradient-to-r from-champagne-deep via-champagne to-champagne-bright"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
              />
            </div>
            <div className="mt-4 flex w-44 items-center justify-between text-[10px] uppercase tracking-widest2 text-cream-dim">
              <span>Prime Labels</span>
              <span className="tabular-nums text-champagne/80">
                {Math.round(progress)}%
              </span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute bottom-10 text-[10px] uppercase tracking-widest2 text-cream-dim"
          >
            Crafting premium branding
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
