import { NextResponse } from "next/server";
import {
  deviceFromUa,
  isBotUa,
  normaliseAction,
  normalisePath,
  recordEvent,
  splitPath,
} from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public ping endpoint used by the on-site AnalyticsTracker. Accepts both
 * fetch() JSON posts and navigator.sendBeacon() payloads.
 */
export async function POST(request: Request) {
  try {
    const ua = request.headers.get("user-agent") || "";
    if (isBotUa(ua)) return NextResponse.json({ ok: true });

    let body: Record<string, unknown> = {};
    const raw = await request.text();
    if (raw) {
      try {
        body = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return NextResponse.json({ ok: true });
      }
    }

    const sid = typeof body.sid === "string" ? body.sid.slice(0, 64) : "";
    if (!sid || !/^[a-zA-Z0-9-]{8,64}$/.test(sid)) {
      return NextResponse.json({ ok: true });
    }

    const full = normalisePath(body.path);
    if (full.startsWith("/admin") || full.startsWith("/api") || full.startsWith("/_next")) {
      return NextResponse.json({ ok: true });
    }
    const { path, query } = splitPath(full);

    const action = normaliseAction(body.event);
    const country = (
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      ""
    ).toUpperCase();

    await recordEvent({
      sid,
      type: action ? "action" : "pageview",
      path: path || "/",
      detail: action
        ? `${action}${typeof body.detail === "string" && body.detail ? `: ${body.detail}` : ""}`.slice(0, 200)
        : query.slice(0, 200),
      country,
      device: deviceFromUa(ua),
      referrer: typeof body.referrer === "string" ? body.referrer : "",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[analytics/track]", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
