import { Fraunces, Manrope, Cairo } from "next/font/google";

// Fraunces: variable serif (weight, optical size, italic for gold accents)
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
});

// Manrope: clean variable sans for body, buttons and labels
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Cairo: polished Arabic support for translated mode, close to the site's clean luxury UI.
// Not preloaded here: English pages only need it if Google-Translate Arabic mode
// kicks in. The native /ar pages preload their own copy (app/_shared/fonts-ar.ts).
export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

export const fontVariablesEn = `${fraunces.variable} ${manrope.variable} ${cairo.variable}`;
export const fontVariablesBase = `${fraunces.variable} ${manrope.variable}`;
