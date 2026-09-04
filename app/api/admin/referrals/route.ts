import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await sql`
    SELECT id, code, name, phone, uses, created_at
    FROM referrals ORDER BY created_at DESC LIMIT 500
  `;
  return NextResponse.json({ ok: true, referrals: rows });
}

/** Increment/decrement a referral's use count (owner marks a redeemed order). */
export async function PUT(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, delta } = await req.json();
  const d = Number(delta) === -1 ? -1 : 1;
  await sql`UPDATE referrals SET uses = GREATEST(0, uses + ${d}) WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await sql`DELETE FROM referrals WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
