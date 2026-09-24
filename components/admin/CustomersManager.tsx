"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CUSTOMER_TYPES, fmt, num } from "@/lib/biz/money";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-[13px] text-cream outline-none focus:border-champagne/50";
const label = "mb-1 block text-[10px] uppercase tracking-wide2 text-cream-dim";

type Customer = Record<string, any>;

const empty = {
  full_name: "", brand_name: "", country: "", city: "", whatsapp: "",
  email: "", instagram: "", address: "", customer_type: "New Brand", notes: "",
};

export default function CustomersManager() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [ledger, setLedger] = useState<any>(null);

  const load = useCallback(async (query = "") => {
    const res = await fetch("/api/admin/biz/customers" + (query ? `?q=${encodeURIComponent(query)}` : ""));
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setRows(j.customers);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function toggleLedger(id: number) {
    if (openId === id) { setOpenId(null); setLedger(null); return; }
    setOpenId(id); setLedger(null);
    const res = await fetch(`/api/admin/biz/customers?id=${id}`);
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setLedger(j);
  }

  /** Copy the customer's last order into a new-order form on the Orders tab. */
  function reorder(c: Customer, ledgerData: any) {
    const last = ledgerData?.orders?.[0];
    window.dispatchEvent(new CustomEvent("biz:navigate", { detail: { tab: "orders" } }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("biz:new-order", {
        detail: {
          name: c.brand_name || c.full_name, customer_id: c.id, country: c.country,
          currency: last?.currency || "PKR", rate: last?.rate || "",
          product: last?.product || "", quantity: last?.quantity || "",
        },
      }));
    }, 150);
  }

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/biz/customers", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editId ?? undefined }),
    });
    const j = await res.json().catch(() => ({}));
    if (j?.ok) { flash(editId ? "Customer updated" : "Customer added"); setForm(null); setEditId(null); load(q); }
    else flash(j?.error || "Save failed");
  }

  async function archive(c: Customer) {
    if (!confirm(`Archive ${c.full_name}? Records stay in ledgers.`)) return;
    await fetch("/api/admin/biz/customers", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, archived: true }),
    });
    flash("Archived"); load(q);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Customers</h1>
          <p className="mt-1 text-[12.5px] text-cream-muted">Customer book for orders, ledgers and repeats.</p>
        </div>
        <button onClick={() => { setForm({ ...empty }); setEditId(null); }} className="btn-primary">+ New Customer</button>
      </div>

      {toast && <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">{toast}</div>}

      <input className={input} placeholder="Search name / brand / WhatsApp / email…" value={q}
        onChange={(e) => { setQ(e.target.value); load(e.target.value); }} />

      {form && (
        <form onSubmit={save} className="grid gap-3 rounded-2xl border border-champagne/25 bg-cream/[0.03] p-4 sm:grid-cols-3">
          <div><span className={label}>Full name *</span><input className={input} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required /></div>
          <div><span className={label}>Brand name</span><input className={input} value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} /></div>
          <div><span className={label}>Customer type</span>
            <select className={input} value={form.customer_type} onChange={(e) => set("customer_type", e.target.value)}>
              {CUSTOMER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div><span className={label}>Country</span><input className={input} value={form.country} onChange={(e) => set("country", e.target.value)} /></div>
          <div><span className={label}>City</span><input className={input} value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
          <div><span className={label}>WhatsApp</span><input className={input} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+966 5…" /></div>
          <div><span className={label}>Email</span><input className={input} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><span className={label}>Instagram</span><input className={input} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
          <div><span className={label}>Address</span><input className={input} value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="sm:col-span-3"><span className={label}>Notes</span><textarea className={input + " resize-none"} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
          <div className="flex gap-2 sm:col-span-3">
            <button className="btn-primary" type="submit">{editId ? "Save changes" : "Add customer"}</button>
            <button type="button" className="btn-ghost" onClick={() => { setForm(null); setEditId(null); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[720px] text-left text-[12.5px]">
          <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
            <tr><th className="px-3 py-2.5">Customer</th><th className="px-3 py-2.5">Country</th><th className="px-3 py-2.5">WhatsApp</th><th className="px-3 py-2.5">Type</th><th className="px-3 py-2.5">Since</th><th className="px-3 py-2.5"></th></tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <React.Fragment key={c.id}>
              <tr className="cursor-pointer border-t border-cream/5 hover:bg-cream/[0.03]" onClick={() => toggleLedger(c.id)}>
                <td className="px-3 py-2.5"><span className="text-cream">{c.full_name}</span>{c.brand_name && <span className="ml-2 text-champagne">{c.brand_name}</span>}</td>
                <td className="px-3 py-2.5 text-cream-muted">{c.country || "—"}</td>
                <td className="px-3 py-2.5 text-cream-muted">{c.whatsapp || "—"}</td>
                <td className="px-3 py-2.5 text-cream-muted">{c.customer_type}</td>
                <td className="px-3 py-2.5 text-cream-dim">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <button className="mr-2 text-[11.5px] text-champagne hover:underline" onClick={() => { setEditId(c.id); setForm({ ...empty, ...c }); }}>Edit</button>
                  <button className="text-[11.5px] text-cream-dim hover:text-red-400" onClick={() => archive(c)}>Archive</button>
                </td>
              </tr>
              {openId === c.id && (
                <tr className="border-t border-cream/5 bg-cream/[0.02]">
                  <td colSpan={6} className="px-4 py-4">
                    {!ledger && <p className="text-[12px] text-cream-dim">Loading ledger…</p>}
                    {ledger && <CustomerLedger data={ledger} onReorder={() => reorder(ledger.customer, ledger)} />}
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-cream-dim">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerLedger({ data, onReorder }: { data: any; onReorder: () => void }) {
  const s = data.summary;
  const cards = [
    { l: "Orders", v: String(s.orderCount) },
    { l: "Lifetime billed", v: fmt(s.lifetimeBilledPkr) },
    { l: "Lifetime received", v: fmt(s.lifetimeReceivedPkr) },
    { l: "Lifetime gross profit", v: fmt(s.lifetimeGrossPkr) },
    { l: "Outstanding (PKR equiv.)", v: fmt(s.outstandingPkr) },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
          {cards.map((c) => (
            <div key={c.l} className="rounded-xl border border-cream/10 bg-cream/[0.03] px-3 py-2">
              <p className="text-[9.5px] uppercase tracking-wide2 text-cream-dim">{c.l}</p>
              <p className="mt-0.5 text-[13px] font-semibold text-cream">{c.v}</p>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={onReorder}>↻ Reorder</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wide2 text-cream-dim">Order history</p>
          {data.orders.length === 0 && <p className="text-[12px] text-cream-dim">No orders yet.</p>}
          <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
            {data.orders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between text-[12px]">
                <span className="text-champagne">{o.order_ref || `#${o.id}`}</span>
                <span className="text-cream-muted">{new Date(o.created_at).toLocaleDateString()} · {o.product}</span>
                <span className="text-cream">{fmt(num(o.totals?.billedCcy ?? 0), o.currency)}</span>
                <span className={o.totals?.outstandingCcy > 0 ? "text-red-300" : "text-emerald-400"}>
                  {o.totals?.outstandingCcy > 0 ? `due ${fmt(num(o.totals.outstandingCcy), o.currency)}` : "paid"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wide2 text-cream-dim">Payments received</p>
          {data.payments.length === 0 && <p className="text-[12px] text-cream-dim">No payments yet.</p>}
          <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
            {data.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-[12px]">
                <span className="text-cream-muted">{p.date} · {p.method}{p.wu_ref ? ` · ${p.wu_ref}` : ""}</span>
                <span className="text-emerald-400">{fmt(num(p.order_amount), p.order_currency)} → {fmt(num(p.received_pkr))}</span>
              </div>
            ))}
          </div>
          {data.quotations.length > 0 && (
            <>
              <p className="mb-1.5 mt-3 text-[10px] uppercase tracking-wide2 text-cream-dim">Quotations</p>
              <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
                {data.quotations.map((qq: any) => (
                  <div key={qq.id} className="flex items-center justify-between text-[12px]">
                    <span className="text-champagne">{qq.q_number}</span>
                    <span className="text-cream-muted">{qq.status}</span>
                    <span className="text-cream">{fmt(num(qq.grand_total), qq.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
