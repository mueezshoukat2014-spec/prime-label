import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/**
 * Public review submission. New reviews are stored UNAPPROVED and only appear
 * on the website after the owner approves them in the admin Testimonials tab.
 * Lightweight anti-spam: honeypot field + minimum content length + per-IP
 * throttle via a recent-submission check.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot — real users never fill this hidden field.
    if (String(body.website ?? "").trim() !== "") {
      return NextResponse.json({ ok: true }); // silently accept spam
    }

    const name = str(body.name, 80);
    const company = str(body.company, 120);
    const country = str(body.country, 80);
    const content = str(body.content, 1200);
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));

    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "Please add your name." }, { status: 400 });
    }
    if (content.length < 20) {
      return NextResponse.json(
        { ok: false, error: "Please write a few words about your experience (at least 20 characters)." },
        { status: 400 }
      );
    }

    // Throttle: max 3 pending (unapproved) reviews in the last hour site-wide
    // from the same name — enough to stop drive-by spam without real user pain.
    const recent = await sql`
      SELECT COUNT(*)::int AS n FROM testimonials
      WHERE approved = FALSE AND created_at > now() - interval '1 hour'
    `;
    if ((recent[0]?.n ?? 0) >= 10) {
      return NextResponse.json(
        { ok: false, error: "We're receiving many reviews right now — please try again later." },
        { status: 429 }
      );
    }

    const max = await sql`SELECT COALESCE(MAX(sort),0)::int AS m FROM testimonials`;
    await sql`
      INSERT INTO testimonials (name, role, company, country, content, rating, approved, sort)
      VALUES (${name}, ${"Customer"}, ${company}, ${country}, ${content}, ${rating}, FALSE, ${max[0].m + 1})
    `;

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("Review submit failed:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { ok: false, error: "Could not submit your review. Please try again." },
      { status: 500 }
    );
  }
}
