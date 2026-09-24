"use client";

import { useCallback, useEffect, useState } from "react";
import { CURRENCIES, PAYMENT_METHODS, fmt, num } from "@/lib/biz/money";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-[13px] text-cream outline-none focus:border-champagne/50";
const label = "mb-1 block text-[10px] uppercase tracking-wide2 text-cream-dim";

export default function CashManager() {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [opening, setOpening] = useState("");
  const [toast, setToast] = useState("");

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2000); };
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/biz/cash");
    const j = await res.json().catch(() => ({}));
    if (j?.ok) { setData(j); setOpening(String(j.opening ?? 0)); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/biz/cash", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const j = await res.json().catch(() => ({}));
    if (j?.ok) { flash("Recorded"); setForm(null); load(); }
    else flash(j?.error || "Save failed");
  }

  async function saveOpening() {
    await fetch("/api/admin/biz/cash", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "opening", value: parseFloat(opening) || 0 }),
    });
    flash("Opening cash saved"); load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this owner transaction?")) return;
    await fetch(`/api/admin/biz/cash?id=${id}`, { method: "DELETE" });
    flash("Deleted"); load();
  }

  const c = data?.cash;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Business Cash</h1>
          <p className="mt-1 text-[12.5px] text-cream-muted">Real money only — <b className="text-champagne">cash ≠ profit</b>. Owner investment and withdrawals stay separate from sales.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => setForm({ kind: "INVESTMENT", date: new Date().toISOString().slice(0, 10), amount: "", currency: "PKR", rate: "", method: "Cash", reason: "", notes: "" })}>+ Investment</button>
          <button className="btn-primary" onClick={() => setForm({ kind: "WITHDRAWAL", date: new Date().toISOString().slice(0, 10), amount: "", currency: "PKR", rate: "", method: "Cash", reason: "", notes: "" })}>+ Withdrawal</button>
        </div>
      </div>

      {toast && <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">{toast}</div>}

      {c && (
        <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { l: "Opening cash", v: c.openingCash, cls: "text-cream" },
            { l: "Customer receipts", v: c.moneyIn, cls: "text-emerald-400" },
            { l: "Owner investment", v: c.invest, cls: "text-emerald-400" },
            { l: "Order costs paid", v: -c.costsOut, cls: "text-red-300" },
            { l: "Delivery paid", v: -c.deliveryOut, cls: "text-red-300" },
            { l: "Expenses", v: -c.expensesOut, cls: "text-red-300" },
            { l: "Owner withdrawals", v: -c.withdraw, cls: "text-red-300" },
            { l: "CASH IN HAND", v: c.current, cls: "text-champagne text-[15px]" },
          ].map((x) => (
            <div key={x.l} className="rounded-xl border border-cream/10 bg-cream/[0.03] px-3 py-2">
              <p className="text-[9.5px] uppercase tracking-wide2 text-cream-dim">{x.l}</p>
              <p className={`mt-0.5 font-semibold ${x.cls}`}>{fmt(x.v)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-cream/10 bg-cream/[0.02] p-4">
        <div className="w-52">
          <span className={label}>Opening cash (PKR) — starting balance</span>
          <input className={input} type="number" step="0.01" value={opening} onChange={(e) => setOpening(e.target.value)} />
        </div>
        <button className="btn-ghost" onClick={saveOpening}>Save opening balance</button>
      </div>

      {form && (
        <form onSubmit={save} className="grid gap-3 rounded-2xl border border-champagne/25 bg-cream/[0.03] p-4 sm:grid-cols-4">
          <div><span className={label}>Type</span>
            <select className={input} value={form.kind} onChange={(e) => set("kind", e.target.value)}>
              <option>INVESTMENT</option><option>WITHDRAWAL</option>
            </select></div>
          <div><span className={label}>Date</span><input className={input} type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
          <div><span className={label}>Amount *</span><input className={input} type="number" step="0.01" required value={form.amount} onChange={(e) => set("amount", e.target.value)} /></div>
          <div><span className={label}>Currency</span>
            <select className={input} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCIES.map((x) => <option key={x}>{x}</option>)}
            </select></div>
          {form.currency !== "PKR" && (
            <div><span className={label}>Rate (PKR per 1 {form.currency})</span><input className={input} type="number" step="0.01" value={form.rate} onChange={(e) => set("rate", e.target.value)} /></div>
          )}
          <div><span className={label}>Method</span>
            <select className={input} value={form.method} onChange={(e) => set("method", e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select></div>
          <div><span className={label}>Reason</span><input className={input} value={form.reason} onChange={(e) => set("reason", e.target.value)} placeholder="Personal need / capital added" /></div>
          <div className="flex items-end gap-2 sm:col-span-4">
            <button className="btn-primary" type="submit">Save</button>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[640px] text-left text-[12.5px]">
          <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
            <tr><th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Type</th><th className="px-3 py-2.5">Reason</th><th className="px-3 py-2.5 text-right">Amount</th><th className="px-3 py-2.5 text-right">PKR</th><th className="px-3 py-2.5"></th></tr>
          </thead>
          <tbody>
            {(data?.owner || []).map((t: any) => (
              <tr key={t.id} className="border-t border-cream/5">
                <td className="px-3 py-2.5 text-cream-muted">{String(t.date).slice(0, 10)}</td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.kind === "INVESTMENT" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>{t.kind}</span>
                </td>
                <td className="px-3 py-2.5 text-cream-muted">{t.reason || "—"}</td>
                <td className="px-3 py-2.5 text-right text-cream">{fmt(num(t.amount), t.currency)}</td>
                <td className={`px-3 py-2.5 text-right ${t.kind === "INVESTMENT" ? "text-emerald-400" : "text-red-300"}`}>
                  {t.kind === "INVESTMENT" ? "+" : "−"}{fmt(num(t.pkr))}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button className="text-[11.5px] text-cream-dim hover:text-red-400" onClick={() => remove(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {(data?.owner || []).length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-cream-dim">No owner transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
