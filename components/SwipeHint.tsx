/**
 * Small "Swipe to see more" hint shown under horizontally-scrolling
 * lists on mobile/tablet (hidden on large screens where lists go vertical).
 */
export default function SwipeHint({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-dim lg:hidden ${className}`}
    >
      <svg className="animate-swipe-rev" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Swipe to see more</span>
      <svg className="animate-swipe" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
