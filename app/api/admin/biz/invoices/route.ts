import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema } from "@/lib/biz/schema";
import { num } from "@/lib/biz/money";
import {
  getInvoiceSettings, nextInvoiceNumber, validateInvoiceBody,
} from "@/lib/biz/invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN = () => process.env.ADMIN_USERNAME || "admin";

/** postgres shim returns JSONB as string — normalise for clients. */
const parseJson = (v: any) => {
  if (v == null) return v;
  if (typeof v === "string") { try { return JSON.parse(v); } catch { return {}; } }
  return v;
};
/** Normalise DATE columns to YYYY-MM-DD no matter what the driver returns
 *  (Neon HTTP returns strings, postgres.js returns Date objects). Keeps date
 *  inputs, lists and print/PDF views free of ISO timestamps / epoch numbers. */
const dOnly = (v: any) => {
  if (v == null || v === "") return v;
  if (v instanceof Date) {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  }
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

const norm = (r: any) => ({
  ...r,
  date: dOnly(r.date),
  due_date: dOnly(r.due_date),
  payment_date: dOnly(r.payment_date),
  estimated_delivery: dOnly(r.estimated_delivery),
  customer_snapshot: parseJson(r.customer_snapshot),
  design_attachment: parseJson(r.design_attachment),
});

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const [inv] = await sql`SELECT * FROM biz_invoices WHERE id = ${Number(id)}`;
    if (!inv) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const [items, customer, order, settings] = await Promise.all([
      sql`SELECT * FROM biz_invoice_items WHERE invoice_id = ${inv.id} ORDER BY id`,
      inv.customer_id ? sql`SELECT * FROM biz_customers WHERE id = ${inv.customer_id}` : Promise.resolve([]),
      inv.order_id ? sql`SELECT id, order_ref, status FROM orders WHERE id = ${inv.order_id}` : Promise.resolve([]),
      getInvoiceSettings(),
    ]);
    return NextResponse.json({
      ok: true, invoice: norm(inv), items,
      customer: customer[0] || null,
      order: order[0] || null,
      settings,
    });
  }

  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const pay = url.searchParams.get("payment_status") || "";
  const del = url.searchParams.get("delivery_status") || "";
  const ccy = url.searchParams.get("currency") || "";
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const sort = url.searchParams.get("sort") || "newest";

  let rows = await sql`
    SELECT i.*, c.full_name AS cust_name, c.brand_name, c.whatsapp AS cust_phone, c.email AS cust_email, o.order_ref
    FROM biz_invoices i
    LEFT JOIN biz_customers c ON c.id = i.customer_id
    LEFT JOIN orders o ON o.id = i.order_id
    WHERE COALESCE(i.archived, FALSE) = FALSE
    ORDER BY i.id DESC LIMIT 500`;

  const hay = (r: any) =>
    [r.inv_number, r.cust_name, r.brand_name, r.cust_phone, r.cust_email, r.order_ref,
     (r.customer_snapshot || {})?.name, (r.customer_snapshot || {})?.phone, (r.customer_snapshot || {})?.email, (r.customer_snapshot || {})?.company]
      .join(" ").toLowerCase();

  let out = rows.map(norm).filter((r: any) => {
    if (q && !hay(r).includes(q)) return false;
    if (pay && r.payment_status !== pay) return false;
    if (del && r.delivery_status !== del) return false;
    if (ccy && r.currency !== ccy) return false;
    if (from && String(r.date || "") < from) return false;
    if (to && String(r.date || "") > to) return false;
    return true;
  });
  if (sort === "oldest") out = out.reverse();
  if (sort === "highest") out = [...out].sort((a: any, b: any) => Number(b.grand_total) - Number(a.grand_total));
  if (sort === "lowest") out = [...out].sort((a: any, b: any) => Number(a.grand_total) - Number(b.grand_total));

  return NextResponse.json({ ok: true, invoices: out });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));

  // Optional: link / mirror an existing order (integration with Orders tab).
  let orderId: number | null = b.order_id ? Number(b.order_id) : null;
  let orderRef = "";
  if (orderId) {
    const [o] = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
    if (!o) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    orderRef = String(o.order_ref || "");
    if (!Array.isArray(b.items) || !b.items.length) {
      const oi = await sql`SELECT * FROM biz_order_items WHERE order_id = ${orderId} ORDER BY id`;
      const t = num(o.sale_amount);
      b.items = oi.length
        ? oi.map((x: any) => ({ product: x.product, quantity: x.quantity, unit_price: x.unit_price }))
        : [{ product: o.product || `Order ${orderRef}`, quantity: num(o.quantity) || 1, unit_price: t }];
      if (b.currency == null) b.currency = o.currency;
      if (b.delivery == null) b.delivery = num(o.customer_delivery_charge);
      if (b.discount == null) b.discount = num(o.discount);
      if (!b.customer?.name) b.customer = { ...(b.customer || {}), name: o.name };
    }
  }

  const v = validateInvoiceBody(b);
  if ("error" in v) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  // Resolve customer: existing id or create new.
  let customerId: number | null = b.customer_id ? Number(b.customer_id) : null;
  if (!customerId && b.customer?.new && b.customer?.name) {
    const [c] = await sql`
      INSERT INTO biz_customers (full_name, brand_name, country, city, whatsapp, email, address, notes)
      VALUES (${b.customer.name}, ${b.customer.company || ""}, ${b.customer.country || ""}, ${b.customer.city || ""},
              ${b.customer.whatsapp || b.customer.phone || ""}, ${b.customer.email || ""}, ${b.customer.address || ""},
              ${"Created from invoice " + new Date().toISOString().slice(0, 10)})
      RETURNING id`;
    customerId = c.id;
  }

  const manualNum = String(b.inv_number ?? "").trim();
  let invNumber: string;
  if (manualNum) {
    if (manualNum.length > 40) return NextResponse.json({ ok: false, error: "Invoice number is too long (max 40 chars)." }, { status: 400 });
    const [ex] = await sql`SELECT 1 FROM biz_invoices WHERE inv_number = ${manualNum}`;
    if (ex) return NextResponse.json({ ok: false, error: `Invoice number ${manualNum} already exists — numbers must be unique.` }, { status: 400 });
    invNumber = manualNum;
  } else {
    invNumber = await nextInvoiceNumber();
  }
  const [inv] = await sql`
    INSERT INTO biz_invoices
      (inv_number, order_id, customer_id, date, due_date, currency, subtotal, discount, delivery, tax, grand_total,
       amount_paid, payment_status, payment_method, payment_date, payment_reference, payment_notes,
       payment_terms_type, payment_terms_custom, terms, notes,
       delivery_status, delivery_method, courier, tracking_number, estimated_delivery, delivery_notes,
       delivery_paid_by, pdf_name,
       customer_snapshot, design_attachment, status, created_by)
    VALUES
      (${invNumber}, ${orderId}, ${customerId}, ${v.fields.date}, ${v.fields.dueDate}, ${v.fields.currency},
       ${v.subtotal}, ${v.discount}, ${v.delivery}, ${v.tax}, ${v.grandTotal},
       ${v.amountPaid}, ${v.fields.paymentStatus}, ${v.fields.paymentMethod}, ${v.fields.paymentDate},
       ${v.fields.paymentReference}, ${v.fields.paymentNotes},
       ${v.fields.termsType}, ${v.fields.paymentTermsCustom}, ${v.fields.terms}, ${v.fields.notes},
       ${v.fields.deliveryStatus}, ${v.fields.deliveryMethod}, ${v.fields.courier}, ${v.fields.trackingNumber},
       ${v.fields.estimatedDelivery}, ${v.fields.deliveryNotes},
       ${v.fields.deliveryPaidBy}, ${v.fields.pdfName},
       ${JSON.stringify(v.fields.customerSnapshot)}, ${b.design_attachment ? JSON.stringify(b.design_attachment) : null},
       ${v.fields.paymentStatus === "PAID" ? "PAID" : "ISSUED"}, ${ADMIN()})
    RETURNING *`;

  for (const i of v.items) {
    await sql`INSERT INTO biz_invoice_items
      (invoice_id, product, description, size, shape, color, quantity, unit, unit_price, discount, subtotal)
      VALUES (${inv.id}, ${i.product}, ${i.description}, ${i.size}, ${i.shape}, ${i.color},
              ${i.quantity}, ${i.unit}, ${i.unitPrice}, ${i.discount}, ${i.lineTotal})`;
  }
  return NextResponse.json({ ok: true, invoice: inv, inv_number: invNumber, order_ref: orderRef });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  const [cur] = await sql`SELECT * FROM biz_invoices WHERE id = ${id}`;
  if (!cur) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // Void / archive are status-only transitions (never edit history silently).
  if (b.voided === true && !cur.voided) {
    await sql`UPDATE biz_invoices SET voided = TRUE, voided_at = now(), voided_by = ${ADMIN()},
              void_reason = ${String(b.void_reason || "").slice(0, 500)}, updated_by = ${ADMIN()}, updated_at = now()
              WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }
  if (typeof b.archived === "boolean") {
    await sql`UPDATE biz_invoices SET archived = ${b.archived}, updated_by = ${ADMIN()}, updated_at = now() WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }
  if (cur.voided) return NextResponse.json({ ok: false, error: "Voided invoices cannot be edited." }, { status: 409 });

  const manualNumPatch = String(b.inv_number ?? "").trim();
  if (manualNumPatch && manualNumPatch !== cur.inv_number) {
    if (manualNumPatch.length > 40) return NextResponse.json({ ok: false, error: "Invoice number is too long (max 40 chars)." }, { status: 400 });
    const [ex] = await sql`SELECT 1 FROM biz_invoices WHERE inv_number = ${manualNumPatch}`;
    if (ex) return NextResponse.json({ ok: false, error: `Invoice number ${manualNumPatch} already exists — numbers must be unique.` }, { status: 400 });
    await sql`UPDATE biz_invoices SET inv_number = ${manualNumPatch} WHERE id = ${cur.id}`;
  }

  // Partial PATCHes (notes-only, status-only from the manager/preview) carry no
  // items — fall back to the stored lines so validation still passes.
  let patchItems = b.items;
  if (!Array.isArray(patchItems)) {
    const curItems = await sql`SELECT * FROM biz_invoice_items WHERE invoice_id = ${id} ORDER BY id`;
    patchItems = curItems.map((it: any) => ({
      product: it.product, description: it.description, size: it.size, shape: it.shape, color: it.color,
      quantity: it.quantity, unit: it.unit, unit_price: it.unit_price, discount: it.discount,
      line_total: String(it.subtotal),
    }));
  }
  const v = validateInvoiceBody({ ...curToBody(cur), ...b, items: patchItems });
  if ("error" in v) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  await sql`UPDATE biz_invoices SET
    date = ${v.fields.date}, due_date = ${v.fields.dueDate}, currency = ${v.fields.currency},
    subtotal = ${v.subtotal}, discount = ${v.discount}, delivery = ${v.delivery}, tax = ${v.tax}, grand_total = ${v.grandTotal},
    amount_paid = ${v.amountPaid}, payment_status = ${v.fields.paymentStatus}, payment_method = ${v.fields.paymentMethod},
    payment_date = ${v.fields.paymentDate}, payment_reference = ${v.fields.paymentReference}, payment_notes = ${v.fields.paymentNotes},
    payment_terms_type = ${v.fields.termsType}, payment_terms_custom = ${v.fields.paymentTermsCustom},
    terms = ${v.fields.terms}, notes = ${v.fields.notes},
    delivery_status = ${v.fields.deliveryStatus}, delivery_method = ${v.fields.deliveryMethod}, courier = ${v.fields.courier},
    tracking_number = ${v.fields.trackingNumber}, estimated_delivery = ${v.fields.estimatedDelivery}, delivery_notes = ${v.fields.deliveryNotes},
    delivery_paid_by = ${v.fields.deliveryPaidBy}, pdf_name = ${v.fields.pdfName},
    customer_snapshot = ${JSON.stringify(v.fields.customerSnapshot)},
    customer_id = ${b.customer_id ? Number(b.customer_id) : cur.customer_id},
    status = ${v.fields.paymentStatus === "PAID" ? "PAID" : "ISSUED"},
    updated_by = ${ADMIN()}, updated_at = now()
    WHERE id = ${id}`;

  if (Array.isArray(b.items)) {
    await sql`DELETE FROM biz_invoice_items WHERE invoice_id = ${id}`;
    for (const i of v.items) {
      await sql`INSERT INTO biz_invoice_items
        (invoice_id, product, description, size, shape, color, quantity, unit, unit_price, discount, subtotal)
        VALUES (${id}, ${i.product}, ${i.description}, ${i.size}, ${i.shape}, ${i.color},
                ${i.quantity}, ${i.unit}, ${i.unitPrice}, ${i.discount}, ${i.lineTotal})`;
    }
  }
  const [inv] = await sql`SELECT * FROM biz_invoices WHERE id = ${id}`;
  return NextResponse.json({ ok: true, invoice: inv });
}

/** Re-shape a stored invoice into the validation body so PATCH re-validates everything. */
function curToBody(cur: any) {
  const snap = cur.customer_snapshot || {};
  return {
    date: cur.date, due_date: cur.due_date, currency: cur.currency, discount: cur.discount,
    delivery: cur.delivery, tax: cur.tax, amount_paid: cur.amount_paid,
    payment_status: cur.payment_status, payment_method: cur.payment_method, payment_date: cur.payment_date,
    payment_reference: cur.payment_reference, payment_notes: cur.payment_notes,
    payment_terms_type: cur.payment_terms_type, payment_terms_custom: cur.payment_terms_custom,
    terms: cur.terms, notes: cur.notes,
    delivery_status: cur.delivery_status, delivery_method: cur.delivery_method, courier: cur.courier,
    tracking_number: cur.tracking_number, estimated_delivery: cur.estimated_delivery, delivery_notes: cur.delivery_notes,
    customer: { ...snap },
  };
}
