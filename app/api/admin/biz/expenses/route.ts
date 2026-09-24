import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema } from "@/lib/biz/schema";
import { num, toPkr } from "@/lib/biz/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const url = new URL(req.url);
  const month = url.searchParams.get("month") || "";
  const type = url.searchParams.get("type") || "";
  const rows = await sql`
    SELECT * FROM biz_expenses
    WHERE (${month} = '' OR to_char(date, 'YYYY-MM') = ${month})
      AND (${type} = '' OR expense_type = ${type})
    ORDER BY date DESC, id DESC LIMIT 500`;
  return NextResponse.json({ ok: true, expenses: rows });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const amount = num(b.amount);
  if (amount <= 0) return NextResponse.json({ ok: false, error: "Amount is required." }, { status: 400 });
  const currency = String(b.currency || "PKR");
  const rate = num(b.rate) > 0 ? num(b.rate) : currency === "PKR" ? 1 : toPkr(1, currency);
  const pkr = currency === "PKR" ? amount : amount * rate;
  const [row] = await sql`
    INSERT INTO biz_expenses
      (date, expense_type, order_id, category, subcategory, description, amount, currency, rate, pkr,
       method, vendor, platform, campaign, notes)
    VALUES
      (${String(b.date || new Date().toISOString().slice(0, 10))},
       ${String(b.expense_type || "GENERAL BUSINESS EXPENSE")},
       ${b.order_id ? Number(b.order_id) : null},
       ${String(b.category || "Other")}, ${String(b.subcategory || "")}, ${String(b.description || "")},
       ${amount}, ${currency}, ${rate}, ${+pkr.toFixed(2)},
       ${String(b.method || "Cash")}, ${String(b.vendor || "")},
       ${String(b.platform || "")}, ${String(b.campaign || "")}, ${String(b.notes || "")})
    RETURNING *`;
  return NextResponse.json({ ok: true, expense: row });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  const [cur] = await sql`SELECT * FROM biz_expenses WHERE id = ${id}`;
  if (!cur) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const amount = b.amount !== undefined ? num(b.amount) : num(cur.amount);
  const currency = String(b.currency ?? cur.currency);
  const rate = b.rate !== undefined ? num(b.rate) : num(cur.rate);
  const pkr = currency === "PKR" ? amount : amount * (rate > 0 ? rate : 1);

  const [row] = await sql`
    UPDATE biz_expenses SET
      date = ${String(b.date ?? cur.date ?? "").slice(0, 10) || cur.date},
      expense_type = ${String(b.expense_type ?? cur.expense_type)},
      order_id = ${b.order_id !== undefined ? (b.order_id ? Number(b.order_id) : null) : cur.order_id},
      category = ${String(b.category ?? cur.category)},
      subcategory = ${String(b.subcategory ?? cur.subcategory)},
      description = ${String(b.description ?? cur.description)},
      amount = ${amount}, currency = ${currency}, rate = ${rate}, pkr = ${+pkr.toFixed(2)},
      method = ${String(b.method ?? cur.method)}, vendor = ${String(b.vendor ?? cur.vendor)},
      platform = ${String(b.platform ?? cur.platform)}, campaign = ${String(b.campaign ?? cur.campaign)},
      notes = ${String(b.notes ?? cur.notes)},
      void = ${b.void !== undefined ? Boolean(b.void) : Boolean(cur.void)}
    WHERE id = ${id} RETURNING *`;
  return NextResponse.json({ ok: true, expense: row });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  await sql`DELETE FROM biz_expenses WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
