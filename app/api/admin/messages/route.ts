import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureContactSchema } from "@/lib/ensure-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Contact-form messages.
 *
 * These were being written to `contact_messages` by /api/contact but nothing
 * ever read them back — the admin panel only showed a count on the Overview
 * tab, so every message submitted through the contact form was invisible.
 * This route is the reader.
 */
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    // The status/replied_at columns were added after the table shipped.
    await ensureContactSchema();

    const rows = await sql`
      SELECT id, created_at, name, email, subject, message, status, replied_at
      FROM contact_messages
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ ok: true, messages: rows });
  } catch (e: unknown) {
    console.error("Messages load failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Could not load messages." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const id = Number(body?.id);

    // Scoped to one exact id. Never accept a pattern or a bulk condition.
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid message id." }, { status: 400 });
    }

    const rows = await sql`DELETE FROM contact_messages WHERE id = ${id} RETURNING id`;
    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "Message not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id });
  } catch (e: unknown) {
    console.error("Message delete failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Could not delete the message." }, { status: 500 });
  }
}
