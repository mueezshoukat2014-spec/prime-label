"use client";

import { useCallback, useEffect, useState } from "react";
import { fmt, num } from "@/lib/biz/money";

export default function PaymentsManager() {
  const [rows, setRows] = useState<any[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/biz/payments");
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setRows(j.payments);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function voidPay(id: number) {
    if (!confirm("Void this payment? It stays in history but stops counting.")) return;
    await fetch("/api/admin/biz/payments", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    load();
  }

  const totalPkr = rows.reduce((s, p) => s + num(p.received_pkr), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="display text-3xl">Payments</h1>
        <p className="mt-1 text-[12.5px] text-cream-muted">
          Every receipt with order currency, actual received currency and effective rate. Total received: <b className="text-emerald-400">{fmt(totalPkr)}</b>
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[820px] text-left text-[12.5px]">
          <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
            <tr>
              <th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Order</th>
              <th className="px-3 py-2.5">Customer</th><th className="px-3 py-2.5">Method</th>
              <th className="px-3 py-2.5 text-right">Order amount</th>
              <th className="px-3 py-2.5 text-right">Received (actual)</th>
              <th className="px-3 py-2.5 text-right">Eff. rate</th><th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-cream/5">
                <td className="px-3 py-2.5 text-cream-dim">{p.date}</td>
                <td className="px-3 py-2.5 text-champagne">{p.order_ref || "—"}</td>
                <td className="px-3 py-2.5 text-cream">{p.customer_name || ""}</td>
                <td className="px-3 py-2.5 text-cream-muted">{p.method}{p.wu_ref ? ` · ${p.wu_ref}` : ""}</td>
                <td className="px-3 py-2.5 text-right text-cream">{fmt(num(p.order_amount), p.order_currency)}</td>
                <td className="px-3 py-2.5 text-right text-emerald-400">{fmt(num(p.received_amount), p.received_currency)} <span className="text-cream-dim">= {fmt(num(p.received_pkr))}</span></td>
                <td className="px-3 py-2.5 text-right text-cream-muted">{num(p.rate) || "—"}</td>
                <td className="px-3 py-2.5 text-right"><button className="text-[11.5px] text-cream-dim hover:text-red-400" onClick={() => voidPay(p.id)}>Void</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-cream-dim">No payments recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
