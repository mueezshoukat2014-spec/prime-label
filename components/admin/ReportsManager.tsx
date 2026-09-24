"use client";

import { useCallback, useEffect, useState } from "react";
import { fmt, num } from "@/lib/biz/money";

const th = "px-3 py-2.5";

function csv(name: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const head = Object.keys(rows[0]);
  const body = [head.join(","), ...rows.map((r) => head.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
  a.download = name;
  a.click();
}

export default function ReportsManager() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const j = await fetch("/api/admin/biz/reports").then((r) => r.json()).catch(() => ({}));
    if (j?.ok) setData(j); else setErr("Could not load reports.");
  }, []);
  useEffect(() => { load(); }, [load]);

  if (err) return <p className="text-[13px] text-red-300">{err}</p>;
  if (!data) return <p className="text-[13px] text-cream-dim">Loading reports…</p>;

  const t = data.totals;
  const cash = data.cash;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Reports</h1>
          <p className="mt-1 text-[12.5px] text-cream-muted">Everything computed live from your real records. PKR is the base currency.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => csv("monthly-pl.csv", data.monthly)}>Export monthly CSV</button>
          <button className="btn-ghost" onClick={() => csv("outstanding.csv", data.outstanding)}>Export outstanding CSV</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { l: "Total orders", v: String(t.orders) },
          { l: "Customers", v: String(t.customers) },
          { l: "Lifetime billed", v: fmt(t.billedPkr) },
          { l: "Lifetime gross profit", v: fmt(t.grossPkr) },
          { l: "Outstanding", v: fmt(t.outstandingPkr), warn: t.outstandingPkr > 0 },
          { l: "CASH IN HAND", v: fmt(cash?.current ?? 0), gold: true },
        ].map((x: any) => (
          <div key={x.l} className="rounded-xl border border-cream/10 bg-cream/[0.03] px-3 py-2.5">
            <p className="text-[9.5px] uppercase tracking-wide2 text-cream-dim">{x.l}</p>
            <p className={`mt-0.5 text-[15px] font-semibold ${x.gold ? "text-champagne" : x.warn ? "text-red-300" : "text-cream"}`}>{x.v}</p>
          </div>
        ))}
      </div>

      {/* Monthly P&L */}
      <section>
        <h2 className="mb-2 text-[12px] uppercase tracking-wide2 text-champagne">Monthly profit &amp; cash</h2>
        <div className="overflow-x-auto rounded-2xl border border-cream/10">
          <table className="w-full min-w-[980px] text-left text-[12.5px]">
            <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
              <tr>
                <th className={th}>Month</th><th className={th + " text-right"}>Orders</th>
                <th className={th + " text-right"}>Billed (PKR)</th><th className={th + " text-right"}>Order costs</th>
                <th className={th + " text-right"}>Gross profit</th><th className={th + " text-right"}>Received (PKR)</th>
                <th className={th + " text-right"}>Expenses</th><th className={th + " text-right"}>Ads</th>
                <th className={th + " text-right"}>Net profit*</th><th className={th + " text-right"}>Cash moved</th>
              </tr>
            </thead>
            <tbody>
              {[...data.monthly].reverse().map((m: any) => (
                <tr key={m.month} className="border-t border-cream/5">
                  <td className={th + " text-champagne"}>{m.month}</td>
                  <td className={th + " text-right text-cream"}>{m.orders}</td>
                  <td className={th + " text-right text-cream"}>{fmt(m.billedPkr)}</td>
                  <td className={th + " text-right text-red-300"}>{fmt(m.costsPkr)}</td>
                  <td className={th + " text-right text-emerald-400"}>{fmt(m.grossPkr)}</td>
                  <td className={th + " text-right text-cream-muted"}>{fmt(m.receivedPkr)}</td>
                  <td className={th + " text-right text-red-300"}>{fmt(m.expensesPkr)}</td>
                  <td className={th + " text-right text-cream-muted"}>{fmt(m.adSpendPkr)}</td>
                  <td className={th + " text-right font-semibold text-cream"}>{fmt(m.grossPkr - m.expensesPkr)}</td>
                  <td className={th + " text-right text-cream-muted"}>{fmt(m.netCashPkr)}</td>
                </tr>
              ))}
              {data.monthly.length === 0 && <tr><td colSpan={10} className="px-3 py-8 text-center text-cream-dim">No data yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-[11px] text-cream-dim">* Net profit = gross profit − general expenses (advertising included). Cash moved is actual PKR in/out — cash ≠ profit.</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* By country */}
        <section>
          <h2 className="mb-2 text-[12px] uppercase tracking-wide2 text-champagne">Sales by country</h2>
          <div className="overflow-hidden rounded-2xl border border-cream/10">
            <table className="w-full text-left text-[12.5px]">
              <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
                <tr><th className={th}>Country</th><th className={th + " text-right"}>Orders</th><th className={th + " text-right"}>Billed</th><th className={th + " text-right"}>Gross</th></tr>
              </thead>
              <tbody>
                {data.byCountry.map((r: any) => (
                  <tr key={r.country} className="border-t border-cream/5">
                    <td className={th + " text-cream"}>{r.country}</td><td className={th + " text-right text-cream-muted"}>{r.count}</td>
                    <td className={th + " text-right text-cream"}>{fmt(r.billedPkr)}</td><td className={th + " text-right text-emerald-400"}>{fmt(r.grossPkr)}</td>
                  </tr>
                ))}
                {data.byCountry.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-cream-dim">—</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* By product */}
        <section>
          <h2 className="mb-2 text-[12px] uppercase tracking-wide2 text-champagne">Sales by product</h2>
          <div className="overflow-hidden rounded-2xl border border-cream/10">
            <table className="w-full text-left text-[12.5px]">
              <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
                <tr><th className={th}>Product</th><th className={th + " text-right"}>Orders</th><th className={th + " text-right"}>Billed</th><th className={th + " text-right"}>Gross</th></tr>
              </thead>
              <tbody>
                {data.byProduct.map((r: any) => (
                  <tr key={r.product} className="border-t border-cream/5">
                    <td className={th + " text-cream"}>{r.product}</td><td className={th + " text-right text-cream-muted"}>{r.count}</td>
                    <td className={th + " text-right text-cream"}>{fmt(r.billedPkr)}</td><td className={th + " text-right text-emerald-400"}>{fmt(r.grossPkr)}</td>
                  </tr>
                ))}
                {data.byProduct.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-cream-dim">—</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* Advertising */}
        <section>
          <h2 className="mb-2 text-[12px] uppercase tracking-wide2 text-champagne">Advertising spend (PKR)</h2>
          <div className="overflow-hidden rounded-2xl border border-cream/10">
            <table className="w-full text-left text-[12.5px]">
              <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
                <tr><th className={th}>Platform</th><th className={th + " text-right"}>Total spend</th></tr>
              </thead>
              <tbody>
                {data.ads.byPlatform.map((r: any) => (
                  <tr key={r.platform} className="border-t border-cream/5">
                    <td className={th + " text-cream"}>{r.platform}</td><td className={th + " text-right text-red-300"}>{fmt(r.pkr)}</td>
                  </tr>
                ))}
                {data.ads.byPlatform.length === 0 && <tr><td colSpan={2} className="px-3 py-6 text-center text-cream-dim">No ad spend recorded (Expenses → ADVERTISING).</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top customers */}
        <section>
          <h2 className="mb-2 text-[12px] uppercase tracking-wide2 text-champagne">Top customers (lifetime gross)</h2>
          <div className="overflow-hidden rounded-2xl border border-cream/10">
            <table className="w-full text-left text-[12.5px]">
              <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
                <tr><th className={th}>Customer</th><th className={th + " text-right"}>Orders</th><th className={th + " text-right"}>Gross</th><th className={th + " text-right"}>Due</th></tr>
              </thead>
              <tbody>
                {data.byCustomer.map((r: any, i: number) => (
                  <tr key={i} className="border-t border-cream/5">
                    <td className={th + " text-cream"}>{r.name}</td><td className={th + " text-right text-cream-muted"}>{r.orders}</td>
                    <td className={th + " text-right text-emerald-400"}>{fmt(r.grossPkr)}</td>
                    <td className={th + " text-right text-red-300"}>{r.outstandingPkr > 0 ? fmt(r.outstandingPkr) : "—"}</td>
                  </tr>
                ))}
                {data.byCustomer.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-cream-dim">—</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Outstanding */}
      <section>
        <h2 className="mb-2 text-[12px] uppercase tracking-wide2 text-champagne">Outstanding payments ({data.outstanding.length})</h2>
        <div className="overflow-x-auto rounded-2xl border border-cream/10">
          <table className="w-full min-w-[760px] text-left text-[12.5px]">
            <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
              <tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Country</th><th className={th + " text-right"}>Due</th><th className={th + " text-right"}>PKR equiv.</th><th className={th}>Payment</th></tr>
            </thead>
            <tbody>
              {data.outstanding.map((r: any) => (
                <tr key={r.order_ref || r.name} className="border-t border-cream/5">
                  <td className={th + " text-champagne"}>{r.order_ref}</td>
                  <td className={th + " text-cream"}>{r.brand !== "Direct / walk-in" ? r.brand : r.name}</td>
                  <td className={th + " text-cream-muted"}>{r.country}</td>
                  <td className={th + " text-right text-cream"}>{fmt(num(r.outstandingCcy), r.currency)}</td>
                  <td className={th + " text-right text-red-300"}>{fmt(r.outstandingPkr)}</td>
                  <td className={th}><span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300">{r.payment_status}</span></td>
                </tr>
              ))}
              {data.outstanding.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-cream-dim">Nothing outstanding. 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Follow-ups */}
      {data.followUps.length > 0 && (
        <section>
          <h2 className="mb-2 text-[12px] uppercase tracking-wide2 text-champagne">Open quotations &amp; follow-ups</h2>
          <div className="overflow-hidden rounded-2xl border border-cream/10">
            <table className="w-full text-left text-[12.5px]">
              <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
                <tr><th className={th}>Quote</th><th className={th}>Status</th><th className={th}>Follow-up</th><th className={th + " text-right"}>Value</th></tr>
              </thead>
              <tbody>
                {data.followUps.map((r: any) => (
                  <tr key={r.id} className="border-t border-cream/5">
                    <td className={th + " text-champagne"}>{r.q_number}</td>
                    <td className={th + " text-cream-muted"}>{r.status}</td>
                    <td className={th + (r.follow_up_at ? " text-cream" : " text-cream-dim")}>{r.follow_up_at ? String(r.follow_up_at).slice(0, 10) : "—"}</td>
                    <td className={th + " text-right text-cream"}>{fmt(num(r.grand_total), r.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
