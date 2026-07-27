"use client";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "about", label: "Studio" },
  { id: "products", label: "Products" },
  { id: "process", label: "Process" },
  { id: "gallery", label: "Gallery" },
  { id: "faq", label: "FAQ" },
];

export default function SectionDots() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-5 top-1/2 z-[90] hidden -translate-y-1/2 flex-col gap-3 lg:flex"
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => goTo(s.id)}
            aria-label={`Go to ${s.label}`}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex h-4 items-center justify-end"
          >
            <span className="pointer-events-none absolute right-full mr-4 whitespace-nowrap rounded-full border border-line bg-surface-2/90 px-2.5 py-1 text-[11px] text-cream opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
              {s.label}
            </span>
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                isActive ? "w-6 bg-champagne" : "w-2 bg-cream/25 group-hover:bg-cream/60"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
