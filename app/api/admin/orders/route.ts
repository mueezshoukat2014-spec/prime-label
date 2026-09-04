import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORDER_STATUSES = [
  "Proof approved",
  "In production",
  "Quality check",
  "Packed",
  "Shipped",
  "Delivered",
] as const;

function s(v: unknown, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await sql`
    SELECT id, code, customer_name, phone, product, status, tracking_number, tracking_url, eta, notes, created_at, updated_at
    FROM orders ORDER BY updated_at DESC LIMIT 500
  `;
  return NextResponse.json({ ok: true, orders: rows, statuses: ORDER_STATUSES });
}

/** Create an order. Auto-generates a PL-XXXX code when none given. */
export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const b = await req.json().catch(() => ({}));
  const customerName = s(b.customer_name, 120);
  if (customerName.length < 2) {
    return NextResponse.json({ ok: false, error: "Customer name required." }, { status: 400 });
  }
  let code = s(b.code, 24).toUpperCase().replace(/[^A-Z0-9-]/g, "");

  for (let i = 0; i < 5; i++) {
    if (!code) code = `PL-${Math.floor(1000 + Math.random() * 9000)}`;
    const rows = await sql`
      INSERT INTO orders (code, customer_name, phone, product, status, tracking_number, tracking_url, eta, notes)
      VALUES (${code}, ${customerName}, ${s(b.phone, 40)}, ${s(b.product, 200)},
              ${s(b.status, 60) || "Proof approved"}, ${s(b.tracking_number, 120)},
              ${s(b.tracking_url, 500)}, ${s(b.eta, 120)}, ${s(b.notes, 2000)})
      ON CONFLICT (code) DO NOTHING
      RETURNING id, code
    `;
    if (rows.length > 0) return NextResponse.json({ ok: true, order: rows[0] });
    code = ""; // collision — regenerate
  }
  return NextResponse.json({ ok: false, error: "Code already exists — try another." }, { status: 409 });
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  await sql`
    UPDATE orders SET
      customer_name = ${s(b.customer_name, 120)},
      phone = ${s(b.phone, 40)},
      product = ${s(b.product, 200)},
      status = ${s(b.status, 60) || "Proof approved"},
      tracking_number = ${s(b.tracking_number, 120)},
      tracking_url = ${s(b.tracking_url, 500)},
      eta = ${s(b.eta, 120)},
      notes = ${s(b.notes, 2000)},
      updated_at = now()
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await sql`DELETE FROM orders WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
