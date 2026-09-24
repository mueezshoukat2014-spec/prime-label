"use client";

import { useCallback, useEffect, useState } from "react";
import { num } from "@/lib/biz/money";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-[13px] text-cream outline-none focus:border-champagne/50";
const label = "mb-1 block text-[10px] uppercase tracking-wide2 text-cream-dim";

type Tier = { qty: number; amount: number; pkr: number; currency: string; rate: number };

export default function ProductCostsManager() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/biz/product-costs");
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setRows(j.products);
  }, []);
  useEffect(() => { load(); }, [load]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/biz/product-costs", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editId ?? undefined }),
    });
    const j = await res.json().catch(() => ({}));
    if (j?.ok) { flash("Saved"); setForm(null); setEditId(null); load(); }
    else flash(j?.error || "Save failed");
  }

  function setTier(i: number, patch: Partial<Tier>) {
    setForm((f: any) => {
      const tiers = [...f.tiers];
      const t = { ...tiers[i], ...patch };
      t.pkr = t.currency === "PKR" ? t.amount : t.amount * (t.rate || 1);
      tiers[i] = t;
      return { ...f, tiers };
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Products &amp; Costs</h1>
          <p className="mt-1 text-[12.5px] text-cream-muted">
            Internal cost book. Quantity tiers suggest default production costs for new orders — historical orders never change.
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ product_name: "", category: "", notes: "", tiers: [{ qty: 250, amount: 0, currency: "PKR", rate: 1, pkr: 0 }] }); setEditId(null); }}>
          + New Product Cost
        </button>
      </div>

      {toast && <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">{toast}</div>}

      {form && (
        <form onSubmit={save} className="space-y-3 rounded-2xl border border-champagne/25 bg-cream/[0.03] p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div><span className={label}>Product name *</span><input className={input} required value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} /></div>
            <div><span className={label}>Category</span><input className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><span className={label}>Notes</span><input className={input} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <div>
            <span className={label}>Quantity-based costs (PKR)</span>
            <div className="space-y-2">
              {form.tiers.map((t: Tier, i: number) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input className={input + " w-28"} type="number" min={1} placeholder="Qty" value={t.qty || ""} onChange={(e) => setTier(i, { qty: num(e.target.value) })} />
                  <span className="text-[11px] text-cream-dim">units →</span>
                  <input className={input + " w-32"} type="number" min={0} placeholder="Cost PKR" value={t.amount || ""} onChange={(e) => setTier(i, { amount: num(e.target.value), currency: "PKR" })} />
                  <span className="text-[11px] text-cream-dim">PKR</span>
                  <button type="button" className="text-[11.5px] text-red-400" onClick={() => setForm({ ...form, tiers: form.tiers.filter((_: Tier, x: number) => x !== i) })}>remove</button>
                </div>
              ))}
              <button type="button" className="text-[12px] text-champagne hover:underline" onClick={() => setForm({ ...form, tiers: [...form.tiers, { qty: 0, amount: 0, currency: "PKR", rate: 1, pkr: 0 }] })}>+ add tier</button>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">{editId ? "Save changes" : "Add product"}</button>
            <button type="button" className="btn-ghost" onClick={() => { setForm(null); setEditId(null); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {rows.map((p) => {
          const tiers: Tier[] = typeof p.tiers === "string" ? JSON.parse(p.tiers) : p.tiers || [];
          return (
            <div key={p.id} className="rounded-2xl border border-cream/10 bg-cream/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13.5px] font-medium text-cream">{p.product_name} <span className="ml-2 text-[11px] text-cream-dim">{p.category}</span></p>
                <button className="text-[11.5px] text-champagne hover:underline" onClick={() => { setEditId(p.id); setForm({ product_name: p.product_name, category: p.category, notes: p.notes, tiers: tiers.length ? tiers : [{ qty: 250, amount: 0, currency: "PKR", rate: 1, pkr: 0 }] }); }}>Edit</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {tiers.map((t, i) => (
                  <span key={i} className="rounded-full border border-cream/10 bg-cream/[0.04] px-2.5 py-1 text-[11px] text-cream-muted">
                    {Number(t.qty).toLocaleString()} → PKR {Number(t.pkr).toLocaleString()}
                  </span>
                ))}
                {tiers.length === 0 && <span className="text-[11px] text-cream-dim">No cost tiers yet.</span>}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="py-8 text-center text-[12.5px] text-cream-dim">No products in the cost book yet.</p>}
      </div>
    </div>
  );
}
