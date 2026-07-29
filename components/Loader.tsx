"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE } from "@/components/anim";
import Logo from "@/components/Logo";

export default function Loader() {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Lightweight first-session preloader: gives the site a polished entrance
    // without blocking repeat visitors or ads traffic for too long.
    if (sessionStorage.getItem("pl_loaded") === "1") {
      setDone(true);
      return;
    }

    let p = 12;
    const started = Date.now();
    const finish = () => {
      const elapsed = Date.now() - started;
      window.setTimeout(() => {
        setProgress(100);
        window.setTimeout(() => {
          setDone(true);
          sessionStorage.setItem("pl_loaded", "1");
        }, 220);
      }, Math.max(0, 650 - elapsed));
    };

    const tick = setInterval(() => {
      p = Math.min(92, p + 11);
      setProgress(p);
    }, 90);

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    const hardCap = window.setTimeout(finish, 1200);
    return () => {
      clearInterval(tick);
      clearTimeout(hardCap);
      window.removeEventListener("load", finish);
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.55, ease: EASE }}
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
            transition={{ delay: 0.15, duration: 0.45 }}
            className="absolute bottom-10 text-[10px] uppercase tracking-widest2 text-cream-dim"
          >
            Crafting premium branding
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
