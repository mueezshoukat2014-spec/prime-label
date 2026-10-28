import type { Metadata, Viewport } from "next";
import "../globals.css";
import RootDocument from "../_shared/RootDocument";
import { fontVariablesEn } from "../_shared/fonts";
import { buildRootMetadata, rootViewport } from "../_shared/metadata";

/*
 * English root layout. Pages are static + ISR: they are served from Vercel's
 * edge cache close to the visitor instead of being rendered in the US on every
 * visit. Content refreshes immediately whenever the admin saves
 * (lib/revalidate.ts), plus a daily background safety-net refresh. /ar has its own
 * root layout (app/ar/layout.tsx) so its HTML ships lang="ar" dir="rtl".
 */
// Daily safety-net refresh only — admin saves revalidate instantly (lib/revalidate.ts),
// so frequent time-based re-renders would just spend the free-plan ISR/function quota.
export const revalidate = 86400;

export const viewport: Viewport = rootViewport;

export function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata();
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en" fontClassName={fontVariablesEn}>{children}</RootDocument>;
}
