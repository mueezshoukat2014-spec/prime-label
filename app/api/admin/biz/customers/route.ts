import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema } from "@/lib/biz/schema";
import { num } from "@/lib/biz/money";
import { computeOrderTotals } from "@/lib/biz/calc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIELDS = [
  "full_name", "brand_name", "country", "city", "whatsapp", "email",
  "instagram", "address", "customer_type", "notes", "lead_id", "archived",
] as const;

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const url = new URL(req.url);

  // ---- customer ledger (Phase 2): full history + lifetime totals ----------
  const id = url.searchParams.get("id");
  if (id) {
    const [customer] = await sql`SELECT * FROM biz_customers WHERE id = ${Number(id)}`;
    if (!customer) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const [orders, payments, quotations] = await Promise.all([
      sql`SELECT * FROM orders WHERE customer_id = ${customer.id} AND COALESCE(archived, FALSE) = FALSE ORDER BY id DESC`,
      sql`SELECT * FROM biz_payments WHERE customer_id = ${customer.id} ORDER BY date DESC, id DESC LIMIT 200`,
      sql`SELECT * FROM biz_quotations WHERE customer_id = ${customer.id} ORDER BY id DESC LIMIT 100`,
    ]);
    let billedPkr = 0, receivedPkr = 0, grossPkr = 0, outstandingPkr = 0;
    const orderList = [];
    for (const o of orders) {
      const [costs, pays] = await Promise.all([
        sql`SELECT * FROM biz_order_costs WHERE order_id = ${o.id}`,
        sql`SELECT * FROM biz_payments WHERE order_id = ${o.id} AND void = FALSE`,
      ]);
      const t = computeOrderTotals(o, costs, pays);
      billedPkr += t.billedPkr; receivedPkr += t.receivedPkr; grossPkr += t.grossPkr;
      const rate = num(o.rate) > 0 ? num(o.rate) : 1;
      outstandingPkr += t.outstandingCcy * rate;
      orderList.push({ ...o, totals: t });
    }
    return NextResponse.json({
      ok: true, customer, orders: orderList, payments, quotations,
      summary: {
        orderCount: orderList.length,
        lifetimeBilledPkr: +billedPkr.toFixed(2),
        lifetimeReceivedPkr: +receivedPkr.toFixed(2),
        lifetimeGrossPkr: +grossPkr.toFixed(2),
        outstandingPkr: +outstandingPkr.toFixed(2),
      },
    });
  }

  const q = url.searchParams.get("q")?.trim() || "";
  const rows = q
    ? await sql`SELECT * FROM biz_customers
        WHERE archived = FALSE
          AND (full_name ILIKE ${"%" + q + "%"} OR brand_name ILIKE ${"%" + q + "%"}
               OR whatsapp LIKE ${"%" + q + "%"} OR email ILIKE ${"%" + q + "%"})
        ORDER BY id DESC`
    : await sql`SELECT * FROM biz_customers WHERE archived = FALSE ORDER BY id DESC`;
  return NextResponse.json({ ok: true, customers: rows });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const name = String(b.full_name || "").trim();
  if (!name) return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  const [row] = await sql`
    INSERT INTO biz_customers
      (full_name, brand_name, country, city, whatsapp, email, instagram, address, customer_type, notes, lead_id)
    VALUES (${name}, ${String(b.brand_name || "")}, ${String(b.country || "")}, ${String(b.city || "")},
            ${String(b.whatsapp || "")}, ${String(b.email || "")}, ${String(b.instagram || "")},
            ${String(b.address || "")}, ${String(b.customer_type || "New Brand")},
            ${String(b.notes || "")}, ${b.lead_id ? Number(b.lead_id) : null})
    RETURNING *`;
  return NextResponse.json({ ok: true, customer: row });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  const [cur] = await sql`SELECT * FROM biz_customers WHERE id = ${id}`;
  if (!cur) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const m = { ...cur };
  for (const f of FIELDS) {
    if (f in b) {
      m[f] = f === "lead_id" ? (b[f] ? Number(b[f]) : null) : f === "archived" ? Boolean(b[f]) : String(b[f] ?? "");
    }
  }

  const [row] = await sql`
    UPDATE biz_customers SET
      full_name = ${m.full_name}, brand_name = ${m.brand_name}, country = ${m.country},
      city = ${m.city}, whatsapp = ${m.whatsapp}, email = ${m.email}, instagram = ${m.instagram},
      address = ${m.address}, customer_type = ${m.customer_type}, notes = ${m.notes},
      lead_id = ${m.lead_id}, archived = ${m.archived}, updated_at = now()
    WHERE id = ${id} RETURNING *`;
  return NextResponse.json({ ok: true, customer: row ?? null });
}
