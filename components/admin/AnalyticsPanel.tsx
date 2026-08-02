"use client";

import { useCallback, useEffect, useState } from "react";

type LiveSession = {
  id: string;
  country: string;
  device: string;
  current_page: string;
  landing_page: string;
  first_seen: string;
  last_seen: string;
};

type ActivityItem = {
  type: "pageview" | "action";
  path: string;
  detail: string;
  created_at: string;
  country: string;
  device: string;
};

type AnalyticsData = {
  live: LiveSession[];
  stats: {
    today: { visitors: number; pageviews: number };
    week: { visitors: number; pageviews: number };
    month: {
      visitors: number;
      pageviews: number;
      leads: number;
      whatsappClicks: number;
      contactSubmits: number;
      quoteViews: number;
      quoteRate: number;
    };
  };
  countries: { country: string; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  activity: ActivityItem[];
};

const COUNTRY_NAMES: Record<string, string> = {
  SA: "Saudi Arabia", AE: "United Arab Emirates", QA: "Qatar", KW: "Kuwait",
  BH: "Bahrain", OM: "Oman", PK: "Pakistan", IN: "India", GB: "United Kingdom",
  US: "United States", CA: "Canada", AU: "Australia", DE: "Germany", FR: "France",
  NL: "Netherlands", IT: "Italy", ES: "Spain", TR: "Turkey", EG: "Egypt",
  JO: "Jordan", LB: "Lebanon", IQ: "Iraq", YE: "Yemen", SD: "Sudan",
  MY: "Malaysia", ID: "Indonesia", SG: "Singapore", BD: "Bangladesh",
  LK: "Sri Lanka", NP: "Nepal", NG: "Nigeria", ZA: "South Africa",
  CN: "China", JP: "Japan", KR: "South Korea", RU: "Russia", BR: "Brazil",
};

function countryName(code: string) {
  if (!code || code === "Unknown") return "Unknown";
  return COUNTRY_NAMES[code] ? `${COUNTRY_NAMES[code]}` : code;
}

function ago(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function visitLength(first: string, last: string) {
  const s = Math.max(1, Math.floor((new Date(last).getTime() - new Date(first).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function deviceIcon(device: string) {
  if (device === "Mobile") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" />
      </svg>
    );
  }
  if (device === "Tablet") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M11 18h2" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function actionLabel(detail: string) {
  if (detail.startsWith("lead_submit")) return "Submitted quote form";
  if (detail.startsWith("whatsapp_click")) return "Clicked WhatsApp";
  if (detail.startsWith("contact_submit")) return "Sent contact message";
  if (detail.startsWith("quote_started")) return "Started quote form";
  return detail || "Action";
}

const POLL_MS = 15_000;

export default function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setData(json);
        setErr("");
        setLastRefresh(new Date());
      } else {
        setErr(json.error || "Failed to load analytics");
      }
    } catch {
      setErr("Network error while loading analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(() => load(true), POLL_MS);
    return () => window.clearInterval(t);
  }, [load]);

  if (loading && !data) {
    return <div className="py-16 text-center text-[13px] text-cream-dim">Loading analytics…</div>;
  }
  if (err && !data) {
    return (
      <div className="py-16 text-center">
        <p className="text-[13px] text-red-400">{err}</p>
        <button onClick={() => load()} className="btn-ghost mt-4 text-[12px]">Retry</button>
      </div>
    );
  }
  if (!data) return null;

  const { live, stats, countries, pages, activity } = data;
  const liveCount = live.length;
  const maxCountry = countries[0]?.visitors || 1;
  const maxPage = pages[0]?.views || 1;

  return (
    <div className="space-y-6">
      {/* Live banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/40 p-5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>
          <div>
            <div className="text-[15px] font-semibold text-cream">
              {liveCount === 0
                ? "No visitors online right now"
                : `${liveCount} visitor${liveCount === 1 ? "" : "s"} online right now`}
            </div>
            <div className="text-[11px] text-cream-dim">
              Active in the last 5 minutes · auto-refreshes every 15s
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-[11px] text-cream-dim">
              Updated {ago(lastRefresh.toISOString())}
            </span>
          )}
          <button onClick={() => load()} className="btn-ghost px-3.5 py-1.5 text-[11px]">Refresh</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5">
          <div className="text-[10px] uppercase tracking-wide2 text-cream-dim">Live now</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-300">{liveCount}</div>
          <div className="mt-1 text-[11px] text-cream-dim">visitors on site</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          <div className="text-[10px] uppercase tracking-wide2 text-cream-dim">Last 24 hours</div>
          <div className="mt-2 text-3xl font-semibold text-cream">{stats.today.visitors}</div>
          <div className="mt-1 text-[11px] text-cream-dim">{stats.today.pageviews} page views</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          <div className="text-[10px] uppercase tracking-wide2 text-cream-dim">Last 7 days</div>
          <div className="mt-2 text-3xl font-semibold text-cream">{stats.week.visitors}</div>
          <div className="mt-1 text-[11px] text-cream-dim">{stats.week.pageviews} page views</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          <div className="text-[10px] uppercase tracking-wide2 text-cream-dim">Last 30 days</div>
          <div className="mt-2 text-3xl font-semibold text-cream">{stats.month.visitors}</div>
          <div className="mt-1 text-[11px] text-cream-dim">{stats.month.pageviews} page views</div>
        </div>
      </div>

      {/* Funnel */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          <div className="text-[10px] uppercase tracking-wide2 text-cream-dim">Quote page views (30d)</div>
          <div className="mt-2 text-2xl font-semibold text-cream">{stats.month.quoteViews}</div>
        </div>
        <div className="rounded-2xl border border-champagne/30 bg-champagne/[0.07] p-5">
          <div className="text-[10px] uppercase tracking-wide2 text-cream-dim">Quote form leads (30d)</div>
          <div className="mt-2 text-2xl font-semibold text-champagne">{stats.month.leads}</div>
          <div className="mt-1 text-[11px] text-cream-dim">{stats.month.quoteRate}% of quote views</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          <div className="text-[10px] uppercase tracking-wide2 text-cream-dim">WhatsApp clicks (30d)</div>
          <div className="mt-2 text-2xl font-semibold text-cream">{stats.month.whatsappClicks}</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          <div className="text-[10px] uppercase tracking-wide2 text-cream-dim">Contact messages (30d)</div>
          <div className="mt-2 text-2xl font-semibold text-cream">{stats.month.contactSubmits}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Live visitors */}
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          <h3 className="text-[13px] font-semibold text-cream">
            Live visitors <span className="ml-1 text-[11px] font-normal text-cream-dim">right now</span>
          </h3>
          {live.length === 0 ? (
            <p className="mt-4 text-[12px] text-cream-dim">
              Nobody is browsing at this moment. When someone opens your site, they show up here within seconds.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {live.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-xl border border-line/60 bg-ink/60 px-3.5 py-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-cream-muted">
                    {deviceIcon(s.device)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] text-cream">
                      {s.current_page || "/"}
                    </div>
                    <div className="text-[11px] text-cream-dim">
                      {countryName(s.country)} · {s.device || "Desktop"} · active {visitLength(s.first_seen, s.last_seen)}
                    </div>
                  </div>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Countries */}
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          <h3 className="text-[13px] font-semibold text-cream">
            Visitor locations <span className="ml-1 text-[11px] font-normal text-cream-dim">last 30 days</span>
          </h3>
          {countries.length === 0 ? (
            <p className="mt-4 text-[12px] text-cream-dim">No visitor data yet — it builds up as people visit.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {countries.map((c) => (
                <li key={c.country}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="text-cream">{countryName(c.country)}</span>
                    <span className="text-cream-dim">{c.visitors} visitor{c.visitors === 1 ? "" : "s"}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-champagne-deep to-champagne"
                      style={{ width: `${Math.max(4, (c.visitors / maxCountry) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top pages */}
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          <h3 className="text-[13px] font-semibold text-cream">
            Top pages <span className="ml-1 text-[11px] font-normal text-cream-dim">last 30 days</span>
          </h3>
          {pages.length === 0 ? (
            <p className="mt-4 text-[12px] text-cream-dim">No page data yet.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {pages.map((p) => (
                <li key={p.path}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
                    <span className="truncate text-cream">{p.path}</span>
                    <span className="shrink-0 text-cream-dim">{p.views} views · {p.visitors} visitors</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-champagne-deep to-champagne"
                      style={{ width: `${Math.max(4, (p.views / maxPage) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          <h3 className="text-[13px] font-semibold text-cream">
            Recent activity <span className="ml-1 text-[11px] font-normal text-cream-dim">latest 30 events</span>
          </h3>
          {activity.length === 0 ? (
            <p className="mt-4 text-[12px] text-cream-dim">No activity yet.</p>
          ) : (
            <ul className="mt-4 max-h-[420px] space-y-1 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-cream/[0.03]">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.type === "action" ? "bg-champagne" : "bg-cream/30"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] text-cream">
                      {a.type === "action" ? actionLabel(a.detail) : <>Viewed <span className="text-cream-muted">{a.path}</span></>}
                    </div>
                    <div className="text-[11px] text-cream-dim">
                      {countryName(a.country || "Unknown")} · {a.device || "Desktop"} · {ago(a.created_at)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-cream-dim">
        Anonymous first-party analytics — random session id, country and device only. No IPs or personal
        data are stored. Your own visits to /admin are not tracked.
      </p>
    </div>
  );
}
