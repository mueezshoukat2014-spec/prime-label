// Celebration burst, themed to the Prime Labels palette.
// canvas-confetti is imported dynamically so it never lands in the initial
// bundle — it is only fetched the moment a form is actually submitted.

/** Champagne / cream palette pulled from tailwind.config.ts. */
export const CONFETTI_COLORS = [
  "#C9A86A", // champagne
  "#E6CB8C", // champagne-bright
  "#9E7E45", // champagne-deep
  "#F4F0E8", // cream
  "#A59D8E", // cream-muted
];

/**
 * Fire a celebratory burst: two angled cannons from the lower corners plus a
 * centre pop. Respects prefers-reduced-motion and never throws — a failed
 * animation must never break a successful submission.
 */
export async function celebrate(): Promise<void> {
  try {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) return;

    const confetti = (await import("canvas-confetti")).default;

    const base = {
      colors: CONFETTI_COLORS,
      disableForReducedMotion: true,
      scalar: 0.95,
      zIndex: 2000,
    };

    // centre pop
    confetti({
      ...base,
      particleCount: 70,
      spread: 78,
      startVelocity: 42,
      origin: { x: 0.5, y: 0.62 },
    });

    // left cannon
    setTimeout(() => {
      confetti({
        ...base,
        particleCount: 45,
        angle: 60,
        spread: 62,
        startVelocity: 46,
        origin: { x: 0.08, y: 0.78 },
      });
    }, 130);

    // right cannon
    setTimeout(() => {
      confetti({
        ...base,
        particleCount: 45,
        angle: 120,
        spread: 62,
        startVelocity: 46,
        origin: { x: 0.92, y: 0.78 },
      });
    }, 240);

    // slow drifting sparkle to finish
    setTimeout(() => {
      confetti({
        ...base,
        particleCount: 28,
        spread: 110,
        startVelocity: 26,
        gravity: 0.55,
        decay: 0.92,
        scalar: 0.7,
        origin: { x: 0.5, y: 0.45 },
      });
    }, 420);
  } catch {
    // animation is decorative only — ignore any failure
  }
}
