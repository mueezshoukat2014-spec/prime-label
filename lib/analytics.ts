import "server-only";
import { sql } from "@/lib/db";

/**
 * First-party visitor analytics (shopify-style): sessions + events.
 *
 * Data is intentionally anonymous: a random session id from the visitor's
 * browser, country (from Vercel's geolocation header), device class and page
 * paths. No IPs, no personal data.
 */

export type AnalyticsEventType = "pageview" | "action";

const BOT_UA =
  /bot|crawler|spider|slurp|preview|pingdom|facebookexternalhit|whatsapp|telegram|discordbot|headless|lighthouse|pagespeed|vercel-monitor|prerender/i;

export function isBotUa(ua: string) {
  return BOT_UA.test(ua);
}

export function deviceFromUa(ua: string): string {
  if (/iPad|Tablet|PlayBook/i.test(ua)) return "Tablet";
  if (/Mobile|iPhone|Android.*Mobile|IEMobile/i.test(ua)) return "Mobile";
  return "Desktop";
}

export function normalisePath(path: unknown): string {
  if (typeof path !== "string") return "/";
  if (!path.startsWith("/")) return "/";
  if (path.startsWith("//")) return "/";
  return path.slice(0, 300);
}

/** Split "?product=X" out of the path so action detail stays readable. */
export function splitPath(path: string): { path: string; query: string } {
  const i = path.indexOf("?");
  if (i === -1) return { path, query: "" };
  return { path: path.slice(0, i), query: path.slice(i + 1) };
}

const ALLOWED_ACTIONS = new Set([
  "lead_submit",
  "contact_submit",
  "whatsapp_click",
  "quote_started",
]);

export function normaliseAction(action: unknown): string | null {
  if (typeof action !== "string") return null;
  return ALLOWED_ACTIONS.has(action) ? action : null;
}

let schemaReady: Promise<void> | null = null;

async function createSchema(): Promise<void> {
  try {
    await sql`CREATE TABLE IF NOT EXISTS analytics_sessions (
      id TEXT PRIMARY KEY,
      first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
      country TEXT DEFAULT '',
      device TEXT DEFAULT '',
      referrer TEXT DEFAULT '',
      landing_page TEXT DEFAULT '/',
      current_page TEXT DEFAULT '/'
    )`;
    await sql`CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGSERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      type TEXT NOT NULL,
      path TEXT NOT NULL DEFAULT '/',
      detail TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events (session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last ON analytics_sessions (last_seen DESC)`;
  } catch (e) {
    console.error(
      "[analytics] schema failed:",
      e instanceof Error ? e.message : e
    );
    schemaReady = null;
    throw e;
  }
}

export function ensureAnalyticsSchema(): Promise<void> {
  if (!schemaReady) schemaReady = createSchema();
  return schemaReady;
}

export async function recordEvent(opts: {
  sid: string;
  type: AnalyticsEventType;
  path: string;
  detail?: string;
  country: string;
  device: string;
  referrer?: string;
}): Promise<void> {
  await ensureAnalyticsSchema();

  const detail = (opts.detail || "").slice(0, 200);
  const referrer = (opts.referrer || "").slice(0, 300);

  await sql`
    INSERT INTO analytics_sessions (id, country, device, referrer, landing_page, current_page)
    VALUES (${opts.sid}, ${opts.country}, ${opts.device}, ${referrer}, ${opts.path}, ${opts.path})
    ON CONFLICT (id) DO UPDATE SET
      last_seen = now(),
      country = CASE WHEN analytics_sessions.country = '' THEN EXCLUDED.country ELSE analytics_sessions.country END,
      current_page = ${opts.path}
  `;

  await sql`
    INSERT INTO analytics_events (session_id, type, path, detail)
    VALUES (${opts.sid}, ${opts.type}, ${opts.path}, ${detail})
  `;

  // ~1% of pings: shed rows older than 60 days so tables stay small.
  if (Math.random() < 0.01) {
    await sql`DELETE FROM analytics_events WHERE created_at < now() - interval '60 days'`;
    await sql`DELETE FROM analytics_sessions WHERE last_seen < now() - interval '60 days'`;
  }
}
