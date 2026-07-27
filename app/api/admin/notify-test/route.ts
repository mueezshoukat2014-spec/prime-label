import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getNotificationEmail, sendQuoteAlert } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends a real alert email to the configured address so the owner can confirm
 * delivery (and check their spam folder) without faking a customer enquiry.
 */
export async function POST() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const to = await getNotificationEmail();
  const result = await sendQuoteAlert();

  if (result.sent) {
    return NextResponse.json({ ok: true, to: result.to });
  }

  const configMissing = result.reason.includes("RESEND_API_KEY");
  return NextResponse.json(
    {
      ok: false,
      to,
      error: configMissing
        ? "Email is not configured yet — RESEND_API_KEY is missing in Vercel."
        : `Could not send: ${result.reason}`,
    },
    { status: configMissing ? 503 : 502 }
  );
}
