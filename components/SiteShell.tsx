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
      <Navbar />
      <main>{children}</main>
      {footer}
    </>
  );
}
