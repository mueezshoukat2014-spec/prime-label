import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Generate a short, readable referral code from the name. */
function makeCode(name: string): string {
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 6);
  const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  return `${base || "REF"}-${rand}`;
}

/**
 * Public: create a referral code.
 * Body: { name, phone, website? } — website is a honeypot.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot: bots fill every field.
    if (String(body.website ?? "").trim() !== "") {
      return NextResponse.json({ ok: true, code: "REF-OK" }); // silently discard
    }

    const name = String(body.name ?? "").trim().slice(0, 80);
    const phoneDigits = String(body.phone ?? "").replace(/\D/g, "");
    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
    }
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid WhatsApp number with country code." },
        { status: 400 }
      );
    }
    const phone = `+${phoneDigits}`;

    // One code per phone number — return the existing one on repeat requests.
    const existing = await sql`SELECT code FROM referrals WHERE phone = ${phone} LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ ok: true, code: existing[0].code, existing: true });
    }

    // Insert with a few retries in the (unlikely) event of a code collision.
    for (let i = 0; i < 5; i++) {
      const code = makeCode(name);
      try {
        const rows = await sql`
          INSERT INTO referrals (code, name, phone) VALUES (${code}, ${name}, ${phone})
          ON CONFLICT (code) DO NOTHING RETURNING code
        `;
        if (rows.length > 0) {
          return NextResponse.json({ ok: true, code: rows[0].code });
        }
      } catch {
        // fall through to retry
      }
    }
    return NextResponse.json(
      { ok: false, error: "Could not create your code — please try again." },
      { status: 500 }
    );
  } catch (e) {
    console.error("referral create failed:", e);
    return NextResponse.json(
      { ok: false, error: "Could not create your code — please try again." },
      { status: 500 }
    );
  }
}
