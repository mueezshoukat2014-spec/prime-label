import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema, nextNumber } from "@/lib/biz/schema";
import { num, toPkr } from "@/lib/biz/money";
import { computeOrderTotals, refreshPaymentStatus, suggestCostPkr } from "@/lib/biz/calc";
import { recordPayment } from "@/lib/biz/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const q = url.searchParams.get("q")?.trim() || "";

  if (id) {
    const [o] = await sql`SELECT * FROM orders WHERE id = ${Number(id)}`;
    if (!o) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const [costs, payments, items] = await Promise.all([
      sql`SELECT * FROM biz_order_costs WHERE order_id = ${o.id} ORDER BY date, id`,
      sql`SELECT * FROM biz_payments WHERE order_id = ${o.id} ORDER BY date, id`,
      sql`SELECT * FROM biz_order_items WHERE order_id = ${o.id} ORDER BY id`,
    ]);
    return NextResponse.json({ ok: true, order: o, costs, payments, items, totals: computeOrderTotals(o, costs, payments) });
  }

  const rows = q
    ? await sql`SELECT o.*, c.brand_name, c.full_name AS cust_name FROM orders o
        LEFT JOIN biz_customers c ON c.id = o.customer_id
        WHERE COALESCE(o.archived, FALSE) = FALSE
          AND (o.name ILIKE ${"%" + q + "%"} OR o.order_ref ILIKE ${"%" + q + "%"}
               OR o.product ILIKE ${"%" + q + "%"} OR c.brand_name ILIKE ${"%" + q + "%"} OR c.full_name ILIKE ${"%" + q + "%"})
        ORDER BY o.id DESC LIMIT 300`
    : await sql`SELECT o.*, c.brand_name, c.full_name AS cust_name FROM orders o
        LEFT JOIN biz_customers c ON c.id = o.customer_id
        WHERE COALESCE(o.archived, FALSE) = FALSE
        ORDER BY o.id DESC LIMIT 300`;

  const out = [];
  for (const o of rows) {
    const [costs, payments] = await Promise.all([
      sql`SELECT * FROM biz_order_costs WHERE order_id = ${o.id}`,
      sql`SELECT * FROM biz_payments WHERE order_id = ${o.id} AND void = FALSE`,
    ]);
    out.push({ ...o, totals: computeOrderTotals(o, costs, payments) });
  }
  return NextResponse.json({ ok: true, orders: out });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));

  const name = String(b.name || "").trim();
  const product = String(b.product || "").trim();
  if (!name || !product) {
    return NextResponse.json({ ok: false, error: "Customer name and product are required." }, { status: 400 });
  }

  const currency = String(b.currency || "PKR");
  const rate = num(b.rate) > 0 ? num(b.rate) : currency === "PKR" ? 1 : 0;
  const deliveryCurrency = String(b.delivery_currency || currency);
  const actualDelivery = num(b.actual_delivery_cost);
  const actualDeliveryPkr =
    deliveryCurrency === "PKR" ? actualDelivery : actualDelivery * (num(b.delivery_rate) > 0 ? num(b.delivery_rate) : toPkr(1, deliveryCurrency));

  const orderRef = String(b.order_ref || "").trim() || (await nextNumber("order"));

  const [o] = await sql`
    INSERT INTO orders
      (order_ref, name, email, phone, company, country, product, quantity, details,
       customer_id, currency, sale_amount, discount, customer_delivery_charge,
       actual_delivery_cost, actual_delivery_pkr, delivery_currency, delivery_mode,
       rate, payment_status, market, status, total)
    VALUES
      (${orderRef}, ${name}, ${String(b.email || "")}, ${String(b.phone || "")}, ${String(b.company || "")},
       ${String(b.country || "")}, ${product}, ${String(b.quantity ?? "")}, ${String(b.details || "")},
       ${b.customer_id ? Number(b.customer_id) : null}, ${currency}, ${num(b.sale_amount)}, ${num(b.discount)},
       ${num(b.customer_delivery_charge)}, ${actualDelivery}, ${actualDeliveryPkr}, ${deliveryCurrency},
       ${String(b.delivery_mode || "CUSTOM")}, ${rate}, 'UNPAID', ${String(b.market || "")},
       ${String(b.status || "NEW")}, ${String(num(b.sale_amount))})
    RETURNING *`;

  await writeItems(o.id, b.items);
  await writeCosts(o.id, b.costs);

  // Optional inline first payment (fast one-screen order entry).
  if (num(b.pay_amount) > 0) {
    await recordPayment({ ...b, order_id: o.id, order_currency: currency });
  }

  // Suggested default production cost from the cost book (only if blank).
  if (!Array.isArray(b.costs) && num(b.sale_amount) > 0 && b.suggest_cost !== false) {
    const sug = await suggestCostPkr(product, num(b.quantity));
    if (sug) {
      await sql`INSERT INTO biz_order_costs (order_id, description, category, amount, currency, rate, pkr)
                VALUES (${o.id}, 'Suggested production cost', 'Production', ${sug}, 'PKR', 1, ${sug})`;
    }
  }

  await refreshPaymentStatus(o.id);
  const [full] = await sql`SELECT * FROM orders WHERE id = ${o.id}`;
  return NextResponse.json({ ok: true, order: full, order_ref: orderRef });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  const [cur] = await sql`SELECT * FROM orders WHERE id = ${id}`;
  if (!cur) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const currency = String(b.currency ?? cur.currency ?? "PKR");
  const rate = b.rate !== undefined ? num(b.rate) : num(cur.rate) > 0 ? num(cur.rate) : currency === "PKR" ? 1 : 0;
  const deliveryCurrency = String(b.delivery_currency ?? cur.delivery_currency ?? currency);
  const actualDelivery = b.actual_delivery_cost !== undefined ? num(b.actual_delivery_cost) : num(cur.actual_delivery_cost);
  const actualDeliveryPkr =
    deliveryCurrency === "PKR"
      ? actualDelivery
      : actualDelivery * (num(b.delivery_rate) > 0 ? num(b.delivery_rate) : toPkr(1, deliveryCurrency));

  await sql`
    UPDATE orders SET
      name = ${String(b.name ?? cur.name)}, phone = ${String(b.phone ?? cur.phone ?? "")},
      country = ${String(b.country ?? cur.country ?? "")}, product = ${String(b.product ?? cur.product)},
      quantity = ${String(b.quantity ?? cur.quantity ?? "")}, details = ${String(b.details ?? cur.details ?? "")},
      customer_id = ${b.customer_id !== undefined ? (b.customer_id ? Number(b.customer_id) : null) : cur.customer_id},
      currency = ${currency}, sale_amount = ${b.sale_amount !== undefined ? num(b.sale_amount) : num(cur.sale_amount)},
      discount = ${b.discount !== undefined ? num(b.discount) : num(cur.discount)},
      customer_delivery_charge = ${b.customer_delivery_charge !== undefined ? num(b.customer_delivery_charge) : num(cur.customer_delivery_charge)},
      actual_delivery_cost = ${actualDelivery}, actual_delivery_pkr = ${actualDeliveryPkr},
      delivery_currency = ${deliveryCurrency},
      delivery_mode = ${String(b.delivery_mode ?? cur.delivery_mode ?? "CUSTOM")},
      rate = ${rate},
      status = ${String(b.status ?? cur.status)},
      payment_status = ${String(b.payment_status ?? cur.payment_status ?? "UNPAID")},
      market = ${String(b.market ?? cur.market ?? "")},
      tracking_number = ${String(b.tracking_number ?? cur.tracking_number ?? "")},
      tracking_url = ${String(b.tracking_url ?? cur.tracking_url ?? "")},
      eta = ${String(b.eta ?? cur.eta ?? "")}, notes = ${String(b.notes ?? cur.notes ?? "")},
      archived = ${b.archived !== undefined ? Boolean(b.archived) : Boolean(cur.archived)},
      updated_at = now()
    WHERE id = ${id}`;

  if (b.items !== undefined) {
    await sql`DELETE FROM biz_order_items WHERE order_id = ${id}`;
    await writeItems(id, b.items);
  }
  if (b.costs !== undefined) {
    await sql`DELETE FROM biz_order_costs WHERE order_id = ${id}`;
    await writeCosts(id, b.costs);
  }
  await refreshPaymentStatus(id);
  const [full] = await sql`SELECT * FROM orders WHERE id = ${id}`;
  return NextResponse.json({ ok: true, order: full });
}

async function writeItems(orderId: number, items: unknown) {
  if (!Array.isArray(items)) return;
  for (const it of items) {
    const product = String(it?.product || "").trim();
    if (!product) continue;
    const qty = num(it?.quantity);
    const price = num(it?.unit_price);
    await sql`INSERT INTO biz_order_items (order_id, product, quantity, unit_price, subtotal)
              VALUES (${orderId}, ${product}, ${qty}, ${price}, ${num(it?.subtotal) || qty * price})`;
  }
}

async function writeCosts(orderId: number, costs: unknown) {
  if (!Array.isArray(costs)) return;
  for (const c of costs) {
    const amount = num(c?.amount);
    if (amount <= 0) continue;
    const ccy = String(c?.currency || "PKR");
    const rate = num(c?.rate) || 1;
    const pkr = num(c?.pkr) || (ccy === "PKR" ? amount : amount * rate);
    await sql`INSERT INTO biz_order_costs (order_id, description, category, amount, currency, rate, pkr, date, notes)
              VALUES (${orderId}, ${String(c?.description || "")}, ${String(c?.category || "Other")},
                      ${amount}, ${ccy}, ${rate}, ${pkr}, ${String(c?.date || new Date().toISOString().slice(0, 10))}, ${String(c?.notes || "")})`;
  }
}
