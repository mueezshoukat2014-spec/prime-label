"use client";
import Link from "next/link";
import { Magnetic } from "@/components/anim";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/10 blur-[140px]" />
      <span className="display relative gradient-text text-[34vw] leading-none sm:text-[20rem]">404</span>
      <p className="relative mt-2 max-w-sm text-[15px] text-cream-muted">
        This page seems to have slipped off the label. Let us get you back to the
        good stuff.
      </p>
      <Link href="/" className="relative mt-8">
        <Magnetic strength={0.4}>
          <span className="btn-primary">Back to home</span>
        </Magnetic>
      </Link>
    </main>
  );
}
