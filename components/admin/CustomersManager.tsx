"use client";

import { useCallback, useEffect, useState } from "react";
import { CUSTOMER_TYPES } from "@/lib/biz/money";

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

  const load = useCallback(async (query = "") => {
    const res = await fetch("/api/admin/biz/customers" + (query ? `?q=${encodeURIComponent(query)}` : ""));
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setRows(j.customers);
  }, []);
  useEffect(() => { load(); }, [load]);

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
              <tr key={c.id} className="border-t border-cream/5">
                <td className="px-3 py-2.5"><span className="text-cream">{c.full_name}</span>{c.brand_name && <span className="ml-2 text-champagne">{c.brand_name}</span>}</td>
                <td className="px-3 py-2.5 text-cream-muted">{c.country || "—"}</td>
                <td className="px-3 py-2.5 text-cream-muted">{c.whatsapp || "—"}</td>
                <td className="px-3 py-2.5 text-cream-muted">{c.customer_type}</td>
                <td className="px-3 py-2.5 text-cream-dim">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-3 py-2.5 text-right">
                  <button className="mr-2 text-[11.5px] text-champagne hover:underline" onClick={() => { setEditId(c.id); setForm({ ...empty, ...c }); }}>Edit</button>
                  <button className="text-[11.5px] text-cream-dim hover:text-red-400" onClick={() => archive(c)}>Archive</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-cream-dim">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
