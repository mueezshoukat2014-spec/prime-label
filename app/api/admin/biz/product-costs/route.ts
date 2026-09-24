import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema } from "@/lib/biz/schema";
import { num } from "@/lib/biz/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const rows = await sql`SELECT * FROM product_costs ORDER BY product_name`;
  return NextResponse.json({ ok: true, products: rows });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const name = String(b.product_name || "").trim();
  if (!name) return NextResponse.json({ ok: false, error: "Product name required." }, { status: 400 });
  const tiers = normaliseTiers(b.tiers);
  const [row] = await sql`
    INSERT INTO product_costs (product_name, category, active, notes, tiers)
    VALUES (${name}, ${String(b.category || "")}, ${b.active !== false}, ${String(b.notes || "")}, ${JSON.stringify(tiers)}::jsonb)
    RETURNING *`;
  return NextResponse.json({ ok: true, product: row });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  const [cur] = await sql`SELECT * FROM product_costs WHERE id = ${id}`;
  if (!cur) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const tiers = b.tiers !== undefined ? normaliseTiers(b.tiers) : (cur.tiers ?? []);
  const [row] = await sql`
    UPDATE product_costs SET
      product_name = ${String(b.product_name ?? cur.product_name).trim() || cur.product_name},
      category = ${String(b.category ?? cur.category)},
      active = ${b.active !== undefined ? Boolean(b.active) : cur.active},
      notes = ${String(b.notes ?? cur.notes)},
      tiers = ${JSON.stringify(tiers)}::jsonb,
      updated_at = now()
    WHERE id = ${id} RETURNING *`;
  return NextResponse.json({ ok: true, product: row });
}

/** tiers: [{qty, currency, amount, rate, pkr}] — pkr snapshot per tier. */
function normaliseTiers(
  raw: unknown
): Array<{ qty: number; currency: string; amount: number; rate: number; pkr: number }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t: any) => ({
      qty: num(t?.qty),
      currency: String(t?.currency || "PKR"),
      amount: num(t?.amount),
      rate: num(t?.rate) || 1,
      pkr: num(t?.pkr) || num(t?.amount) * (num(t?.rate) || 1),
    }))
    .filter((t) => t.qty > 0);
}
