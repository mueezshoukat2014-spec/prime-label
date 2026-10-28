import "server-only";
import { request } from "node:https";

/*
 * Vercel Blob outage fallback.
 * If the Blob store becomes unavailable (e.g. Hobby limits exceeded → every
 * blob URL answers 403 "Your store is blocked"), pages fall back to the repo
 * photos / static media so the storefront never shows broken images or videos.
 * Checked at most every 2 minutes per server instance with a single HEAD
 * request (Node https — not Next's fetch, so static/ISR rendering is
 * untouched). ISR (5 min) brings Blob media back automatically once the store
 * is reachable again. Only a definitive 401/403 flips to fallback; timeouts or
 * network hiccups never do.
 */
export const isBlobUrl = (u: unknown): u is string =>
  typeof u === "string" && u.includes(".public.blob.vercel-storage.com/");

let health: { t: number; ok: boolean } | null = null;

function headStatus(url: string, timeoutMs = 4000): Promise<number> {
  return new Promise((resolve) => {
    try {
      const req = request(url, { method: "HEAD", timeout: timeoutMs }, (res) => {
        res.resume();
        resolve(res.statusCode || 0);
      });
      req.on("timeout", () => {
        req.destroy();
        resolve(0);
      });
      req.on("error", () => resolve(0));
      req.end();
    } catch {
      resolve(0);
    }
  });
}

/** true unless the Blob store is known to be blocked. `sample` = any blob URL in use. */
export async function blobReachable(sample: string | undefined | null): Promise<boolean> {
  if (!sample || !isBlobUrl(sample)) return true;
  if (health && Date.now() - health.t < 120_000) return health.ok;
  const status = await headStatus(sample);
  const ok = !(status === 401 || status === 403);
  health = { t: Date.now(), ok };
  if (!ok) console.warn(`[blob] store unavailable (HTTP ${status}) — serving repo-photo fallbacks`);
  return ok;
}
