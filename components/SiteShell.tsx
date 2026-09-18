"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SiteShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <>
      {/* The cinematic preloader was removed: it kept the entire page hidden
          behind an opaque overlay until window "load" (up to 3s), which
          delayed LCP for every first-time and crawler visit. */}
      <Navbar />
      <main>{children}</main>
      {footer}
    </>
  );
}
