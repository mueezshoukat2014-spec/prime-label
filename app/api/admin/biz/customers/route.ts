import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema } from "@/lib/biz/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIELDS = [
  "full_name", "brand_name", "country", "city", "whatsapp", "email",
  "instagram", "address", "customer_type", "notes", "lead_id", "archived",
] as const;

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
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
