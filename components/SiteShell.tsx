"use client";
import Loader from "@/components/Loader";
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
      <Loader />
      <Navbar />
      <main>{children}</main>
      {footer}
    </>
  );
}
