"use client";
import Image from "next/image";
import { Marquee, Reveal } from "@/components/anim";


function VerifiedBadgeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="text-champagne">
      <path
        d="M12 2.75l2.16 1.73 2.76-.18 1.02 2.57 2.34 1.47-.68 2.68.68 2.68-2.34 1.47-1.02 2.57-2.76-.18L12 21.25l-2.16-1.73-2.76.18-1.02-2.57-2.34-1.47.68-2.68-.68-2.68 2.34-1.47L7.08 4.3l2.76.18L12 2.75z"
        fill="currentColor"
      />
      <path d="M8.7 12.25l2.05 2.05 4.75-5.05" stroke="#08080A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type BrandLogo = { name: string; logoUrl?: string };

function LogoItem({ logo }: { logo: BrandLogo }) {
  return (
    <div className="group flex shrink-0 items-center px-6 md:px-9" title={logo.name}>
      {logo.logoUrl ? (
        <Image
          src={logo.logoUrl}
          alt={logo.name}
          width={150}
          height={48}
          className="h-7 w-auto opacity-55 brightness-150 grayscale transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-100 group-hover:brightness-100 group-hover:grayscale-0 sm:h-8"
        />
      ) : (
        <span className="select-none whitespace-nowrap font-body text-[15px] uppercase tracking-[0.22em] text-cream/40 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-cream sm:text-base">
          {logo.name}
        </span>
      )}
    </div>
  );
}

export default function LogoStrip({
  logos,
  title = "Trusted by clothing brands worldwide",
}: {
  logos: BrandLogo[];
  title?: string;
}) {
  const list = (logos || []).filter((l) => l && (l.name || l.logoUrl));

  return (
    <section className="border-y border-line py-12 sm:py-14">
      <div className="container-lux">
        <Reveal>
          <div className="mb-9 flex justify-center">
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne/60" />
              <span>{title}</span>
              <VerifiedBadgeIcon />
              <span className="h-px w-8 bg-champagne/60" />
            </span>
          </div>
        </Reveal>

        {list.length === 0 ? (
          <p className="text-center text-[13px] text-cream-dim">
            Your client and brand logos will appear here.
          </p>
        ) : list.length > 6 ? (
          <Marquee speed={34} className="mask-fade-x">
            {list.map((logo, i) => (
              <LogoItem key={`${logo.name}-${i}`} logo={logo} />
            ))}
          </Marquee>
        ) : (
          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-6">
              {list.map((logo, i) => (
                <LogoItem key={`${logo.name}-${i}`} logo={logo} />
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
