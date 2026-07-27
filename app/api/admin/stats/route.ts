import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [leads, msgs, orders] = await Promise.all([
      sql`SELECT COUNT(*)::int AS c FROM leads`,
      sql`SELECT COUNT(*)::int AS c FROM contact_messages`,
      sql`SELECT COUNT(*)::int AS c FROM orders`,
    ]);
    const recent = await sql`SELECT id, created_at, name, product, country, status FROM leads ORDER BY created_at DESC LIMIT 6`;
    return NextResponse.json({
      ok: true,
      stats: {
        leads: leads[0].c,
        messages: msgs[0].c,
        orders: orders[0].c,
      },
      recent,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
