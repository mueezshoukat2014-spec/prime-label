
/**
 * Brand logo: the owner's Instagram profile picture inside a
 * champagne-gradient ring. Used in navbar, footer, loader, admin.
 */
export default function Logo({
  size = 38,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 rounded-full bg-gradient-to-br from-champagne-bright via-champagne to-champagne-deep p-[2px] ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="relative block h-full w-full overflow-hidden rounded-full bg-ink">
        <img
  src="/photos/brand-logo.jpg"
  alt="Prime Labels International logo"
  decoding="async"
  className="absolute inset-0 h-full w-full object-cover"
/>
      </span>
    </span>
  );
}
