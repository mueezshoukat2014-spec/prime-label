import { Cairo } from "next/font/google";

// Imported only by app/ar/layout.tsx, so next/font preloads Cairo on the native
// Arabic pages (where it renders the headline/LCP text) and nowhere else.
export const cairoAr = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});
