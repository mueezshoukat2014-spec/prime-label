"use client";
import { useEffect, useState, type ReactNode } from "react";
import { waProductLink } from "@/lib/whatsapp";

/**
 * WhatsApp link for statically rendered (edge-cached) pages: ships the generic
 * chat link in the HTML and switches to the product-specific message when the
 * page was opened with ?product=… (e.g. /quote?product=Woven%20Labels).
 */
export default function WaLinkFromQuery({
  fallbackHref,
  children,
  className,
  number,
  productText,
}: {
  fallbackHref: string;
  children: ReactNode;
  className?: string;
  /** With productText: build wa.me/<number>?text=… instead of the default English message. */
  number?: string;
  /** Message template containing "{product}", e.g. an Arabic greeting. */
  productText?: string;
}) {
  const [href, setHref] = useState(fallbackHref);
  useEffect(() => {
    const p = (new URLSearchParams(window.location.search).get("product") || "").trim();
    if (!p) return;
    setHref(
      number && productText
        ? `https://wa.me/${number}?text=${encodeURIComponent(productText.replace("{product}", p))}`
        : waProductLink(p)
    );
  }, [number, productText]);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
