import "server-only";
import { sql } from "@/lib/db";

/**
 * Lazy, idempotent schema patches.
 *
 * `lib/db-init.mjs` is the source of truth, but it only runs when someone
 * executes `npm run db:init` by hand. Columns added to an existing table would
 * otherwise be missing in production until that happens — and a missing column
 * turns into a 500 on a route that is expected to work.
 *
 * These statements are all `IF NOT EXISTS`, so running them repeatedly is
 * harmless. The result is cached per process so it costs one round-trip per
 * cold start, not one per request.
 */

let ready: Promise<void> | null = null;

async function run(): Promise<void> {
  try {
    await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new'`;
    await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ`;
  } catch (e: unknown) {
    // Never block the request: if the patch fails the caller may still work,
    // and retrying on the next cold start is the right behaviour.
    console.error(
      "[schema] contact_messages patch failed:",
      e instanceof Error ? e.message : e
    );
    ready = null; // allow a retry rather than caching the failure
    throw e;
  }
}

export function ensureContactSchema(): Promise<void> {
  if (!ready) ready = run();
  return ready;
}
