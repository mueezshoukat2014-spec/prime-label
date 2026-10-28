import type { Metadata } from "next";
import { isAuthed } from "@/lib/auth";
import { SITE_URL } from "@/lib/seo";
import AdminLogin from "@/components/admin/AdminLogin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Admin must never inherit the public homepage metadata (title, canonical,
// hreflang, OG): keep it minimal and hard-noindex. (This used to be decided in
// the root layout from the request path, which forced every page dynamic.)
export const metadata: Metadata = {
  title: { absolute: "Admin" },
  description: "Admin area.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: `${SITE_URL}/admin` },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthed();
  if (!authed) return <AdminLogin />;
  return <>{children}</>;
}
