"use client";
import Loader from "@/components/Loader";
import Cursor from "@/components/Cursor";
import ScrollProgress from "@/components/ScrollProgress";
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
      <Cursor />
      <ScrollProgress />
      <Navbar />
      <main>{children}</main>
      {footer}
    </>
  );
}
