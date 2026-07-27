import { NextResponse } from "next/server";
import { checkCredentials, setSessionCookie, clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { username, password, logout } = await req.json().catch(() => ({}));
  if (logout) {
    const res = NextResponse.json({ ok: true });
    clearSessionCookie(res);
    return res;
  }
  if (!checkCredentials(String(username || ""), String(password || ""))) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res);
  return res;
}
