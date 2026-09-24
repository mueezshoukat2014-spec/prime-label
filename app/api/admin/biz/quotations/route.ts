import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema, nextNumber } from "@/lib/biz/schema";
import { num, toPkr } from "@/lib/biz/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function totalsOf(currency: string, rate: number, subtotal: number, discount: number, delivery: number) {
  const grand = subtotal - discount + delivery;
  const grandPkr = currency === "PKR" ? grand : grand * rate;
  return { grand: +grand.toFixed(2), grandPkr: +grandPkr.toFixed(2) };
}

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const [quote] = await sql`SELECT * FROM biz_quotations WHERE id = ${Number(id)}`;
    if (!quote) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const items = await sql`SELECT * FROM biz_quotation_items WHERE quotation_id = ${quote.id} ORDER BY id`;
    const [customer] = quote.customer_id
      ? await sql`SELECT * FROM biz_customers WHERE id = ${quote.customer_id}`
      : [null];
    return NextResponse.json({ ok: true, quote, items, customer });
  }

  const rows = await sql`
    SELECT q.*, c.full_name AS cust_name, c.brand_name, c.whatsapp
    FROM biz_quotations q LEFT JOIN biz_customers c ON c.id = q.customer_id
    ORDER BY q.id DESC LIMIT 300`;
  return NextResponse.json({ ok: true, quotes: rows });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));

  const items = Array.isArray(b.items) ? b.items.filter((i: any) => String(i?.product || "").trim()) : [];
  const subtotal = items.reduce(
    (s: number, i: any) => s + (num(i.subtotal) || num(i.quantity) * num(i.unit_price)), 0);

  const currency = String(b.currency || "PKR");
  const rate = num(b.rate) > 0 ? num(b.rate) : currency === "PKR" ? 1 : toPkr(1, currency);
  const discount = num(b.discount);
  const delivery = num(b.delivery_charge);
  const { grand, grandPkr } = totalsOf(currency, rate, subtotal, discount, delivery);
  const qNumber = await nextNumber("quote");

  const [quote] = await sql`
    INSERT INTO biz_quotations
      (q_number, customer_id, country, currency, rate, discount, delivery_charge,
       grand_total, grand_total_pkr, production_time, delivery_time, payment_terms,
       validity_days, notes, status, follow_up_at, follow_up_notes)
    VALUES
      (${qNumber}, ${b.customer_id ? Number(b.customer_id) : null}, ${String(b.country || "")},
       ${currency}, ${rate}, ${discount}, ${delivery}, ${grand}, ${grandPkr},
       ${String(b.production_time || "")}, ${String(b.delivery_time || "")},
       ${String(b.payment_terms || "50% Advance / 50% Before Delivery")},
       ${Number(b.validity_days) || 15}, ${String(b.notes || "")},
       ${String(b.status || "DRAFT")}, ${b.follow_up_at ? String(b.follow_up_at).slice(0, 10) : null},
       ${String(b.follow_up_notes || "")})
    RETURNING *`;

  for (const i of items) {
    const qty = num(i.quantity); const price = num(i.unit_price);
    await sql`INSERT INTO biz_quotation_items (quotation_id, product, quantity, unit_price, subtotal)
              VALUES (${quote.id}, ${String(i.product)}, ${qty}, ${price}, ${num(i.subtotal) || qty * price})`;
  }
  return NextResponse.json({ ok: true, quote, q_number: qNumber });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  const [cur] = await sql`SELECT * FROM biz_quotations WHERE id = ${id}`;
  if (!cur) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const currency = String(b.currency ?? cur.currency ?? "PKR");
  const rate = b.rate !== undefined ? num(b.rate) : num(cur.rate);
  const discount = b.discount !== undefined ? num(b.discount) : num(cur.discount);
  const delivery = b.delivery_charge !== undefined ? num(b.delivery_charge) : num(cur.delivery_charge);

  let subtotal = num(cur.grand_total) + num(cur.discount) - num(cur.delivery_charge);
  if (Array.isArray(b.items)) {
    await sql`DELETE FROM biz_quotation_items WHERE quotation_id = ${id}`;
    subtotal = 0;
    for (const i of b.items) {
      if (!String(i?.product || "").trim()) continue;
      const qty = num(i.quantity); const price = num(i.unit_price);
      const sub = num(i.subtotal) || qty * price;
      subtotal += sub;
      await sql`INSERT INTO biz_quotation_items (quotation_id, product, quantity, unit_price, subtotal)
                VALUES (${id}, ${String(i.product)}, ${qty}, ${price}, ${sub})`;
    }
  }
  const { grand, grandPkr } = totalsOf(currency, rate, subtotal, discount, delivery);

  await sql`
    UPDATE biz_quotations SET
      customer_id = ${b.customer_id !== undefined ? (b.customer_id ? Number(b.customer_id) : null) : cur.customer_id},
      country = ${String(b.country ?? cur.country ?? "")},
      currency = ${currency}, rate = ${rate}, discount = ${discount}, delivery_charge = ${delivery},
      grand_total = ${grand}, grand_total_pkr = ${grandPkr},
      production_time = ${String(b.production_time ?? cur.production_time ?? "")},
      delivery_time = ${String(b.delivery_time ?? cur.delivery_time ?? "")},
      payment_terms = ${String(b.payment_terms ?? cur.payment_terms ?? "")},
      validity_days = ${b.validity_days !== undefined ? Number(b.validity_days) || 0 : Number(cur.validity_days) || 15},
      notes = ${String(b.notes ?? cur.notes ?? "")},
      status = ${String(b.status ?? cur.status ?? "DRAFT")},
      follow_up_at = ${b.follow_up_at !== undefined ? (b.follow_up_at ? String(b.follow_up_at).slice(0, 10) : null) : cur.follow_up_at},
      follow_up_notes = ${String(b.follow_up_notes ?? cur.follow_up_notes ?? "")},
      updated_at = now()
    WHERE id = ${id}`;

  // ---- convert quotation → confirmed order (one click) --------------------
  if (b.convert === true) {
    const [customer] = cur.customer_id
      ? await sql`SELECT * FROM biz_customers WHERE id = ${cur.customer_id}`
      : [null];
    const name = String(b.name || customer?.brand_name || customer?.full_name || "Quotation customer");
    const orderRef = await nextNumber("order");
    const [order] = await sql`
      INSERT INTO orders
        (order_ref, name, phone, country, product, quantity, details,
         customer_id, currency, sale_amount, discount, customer_delivery_charge,
         rate, payment_status, status, total)
      VALUES
        (${orderRef}, ${name}, ${String(customer?.whatsapp || "")}, ${String(cur.country || customer?.country || "")},
         ${String(b.product || "Per quotation " + cur.q_number)}, ${String(b.quantity || "")},
         ${"Converted from " + cur.q_number}, ${cur.customer_id}, ${currency}, ${subtotal}, ${discount},
         ${delivery}, ${rate}, 'UNPAID', 'CONFIRMED', ${String(subtotal)})
      RETURNING *`;
    await sql`UPDATE biz_quotations SET converted_order_id = ${order.id}, status = 'CONVERTED', updated_at = now() WHERE id = ${id}`;
    const [full] = await sql`SELECT * FROM biz_quotations WHERE id = ${id}`;
    return NextResponse.json({ ok: true, quote: full, order, order_ref: orderRef });
  }

  const [quote] = await sql`SELECT * FROM biz_quotations WHERE id = ${id}`;
  return NextResponse.json({ ok: true, quote });
}
