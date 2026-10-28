import type { Metadata, Viewport } from "next";
import "../globals.css";
import RootDocument from "../_shared/RootDocument";
import { fontVariablesBase } from "../_shared/fonts";
import { cairoAr } from "../_shared/fonts-ar";
import { buildRootMetadata, rootViewport } from "../_shared/metadata";

/*
 * Arabic root layout for the natively written /ar pages: the server HTML always
 * declares lang="ar" dir="rtl" (hreflang="ar" consistency — see SEO notes), and
 * the pages are static + ISR like the English site (lib/revalidate.ts).
 */
export const revalidate = 300;

export const viewport: Viewport = rootViewport;

export function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata();
}

export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="ar" fontClassName={`${fontVariablesBase} ${cairoAr.variable}`}>{children}</RootDocument>;
}
