"use client";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
  animate,
  type Variants,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";

const SPRING = { type: "spring" as const, stiffness: 120, damping: 18, mass: 0.6 };
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ---------- Reveal: fade + rise on enter ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- TextReveal: masked word-by-word headline ---------- */
export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.05,
  as = "div",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const words = text.split(" ");
  const MotionTag = motion[as];
  return (
    <MotionTag
      ref={ref as any}
      className={className}
      aria-label={text}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.14em", marginBottom: "-0.14em" }}
        >
          <motion.span
            style={{ display: "inline-block", willChange: "transform" }}
            variants={{
              hidden: { y: "110%" },
              show: { y: "0%" },
            }}
            transition={{ duration: 0.55, ease: EASE, delay: delay + i * stagger }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/* ---------- Magnetic: element follows cursor slightly ---------- */
export function Magnetic({
  children,
  strength = 0.35,
  className,
  style,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, ...style }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Counter: animate to number on enter ---------- */
export function Counter({
  to,
  from = 0,
  suffix = "",
  prefix = "",
  duration = 2,
  className,
}: {
  to: number;
  from?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [val, setVal] = useState(from);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(from, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, from, duration]);
  const display =
    to >= 1000 ? Math.round(val).toLocaleString("en-US") : Math.round(val).toString();
  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ---------- Marquee: infinite horizontal scroll ---------- */
export function Marquee({
  children,
  className,
  speed = 38,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px" });
  return (
    <div ref={ref} className={`relative flex overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex shrink-0"
        animate={inView ? { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] } : { x: 0 }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Parallax: vertical parallax on scroll ---------- */
export function Parallax({
  children,
  amount = 80,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ---------- Tilt: 3D hover tilt ---------- */
export function Tilt({
  children,
  className,
  max = 8,
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 15 });
  const sry = useSpring(ry, { stiffness: 150, damping: 15 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformPerspective: 1000,
      }}
      whileHover={{ scale }}
      transition={{ scale: { duration: 0.5, ease: EASE } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { EASE, SPRING };
export type { Variants };
