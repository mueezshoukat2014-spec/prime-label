import "server-only";
import { revalidatePath } from "next/cache";
import { clearDataMemo } from "@/lib/data";

/**
 * Public pages are static + ISR (served from Vercel's edge cache). Call this
 * after any admin change to public content: every English and Arabic page is
 * re-rendered on its next visit (stale-while-revalidate — visitors never wait),
 * so admin edits go live within seconds instead of after a deploy.
 */
export function revalidatePublicSite() {
  try {
    clearDataMemo();
  } catch {}
  try {
    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
  } catch (e) {
    console.error("[revalidate] failed:", e);
  }
}

/** Wrap an admin route handler: after a successful (2xx) response, refresh the public site. */
export function withSiteRevalidate<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    const res = await handler(...args);
    if (res.ok) revalidatePublicSite();
    return res;
  };
}
