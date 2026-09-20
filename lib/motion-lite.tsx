/* eslint-disable */
/**
 * motion-lite — a tiny, dependency-free stand-in for the framer-motion API
 * surface used by this codebase (~5KB vs ~127KB of framer runtime).
 *
 * Why: framer-motion put a 127KB chunk on the critical path of every page
 * (it dominated Lighthouse bootup-time under CPU throttling, delaying first
 * paint of the hero and inflating TBT). This shim re-implements only what the
 * components actually use, with CSS transitions / WAAPI / IntersectionObserver
 * instead of a full animation engine:
 *
 *   motion.<tag>  initial/animate/whileInView/whileHover/whileTap/exit/
 *                 variants/viewport/transition/style(MotionValues)/drag/pathLength
 *   AnimatePresence, useMotionValue, useSpring, useTransform, useScroll,
 *   useMotionValueEvent, useInView, useReducedMotion, animate()
 *
 * SSR parity: like framer, initial static styles are rendered into the HTML so
 * there is no flash-of-visible-content and no layout shift when the client
 * attaches.
 */
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  createElement,
} from "react";

/* ------------------------------ MotionValue ------------------------------ */
export class MotionValue<_T = any> {
  current: any;
  private subs = new Set<(v: any) => void>();
  constructor(initial: any) {
    this.current = initial;
  }
  get() {
    return this.current;
  }
  set(v: any) {
    this.current = v;
    this.subs.forEach((f) => f(v));
  }
  on(_ev: "change" | "renderRequest", cb: (v: any) => void) {
    this.subs.add(cb);
    return () => {
      this.subs.delete(cb);
    };
  }
  subscribe(cb: (v: any) => void) {
    return this.on("change", cb);
  }
  addEventListener(ev: "change", cb: (v: any) => void) {
    return this.on(ev, cb);
  }
  removeEventListener(_ev: "change", cb: (v: any) => void) {
    this.subs.delete(cb);
  }
  stop() {}
}
export function isMotionValue(v: unknown): v is MotionValue {
  return v instanceof MotionValue;
}
export function useMotionValue<T = number>(init: T): MotionValue<T> {
  const r = useRef<MotionValue<T> | null>(null);
  if (!r.current) r.current = new MotionValue<T>(init);
  return r.current;
}

/* ------------------------------ useTransform ----------------------------- */
export function useTransform<I = number, O = any>(
  source: MotionValue<I>,
  map: ((v: I) => O) | number[],
  out?: O[]
): MotionValue<O> {
  const fn: (v: any) => O =
    typeof map === "function"
      ? (map as (v: I) => O)
      : (v: number) => {
          const input = map as number[];
          const output = out as any[];
          if (v <= input[0]) return output[0];
          if (v >= input[input.length - 1]) return output[output.length - 1];
          let i = 0;
          while (i < input.length - 2 && v > input[i + 1]) i++;
          const t = (v - input[i]) / (input[i + 1] - input[i] || 1);
          const a = output[i], b = output[i + 1];
          if (typeof a === "number" && typeof b === "number") return (a + (b - a) * t) as O;
          return (t < 0.5 ? a : b) as O;
        };
  const mv = useMotionValue<O>(fn(source.get()));
  useEffect(() => source.on("change", (v) => mv.set(fn(v))), [source, mv]);
  return mv;
}

/* ------------------------------- useSpring ------------------------------- */
export function useSpring(
  source: MotionValue<any> | number,
  config: { stiffness?: number; damping?: number; mass?: number; restDelta?: number } = {}
): MotionValue<number> {
  const { stiffness = 100, damping = 10, mass = 1 } = config;
  const src = isMotionValue(source) ? (source as MotionValue<number>) : null;
  const out = useMotionValue<number>(src ? src.get() : (source as number));
  useEffect(() => {
    let value = out.get();
    let target = src ? src.get() : (source as number);
    let velocity = 0;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      const dt = Math.min(0.064, (t - last) / 1000 || 0.016);
      last = t;
      const accel = (-stiffness * (value - target) - damping * velocity) / mass;
      velocity += accel * dt;
      value += velocity * dt;
      if (Math.abs(velocity) < 0.01 && Math.abs(value - target) < 0.01) {
        out.set(target);
        raf = 0;
        return;
      }
      out.set(value);
      raf = requestAnimationFrame(loop);
    };
    const kick = (t2: number) => {
      target = t2;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const un = src ? src.on("change", kick) : () => {};
    return () => {
      un();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [src]);
  return out;
}

/* ------------------------------- useScroll ------------------------------- */
export function useScroll(opts?: {
  target?: React.RefObject<HTMLElement | null>;
  offset?: unknown;
}) {
  const scrollY = useMotionValue(0);
  const scrollYProgress = useMotionValue(0);
  const scrollX = useMotionValue(0);
  const scrollXProgress = useMotionValue(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      scrollY.set(y);
      scrollX.set(window.scrollX);
      const el = opts?.target?.current;
      const vh = window.innerHeight;
      if (!el) {
        const max = document.documentElement.scrollHeight - vh;
        scrollYProgress.set(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
      } else {
        const r = el.getBoundingClientRect();
        const total = r.height + vh;
        scrollYProgress.set(Math.min(1, Math.max(0, (vh - r.top) / total)));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return { scrollY, scrollYProgress, scrollX, scrollXProgress };
}

export function useMotionValueEvent(
  mv: MotionValue<any>,
  _ev: "change",
  cb: (v: any) => void
) {
  useEffect(() => mv.on("change", cb), [mv, cb]);
}

/* ------------------------------- useInView ------------------------------- */
export function useInView(
  ref: React.RefObject<Element | null>,
  opts: { once?: boolean; margin?: string; amount?: number | "some" | "all" } = {}
) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (opts.once) io.disconnect();
          } else if (!opts.once) setInView(false);
        }
      },
      { rootMargin: opts.margin || "0px", threshold: opts.amount === "all" ? 1 : 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return inView;
}

export function useReducedMotion(): boolean | null {
  const [reduce, setReduce] = useState<boolean | null>(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

/* ------------------------- cubic-bezier + animate() ----------------------- */
function bezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
  const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 5; i++) {
      const dx = sampleX(t) - x;
      const d = sampleDX(t);
      if (Math.abs(dx) < 1e-4 || d === 0) break;
      t -= dx / d;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}
function easeFn(ease: unknown): (t: number) => number {
  if (Array.isArray(ease) && ease.length === 4)
    return bezier(...(ease as [number, number, number, number]));
  switch (ease) {
    case "linear": return (t) => t;
    case "easeIn": return (t) => t * t * t;
    case "easeInOut": return (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    case "circOut": return (t) => Math.sqrt(1 - Math.pow(t - 1, 2));
    default: return (t) => 1 - Math.pow(1 - t, 3);
  }
}
export function animate(
  from: number,
  to: number,
  opts: { duration?: number; ease?: unknown; onUpdate?: (v: number) => void; onComplete?: () => void } = {}
) {
  const dur = (opts.duration ?? 0.6) * 1000;
  const fn = easeFn(opts.ease);
  const start = performance.now();
  let raf = 0;
  let stopped = false;
  const loop = (t: number) => {
    if (stopped) return;
    const p = Math.min(1, (t - start) / dur);
    opts.onUpdate?.(from + (to - from) * fn(p));
    if (p < 1) raf = requestAnimationFrame(loop);
    else opts.onComplete?.();
  };
  raf = requestAnimationFrame(loop);
  return { stop: () => { stopped = true; cancelAnimationFrame(raf); } };
}

/* ----------------------------- style helpers ----------------------------- */
const TRANSFORM_KEYS = ["x", "y", "scale", "scaleX", "scaleY", "rotate", "rotateX", "rotateY", "transformPerspective", "skewX", "skewY"];
function unit(key: string, v: number | string) {
  if (typeof v === "number") {
    if (key === "scale" || key === "scaleX" || key === "scaleY" || key === "opacity") return String(v);
    if (key === "rotate" || key === "rotateX" || key === "rotateY" || key === "skewX" || key === "skewY") return `${v}deg`;
    return `${v}px`;
  }
  return String(v);
}
function transformFrom(t: Record<string, unknown>) {
  const parts: string[] = [];
  if (t.transformPerspective != null) parts.push(`perspective(${unit("transformPerspective", t.transformPerspective as any)})`);
  if (t.x != null || t.y != null) parts.push(`translate(${unit("x", (t.x as any) ?? 0)}, ${unit("y", (t.y as any) ?? 0)})`);
  if (t.rotate != null) parts.push(`rotate(${unit("rotate", t.rotate as any)})`);
  if (t.rotateX != null || t.rotateY != null)
    parts.push(`rotateX(${unit("rotateX", (t.rotateX as any) ?? 0)}) rotateY(${unit("rotateY", (t.rotateY as any) ?? 0)})`);
  if (t.scale != null) parts.push(`scale(${unit("scale", t.scale as any)})`);
  if (t.scaleX != null) parts.push(`scaleX(${unit("scaleX", t.scaleX as any)})`);
  if (t.scaleY != null) parts.push(`scaleY(${unit("scaleY", t.scaleY as any)})`);
  return parts.join(" ");
}
function cssFromTarget(target: Record<string, unknown>) {
  const style: Record<string, string> = {};
  const tf: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(target)) {
    if (v == null || isMotionValue(v) || Array.isArray(v)) continue;
    if (TRANSFORM_KEYS.includes(k)) tf[k] = v;
    else if (k === "pathLength") {
      style.strokeDasharray = "1";
      style.strokeDashoffset = String(1 - (v as number));
    } else if (k === "opacity") style.opacity = String(v);
    else if (typeof v === "string" || typeof v === "number") style[k] = unit(k, v as any);
  }
  if (Object.keys(tf).length) style.transform = transformFrom(tf);
  return style;
}
function easeCss(ease: unknown) {
  if (Array.isArray(ease) && ease.length === 4) return `cubic-bezier(${ease.join(",")})`;
  if (ease === "easeOut") return "cubic-bezier(0, 0, 0.2, 1)";
  if (ease === "easeIn") return "cubic-bezier(0.4, 0, 1, 1)";
  if (ease === "easeInOut") return "cubic-bezier(0.4, 0, 0.2, 1)";
  if (ease === "linear") return "linear";
  if (ease === "circOut") return "cubic-bezier(0, 0.55, 0.45, 1)";
  return "cubic-bezier(0.16, 1, 0.3, 1)";
}

/* --------------------------- variant propagation -------------------------- */
const VariantCtx = createContext<{ i: string | null; a: string | null }>({ i: null, a: null });

function resolveTarget(
  value: unknown,
  variants?: Record<string, Record<string, unknown>>,
): Record<string, unknown> | undefined {
  if (value == null || value === false) return undefined;
  if (typeof value === "string") return variants?.[value];
  if (typeof value === "object") return value as Record<string, unknown>;
  return undefined;
}

/* --------------------------------- props ---------------------------------- */
type MotionProps = Omit<
  React.AllHTMLAttributes<any> & React.SVGAttributes<any>,
  "style" | "onDrag" | "onDragStart" | "onDragEnd" | "onDragCapture" | "onDragStartCapture" | "onDragEndCapture"
> & {
    style?: any;
    layout?: any;
    disablePictureInPicture?: any;
    controlsList?: any;
    initial?: any;
    animate?: any;
    whileInView?: any;
    whileHover?: any;
    whileTap?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    viewport?: any;
    drag?: any;
    dragConstraints?: any;
    dragElastic?: any;
    layoutId?: any;
    onAnimationComplete?: any;
    onDragStart?: (e: any, info: any) => void;
    onDrag?: (e: any, info: any) => void;
    onDragEnd?: (e: any, info: any) => void;
  };

/* -------------------------------- makeMotion ------------------------------ */
function makeMotion(tag: string) {
  const C = forwardRef<HTMLElement, MotionProps>(function MotionEl(props, ref) {
    const {
      initial,
      animate,
      whileInView,
      whileHover,
      whileTap,
      exit,
      transition,
      variants,
      viewport,
      style,
      drag,
      dragConstraints,
      dragElastic,
      layoutId,
      onAnimationComplete,
      onDragStart,
      onDrag,
      onDragEnd,
      ...rest
    } = props;
    const el = useRef<HTMLElement | null>(null);
    const parentVariant = useContext(VariantCtx);

    const initialName = typeof initial === "string" ? initial : parentVariant.i;
    // framer propagates variant *labels* to descendants: a parent with
    // animate="show" makes children that define `variants` resolve their own
    // "show" target. Without this, masked reveals (TextReveal) never un-hide.
    const animateName = typeof animate === "string" ? animate : parentVariant.a;

    const initialTarget = useMemo(
      () =>
        (typeof initial === "object" ? initial : undefined) ??
        (variants && initialName ? variants[initialName] : undefined),
      []
    );

    const usesPathLength =
      (style && style.pathLength != null) ||
      (initialTarget && initialTarget.pathLength != null) ||
      (animate && typeof animate === "object" && animate.pathLength != null);

    const staticStyle = useMemo(() => {
      const out: Record<string, string> = {};
      if (style) {
        for (const [k, v] of Object.entries(style)) {
          if (isMotionValue(v)) continue;
          if (TRANSFORM_KEYS.includes(k)) continue;
          if (k === "pathLength") continue;
          out[k] = unit(k, v as any);
        }
      }
      if (initialTarget) Object.assign(out, cssFromTarget(initialTarget));
      if (style?.transform && !initialTarget?.x && !initialTarget?.y) out.transform = style.transform;
      return out;
    }, []);

    const animsRef = useRef<any[]>([]);
    const baseRef = useRef<Record<string, unknown> | null>(null);

    const applyTarget = (node: HTMLElement, target: Record<string, unknown> | undefined, tr: any) => {
      if (!target) return;
      const hasKeyframes = Object.values(target).some((v) => Array.isArray(v));
      if (hasKeyframes) {
        const kf: Record<string, unknown[]> = {};
        for (const [k, v] of Object.entries(target)) {
          if (!Array.isArray(v)) continue;
          if (k === "y" || k === "x") kf.transform = (v as any[]).map((vv) => transformFrom({ [k]: vv }));
          else if (k === "opacity") kf.opacity = v as any[];
          else if (k === "scale") kf.transform = (v as any[]).map((vv) => transformFrom({ scale: vv }));
          else if (k === "color") kf.color = v as any[];
        }
        try {
          const a = (node as any).animate(kf, {
            duration: ((tr?.duration ?? 0.6) as number) * 1000,
            delay: ((tr?.delay ?? 0) as number) * 1000,
            iterations: tr?.repeat && tr.repeat !== 0 ? Infinity : 1,
            direction: tr?.repeatType === "mirror" ? "alternate" : "normal",
            easing: easeCss(tr?.ease),
            fill: "both",
          });
          animsRef.current.push(a);
        } catch {}
        return;
      }
      const css = cssFromTarget(target);
      const keys = Object.keys(css);
      if (!keys.length) return;
      const per = (k: string) => (tr && typeof tr === "object" && tr[k] && typeof tr[k] === "object" ? tr[k] : tr) || {};
      node.style.transition = keys
        .map((k) => {
          const t2 = per(k);
          const prop = k === "transform" ? "transform" : k;
          if (t2.type === "spring") return `${prop} 0.6s ${easeCss("easeOut")} ${(t2.delay ?? 0)}s`;
          return `${prop} ${(t2.duration ?? 0.6)}s ${easeCss(t2.ease)} ${(t2.delay ?? 0)}s`;
        })
        .join(", ");
      requestAnimationFrame(() => {
        for (const [k, v] of Object.entries(css)) (node.style as any)[k] = v;
      });
    };

    /* Effect A — observers/subscriptions that MUST survive re-renders.
       (The previous single no-deps effect re-ran every render; each re-render
       destroyed the IntersectionObservers, so below-fold whileInView reveals
       never fired and their text stayed at opacity 0.) */
    useEffect(() => {
      const node = el.current;
      if (!node) return;
      const cleanups: Array<() => void> = [];

      /* MotionValues in style -> write directly */
      const mvKeys: string[] = [];
      if (style) {
        for (const [k, v] of Object.entries(style)) {
          if (!isMotionValue(v)) continue;
          if (!mvKeys.includes(k)) mvKeys.push(k);
        }
        const applyMv = () => {
          const t: Record<string, unknown> = {};
          let hasTf = false;
          for (const key of mvKeys) {
            const val = (style[key] as MotionValue).get();
            if (TRANSFORM_KEYS.includes(key)) { t[key] = val; hasTf = true; }
            else if (key === "pathLength") {
              node.style.strokeDasharray = "1";
              node.style.strokeDashoffset = String(1 - (val as number));
            } else {
              (node.style as any)[key] = typeof val === "number" && key !== "opacity" ? `${val}px` : String(val);
            }
          }
          if (hasTf) node.style.transform = transformFrom(t);
        };
        for (const key of mvKeys) cleanups.push((style[key] as MotionValue).on("change", applyMv));
        applyMv();
      }

      if (whileInView) {
        const io = new IntersectionObserver(
          (ents) => {
            for (const e of ents) {
              if (e.isIntersecting) {
                applyTarget(node, resolveTarget(whileInView, variants), transition);
                if (viewport?.once !== false) io.disconnect();
              }
            }
          },
          { rootMargin: viewport?.margin || "0px", threshold: 0 }
        );
        io.observe(node);
        cleanups.push(() => io.disconnect());
      }

      const hoverT = resolveTarget(whileHover, variants);
      if (hoverT) {
        const cssH = cssFromTarget(hoverT);
        const base = () => cssFromTarget(baseRef.current ?? initialTarget ?? {});
        const onIn = () => {
          node.style.transition = "transform .35s cubic-bezier(0.16,1,0.3,1)";
          for (const [k, v] of Object.entries(cssH)) (node.style as any)[k] = v;
        };
        const onOut = () => {
          for (const [k, v] of Object.entries(base())) (node.style as any)[k] = v;
        };
        node.addEventListener("pointerenter", onIn);
        node.addEventListener("pointerleave", onOut);
        cleanups.push(() => {
          node.removeEventListener("pointerenter", onIn);
          node.removeEventListener("pointerleave", onOut);
        });
      }
      const tapT = resolveTarget(whileTap, variants);
      if (tapT) {
        const cssT = cssFromTarget(tapT);
        const down = () => { for (const [k, v] of Object.entries(cssT)) (node.style as any)[k] = v; };
        const up = () => { for (const [k, v] of Object.entries(cssFromTarget(hoverT ?? baseRef.current ?? {}))) (node.style as any)[k] = v; };
        node.addEventListener("pointerdown", down);
        node.addEventListener("pointerup", up);
        cleanups.push(() => {
          node.removeEventListener("pointerdown", down);
          node.removeEventListener("pointerup", up);
        });
      }
      if (drag) {
        let startX = 0, startY = 0, baseX = 0, baseY = 0, dragging = false;
        const axis = drag === true ? "both" : drag;
        const getXY = () => {
          const m = (node.style.transform || "").match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
          return m ? [parseFloat(m[1]), parseFloat(m[2])] : [0, 0];
        };
        const setXY = (x: number, y: number) => {
          const c = dragConstraints || {};
          const cx = Math.min(c.right ?? Infinity, Math.max(c.left ?? -Infinity, x));
          const cy = Math.min(c.bottom ?? Infinity, Math.max(c.top ?? -Infinity, y));
          node.style.transition = "none";
          node.style.transform = transformFrom({ x: axis === "y" ? 0 : cx, y: axis === "x" ? 0 : cy });
          return [cx, cy];
        };
        const info = (e: PointerEvent, ox: number, oy: number) => ({
          point: { x: e.clientX, y: e.clientY },
          offset: { x: ox, y: oy },
          velocity: { x: 0, y: 0 },
          delta: { x: e.clientX - startX, y: e.clientY - startY },
        });
        const down = (e: PointerEvent) => {
          dragging = true;
          startX = e.clientX; startY = e.clientY;
          [baseX, baseY] = getXY();
          node.setPointerCapture(e.pointerId);
          onDragStart?.(e, info(e, 0, 0));
        };
        const move = (e: PointerEvent) => {
          if (!dragging) return;
          const ox = e.clientX - startX, oy = e.clientY - startY;
          setXY(axis === "y" ? baseX : baseX + ox, axis === "x" ? baseY : baseY + oy);
          onDrag?.(e, info(e, ox, oy));
        };
        const up = (e: PointerEvent) => {
          if (!dragging) return;
          dragging = false;
          if (node.hasPointerCapture(e.pointerId)) node.releasePointerCapture(e.pointerId);
          onDragEnd?.(e, info(e, e.clientX - startX, e.clientY - startY));
        };
        node.addEventListener("pointerdown", down);
        node.addEventListener("pointermove", move);
        node.addEventListener("pointerup", up);
        node.addEventListener("pointercancel", up);
        (node.style as any).touchAction = axis === "x" ? "pan-y" : "pan-x";
        (node.style as any).cursor = "grab";
        cleanups.push(() => {
          node.removeEventListener("pointerdown", down);
          node.removeEventListener("pointermove", move);
          node.removeEventListener("pointerup", up);
          node.removeEventListener("pointercancel", up);
        });
      }

      return () => cleanups.forEach((f) => f());
    }, []);

    /* Effect B — entrance animation target; reactive to animate / inherited
       variant label changes (TextReveal parent "hidden" -> "show"). */
    const animateKey = typeof animate === "object" && animate !== null ? JSON.stringify(animate) : String(animate ?? "");
    useEffect(() => {
      const node = el.current;
      if (!node) return;
      const enterTarget =
        (typeof animate === "object" && animate !== null ? animate : undefined) ??
        (typeof animate === "string" ? variants?.[animate] : undefined) ??
        (animate == null && animateName && variants ? variants[animateName] : undefined);
      baseRef.current = enterTarget ?? null;
      if (enterTarget) {
        const id = requestAnimationFrame(() => applyTarget(node, enterTarget, transition));
        return () => cancelAnimationFrame(id);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animateKey, animateName]);

    useEffect(
      () => () => {
        animsRef.current.forEach((a) => { try { a.cancel(); } catch {} });
      },
      []
    );


    const setRefs = (node: HTMLElement | null) => {
      el.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    const elemProps: Record<string, any> = { ...rest, ref: setRefs, style: staticStyle };
    if (usesPathLength) elemProps.pathLength = 1;

    return createElement(
      VariantCtx.Provider,
      { value: { i: initialName, a: animateName } },
      createElement(tag, elemProps)
    );
  });
  return C;
}

const cache: Record<string, ReturnType<typeof makeMotion>> = {};
export const motion: { [tag: string]: React.ForwardRefExoticComponent<MotionProps & React.RefAttributes<any>> } = new Proxy({} as any, {
  get(_, tag: string) {
    if (!cache[tag]) cache[tag] = makeMotion(tag);
    return cache[tag];
  },
});

export function AnimatePresence(props: {
  children?: React.ReactNode;
  initial?: boolean;
  mode?: string;
  onExitComplete?: () => void;
}) {
  return <>{props.children}</>;
}

export type Variants = Record<string, Record<string, any>>;
