import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema } from "@/lib/biz/schema";
import { num } from "@/lib/biz/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** CRM extension of the existing public leads table (additive fields only). */

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const status = new URL(req.url).searchParams.get("status") || "";
  const rows = status
    ? await sql`SELECT * FROM leads WHERE crm_status = ${status} ORDER BY id DESC LIMIT 300`
    : await sql`SELECT * FROM leads ORDER BY id DESC LIMIT 300`;
  return NextResponse.json({ ok: true, leads: rows });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });
  const [cur] = await sql`SELECT * FROM leads WHERE id = ${id}`;
  if (!cur) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const [row] = await sql`
    UPDATE leads SET
      brand = ${String(b.brand ?? cur.brand ?? "")},
      city = ${String(b.city ?? cur.city ?? "")},
      instagram = ${String(b.instagram ?? cur.instagram ?? "")},
      lead_source = ${String(b.lead_source ?? cur.lead_source ?? "Website")},
      est_value = ${b.est_value !== undefined ? num(b.est_value) : num(cur.est_value)},
      est_currency = ${String(b.est_currency ?? cur.est_currency ?? "PKR")},
      next_follow_up = ${b.next_follow_up !== undefined ? (b.next_follow_up ? String(b.next_follow_up).slice(0, 10) : null) : cur.next_follow_up},
      follow_up_notes = ${String(b.follow_up_notes ?? cur.follow_up_notes ?? "")},
      crm_status = ${String(b.crm_status ?? cur.crm_status ?? "NEW")}
    WHERE id = ${id} RETURNING *`;
  return NextResponse.json({ ok: true, lead: row });
}

/**
 * POST = convert a lead into a customer (and optionally a draft quotation).
 * The original lead is never deleted — it stays in the funnel with WON status.
 */
export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.lead_id);
  const [lead] = id ? await sql`SELECT * FROM leads WHERE id = ${id}` : [null];
  if (!lead) return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });

  const name = String(b.full_name || lead.company || lead.name || "Lead");
  const [customer] = await sql`
    INSERT INTO biz_customers
      (full_name, brand_name, country, city, whatsapp, email, instagram, customer_type, notes, lead_id)
    VALUES
      (${name}, ${String(b.brand_name || lead.company || "")}, ${String(lead.country || "")},
       ${String(b.city || lead.city || "")}, ${String(lead.phone || "")}, ${String(lead.email || "")},
       ${String(b.instagram || lead.instagram || "")}, 'New Brand',
       ${"Converted from lead #" + lead.id + (lead.details ? " — " + lead.details : "")}, ${lead.id})
    RETURNING *`;

  await sql`UPDATE leads SET crm_status = 'WON' WHERE id = ${lead.id}`;

  let quote = null;
  if (b.create_quote === true) {
    const { nextNumber } = await import("@/lib/biz/schema");
    const estValue = num(lead.est_value);
    const qNumber = await nextNumber("quote");
    const [q] = await sql`
      INSERT INTO biz_quotations
        (q_number, customer_id, country, currency, grand_total, grand_total_pkr, notes, status)
      VALUES
        (${qNumber}, ${customer.id}, ${String(lead.country || "")}, ${String(lead.est_currency || "PKR")},
         ${estValue}, ${estValue}, ${"Auto draft from lead #" + lead.id + (lead.product ? " — " + lead.product : "")},
         'DRAFT')
      RETURNING *`;
    if (lead.product) {
      await sql`INSERT INTO biz_quotation_items (quotation_id, product, quantity, unit_price, subtotal)
                VALUES (${q.id}, ${String(lead.product)}, ${String(lead.quantity || "").match(/^\d+$/) ? Number(lead.quantity) : 0}, 0, 0)`;
    }
    quote = q;
  }
  return NextResponse.json({ ok: true, customer, quote });
}
