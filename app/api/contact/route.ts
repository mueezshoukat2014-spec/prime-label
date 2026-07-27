import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendContactAlert } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 200);
    const message = String(body.message || "").trim().slice(0, 4000);
    if (!name || !message) {
      return NextResponse.json(
        { ok: false, error: "Name and message are required." },
        { status: 400 }
      );
    }
    const email = String(body.email || "").trim().slice(0, 200);
    const subject = String(body.subject || "").trim().slice(0, 200);

    const rows = await sql`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (${name}, ${email}, ${subject}, ${message})
      RETURNING id
    `;

    // ---- notify the owner -------------------------------------------------
    // Awaited on purpose. On Vercel the serverless function is frozen as soon
    // as the response is returned, so a fire-and-forget call would be killed
    // before the request to Resend is even sent — the message would save and
    // the alert would silently never arrive.
    //
    // sendContactAlert never throws, so this cannot break the submission.
    const alert = await sendContactAlert({ name, email, subject, message });
    if (!alert.sent) {
      console.error(
        `[contact] alert NOT sent for message ${rows[0]?.id}: ${alert.reason}`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Contact insert failed:", e?.message || e);
    return NextResponse.json(
      { ok: false, error: "Could not send your message. Please try again." },
      { status: 500 }
    );
  }
}
