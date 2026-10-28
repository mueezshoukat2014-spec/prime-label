import Image from "next/image";

/**
 * Site image policy (see next.config.mjs): remote Vercel-Blob uploads go through
 * next/image — resized for the slot and re-encoded to AVIF/WebP — while repo
 * photos stay plain <img> (already compressed in-repo, no transformations).
 * Use `sizes` (fill mode, inside a positioned box) or width+height (fixed size).
 */
export default function SmartImg({
  src,
  alt,
  className,
  sizes,
  width,
  height,
  priority = false,
  eager = false,
  quality = 75,
}: {
  src: unknown;
  alt: string;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  /** LCP image: preload with high fetch priority. */
  priority?: boolean;
  /** Above the fold but not the LCP: load immediately, normal priority. */
  eager?: boolean;
  quality?: number;
}) {
  const s = typeof src === "string" ? src : "";
  if (s.startsWith("https://")) {
    const loading = priority ? undefined : eager ? ("eager" as const) : ("lazy" as const);
    return width && height ? (
      <Image src={s} alt={alt} width={width} height={height} quality={quality} priority={priority} loading={loading} className={className} />
    ) : (
      <Image src={s} alt={alt} fill sizes={sizes || "100vw"} quality={quality} priority={priority} loading={loading} className={className} />
    );
  }
  return (
    <img
      src={s}
      alt={alt}
      width={width}
      height={height}
      loading={priority || eager ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
      className={className}
    />
  );
}
