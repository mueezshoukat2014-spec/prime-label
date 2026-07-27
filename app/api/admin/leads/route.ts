import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await sql`SELECT id, created_at, name, email, phone, company, country, product, quantity, details, artwork_url, artwork_name, status FROM leads ORDER BY created_at DESC`;
  return NextResponse.json({ ok: true, leads: rows });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await sql`DELETE FROM leads WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, status } = await req.json();
  await sql`UPDATE leads SET status = ${status} WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
