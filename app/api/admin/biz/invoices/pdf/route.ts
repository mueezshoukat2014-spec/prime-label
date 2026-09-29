import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema } from "@/lib/biz/schema";
import { getInvoiceSettings } from "@/lib/biz/invoice";
import { buildInvoicePdf } from "@/lib/biz/invoice-pdf";
import { getSiteContent } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  const [inv] = await sql`SELECT * FROM biz_invoices WHERE id = ${id}`;
  if (!inv) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const [items, customer, order, settings, site] = await Promise.all([
    sql`SELECT * FROM biz_invoice_items WHERE invoice_id = ${id} ORDER BY id`,
    inv.customer_id ? sql`SELECT * FROM biz_customers WHERE id = ${inv.customer_id}` : Promise.resolve([]),
    inv.order_id ? sql`SELECT id, order_ref FROM orders WHERE id = ${inv.order_id}` : Promise.resolve([]),
    getInvoiceSettings(),
    getSiteContent(),
  ]);

  const pdf = await buildInvoicePdf({
    invoice: inv,
    items,
    customer: customer[0] || null,
    order: order[0] || null,
    settings,
    business: {
      name: site.businessName || "Prime Labels International",
      phone: site.phone || "+92 324 4999224",
      email: "Primelabelsintl@gmail.com",
      website: "primelabelsintl.com",
      instagram: site.instagram,
    },
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${((inv.pdf_name || "").trim().replace(/[^\w\- .]+/g, "") || "PrimeLabels-Invoice-" + inv.inv_number).replace(/\.pdf$/i, "")}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
