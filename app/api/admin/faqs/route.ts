import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await sql`SELECT id, question, answer, sort FROM faqs ORDER BY sort, id`;
  return NextResponse.json({ ok: true, faqs: rows });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { question, answer } = await req.json();
  const max = await sql`SELECT COALESCE(MAX(sort),0)::int AS m FROM faqs`;
  await sql`INSERT INTO faqs (question, answer, sort) VALUES (${String(question||"")}, ${String(answer||"")}, ${max[0].m + 1})`;
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, question, answer } = await req.json();
  await sql`UPDATE faqs SET question = ${String(question||"")}, answer = ${String(answer||"")} WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await sql`DELETE FROM faqs WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
