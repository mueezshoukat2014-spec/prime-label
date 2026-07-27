import { isAuthed } from "@/lib/auth";
import AdminLogin from "@/components/admin/AdminLogin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthed();
  if (!authed) return <AdminLogin />;
  return <>{children}</>;
}
