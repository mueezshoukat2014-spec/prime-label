import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

/**
 * Resilient SQL client (tagged-template).
 *
 * Two drivers, one `sql` API:
 *  - Default: Neon's HTTP serverless driver (production).
 *  - `DB_DRIVER=postgres` (or a Supabase/pooler URL): plain postgres.js over
 *    TCP — used for local testing and ready for a Supabase migration.
 *
 * Lazily created on first use. When DATABASE_URL is missing (for example
 * during a build without database access), queries resolve to an empty array
 * instead of throwing, so callers fall back to static content and the build
 * never crashes.
 */
type SqlFn = (s: TemplateStringsArray, ...v: unknown[]) => Promise<any[]>;

let client: SqlFn | null = null;

function getClient(): SqlFn | null {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    if (process.env.DB_DRIVER === "postgres" || /supabase\.(co|com)/.test(url)) {
      const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
      const pg = postgres(url, {
        max: 2,
        prepare: false, // safe behind Supavisor transaction poolers too
        ...(isLocal ? { ssl: false } : {}),
        onnotice: () => {},
      });
      client = ((strings: TemplateStringsArray, ...values: unknown[]) =>
        (pg as any)(strings, ...values)) as SqlFn;
      return client;
    }
    client = neon(url) as unknown as SqlFn;
    return client;
  } catch {
    return null;
  }
}

export const sql: SqlFn = (strings, ...values) => {
  const c = getClient();
  if (!c) return Promise.resolve([]);
  return c(strings, ...values);
};
