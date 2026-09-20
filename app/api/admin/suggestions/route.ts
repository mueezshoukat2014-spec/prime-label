import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureSuggestionsTable, listSuggestions } from "@/lib/suggestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** List all visitor suggestions (newest first). */
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const suggestions = await listSuggestions();
    return NextResponse.json({ ok: true, suggestions });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

/** Toggle status between "new" and "done". */
export async function PATCH(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);
    const status = body.status === "done" ? "done" : "new";
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
    }
    await ensureSuggestionsTable();
    await sql`UPDATE suggestions SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

/** Delete a suggestion. */
export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
    }
    await ensureSuggestionsTable();
    await sql`DELETE FROM suggestions WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
