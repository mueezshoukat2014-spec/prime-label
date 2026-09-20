import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ensureSuggestionsTable } from "@/lib/suggestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public suggestion box endpoint.
 *
 * Customers (and any visitor) can propose website changes or leave any
 * suggestion. Entries land in the owner's Admin Dashboard → Suggestions tab.
 * Stores nothing beyond what the visitor chooses to type.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim().slice(0, 200);
    const contact = String(body.contact || "").trim().slice(0, 200);
    const message = String(body.message || "").trim().slice(0, 2000);

    if (message.length < 5) {
      return NextResponse.json(
        { ok: false, error: "Please write a short suggestion first." },
        { status: 400 }
      );
    }

    await ensureSuggestionsTable();
    await sql`INSERT INTO suggestions (name, contact, message)
              VALUES (${name}, ${contact}, ${message})`;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Suggestion insert failed:", e?.message || e);
    return NextResponse.json(
      { ok: false, error: "Could not save your suggestion. Please try again." },
      { status: 500 }
    );
  }
}
