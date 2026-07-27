import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureContactSchema } from "@/lib/ensure-schema";
import { sendAdminReply } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Sending can take a moment on a cold start.
export const maxDuration = 30;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * Send a reply to a contact message, from inside the dashboard.
 *
 * On success the message is marked "replied" so the inbox shows what has
 * already been handled.
 */
export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    const id = Number(body?.id);
    const to = String(body?.to ?? "").trim().slice(0, 200);
    const subject = String(body?.subject ?? "").trim().slice(0, 200);
    const replyMessage = String(body?.replyMessage ?? "").trim().slice(0, 8000);

    if (!isEmail(to)) {
      return NextResponse.json(
        { ok: false, error: "That customer has no valid email address to reply to." },
        { status: 400 }
      );
    }
    if (!subject) {
      return NextResponse.json({ ok: false, error: "Please add a subject." }, { status: 400 });
    }
    if (!replyMessage) {
      return NextResponse.json(
        { ok: false, error: "Please write a message before sending." },
        { status: 400 }
      );
    }

    // Pull the original so the reply can quote it for context.
    let original: { name?: string; message?: string } = {};
    if (Number.isInteger(id) && id > 0) {
      try {
        const rows = await sql`
          SELECT name, message FROM contact_messages WHERE id = ${id} LIMIT 1
        `;
        if (rows.length) original = rows[0];
      } catch {
        /* context is a nice-to-have — never block the send */
      }
    }

    const result = await sendAdminReply({
      to,
      subject,
      replyMessage,
      customerName: String(original.name ?? "").trim(),
      originalMessage: String(original.message ?? "").trim(),
    });

    if (!result.sent) {
      console.error(`[reply-email] send failed for message ${id}: ${result.reason}`);
      return NextResponse.json(
        { ok: false, error: `Could not send: ${result.reason}` },
        { status: 502 }
      );
    }

    // Mark as replied. The email is already gone, so a bookkeeping failure
    // must not be reported as a send failure.
    let statusSaved = false;
    if (Number.isInteger(id) && id > 0) {
      try {
        await ensureContactSchema();
        await sql`
          UPDATE contact_messages
          SET status = 'replied', replied_at = now()
          WHERE id = ${id}
        `;
        statusSaved = true;
      } catch (e: unknown) {
        console.error(
          `[reply-email] sent, but could not mark ${id} replied:`,
          e instanceof Error ? e.message : e
        );
      }
    }

    return NextResponse.json({ ok: true, id: result.id, to, statusSaved });
  } catch (e: unknown) {
    console.error("Reply send failed:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { ok: false, error: "Could not send the reply. Please try again." },
      { status: 500 }
    );
  }
}
