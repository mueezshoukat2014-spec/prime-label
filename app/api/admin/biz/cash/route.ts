import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema } from "@/lib/biz/schema";
import { num, toPkr } from "@/lib/biz/money";
import { cashPosition } from "@/lib/biz/calc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Business cash ≠ profit. This endpoint only ever touches real money
 * movements: opening cash, owner investments and owner withdrawals.
 */
export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const url = new URL(req.url);
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const cash = await cashPosition(from || undefined, to || undefined);
  const owner = await sql`SELECT * FROM biz_owner_txns ORDER BY date DESC, id DESC LIMIT 300`;
  const [openingRow] = await sql`SELECT value FROM biz_settings WHERE key = 'opening_cash_pkr'`;
  return NextResponse.json({ ok: true, cash, owner, opening: parseFloat(String(openingRow?.value ?? "0")) || 0 });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));

  // Set the opening cash balance (settings upsert).
  if (String(b.action) === "opening") {
    const value = String(num(b.value));
    await sql`INSERT INTO biz_settings (key, value) VALUES ('opening_cash_pkr', ${value})
              ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    return NextResponse.json({ ok: true, opening: parseFloat(value) });
  }

  const kind = String(b.kind || "").toUpperCase();
  if (kind !== "INVESTMENT" && kind !== "WITHDRAWAL") {
    return NextResponse.json({ ok: false, error: "kind must be INVESTMENT or WITHDRAWAL" }, { status: 400 });
  }
  const amount = num(b.amount);
  if (amount <= 0) return NextResponse.json({ ok: false, error: "Amount is required." }, { status: 400 });
  const currency = String(b.currency || "PKR");
  const rate = num(b.rate) > 0 ? num(b.rate) : currency === "PKR" ? 1 : toPkr(1, currency);
  const pkr = currency === "PKR" ? amount : amount * rate;
  const [row] = await sql`
    INSERT INTO biz_owner_txns (date, kind, amount, currency, rate, pkr, method, reason, notes)
    VALUES (${String(b.date || new Date().toISOString().slice(0, 10))}, ${kind}, ${amount}, ${currency},
            ${rate}, ${+pkr.toFixed(2)}, ${String(b.method || "Cash")},
            ${String(b.reason || "")}, ${String(b.notes || "")})
    RETURNING *`;
  return NextResponse.json({ ok: true, txn: row });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  await sql`DELETE FROM biz_owner_txns WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
