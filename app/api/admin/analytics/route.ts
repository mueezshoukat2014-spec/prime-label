import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureAnalyticsSchema } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Aggregates for the admin Analytics tab. Rolling windows (last 24 hours /
 * 7 days / 30 days) so they never depend on a timezone.
 */
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureAnalyticsSchema();

    const [live, stats24h, stats7d, stats30d, countries, pages, activity, funnel] =
      await Promise.all([
        sql`SELECT id, country, device, current_page, landing_page,
                   first_seen, last_seen
            FROM analytics_sessions
            WHERE last_seen > now() - interval '5 minutes'
            ORDER BY last_seen DESC
            LIMIT 50`,
        sql`SELECT COUNT(DISTINCT session_id)::int AS visitors,
                   COUNT(*) FILTER (WHERE type = 'pageview')::int AS pageviews
            FROM analytics_events
            WHERE created_at > now() - interval '24 hours'`,
        sql`SELECT COUNT(DISTINCT session_id)::int AS visitors,
                   COUNT(*) FILTER (WHERE type = 'pageview')::int AS pageviews
            FROM analytics_events
            WHERE created_at > now() - interval '7 days'`,
        sql`SELECT COUNT(DISTINCT session_id)::int AS visitors,
                   COUNT(*) FILTER (WHERE type = 'pageview')::int AS pageviews
            FROM analytics_events
            WHERE created_at > now() - interval '30 days'`,
        sql`SELECT COALESCE(NULLIFF(country, ''), 'Unknown') AS country,
                   COUNT(*)::int AS visitors
            FROM analytics_sessions
            WHERE last_seen > now() - interval '30 days'
            GROUP BY 1
            ORDER BY visitors DESC
            LIMIT 12`,
        sql`SELECT path, COUNT(*)::int AS views,
                   COUNT(DISTINCT session_id)::int AS visitors
            FROM analytics_events
            WHERE type = 'pageview' AND created_at > now() - interval '30 days'
            GROUP BY path
            ORDER BY views DESC
            LIMIT 10`,
        sql`SELECT e.type, e.path, e.detail, e.created_at,
                   s.country, s.device
            FROM analytics_events e
            LEFT JOIN analytics_sessions s ON s.id = e.session_id
            ORDER BY e.created_at DESC
            LIMIT 30`,
        sql`SELECT
              COUNT(*) FILTER (WHERE type = 'pageview' AND path = '/quote')::int AS quote_views,
              COUNT(*) FILTER (WHERE type = 'action' AND detail LIKE 'lead_submit%')::int AS leads,
              COUNT(*) FILTER (WHERE type = 'action' AND detail LIKE 'whatsapp_click%')::int AS whatsapp_clicks,
              COUNT(*) FILTER (WHERE type = 'action' AND detail LIKE 'contact_submit%')::int AS contact_submits
            FROM analytics_events
            WHERE created_at > now() - interval '30 days'`,
      ]);

    const qv = funnel[0]?.quote_views || 0;
    const leads = funnel[0]?.leads || 0;

    return NextResponse.json({
      ok: true,
      live,
      stats: {
        today: stats24h[0] || { visitors: 0, pageviews: 0 },
        week: stats7d[0] || { visitors: 0, pageviews: 0 },
        month: {
          ...(stats30d[0] || { visitors: 0, pageviews: 0 }),
          leads,
          whatsappClicks: funnel[0]?.whatsapp_clicks || 0,
          contactSubmits: funnel[0]?.contact_submits || 0,
          quoteViews: qv,
          quoteRate: qv > 0 ? Math.round((leads / qv) * 100) : 0,
        },
      },
      countries,
      pages,
      activity,
    });
  } catch (e) {
    console.error("[admin/analytics]", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
