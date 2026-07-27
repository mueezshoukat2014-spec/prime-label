import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";

const USER = process.env.ADMIN_USERNAME || "admin";
const PASS = process.env.ADMIN_PASSWORD || "change-me";
const KEY = process.env.ADMIN_SECRET || PASS;
const COOKIE = "pl_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function sign(payload: string) {
  return crypto.createHmac("sha256", KEY).update(payload).digest("hex");
}

function createToken() {
  const payload = `${USER}:${Date.now() + MAX_AGE * 1000}`;
  const b64 = Buffer.from(payload).toString("base64url");
  return `${b64}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return false;
  try {
    const payload = Buffer.from(b64, "base64url").toString();
    const expected = sign(payload);
    if (sig !== expected) return false;
    const [, exp] = payload.split(":");
    return Number(exp) > Date.now();
  } catch {
    return false;
  }
}

export function checkCredentials(user: string, pass: string) {
  return user === USER && pass === PASS;
}

export function setSessionCookie(res: Response) {
  const token = createToken();
  res.headers.append(
    "Set-Cookie",
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`
  );
}

export function clearSessionCookie(res: Response) {
  res.headers.append(
    "Set-Cookie",
    `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

export async function isAuthed(): Promise<boolean> {
  const store = cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

export function adminGuard(): { authed: boolean } {
  return { authed: false };
}
