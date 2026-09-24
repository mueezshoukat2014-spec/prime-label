import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema } from "@/lib/biz/schema";
import { refreshPaymentStatus } from "@/lib/biz/calc";
import { recordPayment } from "@/lib/biz/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const orderId = new URL(req.url).searchParams.get("order_id");
  const rows = orderId
    ? await sql`SELECT * FROM biz_payments WHERE order_id = ${Number(orderId)} AND void = FALSE ORDER BY date, id`
    : await sql`SELECT p.*, o.order_ref, o.name AS customer_name FROM biz_payments p
                LEFT JOIN orders o ON o.id = p.order_id
                WHERE p.void = FALSE ORDER BY p.date DESC, p.id DESC LIMIT 300`;
  return NextResponse.json({ ok: true, payments: rows });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  if (!b.order_id && !b.customer_id) {
    return NextResponse.json({ ok: false, error: "Link the payment to an order or customer." }, { status: 400 });
  }
  const row = await recordPayment(b);
  return NextResponse.json({ ok: true, payment: row });
}

/** Void a payment (never hard-delete financial records). */
export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  const [p] = await sql`UPDATE biz_payments SET void = TRUE WHERE id = ${id} RETURNING order_id`;
  if (p?.order_id) await refreshPaymentStatus(p.order_id);
  return NextResponse.json({ ok: true });
}
