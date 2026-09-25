"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CURRENCIES, INVOICE_STATUSES, QUOTE_STATUSES, fmt, num,
} from "@/lib/biz/money";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-[13px] text-cream outline-none focus:border-champagne/50";
const label = "mb-1 block text-[10px] uppercase tracking-wide2 text-cream-dim";

const badge = (s: string) =>
  ["ACCEPTED", "PAID", "CONVERTED"].includes(s)
    ? "bg-emerald-500/15 text-emerald-400"
    : ["REJECTED", "EXPIRED", "CANCELLED", "OVERDUE"].includes(s)
      ? "bg-red-500/15 text-red-400"
      : "bg-champagne/15 text-champagne";

export default function DocumentsManager() {
  const [sub, setSub] = useState<"quotes" | "invoices">("quotes");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="display mr-4 text-3xl">Quotes & Invoices</h1>
        {(["quotes", "invoices"] as const).map((s) => (
          <button key={s} onClick={() => setSub(s)}
            className={`rounded-full px-4 py-1.5 text-[12px] ${sub === s ? "bg-champagne text-ink" : "border border-cream/15 text-cream-muted"}`}>
            {s === "quotes" ? "Quotations" : "Invoices"}
          </button>
        ))}
      </div>
      {sub === "quotes" ? <Quotes /> : <Invoices />}
    </div>
  );
}

/* ------------------------------ quotations ------------------------------ */

const emptyQuote = {
  customer: "", customer_id: "", country: "", currency: "PKR", rate: "",
  discount: 0, delivery_charge: 0, production_time: "7–10 working days",
  delivery_time: "", validity_days: 15,
  payment_terms: "50% Advance / 50% Before Delivery", notes: "", follow_up_at: "",
  items: [{ product: "", quantity: "", unit_price: "" }],
};

function Quotes() {
  const [rows, setRows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [toast, setToast] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2000); };

  const load = useCallback(async () => {
    const [q, c] = await Promise.all([
      fetch("/api/admin/biz/quotations").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/biz/customers").then((r) => r.json()).catch(() => ({})),
    ]);
    if (q?.ok) setRows(q.quotes);
    if (c?.ok) setCustomers(c.customers);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function openQuote(id: number) {
    setOpen(open === id ? null : id);
    if (open !== id) {
      const j = await fetch(`/api/admin/biz/quotations?id=${id}`).then((r) => r.json()).catch(() => ({}));
      if (j?.ok) setDetail(j);
    }
  }

  const setItem = (i: number, k: string, v: any) =>
    setForm((f: any) => ({ ...f, items: f.items.map((it: any, j: number) => (j === i ? { ...it, [k]: v } : it)) }));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const cust = customers.find((c) => c.full_name === form.customer || c.brand_name === form.customer);
    const body = { ...form, customer_id: form.customer_id || cust?.id || null, items: form.items.filter((i: any) => i.product) };
    const j = await fetch("/api/admin/biz/quotations", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }).then((r) => r.json()).catch(() => ({}));
    if (j?.ok) { flash(`Quotation ${j.q_number} created`); setForm(null); load(); }
    else flash(j?.error || "Save failed");
  }

  async function patch(id: number, p: any) {
    const j = await fetch("/api/admin/biz/quotations", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...p }),
    }).then((r) => r.json()).catch(() => ({}));
    if (j?.ok) {
      flash(j.order_ref ? `Converted → order ${j.order_ref}` : "Updated");
      const d = await fetch(`/api/admin/biz/quotations?id=${id}`).then((r) => r.json()).catch(() => ({}));
      if (d?.ok) setDetail(d);
      load();
    } else flash(j?.error || "Failed");
  }

  return (
    <div className="space-y-4">
      {toast && <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">{toast}</div>}
      <div className="flex justify-end">
        <button className="btn-primary" onClick={() => setForm({ ...emptyQuote, items: [{ product: "", quantity: "", unit_price: "" }] })}>+ New quotation</button>
      </div>

      {form && (
        <form onSubmit={create} className="space-y-3 rounded-2xl border border-champagne/25 bg-cream/[0.03] p-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div><span className={label}>Customer</span>
              <input className={input} list="q-cust" value={form.customer} onChange={(e) => {
                const v = e.target.value;
                const c = customers.find((x) => x.full_name === v || x.brand_name === v);
                setForm((f: any) => ({ ...f, customer: v, customer_id: c?.id || "", country: c?.country || f.country }));
              }} />
              <datalist id="q-cust">{customers.map((c) => <option key={c.id} value={c.full_name}>{c.brand_name}</option>)}</datalist>
            </div>
            <div><span className={label}>Country</span><input className={input} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
            <div><span className={label}>Currency</span>
              <select className={input} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><span className={label}>Rate (PKR per 1 {form.currency})</span><input className={input} type="number" step="0.01" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} /></div>
          </div>

          <div className="space-y-2">
            <span className={label}>Items</span>
            {form.items.map((it: any, i: number) => (
              <div key={i} className="flex gap-2">
                <input className={input} placeholder="Product" value={it.product} onChange={(e) => setItem(i, "product", e.target.value)} />
                <input className={input + " w-24"} type="number" placeholder="Qty" value={it.quantity} onChange={(e) => setItem(i, "quantity", e.target.value)} />
                <input className={input + " w-32"} type="number" step="0.01" placeholder={`Unit price (${form.currency})`} value={it.unit_price} onChange={(e) => setItem(i, "unit_price", e.target.value)} />
                <button type="button" className="btn-ghost" onClick={() => setForm({ ...form, items: form.items.filter((_: any, j: number) => j !== i) })}>✕</button>
              </div>
            ))}
            <button type="button" className="btn-ghost" onClick={() => setForm({ ...form, items: [...form.items, { product: "", quantity: "", unit_price: "" }] })}>+ Add item</button>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div><span className={label}>Discount ({form.currency})</span><input className={input} type="number" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></div>
            <div><span className={label}>Delivery charge ({form.currency})</span><input className={input} type="number" step="0.01" value={form.delivery_charge} onChange={(e) => setForm({ ...form, delivery_charge: e.target.value })} /></div>
            <div><span className={label}>Production time</span><input className={input} value={form.production_time} onChange={(e) => setForm({ ...form, production_time: e.target.value })} /></div>
            <div><span className={label}>Delivery time</span><input className={input} value={form.delivery_time} onChange={(e) => setForm({ ...form, delivery_time: e.target.value })} /></div>
            <div><span className={label}>Validity (days)</span><input className={input} type="number" value={form.validity_days} onChange={(e) => setForm({ ...form, validity_days: e.target.value })} /></div>
            <div><span className={label}>Follow-up date</span><input className={input} type="date" value={form.follow_up_at} onChange={(e) => setForm({ ...form, follow_up_at: e.target.value })} /></div>
            <div className="sm:col-span-2"><span className={label}>Notes</span><input className={input} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">Create quotation</button>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[780px] text-left text-[12.5px]">
          <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
            <tr><th className="px-3 py-2.5">Quote #</th><th className="px-3 py-2.5">Customer</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Follow-up</th><th className="px-3 py-2.5 text-right">Total</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <React.Fragment key={r.id}>
                <tr className="cursor-pointer border-t border-cream/5 hover:bg-cream/[0.03]" onClick={() => openQuote(r.id)}>
                  <td className="px-3 py-2.5 text-champagne">{r.q_number}</td>
                  <td className="px-3 py-2.5"><span className="text-cream">{r.cust_name || "—"}</span>{r.brand_name && <span className="ml-1 text-cream-dim">· {r.brand_name}</span>}</td>
                  <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge(r.status)}`}>{r.status}</span></td>
                  <td className="px-3 py-2.5 text-cream-muted">{r.follow_up_at ? String(r.follow_up_at).slice(0, 10) : "—"}</td>
                  <td className="px-3 py-2.5 text-right text-cream">{fmt(num(r.grand_total), r.currency)}</td>
                </tr>
                {open === r.id && detail && (
                  <tr className="border-t border-cream/5 bg-cream/[0.02]">
                    <td colSpan={5} className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="grid gap-5 lg:grid-cols-3">
                        <div>
                          <p className="mb-2 text-[10px] uppercase tracking-wide2 text-cream-dim">Items</p>
                          {detail.items.map((it: any) => (
                            <div key={it.id} className="flex justify-between text-[12px]">
                              <span className="text-cream-muted">{it.product} × {num(it.quantity)}</span>
                              <span className="text-cream">{fmt(num(it.subtotal), detail.quote.currency)}</span>
                            </div>
                          ))}
                          <div className="mt-2 border-t border-cream/10 pt-2 text-[12px]">
                            <div className="flex justify-between"><span className="text-cream-dim">Discount</span><span className="text-cream">−{fmt(num(detail.quote.discount), detail.quote.currency)}</span></div>
                            <div className="flex justify-between"><span className="text-cream-dim">Delivery</span><span className="text-cream">{fmt(num(detail.quote.delivery_charge), detail.quote.currency)}</span></div>
                            <div className="mt-1 flex justify-between font-semibold"><span className="text-cream">Grand total</span><span className="text-champagne">{fmt(num(detail.quote.grand_total), detail.quote.currency)}</span></div>
                            <div className="flex justify-between text-[11px] text-cream-dim"><span>PKR equiv.</span><span>{fmt(num(detail.quote.grand_total_pkr))}</span></div>
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] uppercase tracking-wide2 text-cream-dim">Status & follow-up</p>
                          <select className={input} value={detail.quote.status} onChange={(e) => patch(detail.quote.id, { status: e.target.value })}>
                            {QUOTE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <input className={input} type="date" value={String(detail.quote.follow_up_at || "").slice(0, 10)} onChange={(e) => patch(detail.quote.id, { follow_up_at: e.target.value })} />
                            <input className={input} placeholder="Follow-up note" value={detail.quote.follow_up_notes || ""} onChange={(e) => patch(detail.quote.id, { follow_up_notes: e.target.value })} />
                          </div>
                          {detail.customer?.whatsapp && (
                            <a className="mt-2 inline-block text-[12px] text-emerald-400 hover:underline" target="_blank" rel="noreferrer"
                              href={`https://wa.me/${String(detail.customer.whatsapp).replace(/\D/g, "")}`}>
                              WhatsApp {detail.customer.whatsapp}
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="btn-primary" disabled={detail.quote.converted_order_id}
                            onClick={() => { if (confirm(`Convert ${detail.quote.q_number} into a confirmed order?`)) patch(detail.quote.id, { convert: true }); }}>
                            {detail.quote.converted_order_id ? "Converted ✓" : "Convert to order →"}
                          </button>
                          <button className="btn-ghost" onClick={() => printQuote(detail)}>🖨 Print / PDF</button>
                          <button
                            className="rounded-full border border-red-500/30 px-4 py-2 text-[12px] text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={!!detail.quote.converted_order_id}
                            title={detail.quote.converted_order_id ? "Converted quotations are part of order history and cannot be deleted" : "Delete this quotation"}
                            onClick={async () => {
                              if (!confirm(`Delete ${detail.quote.q_number} permanently?\n\nThis removes the quotation and its items. This cannot be undone.`)) return;
                              const j = await fetch(`/api/admin/biz/quotations?id=${detail.quote.id}`, { method: "DELETE" })
                                .then((r) => r.json()).catch(() => ({}));
                              if (j?.ok) { flash("Quotation deleted"); setOpen(null); setDetail(null); load(); }
                              else flash(j?.error || "Delete failed");
                            }}
                          >
                            🗑 Delete quotation
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-cream-dim">No quotations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------- invoices -------------------------------- */

function Invoices() {
  const [rows, setRows] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [pickOrder, setPickOrder] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [toast, setToast] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2000); };

  const load = useCallback(async () => {
    const [i, o] = await Promise.all([
      fetch("/api/admin/biz/invoices").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/biz/orders").then((r) => r.json()).catch(() => ({})),
    ]);
    if (i?.ok) setRows(i.invoices);
    if (o?.ok) setOrders(o.orders);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function createFromOrder() {
    if (!pickOrder) return flash("Choose an order");
    const j = await fetch("/api/admin/biz/invoices", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: Number(pickOrder), status: "SENT" }),
    }).then((r) => r.json()).catch(() => ({}));
    if (j?.ok) { flash(`Invoice ${j.inv_number} created`); setShowNew(false); setPickOrder(""); load(); }
    else flash(j?.error || "Failed");
  }

  async function openInv(id: number) {
    setOpen(open === id ? null : id);
    if (open !== id) {
      const j = await fetch(`/api/admin/biz/invoices?id=${id}`).then((r) => r.json()).catch(() => ({}));
      if (j?.ok) setDetail(j);
    }
  }

  async function patch(id: number, p: any) {
    await fetch("/api/admin/biz/invoices", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...p }),
    });
    const d = await fetch(`/api/admin/biz/invoices?id=${id}`).then((r) => r.json()).catch(() => ({}));
    if (d?.ok) setDetail(d);
    flash("Updated"); load();
  }

  return (
    <div className="space-y-4">
      {toast && <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">{toast}</div>}
      <div className="flex flex-wrap justify-end gap-2">
        {showNew && (
          <>
            <select className={input + " w-72"} value={pickOrder} onChange={(e) => setPickOrder(e.target.value)}>
              <option value="">Select order…</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>{o.order_ref} — {o.cust_name || o.name} ({fmt(num(o.totals?.billedCcy ?? 0), o.currency)})</option>
              ))}
            </select>
            <button className="btn-primary" onClick={createFromOrder}>Create invoice</button>
          </>
        )}
        <button className="btn-primary" onClick={() => setShowNew(!showNew)}>+ Invoice from order</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[720px] text-left text-[12.5px]">
          <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
            <tr><th className="px-3 py-2.5">Invoice #</th><th className="px-3 py-2.5">Order</th><th className="px-3 py-2.5">Customer</th><th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5 text-right">Total</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <React.Fragment key={r.id}>
                <tr className="cursor-pointer border-t border-cream/5 hover:bg-cream/[0.03]" onClick={() => openInv(r.id)}>
                  <td className="px-3 py-2.5 text-champagne">{r.inv_number}</td>
                  <td className="px-3 py-2.5 text-cream-muted">{r.order_ref || "—"}</td>
                  <td className="px-3 py-2.5 text-cream">{r.cust_name || "—"}</td>
                  <td className="px-3 py-2.5 text-cream-muted">{String(r.date).slice(0, 10)}</td>
                  <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge(r.status)}`}>{r.status}</span></td>
                  <td className="px-3 py-2.5 text-right text-cream">{fmt(num(r.grand_total), r.currency)}</td>
                </tr>
                {open === r.id && detail && (
                  <tr className="border-t border-cream/5 bg-cream/[0.02]">
                    <td colSpan={6} className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="grid gap-5 lg:grid-cols-3">
                        <div>
                          <p className="mb-2 text-[10px] uppercase tracking-wide2 text-cream-dim">Items</p>
                          {detail.items.map((it: any) => (
                            <div key={it.id} className="flex justify-between text-[12px]">
                              <span className="text-cream-muted">{it.product} × {num(it.quantity)}</span>
                              <span className="text-cream">{fmt(num(it.subtotal), detail.invoice.currency)}</span>
                            </div>
                          ))}
                          <div className="mt-2 border-t border-cream/10 pt-2 text-[12px]">
                            <div className="flex justify-between font-semibold"><span className="text-cream">Grand total</span><span className="text-champagne">{fmt(num(detail.invoice.grand_total), detail.invoice.currency)}</span></div>
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] uppercase tracking-wide2 text-cream-dim">Status</p>
                          <select className={input} value={detail.invoice.status} onChange={(e) => patch(detail.invoice.id, { status: e.target.value })}>
                            {INVOICE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                          <p className="mt-2 text-[11.5px] text-cream-dim">{detail.invoice.terms}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="btn-primary" onClick={() => printInvoice(detail)}>🖨 Print / PDF</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-cream-dim">No invoices yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------- printing -------------------------------- */

const COMPANY = {
  name: "Prime Labels Intl",
  tag: "Custom Woven · Printed · Satin Labels",
  email: "info@primelabelsintl.com",
  site: "primelabelsintl.com",
};

function openPrint(title: string, bodyHtml: string) {
  const w = window.open("", "_blank", "width=820,height=1000");
  if (!w) return alert("Please allow pop-ups to print.");
  w.document.write(`<!doctype html><html><head><title>${title}</title><style>
    * { box-sizing: border-box; margin: 0; font-family: Georgia, 'Times New Roman', serif; }
    body { color: #1c1a17; padding: 48px 56px; }
    .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #b9985a; padding-bottom: 18px; margin-bottom: 26px; }
    .brand { font-size: 26px; letter-spacing: 1px; }
    .tag { color: #7a736a; font-size: 12px; margin-top: 4px; }
    h1 { font-size: 20px; letter-spacing: 3px; text-transform: uppercase; color: #b9985a; text-align: right; }
    .meta { color: #4c473f; font-size: 12.5px; text-align: right; margin-top: 6px; line-height: 1.55; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 1px; color: #7a736a; border-bottom: 1.5px solid #d8cfc0; padding: 8px 6px; }
    td { padding: 9px 6px; font-size: 13px; border-bottom: 1px solid #ece7dd; }
    .r { text-align: right; }
    .tot { width: 260px; margin-left: auto; margin-top: 14px; }
    .tot td { border: none; padding: 5px 6px; font-size: 13px; }
    .grand td { font-size: 15px; font-weight: bold; border-top: 2px solid #b9985a; }
    .foot { margin-top: 40px; border-top: 1px solid #d8cfc0; padding-top: 14px; color: #7a736a; font-size: 11.5px; line-height: 1.7; }
    .terms { margin-top: 26px; font-size: 12px; color: #4c473f; line-height: 1.7; }
    @media print { body { padding: 24px 32px; } }
  </style></head><body>${bodyHtml}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 350);
}

function esc(s: any) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string)); }
const n2 = (x: number) => x.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function itemRows(items: any[], ccy: string) {
  return items.map((it) => `<tr><td>${esc(it.product)}</td><td class="r">${n2(num(it.quantity))}</td><td class="r">${n2(num(it.unit_price))}</td><td class="r">${ccy} ${n2(num(it.subtotal))}</td></tr>`).join("");
}

export function printQuote(d: any) {
  const q = d.quote; const ccy = q.currency;
  openPrint(`Quotation ${q.q_number}`, `
    <div class="hdr"><div><div class="brand">${COMPANY.name}</div><div class="tag">${COMPANY.tag}</div></div>
    <div><h1>Quotation</h1><div class="meta">${esc(q.q_number)}<br>${new Date(q.created_at).toLocaleDateString()}<br>Valid ${q.validity_days} days</div></div></div>
    <div style="font-size:13.5px;line-height:1.7;margin-bottom:18px"><b>${esc(d.customer?.brand_name || d.customer?.full_name || "Valued Customer")}</b><br>
    ${esc([d.customer?.city, d.customer?.country].filter(Boolean).join(", "))}<br>${esc(d.customer?.whatsapp || "")}</div>
    <table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead>
    <tbody>${itemRows(d.items, ccy)}</tbody></table>
    <table class="tot"><tbody>
      <tr><td>Discount</td><td class="r">−${ccy} ${n2(num(q.discount))}</td></tr>
      <tr><td>Delivery</td><td class="r">${ccy} ${n2(num(q.delivery_charge))}</td></tr>
      <tr class="grand"><td>Grand total</td><td class="r">${ccy} ${n2(num(q.grand_total))}</td></tr>
    </tbody></table>
    <div class="terms"><b>Production time:</b> ${esc(q.production_time || "—")}<br><b>Delivery time:</b> ${esc(q.delivery_time || "—")}<br><b>Payment terms:</b> ${esc(q.payment_terms)}<br>${esc(q.notes || "")}</div>
    <div class="foot">${COMPANY.name} · ${COMPANY.site} · ${COMPANY.email}<br>Thank you for considering us for your brand labels.</div>`);
}

export function printInvoice(d: any) {
  const inv = d.invoice; const ccy = inv.currency;
  openPrint(`Invoice ${inv.inv_number}`, `
    <div class="hdr"><div><div class="brand">${COMPANY.name}</div><div class="tag">${COMPANY.tag}</div></div>
    <div><h1>Invoice</h1><div class="meta">${esc(inv.inv_number)}<br>${String(inv.date).slice(0, 10)}${d.order?.order_ref ? `<br>Order ${esc(d.order.order_ref)}` : ""}</div></div></div>
    <div style="font-size:13.5px;line-height:1.7;margin-bottom:18px"><b>${esc(d.customer?.brand_name || d.customer?.full_name || d.order?.name || "Customer")}</b><br>
    ${esc([d.customer?.city, d.customer?.country].filter(Boolean).join(", ") || d.order?.country || "")}<br>${esc(d.customer?.whatsapp || d.order?.phone || "")}</div>
    <table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead>
    <tbody>${itemRows(d.items, ccy)}</tbody></table>
    <table class="tot"><tbody>
      <tr><td>Discount</td><td class="r">−${ccy} ${n2(num(inv.discount))}</td></tr>
      <tr><td>Delivery</td><td class="r">${ccy} ${n2(num(inv.delivery))}</td></tr>
      <tr class="grand"><td>Grand total</td><td class="r">${ccy} ${n2(num(inv.grand_total))}</td></tr>
    </tbody></table>
    <div class="terms"><b>Terms:</b> ${esc(inv.terms)}<br>${esc(inv.notes || "")}</div>
    <div class="foot">${COMPANY.name} · ${COMPANY.site} · ${COMPANY.email}<br>Payment confirmation via Western Union / Bank Transfer. Please quote the invoice number.</div>`);
}
