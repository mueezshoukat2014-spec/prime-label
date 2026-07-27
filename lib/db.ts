import { neon } from "@neondatabase/serverless";

/**
 * Resilient Neon SQL client (tagged-template).
 *
 * Lazily creates the client on first use. When DATABASE_URL is missing
 * (for example during a build without database access), queries resolve to an
 * empty array instead of throwing, so callers can fall back to static content
 * and the build never crashes.
 */
let client: ((s: TemplateStringsArray, ...v: unknown[]) => Promise<any[]>) | null = null;

function getClient() {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    client = neon(url) as unknown as typeof client;
    return client;
  } catch {
    return null;
  }
}

export const sql: (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<any[]> = (strings, ...values) => {
  const c = getClient();
  if (!c) return Promise.resolve([]);
  return c(strings, ...values);
};
