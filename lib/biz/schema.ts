import "server-only";
import { sql } from "@/lib/db";

/**
 * Business management schema — lazy and idempotent, same convention as
 * lib/ensure-schema.ts. Every statement is IF NOT EXISTS so it is safe on
 * every cold start and on the existing production database (additive only;
 * nothing is ever dropped or rewritten).
 *
 * Financial rows always store: original currency, original amount, exchange
 * rate at transaction time, and the PKR equivalent snapshot.
 */
let ready: Promise<void> | null = null;

async function run(): Promise<void> {
  // ---- customers ---------------------------------------------------------
  await sql`CREATE TABLE IF NOT EXISTS biz_customers (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    full_name TEXT NOT NULL,
    brand_name TEXT DEFAULT '',
    country TEXT DEFAULT '',
    city TEXT DEFAULT '',
    whatsapp TEXT DEFAULT '',
    email TEXT DEFAULT '',
    instagram TEXT DEFAULT '',
    address TEXT DEFAULT '',
    customer_type TEXT DEFAULT 'New Brand',
    notes TEXT DEFAULT '',
    lead_id INTEGER,
    archived BOOLEAN DEFAULT FALSE
  )`;

  // ---- internal product cost book (separate from the public catalogue) ---
  await sql`CREATE TABLE IF NOT EXISTS product_costs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    product_name TEXT NOT NULL,
    category TEXT DEFAULT '',
    active BOOLEAN DEFAULT TRUE,
    notes TEXT DEFAULT '',
    tiers JSONB DEFAULT '[]'::jsonb
  )`;

  // ---- quotations ---------------------------------------------------------
  await sql`CREATE TABLE IF NOT EXISTS biz_quotations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    q_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER,
    country TEXT DEFAULT '',
    currency TEXT DEFAULT 'PKR',
    rate NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    delivery_charge NUMERIC DEFAULT 0,
    grand_total NUMERIC DEFAULT 0,
    grand_total_pkr NUMERIC DEFAULT 0,
    production_time TEXT DEFAULT '',
    delivery_time TEXT DEFAULT '',
    payment_terms TEXT DEFAULT '50% Advance / 50% Before Delivery',
    validity_days INTEGER DEFAULT 15,
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'DRAFT',
    follow_up_at DATE,
    follow_up_notes TEXT DEFAULT '',
    converted_order_id INTEGER
  )`;
  await sql`CREATE TABLE IF NOT EXISTS biz_quotation_items (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER NOT NULL,
    product TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    unit_price NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0
  )`;

  // ---- financial extension of the existing orders table (additive) -------
  // On a brand-new database (e.g. after a provider migration) the legacy
  // tables may not exist yet — create them idempotently first so the ALTERs
  // below can never fail. On production Neon they already exist and these
  // statements are no-ops.
  await sql`CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    order_ref TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    country TEXT,
    product TEXT,
    quantity TEXT,
    details TEXT,
    total TEXT,
    status TEXT DEFAULT 'new'
  )`;
  await sql`CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    country TEXT,
    product TEXT,
    quantity TEXT,
    details TEXT,
    artwork_url TEXT,
    artwork_name TEXT,
    status TEXT DEFAULT 'new'
  )`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INTEGER`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PKR'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS sale_amount NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_delivery_charge NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery_cost NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery_pkr NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_currency TEXT DEFAULT 'PKR'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_mode TEXT DEFAULT 'CUSTOM'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS rate NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'UNPAID'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS market TEXT DEFAULT ''`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`;

  await sql`CREATE TABLE IF NOT EXISTS biz_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    unit_price NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0
  )`;
  await sql`CREATE TABLE IF NOT EXISTS biz_order_costs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'Other',
    amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'PKR',
    rate NUMERIC DEFAULT 1,
    pkr NUMERIC DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    notes TEXT DEFAULT ''
  )`;

  // ---- payments (dual currency, WU-ready) ---------------------------------
  await sql`CREATE TABLE IF NOT EXISTS biz_payments (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    order_id INTEGER,
    customer_id INTEGER,
    date DATE DEFAULT CURRENT_DATE,
    order_currency TEXT DEFAULT 'PKR',
    order_amount NUMERIC DEFAULT 0,
    method TEXT DEFAULT 'Cash',
    received_currency TEXT DEFAULT 'PKR',
    received_amount NUMERIC DEFAULT 0,
    received_pkr NUMERIC DEFAULT 0,
    rate NUMERIC DEFAULT 0,
    fee NUMERIC DEFAULT 0,
    fee_currency TEXT DEFAULT 'PKR',
    fee_pkr NUMERIC DEFAULT 0,
    fee_paid_by TEXT DEFAULT 'customer',
    wu_ref TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    void BOOLEAN DEFAULT FALSE
  )`;

  // ---- invoices ------------------------------------------------------------
  await sql`CREATE TABLE IF NOT EXISTS biz_invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    product TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    unit_price NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0
  )`;
  await sql`CREATE TABLE IF NOT EXISTS biz_invoices (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    inv_number TEXT UNIQUE NOT NULL,
    order_id INTEGER,
    customer_id INTEGER,
    date DATE DEFAULT CURRENT_DATE,
    currency TEXT DEFAULT 'PKR',
    subtotal NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    delivery NUMERIC DEFAULT 0,
    grand_total NUMERIC DEFAULT 0,
    terms TEXT DEFAULT '50% Advance / 50% Before Delivery',
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'DRAFT'
  )`;

  // ---- expenses (general + order-specific + advertising) -------------------
  await sql`CREATE TABLE IF NOT EXISTS biz_expenses (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    date DATE DEFAULT CURRENT_DATE,
    expense_type TEXT DEFAULT 'GENERAL BUSINESS EXPENSE',
    order_id INTEGER,
    category TEXT DEFAULT 'Other',
    subcategory TEXT DEFAULT '',
    description TEXT DEFAULT '',
    amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'PKR',
    rate NUMERIC DEFAULT 1,
    pkr NUMERIC DEFAULT 0,
    method TEXT DEFAULT 'Cash',
    vendor TEXT DEFAULT '',
    platform TEXT DEFAULT '',
    campaign TEXT DEFAULT '',
    receipt_url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    void BOOLEAN DEFAULT FALSE
  )`;

  // ---- owner investment / withdrawal ---------------------------------------
  await sql`CREATE TABLE IF NOT EXISTS biz_owner_txns (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    date DATE DEFAULT CURRENT_DATE,
    kind TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'PKR',
    rate NUMERIC DEFAULT 1,
    pkr NUMERIC DEFAULT 0,
    method TEXT DEFAULT 'Cash',
    reason TEXT DEFAULT '',
    notes TEXT DEFAULT ''
  )`;

  // ---- settings (opening cash etc.) ----------------------------------------
  await sql`CREATE TABLE IF NOT EXISTS biz_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`;

  // ---- leads CRM extension (additive) --------------------------------------
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT ''`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS city TEXT DEFAULT ''`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS instagram TEXT DEFAULT ''`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'Website'`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS est_value NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS est_currency TEXT DEFAULT 'PKR'`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up DATE`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_notes TEXT DEFAULT ''`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS crm_status TEXT DEFAULT 'NEW'`;
}

export function ensureBizSchema(): Promise<void> {
  if (!ready) {
    ready = run().catch((e) => {
      ready = null;
      console.error("[biz-schema] failed:", e instanceof Error ? e.message : e);
      throw e;
    });
  }
  return ready;
}

/** Sequential human-readable numbers: PL-2026-0001, QT-…, INV-… */
export async function nextNumber(
  kind: "order" | "quote" | "invoice"
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = kind === "order" ? "PL" : kind === "quote" ? "QT" : "INV";
  const like = `${prefix}-${year}-%`;
  const rows =
    kind === "order"
      ? await sql`SELECT order_ref AS n FROM orders WHERE order_ref LIKE ${like}`
      : kind === "quote"
        ? await sql`SELECT q_number AS n FROM biz_quotations WHERE q_number LIKE ${like}`
        : await sql`SELECT inv_number AS n FROM biz_invoices WHERE inv_number LIKE ${like}`;
  let max = 0;
  for (const r of rows) {
    const m = String(r.n || "").match(/-(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}-${year}-${String(max + 1).padStart(4, "0")}`;
}
