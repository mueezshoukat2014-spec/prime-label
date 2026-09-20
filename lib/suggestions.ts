import "server-only";
import { sql } from "@/lib/db";

/**
 * Suggestions (website feedback box) storage helpers.
 *
 * The table is created lazily and idempotently so no manual migration is
 * needed on any environment — first write or first admin read creates it.
 */
export async function ensureSuggestionsTable() {
  await sql`CREATE TABLE IF NOT EXISTS suggestions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    contact TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
}

export type SuggestionRow = {
  id: number;
  name: string;
  contact: string;
  message: string;
  status: string;
  created_at: string;
};

export async function listSuggestions(): Promise<SuggestionRow[]> {
  await ensureSuggestionsTable();
  return (await sql`SELECT id, name, contact, message, status, created_at
                     FROM suggestions
                     ORDER BY created_at DESC
                     LIMIT 300`) as SuggestionRow[];
}

export async function countSuggestions(): Promise<number> {
  try {
    const rows = await sql`SELECT COUNT(*)::int AS c FROM suggestions`;
    return rows[0]?.c ?? 0;
  } catch {
    // Table not created yet (no suggestion ever submitted) — not an error.
    return 0;
  }
}
