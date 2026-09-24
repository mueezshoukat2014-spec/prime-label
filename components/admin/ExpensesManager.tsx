"use client";

import { useCallback, useEffect, useState } from "react";
import { AD_PLATFORMS, CURRENCIES, EXPENSE_CATEGORIES, PAYMENT_METHODS, fmt, num } from "@/lib/biz/money";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-[13px] text-cream outline-none focus:border-champagne/50";
const label = "mb-1 block text-[10px] uppercase tracking-wide2 text-cream-dim";

const TYPES = ["GENERAL BUSINESS EXPENSE", "ADVERTISING / MARKETING", "ORDER-SPECIFIC COST"] as const;

const emptyForm = {
  date: new Date().toISOString().slice(0, 10), expense_type: "GENERAL BUSINESS EXPENSE",
  category: "Other", description: "", amount: "", currency: "PKR", rate: "",
  method: "Cash", vendor: "", platform: "Meta", campaign: "", order_id: "", notes: "",
};

export default function ExpensesManager() {
  const [rows, setRows] = useState<any[]>([]);
  const [month, setMonth] = useState("");
  const [form, setForm] = useState<any>(null);
  const [toast, setToast] = useState("");

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2000); };
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const load = useCallback(async (m = "") => {
    const res = await fetch("/api/admin/biz/expenses" + (m ? `?month=${m}` : ""));
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setRows(j.expenses);
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = rows.filter((r) => !r.void);
  const monthTotal = shown.reduce((s, r) => s + num(r.pkr), 0);
  const adTotal = shown.filter((r) => String(r.expense_type).includes("ADVERT") || r.category === "Advertising")
    .reduce((s, r) => s + num(r.pkr), 0);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/biz/expenses", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const j = await res.json().catch(() => ({}));
    if (j?.ok) { flash("Expense recorded"); setForm(null); load(month); }
    else flash(j?.error || "Save failed");
  }

  async function voidRow(r: any) {
    if (!confirm("Void this expense? It will stay listed but leave all totals.")) return;
    await fetch("/api/admin/biz/expenses", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, void: true }),
    });
    flash("Voided"); load(month);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Expenses</h1>
          <p className="mt-1 text-[12.5px] text-cream-muted">General costs + advertising. These reduce CASH and NET profit — never mix with per-order costs.</p>
        </div>
        <button className="btn-primary" onClick={() => setForm({ ...emptyForm })}>+ Record expense</button>
      </div>

      {toast && <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">{toast}</div>}

      <div className="flex flex-wrap items-center gap-3">
        <input className={input + " w-44"} type="month" value={month} onChange={(e) => { setMonth(e.target.value); load(e.target.value); }} />
        <div className="rounded-xl border border-cream/10 bg-cream/[0.03] px-4 py-2 text-[12px]">
          Total (shown): <b className="text-red-300">{fmt(monthTotal)}</b>
          <span className="mx-2 text-cream-dim">·</span>
          Advertising: <b className="text-champagne">{fmt(adTotal)}</b>
        </div>
      </div>

      {form && (
        <form onSubmit={save} className="grid gap-3 rounded-2xl border border-champagne/25 bg-cream/[0.03] p-4 sm:grid-cols-4">
          <div><span className={label}>Type</span>
            <select className={input} value={form.expense_type} onChange={(e) => set("expense_type", e.target.value)}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div><span className={label}>Date</span><input className={input} type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
          <div><span className={label}>Category</span>
            <select className={input} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select></div>
          <div><span className={label}>Description</span><input className={input} required value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Meta ads — August boost" /></div>
          <div><span className={label}>Amount *</span><input className={input} type="number" step="0.01" required value={form.amount} onChange={(e) => set("amount", e.target.value)} /></div>
          <div><span className={label}>Currency</span>
            <select className={input} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select></div>
          {form.currency !== "PKR" && (
            <div><span className={label}>Rate (PKR per 1 {form.currency})</span><input className={input} type="number" step="0.01" value={form.rate} onChange={(e) => set("rate", e.target.value)} /></div>
          )}
          <div><span className={label}>Paid via</span>
            <select className={input} value={form.method} onChange={(e) => set("method", e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select></div>
          {String(form.expense_type).includes("ADVERT") && (
            <>
              <div><span className={label}>Platform</span>
                <select className={input} value={form.platform} onChange={(e) => set("platform", e.target.value)}>
                  {AD_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                </select></div>
              <div><span className={label}>Campaign (optional)</span><input className={input} value={form.campaign} onChange={(e) => set("campaign", e.target.value)} /></div>
            </>
          )}
          {String(form.expense_type).includes("ORDER") && (
            <div><span className={label}>Order ID</span><input className={input} type="number" value={form.order_id} onChange={(e) => set("order_id", e.target.value)} placeholder="links to order" /></div>
          )}
          <div><span className={label}>Vendor</span><input className={input} value={form.vendor} onChange={(e) => set("vendor", e.target.value)} /></div>
          <div className="flex items-end gap-2 sm:col-span-4">
            <button className="btn-primary" type="submit">Save expense</button>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[760px] text-left text-[12.5px]">
          <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
            <tr><th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Type / Category</th><th className="px-3 py-2.5">Description</th><th className="px-3 py-2.5 text-right">Amount</th><th className="px-3 py-2.5 text-right">PKR</th><th className="px-3 py-2.5"></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={`border-t border-cream/5 ${r.void ? "opacity-40" : ""}`}>
                <td className="px-3 py-2.5 text-cream-muted">{String(r.date).slice(0, 10)}</td>
                <td className="px-3 py-2.5"><span className={String(r.expense_type).includes("ADVERT") ? "text-champagne" : "text-cream"}>{r.category}</span><span className="ml-2 text-[10.5px] text-cream-dim">{r.platform || r.expense_type}</span></td>
                <td className="px-3 py-2.5 text-cream-muted">{r.description}{r.campaign ? ` · ${r.campaign}` : ""}</td>
                <td className="px-3 py-2.5 text-right text-cream">{fmt(num(r.amount), r.currency)}</td>
                <td className="px-3 py-2.5 text-right text-red-300">{fmt(num(r.pkr))}</td>
                <td className="px-3 py-2.5 text-right">
                  {!r.void && <button className="text-[11.5px] text-cream-dim hover:text-red-400" onClick={() => voidRow(r)}>Void</button>}
                  {r.void && <span className="text-[10.5px] text-red-400">VOID</span>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-cream-dim">No expenses recorded.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
