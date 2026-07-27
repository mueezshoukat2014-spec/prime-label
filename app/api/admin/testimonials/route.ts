import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await sql`SELECT id, name, role, company, country, content, rating, approved, sort FROM testimonials ORDER BY sort, id`;
  return NextResponse.json({ ok: true, testimonials: rows });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { name, role, company, country, content, rating } = await req.json();
  const max = await sql`SELECT COALESCE(MAX(sort),0)::int AS m FROM testimonials`;
  await sql`INSERT INTO testimonials (name, role, company, country, content, rating, sort) VALUES (${String(name||"")}, ${String(role||"")}, ${String(company||"")}, ${String(country||"")}, ${String(content||"")}, ${Number(rating||5)}, ${max[0].m + 1})`;
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, name, role, company, country, content, rating, approved } = await req.json();
  await sql`UPDATE testimonials SET name=${String(name||"")}, role=${String(role||"")}, company=${String(company||"")}, country=${String(country||"")}, content=${String(content||"")}, rating=${Number(rating||5)}, approved=${Boolean(approved)} WHERE id=${Number(id)}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await sql`DELETE FROM testimonials WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
