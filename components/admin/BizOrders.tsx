"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CURRENCIES, DELIVERY_MODES, ORDER_COST_CATEGORIES, ORDER_STATUSES,
  PAYMENT_METHODS, fmt, num,
} from "@/lib/biz/money";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-[13px] text-cream outline-none focus:border-champagne/50";
const label = "mb-1 block text-[10px] uppercase tracking-wide2 text-cream-dim";
const badge = (s: string) =>
  s === "DELIVERED" || s === "PAID"
    ? "bg-emerald-500/15 text-emerald-400"
    : s === "CANCELLED" || s === "REFUNDED"
      ? "bg-red-500/15 text-red-400"
      : s === "UNPAID"
        ? "bg-red-500/10 text-red-300"
        : "bg-champagne/15 text-champagne";

export default function BizOrders() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [toast, setToast] = useState("");

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2000); };

  const load = useCallback(async (query = "") => {
    const res = await fetch("/api/admin/biz/orders" + (query ? `?q=${encodeURIComponent(query)}` : ""));
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setRows(j.orders);
  }, []);
  useEffect(() => { load(); fetch("/api/admin/biz/customers").then(r => r.json()).then(j => j?.ok && setCustomers(j.customers)); }, [load]);

  // "Reorder" from the Customers ledger pre-fills the new-order form.
  useEffect(() => {
    const onNewOrder = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      setForm({
        name: d.name || "", customer_id: d.customer_id || "", country: d.country || "",
        currency: d.currency || "PKR", rate: d.rate ?? "", product: d.product || "",
        quantity: d.quantity || "", sale_amount: "", discount: 0, customer_delivery_charge: 0,
        delivery_mode: "CUSTOM", actual_delivery_cost: 0, delivery_currency: "PKR",
        status: "NEW", pay_amount: 0, method: "Cash", received_currency: "PKR", received_amount: 0,
      });
      setShowNew(true);
    };
    window.addEventListener("biz:new-order", onNewOrder);
    return () => window.removeEventListener("biz:new-order", onNewOrder);
  }, []);

  async function openOrder(id: number) {
    setOpen(open === id ? null : id);
    if (open !== id) {
      const res = await fetch(`/api/admin/biz/orders?id=${id}`);
      const j = await res.json().catch(() => ({}));
      if (j?.ok) setDetail(j);
    }
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/biz/orders", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const j = await res.json().catch(() => ({}));
    if (j?.ok) { flash(`Order ${j.order_ref} created`); setForm(null); setShowNew(false); load(); }
    else flash(j?.error || "Could not create order");
  }

  async function patchOrder(id: number, patch: any) {
    await fetch("/api/admin/biz/orders", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }),
    });
    const res = await fetch(`/api/admin/biz/orders?id=${id}`);
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setDetail(j);
    load(q);
  }

  async function addPayment(orderId: number, p: any) {
    const res = await fetch("/api/admin/biz/payments", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order_id: orderId, ...p }),
    });
    const j = await res.json().catch(() => ({}));
    if (j?.ok) { flash("Payment recorded"); const r = await fetch(`/api/admin/biz/orders?id=${orderId}`); const jj = await r.json(); if (jj?.ok) setDetail(jj); load(q); }
    else flash(j?.error || "Payment failed");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Orders</h1>
          <p className="mt-1 text-[12.5px] text-cream-muted">Sales, direct costs, payments and per-order gross profit.</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowNew(!showNew); setForm({ name: "", customer_id: "", country: "", currency: "PKR", rate: "", product: "", quantity: "", sale_amount: "", discount: 0, customer_delivery_charge: 0, delivery_mode: "CUSTOM", actual_delivery_cost: 0, delivery_currency: "PKR", status: "NEW", pay_amount: 0, method: "Cash", received_currency: "PKR", received_amount: 0 }); }}>
          + New Order
        </button>
      </div>

      {toast && <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">{toast}</div>}

      {showNew && form && (
        <form onSubmit={create} className="grid gap-3 rounded-2xl border border-champagne/25 bg-cream/[0.03] p-4 sm:grid-cols-4">
          <div><span className={label}>Customer *</span>
            <input className={input} list="cust-list" required value={form.name} placeholder="Name / brand"
              onChange={(e) => {
                const v = e.target.value; set("name", v);
                const c = customers.find((c) => c.full_name === v || c.brand_name === v);
                if (c) { set("customer_id", c.id); if (c.country) set("country", c.country); }
              }} />
            <datalist id="cust-list">{customers.map((c) => <option key={c.id} value={c.full_name}>{c.brand_name}</option>)}</datalist>
          </div>
          <div><span className={label}>Country</span><input className={input} value={form.country} onChange={(e) => set("country", e.target.value)} /></div>
          <div><span className={label}>Order currency</span>
            <select className={input} value={form.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><span className={label}>Rate (PKR per 1 {form.currency})</span><input className={input} type="number" step="0.01" value={form.rate} onChange={(e) => set("rate", e.target.value)} placeholder={form.currency === "PKR" ? "1" : "e.g. 416"} /></div>
          <div><span className={label}>Product *</span><input className={input} required value={form.product} onChange={(e) => set("product", e.target.value)} placeholder="Woven Labels" /></div>
          <div><span className={label}>Quantity</span><input className={input} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} /></div>
          <div><span className={label}>Sale price ({form.currency})</span><input className={input} type="number" step="0.01" required value={form.sale_amount} onChange={(e) => set("sale_amount", e.target.value)} /></div>
          <div><span className={label}>Discount ({form.currency})</span><input className={input} type="number" step="0.01" value={form.discount} onChange={(e) => set("discount", e.target.value)} /></div>
          <div><span className={label}>Customer delivery charge</span><input className={input} type="number" step="0.01" value={form.customer_delivery_charge} onChange={(e) => set("customer_delivery_charge", e.target.value)} /></div>
          <div><span className={label}>Delivery mode</span>
            <select className={input} value={form.delivery_mode} onChange={(e) => set("delivery_mode", e.target.value)}>{DELIVERY_MODES.map((m) => <option key={m}>{m}</option>)}</select></div>
          <div><span className={label}>ACTUAL delivery cost</span><input className={input} type="number" step="0.01" value={form.actual_delivery_cost} onChange={(e) => set("actual_delivery_cost", e.target.value)} /></div>
          <div><span className={label}>Actual cost currency</span>
            <select className={input} value={form.delivery_currency} onChange={(e) => set("delivery_currency", e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><span className={label}>Status</span>
            <select className={input} value={form.status} onChange={(e) => set("status", e.target.value)}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><span className={label}>Advance now ({form.currency})</span><input className={input} type="number" step="0.01" value={form.pay_amount} onChange={(e) => set("pay_amount", e.target.value)} /></div>
          <div><span className={label}>Method</span>
            <select className={input} value={form.method} onChange={(e) => set("method", e.target.value)}>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
          <div><span className={label}>Received currency</span>
            <select className={input} value={form.received_currency} onChange={(e) => set("received_currency", e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          {form.pay_amount > 0 && form.received_currency !== form.currency && (
            <div><span className={label}>Actual received ({form.received_currency})</span><input className={input} type="number" step="0.01" value={form.received_amount} onChange={(e) => set("received_amount", e.target.value)} placeholder="e.g. 12500 PKR" /></div>
          )}
          <details className="sm:col-span-4 text-[12px] text-cream-muted">
            <summary className="cursor-pointer text-champagne">Advanced (notes, email, phone)</summary>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <input className={input} placeholder="Phone / WhatsApp" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />
              <input className={input} placeholder="Email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
              <input className={input} placeholder="Notes" value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </details>
          <div className="flex gap-2 sm:col-span-4">
            <button className="btn-primary" type="submit">Create order</button>
            <button type="button" className="btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </form>
      )}

      <input className={input} placeholder="Search order # / customer / product…" value={q} onChange={(e) => { setQ(e.target.value); load(e.target.value); }} />

      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[860px] text-left text-[12.5px]">
          <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
            <tr>
              <th className="px-3 py-2.5">Order</th><th className="px-3 py-2.5">Customer</th>
              <th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Payment</th>
              <th className="px-3 py-2.5 text-right">Billed</th><th className="px-3 py-2.5 text-right">Outstanding</th>
              <th className="px-3 py-2.5 text-right">Gross (PKR)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <OrderRow key={o.id} o={o} open={open === o.id} onToggle={() => openOrder(o.id)}
                detail={open === o.id ? detail : null}
                onPatch={patchOrder} onPayment={addPayment} flash={flash} />
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-cream-dim">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderRow({ o, open, onToggle, detail, onPatch, onPayment, flash }: any) {
  const [pay, setPay] = useState<any>({ order_amount: "", method: "Cash", received_currency: "PKR", received_amount: "", fee: 0, fee_paid_by: "customer", wu_ref: "" });
  const [cost, setCost] = useState<any>({ description: "", category: "Production", amount: "", currency: "PKR", rate: 1 });
  const t = o.totals || {};
  return (
    <>
      <tr className="cursor-pointer border-t border-cream/5 hover:bg-cream/[0.03]" onClick={onToggle}>
        <td className="px-3 py-2.5 text-champagne">{o.order_ref || `#${o.id}`}</td>
        <td className="px-3 py-2.5"><span className="text-cream">{o.cust_name || o.name}</span>{o.brand_name && <span className="ml-1 text-cream-dim">· {o.brand_name}</span>}<span className="ml-2 text-[11px] text-cream-dim">{o.country}</span></td>
        <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge(o.status)}`}>{o.status}</span></td>
        <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge(o.payment_status)}`}>{o.payment_status}</span></td>
        <td className="px-3 py-2.5 text-right text-cream">{fmt(t.billedCcy ?? 0, o.currency)}</td>
        <td className="px-3 py-2.5 text-right text-cream-muted">{fmt(t.outstandingCcy ?? 0, o.currency)}</td>
        <td className="px-3 py-2.5 text-right text-emerald-400">{fmt(t.grossPkr ?? 0)}</td>
      </tr>
      {open && detail && (
        <tr className="border-t border-cream/5 bg-cream/[0.02]">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wide2 text-cream-dim">Status & workflow</p>
                <select className={input} value={detail.order.status} onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onPatch(detail.order.id, { status: e.target.value })}>
                  {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-cream-muted">
                  <span>Sale: <b className="text-cream">{fmt(num(detail.order.sale_amount), detail.order.currency)}</b></span>
                  <span>Discount: <b className="text-cream">{fmt(num(detail.order.discount), detail.order.currency)}</b></span>
                  <span>Cust. delivery: <b className="text-cream">{fmt(num(detail.order.customer_delivery_charge), detail.order.currency)}</b></span>
                  <span>Actual delivery: <b className="text-cream">{fmt(num(detail.order.actual_delivery_pkr))} PKR</b></span>
                  <span>Costs: <b className="text-red-300">{fmt(t.costsPkr ?? 0)}</b></span>
                  <span>Received: <b className="text-emerald-400">{fmt(t.receivedPkr ?? 0)}</b></span>
                </div>
                {/* stable, backend-generated invoice numbers for this order */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(detail.invoices || []).length > 0 ? (
                    (detail.invoices as any[]).map((inv) => (
                      <span key={inv.id} className="rounded-full border border-champagne/30 bg-champagne/10 px-2.5 py-1 text-[10.5px] font-semibold text-champagne">
                        {inv.inv_number} · {inv.status}
                      </span>
                    ))
                  ) : (
                    <button
                      className="rounded-full border border-line px-3 py-1 text-[10.5px] text-cream-muted transition-colors hover:border-champagne/40 hover:text-champagne"
                      onClick={async () => {
                        const j = await fetch("/api/admin/biz/invoices", {
                          method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ order_id: detail.order.id }),
                        }).then((r) => r.json()).catch(() => ({}));
                        if (j?.ok) { flash(`Invoice ${j.inv_number} created`); onPatch(detail.order.id, {}); }
                        else flash(j?.error || "Invoice creation failed");
                      }}
                    >
                      + Create invoice (auto number)
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wide2 text-cream-dim">Direct costs</p>
                <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                  {detail.costs.map((c: any) => (
                    <div key={c.id} className="flex justify-between text-[12px]">
                      <span className="text-cream-muted">{c.category} — {c.description}</span>
                      <span className="text-red-300">{fmt(num(c.pkr))}</span>
                    </div>
                  ))}
                  {detail.costs.length === 0 && <p className="text-[11.5px] text-cream-dim">No costs recorded.</p>}
                </div>
                <div className="mt-2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <input className={input} placeholder="Description" value={cost.description} onChange={(e) => setCost({ ...cost, description: e.target.value })} />
                  <select className={input + " w-32"} value={cost.category} onChange={(e) => setCost({ ...cost, category: e.target.value })}>
                    {ORDER_COST_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input className={input + " w-24"} type="number" placeholder="PKR" value={cost.amount} onChange={(e) => setCost({ ...cost, amount: e.target.value, currency: "PKR" })} />
                  <button className="btn-ghost whitespace-nowrap" onClick={async () => {
                    if (!num(cost.amount)) return flash("Enter a cost amount");
                    await onPatch(detail.order.id, { costs: [...detail.costs.map((c: any) => ({ description: c.description, category: c.category, amount: c.amount, currency: c.currency, rate: c.rate, pkr: c.pkr, date: c.date, notes: c.notes })), cost] });
                    setCost({ description: "", category: "Production", amount: "", currency: "PKR", rate: 1 });
                    flash("Cost added");
                  }}>Add</button>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <p className="mb-2 text-[10px] uppercase tracking-wide2 text-cream-dim">Payments</p>
                <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                  {detail.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between text-[12px]">
                      <span className="text-cream-muted">{p.date} · {p.method}{p.wu_ref ? ` · ${p.wu_ref}` : ""}</span>
                      <span className="text-emerald-400">{fmt(num(p.order_amount), p.order_currency)} → {fmt(num(p.received_pkr))}</span>
                    </div>
                  ))}
                  {detail.payments.length === 0 && <p className="text-[11.5px] text-cream-dim">No payments yet.</p>}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <input className={input} type="number" placeholder={`Amount (${detail.order.currency})`} value={pay.order_amount} onChange={(e) => setPay({ ...pay, order_amount: e.target.value })} />
                  <select className={input} value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <select className={input} value={pay.received_currency} onChange={(e) => setPay({ ...pay, received_currency: e.target.value })}>
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input className={input} type="number" placeholder={pay.received_currency !== detail.order.currency ? `Actual received (${pay.received_currency})` : "Actual received"} value={pay.received_amount} onChange={(e) => setPay({ ...pay, received_amount: e.target.value })} />
                  <input className={input} placeholder="WU ref (optional)" value={pay.wu_ref} onChange={(e) => setPay({ ...pay, wu_ref: e.target.value })} />
                  <button className="btn-primary" onClick={() => {
                    if (!num(pay.order_amount)) return flash("Enter payment amount");
                    onPayment(detail.order.id, {
                      order_currency: detail.order.currency, order_amount: num(pay.order_amount),
                      method: pay.method, received_currency: pay.received_currency,
                      received_amount: num(pay.received_amount) || num(pay.order_amount),
                      fee: num(pay.fee), fee_paid_by: pay.fee_paid_by, wu_ref: pay.wu_ref,
                    });
                    setPay({ order_amount: "", method: "Cash", received_currency: "PKR", received_amount: "", fee: 0, fee_paid_by: "customer", wu_ref: "" });
                  }}>Record payment</button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
