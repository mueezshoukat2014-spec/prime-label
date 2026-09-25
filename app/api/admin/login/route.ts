import { NextResponse } from "next/server";
import { checkCredentials, setSessionCookie, clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Practical brute-force brake: max 5 failed attempts per IP per minute.
 * Serverless instances keep their own map — deliberately simple; the real
 * protection remains a strong ADMIN_PASSWORD (+ HMAC-signed session cookie).
 */
const WINDOW_MS = 60_000;
const MAX_FAILS = 5;
const fails = new Map<string, number[]>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return (fwd.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}
function isLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (fails.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  fails.set(ip, recent);
  return recent.length >= MAX_FAILS;
}
function noteFail(ip: string) {
  const now = Date.now();
  fails.set(ip, [...(fails.get(ip) || []).filter((t) => now - t < WINDOW_MS), now]);
}

export async function POST(req: Request) {
  const { username, password, logout } = await req.json().catch(() => ({}));
  if (logout) {
    const res = NextResponse.json({ ok: true });
    clearSessionCookie(res);
    return res;
  }
  const ip = clientIp(req);
  if (isLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }
  if (!checkCredentials(String(username || ""), String(password || ""))) {
    noteFail(ip);
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }
  fails.delete(ip);
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res);
  return res;
}
