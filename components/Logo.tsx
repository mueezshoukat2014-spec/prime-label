
/**
 * Brand logo: the gold "PL" monogram with a soft champagne glow.
 * Used in navbar, footer, loader, admin.
 */
export default function Logo({
  size = 38,
  className = "",
  glow = true,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  // The monogram artwork is slightly taller than wide (709x800).
  const width = Math.round(size * 0.886);
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute inset-[-30%] rounded-full bg-champagne/25 blur-lg"
        />
      )}
      <img
        src="/pl-monogram.png"
        alt="Prime Labels International logo"
        width={width}
        height={size}
        decoding="async"
        className="relative h-full w-auto object-contain drop-shadow-[0_1px_6px_rgba(201,168,106,0.35)]"
      />
    </span>
  );
}
