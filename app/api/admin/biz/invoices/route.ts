import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema, nextNumber } from "@/lib/biz/schema";
import { num, toPkr } from "@/lib/biz/money";
import { orderTotals } from "@/lib/biz/calc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const [inv] = await sql`SELECT * FROM biz_invoices WHERE id = ${Number(id)}`;
    if (!inv) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const [items, customer, order] = await Promise.all([
      sql`SELECT * FROM biz_invoice_items WHERE invoice_id = ${inv.id} ORDER BY id`,
      inv.customer_id ? sql`SELECT * FROM biz_customers WHERE id = ${inv.customer_id}` : Promise.resolve([]),
      inv.order_id ? sql`SELECT * FROM orders WHERE id = ${inv.order_id}` : Promise.resolve([]),
    ]);
    return NextResponse.json({ ok: true, invoice: inv, items, customer: customer[0] ?? null, order: order[0] ?? null });
  }

  const rows = await sql`
    SELECT i.*, c.full_name AS cust_name, c.brand_name, o.order_ref
    FROM biz_invoices i
    LEFT JOIN biz_customers c ON c.id = i.customer_id
    LEFT JOIN orders o ON o.id = i.order_id
    ORDER BY i.id DESC LIMIT 300`;
  return NextResponse.json({ ok: true, invoices: rows });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));

  let subtotal = num(b.subtotal);
  let discount = num(b.discount);
  let delivery = num(b.delivery);
  let currency = String(b.currency || "PKR");
  let customerId = b.customer_id ? Number(b.customer_id) : null;
  let orderId = b.order_id ? Number(b.order_id) : null;
  let items: any[] = Array.isArray(b.items) ? b.items : [];

  // Creating from an existing order: mirror its financial snapshot exactly.
  if (orderId) {
    const [o] = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
    if (!o) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    currency = String(o.currency || "PKR");
    customerId = o.customer_id ?? customerId;
    const t = await orderTotals(o);
    // billedCcy = sale − discount + delivery, so recover the raw subtotal.
    subtotal = t.billedCcy + num(o.discount) - num(o.customer_delivery_charge);
    discount = num(o.discount);
    delivery = num(o.customer_delivery_charge);
    if (!items.length) {
      const oi = await sql`SELECT * FROM biz_order_items WHERE order_id = ${orderId} ORDER BY id`;
      items = oi.length
        ? oi
        : [{ product: o.product || "Order " + o.order_ref, quantity: num(o.quantity), unit_price: subtotal, subtotal }];
    }
  }

  const grand = subtotal - discount + delivery;
  const invNumber = await nextNumber("invoice");
  const [inv] = await sql`
    INSERT INTO biz_invoices
      (inv_number, order_id, customer_id, date, currency, subtotal, discount, delivery, grand_total, terms, notes, status)
    VALUES
      (${invNumber}, ${orderId}, ${customerId}, ${String(b.date || new Date().toISOString().slice(0, 10))},
       ${currency}, ${subtotal}, ${discount}, ${delivery}, ${+grand.toFixed(2)},
       ${String(b.terms || "50% Advance / 50% Before Delivery")}, ${String(b.notes || "")},
       ${String(b.status || "DRAFT")})
    RETURNING *`;
  for (const i of items) {
    if (!String(i?.product || "").trim()) continue;
    const qty = num(i.quantity); const price = num(i.unit_price);
    await sql`INSERT INTO biz_invoice_items (invoice_id, product, quantity, unit_price, subtotal)
              VALUES (${inv.id}, ${String(i.product)}, ${qty}, ${price}, ${num(i.subtotal) || qty * price})`;
  }
  return NextResponse.json({ ok: true, invoice: inv, inv_number: invNumber });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  const [cur] = await sql`SELECT * FROM biz_invoices WHERE id = ${id}`;
  if (!cur) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  let subtotal = num(cur.subtotal), discount = num(cur.discount), delivery = num(cur.delivery);
  if (Array.isArray(b.items)) {
    await sql`DELETE FROM biz_invoice_items WHERE invoice_id = ${id}`;
    subtotal = 0;
    for (const i of b.items) {
      if (!String(i?.product || "").trim()) continue;
      const qty = num(i.quantity); const price = num(i.unit_price);
      const sub = num(i.subtotal) || qty * price;
      subtotal += sub;
      await sql`INSERT INTO biz_invoice_items (invoice_id, product, quantity, unit_price, subtotal)
                VALUES (${id}, ${String(i.product)}, ${qty}, ${price}, ${sub})`;
    }
  }
  if (b.discount !== undefined) discount = num(b.discount);
  if (b.delivery !== undefined) delivery = num(b.delivery);
  const grand = subtotal - discount + delivery;

  const [row] = await sql`
    UPDATE biz_invoices SET
      date = ${b.date ? String(b.date).slice(0, 10) : cur.date},
      subtotal = ${subtotal}, discount = ${discount}, delivery = ${delivery}, grand_total = ${+grand.toFixed(2)},
      terms = ${String(b.terms ?? cur.terms ?? "")}, notes = ${String(b.notes ?? cur.notes ?? "")},
      status = ${String(b.status ?? cur.status ?? "DRAFT")}
    WHERE id = ${id} RETURNING *`;
  return NextResponse.json({ ok: true, invoice: row });
}
