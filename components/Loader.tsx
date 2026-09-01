"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE } from "@/components/anim";
import Logo from "@/components/Logo";

export default function Loader() {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cinematic preloader for FIRST-EVER visit only. Repeat visitors
    // (localStorage) and same-session navigations (sessionStorage) skip it
    // entirely — best mobile LCP for the traffic that already knows us.
    try {
      if (
        sessionStorage.getItem("pl_loaded") === "1" ||
        localStorage.getItem("pl_visited") === "1"
      ) {
        setDone(true);
        try {
          localStorage.setItem("pl_visited", "1");
        } catch {}
        return;
      }
    } catch {
      /* storage blocked — show the loader normally */
    }

    // Real loading progress: the loader stays until the FULL page (images,
    // fonts, everything) has finished loading — window "load" event — with a
    // 6s safety cap so an extremely slow connection never traps the visitor.
    let p = 8;
    let finished = false;
    const started = Date.now();
    const finish = () => {
      if (finished) return;
      finished = true;
      const elapsed = Date.now() - started;
      // keep a tiny minimum so the entrance never "blinks" on fast networks
      window.setTimeout(() => {
        setProgress(100);
        window.setTimeout(() => {
          setDone(true);
          try {
            sessionStorage.setItem("pl_loaded", "1");
            localStorage.setItem("pl_visited", "1");
          } catch {}
        }, 200);
      }, Math.max(0, 500 - elapsed));
    };

    // Progress creeps toward 94% while the page is genuinely still loading,
    // easing off as it gets closer so it feels like real measured progress.
    const tick = setInterval(() => {
      p = Math.min(94, p + Math.max(0.6, (94 - p) * 0.09));
      setProgress(Math.round(p));
    }, 120);

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    // 3s cap balances the "wait for full load" feel against mobile LCP.
    const hardCap = window.setTimeout(finish, 3000);
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
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="pointer-events-none absolute inset-0 bg-radial-fade opacity-60" />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative flex flex-col items-center"
          >
            {/* breathing gold aura behind the monogram */}
            <motion.span
              aria-hidden
              className="absolute -top-10 h-44 w-44 rounded-full bg-champagne/15 blur-2xl"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.92, 1.06, 0.92] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: EASE }}
            >
              <Logo size={96} glow={false} />
            </motion.div>
            <div className="mt-7 h-px w-44 overflow-hidden bg-cream/10">
              <motion.div
                className="h-full bg-gradient-to-r from-champagne-deep via-champagne to-champagne-bright"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
              />
            </div>
            <div className="mt-4 flex w-44 items-center justify-between text-[10px] uppercase tracking-widest2 text-cream-dim">
              <span>Prime Labels</span>
              <span className="notranslate tabular-nums text-champagne/80" translate="no" dir="ltr">
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
