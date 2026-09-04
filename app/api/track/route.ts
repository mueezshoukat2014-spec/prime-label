import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public order-status lookup by order code (e.g. PL-2493).
 * Returns only non-sensitive fields — no phone, no notes.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = String(searchParams.get("code") ?? "")
    .trim()
    .toUpperCase()
    .slice(0, 24);

  if (!/^[A-Z0-9-]{4,24}$/.test(code)) {
    return NextResponse.json({ ok: false, error: "Invalid order code." }, { status: 400 });
  }

  const rows = await sql`
    SELECT code, customer_name, product, status, tracking_number, tracking_url, eta, updated_at
    FROM orders WHERE UPPER(code) = ${code} LIMIT 1
  `;
  if (rows.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No order found with that code. Check the code from your confirmation message, or ask us on WhatsApp." },
      { status: 404 }
    );
  }
  const o = rows[0];
  return NextResponse.json({
    ok: true,
    order: {
      code: o.code,
      // first name only — page is public to anyone with the code
      name: String(o.customer_name || "").split(/\s+/)[0],
      product: o.product,
      status: o.status,
      trackingNumber: o.tracking_number,
      trackingUrl: o.tracking_url,
      eta: o.eta,
      updatedAt: o.updated_at,
    },
  });
}
