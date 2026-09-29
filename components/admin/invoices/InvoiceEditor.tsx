"use client";

import { useEffect, useMemo, useState } from "react";
import { INV_CURRENCIES, PAYMENT_STATUSES, PAYMENT_METHODS, DELIVERY_STATUSES, COURIERS, PAYMENT_TERMS_TYPES, paymentTermsText } from "@/lib/biz/invoice-types";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-[13px] text-cream outline-none focus:border-champagne/50";
const label = "mb-1 block text-[10px] uppercase tracking-wide2 text-cream-dim";
const card = "rounded-2xl border border-cream/10 bg-cream/[0.02] p-4";

const money = (n: number) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const blankItem = () => ({ product: "", description: "", size: "", shape: "", color: "", quantity: 1, unit: "pcs", unit_price: 0, discount: 0, line_total: "" });

export default function InvoiceEditor({ id, orderId, dup, onDone, onBack }: {
  id?: number; orderId?: number; dup?: boolean;
  onDone: (id?: number) => void; onBack: () => void;
}) {
  const [f, setF] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orderRef, setOrderRef] = useState("");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));
  const setCust = (k: string, v: any) => setF((s: any) => ({ ...s, customer: { ...s.customer, [k]: v } }));
  const setItem = (i: number, k: string, v: any) => set("items", f.items.map((it: any, j: number) => (j === i ? { ...it, [k]: v } : it)));

  useEffect(() => {
    (async () => {
      const [cj, sj] = await Promise.all([
        fetch("/api/admin/biz/customers").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/biz/invoice-settings").then((r) => r.json()).catch(() => ({})),
      ]);
      const custs = cj?.customers || [];
      setCustomers(custs);
      const st = sj?.settings || {};
      const base: any = {
        customer_id: "", newCustomer: false,
        customer: { name: "", company: "", phone: "", whatsapp: "", email: "", address: "", city: "", country: "", reference: "" },
        date: new Date().toISOString().slice(0, 10), due_date: "", inv_number: "", currency: st.defaultCurrency || "PKR",
        items: [blankItem()], discount: 0, delivery: st.defaultDelivery || 0, tax: st.defaultTax || 0, amount_paid: 0,
        payment_status: "UNPAID", payment_method: "", payment_date: "", payment_reference: "", payment_notes: "",
        payment_terms_type: st.defaultPaymentTerms || "ADVANCE_50", payment_terms_custom: "",
        delivery_status: "PENDING", delivery_method: "", courier: "", tracking_number: "", estimated_delivery: "", delivery_notes: "",
        notes: st.defaultNotes || "", terms: st.termsAndConditions || "", design_attachment: null,
      };
      if (id) {
        const j = await fetch(`/api/admin/biz/invoices?id=${id}`).then((r) => r.json()).catch(() => ({}));
        if (j?.ok) {
          const inv = j.invoice;
          const snap = inv.customer_snapshot || {};
          Object.assign(base, {
            customer_id: dup ? inv.customer_id || "" : inv.customer_id || "",
            customer: { name: snap.name || "", company: snap.company || "", phone: snap.phone || "", whatsapp: snap.whatsapp || "", email: snap.email || "", address: snap.address || "", city: snap.city || "", country: snap.country || "", reference: snap.reference || "" },
            date: dup ? new Date().toISOString().slice(0, 10) : inv.date, due_date: inv.due_date || "", inv_number: dup ? "" : inv.inv_number || "", currency: inv.currency,
            items: (j.items || []).map((it: any) => ({ ...blankItem(), product: it.product, description: it.description || "", size: it.size || "", shape: it.shape || "", color: it.color || "", quantity: Number(it.quantity), unit: it.unit || "pcs", unit_price: Number(it.unit_price), discount: Number(it.discount), line_total: it.subtotal != null ? String(it.subtotal) : "" })),
            discount: Number(inv.discount), delivery: Number(inv.delivery), tax: Number(inv.tax), amount_paid: dup ? 0 : Number(inv.amount_paid),
            payment_status: dup ? "UNPAID" : inv.payment_status, payment_method: inv.payment_method || "", payment_date: inv.payment_date || "",
            payment_reference: inv.payment_reference || "", payment_notes: inv.payment_notes || "",
            payment_terms_type: inv.payment_terms_type, payment_terms_custom: inv.payment_terms_custom || "",
            delivery_status: dup ? "PENDING" : inv.delivery_status, delivery_method: inv.delivery_method || "", courier: inv.courier || "",
            tracking_number: dup ? "" : inv.tracking_number || "", estimated_delivery: inv.estimated_delivery || "", delivery_notes: inv.delivery_notes || "",
            notes: inv.notes || "", terms: inv.terms || st.termsAndConditions || "", design_attachment: dup ? null : inv.design_attachment || null,
          });
          if (!base.items.length) base.items = [blankItem()];
          setOrderRef(j.order?.order_ref || inv.order_ref || "");
        }
      } else if (orderId) {
        const j = await fetch(`/api/admin/biz/orders?id=${orderId}`).then((r) => r.json()).catch(() => ({}));
        if (j?.ok) {
          const o = j.order;
          setOrderRef(o.order_ref || "");
          base.order_id = orderId;
          base.currency = o.currency || base.currency;
          base.customer.name = o.name || "";
          base.customer_id = o.customer_id || "";
          if (j.items?.length) base.items = j.items.map((it: any) => ({ ...blankItem(), product: it.product, quantity: Number(it.quantity) || 1, unit_price: Number(it.unit_price) }));
          else base.items = [{ ...blankItem(), product: o.product || `Order ${o.order_ref}`, quantity: Number(o.quantity) || 1, unit_price: Number(o.sale_amount) }];
          base.discount = Number(o.discount) || 0;
          base.delivery = Number(o.customer_delivery_charge) || 0;
        }
      }
      setF(base);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, orderId]);

  const lineTotalOf = (it: any) =>
    Number(it.line_total) > 0
      ? Number(it.line_total)
      : Math.max(0, (Number(it.quantity) || 0) * (Number(it.unit_price) || 0) - (Number(it.discount) || 0));

  const totals = useMemo(() => {
    if (!f) return null;
    const lines = (f.items as any[]).map((it) => lineTotalOf(it));
    const subtotal = lines.reduce((s, v) => s + v, 0);
    const grand = Math.max(0, subtotal - (Number(f.discount) || 0) + (Number(f.delivery) || 0) + (Number(f.tax) || 0));
    return { subtotal, grand, balance: grand - (Number(f.amount_paid) || 0) };
  }, [f]);

  if (!f || !totals) return <p className="text-[12.5px] text-cream-muted">Loading…</p>;

  const pickCustomer = (cid: string) => {
    set("customer_id", cid);
    const c = customers.find((x) => String(x.id) === cid);
    if (c) {
      setF((s: any) => ({
        ...s, customer_id: cid,
        customer: {
          ...s.customer,
          name: c.full_name || s.customer.name, company: c.brand_name || s.customer.company,
          phone: c.whatsapp || s.customer.phone, whatsapp: c.whatsapp || s.customer.whatsapp,
          email: c.email || s.customer.email, address: c.address || s.customer.address,
          city: c.city || s.customer.city, country: c.country || s.customer.country,
        },
      }));
    }
  };

  const attach = async (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    const j = await fetch("/api/admin/biz/invoices/attach", { method: "POST", body: fd }).then((r) => r.json()).catch(() => ({}));
    if (j?.ok) { set("design_attachment", j.attachment); setToast("Design attached ✓"); }
    else setToast(j?.error || "Attachment failed (storage not configured here)");
    setTimeout(() => setToast(""), 2500);
  };

  const save = async () => {
    setSaving(true);
    const body = {
      ...f,
      customer: { ...f.customer, new: f.newCustomer || !f.customer_id },
      order_id: f.order_id || (orderId ?? null),
      order_ref: orderRef,
    };
    const res = await fetch("/api/admin/biz/invoices", {
      method: id && !dup ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id && !dup ? { ...body, id } : body),
    });
    const j = await res.json().catch(() => ({}));
    setSaving(false);
    if (j?.ok) onDone(j.invoice?.id);
    else setToast(j?.error || "Save failed");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button className="btn-ghost" onClick={onBack}>← Invoices</button>
          <h1 className="display text-2xl">{id && !dup ? "Edit Invoice" : dup ? "Duplicate Invoice" : "Create Invoice"}</h1>
          {orderRef && <span className="rounded-full border border-line px-2 py-0.5 text-[10.5px] text-cream-muted">Order {orderRef}</span>}
        </div>
        <button className="btn-primary disabled:opacity-50" disabled={saving} onClick={save}>{saving ? "Saving…" : "💾 Save Invoice"}</button>
      </div>
      {toast && <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-[12px] text-red-300">{toast}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* customer */}
        <div className={card}>
          <p className="mb-3 text-[10px] uppercase tracking-wide2 text-cream-dim">Customer</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <span className={label}>Existing customer</span>
              <select className={input} value={f.customer_id || ""} onChange={(e) => pickCustomer(e.target.value)}>
                <option value="">— New / walk-in customer —</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.brand_name || c.full_name} ({c.country || "—"})</option>)}
              </select>
            </div>
            <div><span className={label}>Customer name *</span><input className={input} value={f.customer.name} onChange={(e) => setCust("name", e.target.value)} /></div>
            <div><span className={label}>Company / brand</span><input className={input} value={f.customer.company} onChange={(e) => setCust("company", e.target.value)} /></div>
            <div><span className={label}>Phone</span><input className={input} value={f.customer.phone} onChange={(e) => setCust("phone", e.target.value)} /></div>
            <div><span className={label}>WhatsApp</span><input className={input} value={f.customer.whatsapp} onChange={(e) => setCust("whatsapp", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>Email</span><input className={input} value={f.customer.email} onChange={(e) => setCust("email", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>Address</span><input className={input} value={f.customer.address} onChange={(e) => setCust("address", e.target.value)} /></div>
            <div><span className={label}>City</span><input className={input} value={f.customer.city} onChange={(e) => setCust("city", e.target.value)} /></div>
            <div><span className={label}>Country</span><input className={input} value={f.customer.country} onChange={(e) => setCust("country", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>Customer reference</span><input className={input} value={f.customer.reference} onChange={(e) => setCust("reference", e.target.value)} /></div>
          </div>
        </div>

        {/* invoice info */}
        <div className={card}>
          <p className="mb-3 text-[10px] uppercase tracking-wide2 text-cream-dim">Invoice information</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><span className={label}>Invoice # (optional — your own number)</span><input className={input} value={f.inv_number || ""} placeholder="Leave empty for automatic PL-INV number" onChange={(e) => set("inv_number", e.target.value)} /></div>
            <div><span className={label}>Invoice date</span><div className="flex gap-1"><input className={input} type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /><button type="button" title="Clear date" className="shrink-0 rounded-lg border border-line px-2 text-[12px] text-cream-muted hover:text-red-300" onClick={() => set("date", "")}>✕</button></div></div>
            <div><span className={label}>Due date</span><div className="flex gap-1"><input className={input} type="date" value={f.due_date} onChange={(e) => set("due_date", e.target.value)} /><button type="button" title="Clear date" className="shrink-0 rounded-lg border border-line px-2 text-[12px] text-cream-muted hover:text-red-300" onClick={() => set("due_date", "")}>✕</button></div></div>
            <div><span className={label}>Currency (one per invoice)</span><select className={input} value={f.currency} onChange={(e) => set("currency", e.target.value)}>{INV_CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><span className={label}>Payment status</span><select className={input} value={f.payment_status} onChange={(e) => set("payment_status", e.target.value)}>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><span className={label}>Payment method</span><select className={input} value={f.payment_method} onChange={(e) => set("payment_method", e.target.value)}><option value="">—</option>{PAYMENT_METHODS.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><span className={label}>Payment date</span><div className="flex gap-1"><input className={input} type="date" value={f.payment_date} onChange={(e) => set("payment_date", e.target.value)} /><button type="button" title="Clear date" className="shrink-0 rounded-lg border border-line px-2 text-[12px] text-cream-muted hover:text-red-300" onClick={() => set("payment_date", "")}>✕</button></div></div>
            <div><span className={label}>Payment reference</span><input className={input} value={f.payment_reference} onChange={(e) => set("payment_reference", e.target.value)} /></div>
            <div><span className={label}>Payment terms</span><select className={input} value={f.payment_terms_type} onChange={(e) => set("payment_terms_type", e.target.value)}>{PAYMENT_TERMS_TYPES.map((s) => <option key={s} value={s}>{s === "ADVANCE_100" ? "100% Advance" : s === "ADVANCE_50" ? "50% Advance + 50% Before Dispatch" : "Custom terms"}</option>)}</select></div>
            {f.payment_terms_type === "CUSTOM" && (
              <div className="sm:col-span-2"><span className={label}>Custom payment terms</span><textarea className={input} rows={2} value={f.payment_terms_custom} onChange={(e) => set("payment_terms_custom", e.target.value)} /></div>)}
            <div className="sm:col-span-2"><span className={label}>Payment notes</span><input className={input} value={f.payment_notes} onChange={(e) => set("payment_notes", e.target.value)} /></div>
            <div className="sm:col-span-2">
              <span className={label}>Design / artwork attachment</span>
              {f.design_attachment ? (
                <div className="flex items-center gap-2 text-[12px] text-emerald-400">Design Attached ✓ <span className="text-cream-dim">{f.design_attachment.name}</span>
                  <button className="text-red-300 underline" onClick={() => set("design_attachment", null)}>remove</button></div>
              ) : (
                <input type="file" accept=".png,.jpg,.jpeg,.pdf,.svg,.ai,.eps" className="text-[12px] text-cream-muted"
                  onChange={(e) => e.target.files?.[0] && attach(e.target.files[0])} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* items */}
      <div className={card}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wide2 text-cream-dim">Items</p>
          <button className="btn-ghost" onClick={() => set("items", [...f.items, blankItem()])}>+ Add item</button>
        </div>
        <div className="space-y-3">
          {f.items.map((it: any, i: number) => (
            <div key={i} className="grid gap-2 rounded-xl border border-cream/5 p-3 sm:grid-cols-4 lg:grid-cols-8">
              <div className="sm:col-span-2 lg:col-span-2"><span className={label}>Product / service *</span><input className={input} value={it.product} onChange={(e) => setItem(i, "product", e.target.value)} placeholder="Custom woven labels" /></div>
              <div className="sm:col-span-2 lg:col-span-2"><span className={label}>Description</span><input className={input} value={it.description} onChange={(e) => setItem(i, "description", e.target.value)} /></div>
              <div><span className={label}>Size</span><input className={input} value={it.size} onChange={(e) => setItem(i, "size", e.target.value)} /></div>
              <div><span className={label}>Shape</span><input className={input} value={it.shape} onChange={(e) => setItem(i, "shape", e.target.value)} /></div>
              <div><span className={label}>Color</span><input className={input} value={it.color} onChange={(e) => setItem(i, "color", e.target.value)} /></div>
              <div><span className={label}>Qty</span><input className={input} type="number" min="1" value={it.quantity} onChange={(e) => setItem(i, "quantity", e.target.value)} /></div>
              <div><span className={label}>Unit</span><input className={input} value={it.unit} onChange={(e) => setItem(i, "unit", e.target.value)} /></div>
              <div><span className={label}>Total price ({f.currency}) *</span><input className={input} type="number" min="0" step="0.01" value={it.line_total === "" || it.line_total == null ? String(Math.max(0, (Number(it.quantity) || 0) * (Number(it.unit_price) || 0) - (Number(it.discount) || 0))) : it.line_total} onChange={(e) => setItem(i, "line_total", e.target.value)} placeholder="Line total" /></div>
              <div className="flex items-end"><span className="text-[12px] text-cream-muted">Unit price (auto):<br /><b className="text-cream">{(Number(it.quantity) || 0) > 0 ? `${f.currency} ${money(lineTotalOf(it) / (Number(it.quantity) || 1))}` : "—"}</b></span></div>
              <div className="flex items-end justify-between gap-2 lg:col-span-2">
                <span className="text-[12px] text-cream-muted">Line total:<br /><b className="text-cream">{f.currency} {money(lineTotalOf(it))}</b></span>
                <button className="text-[11px] text-red-300" onClick={() => set("items", f.items.filter((_: any, j: number) => j !== i))} disabled={f.items.length === 1}>✕ Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* totals */}
        <div className={card}>
          <p className="mb-3 text-[10px] uppercase tracking-wide2 text-cream-dim">Totals ({f.currency})</p>
          <div className="space-y-2 text-[12.5px]">
            <div className="flex justify-between"><span className="text-cream-muted">Subtotal</span><b className="text-cream">{money(totals.subtotal)}</b></div>
            <div className="flex items-center justify-between gap-2"><span className="text-cream-muted">Discount</span><input className={`${input} !w-28 text-right`} type="number" min="0" value={f.discount} onChange={(e) => set("discount", e.target.value)} /></div>
            <div className="flex items-center justify-between gap-2"><span className="text-cream-muted">Delivery / shipping</span><input className={`${input} !w-28 text-right`} type="number" min="0" value={f.delivery} onChange={(e) => set("delivery", e.target.value)} /></div>
            <div className="flex items-center justify-between gap-2"><span className="text-cream-muted">Tax</span><input className={`${input} !w-28 text-right`} type="number" min="0" value={f.tax} onChange={(e) => set("tax", e.target.value)} /></div>
            <div className="flex justify-between border-t border-champagne/30 pt-2 text-[14px]"><span className="font-semibold text-champagne">Grand total</span><b className="text-champagne">{money(totals.grand)}</b></div>
            <div className="flex items-center justify-between gap-2"><span className="text-cream-muted">Amount paid</span><input className={`${input} !w-28 text-right`} type="number" min="0" value={f.amount_paid} onChange={(e) => set("amount_paid", e.target.value)} /></div>
            <div className={`flex justify-between font-semibold ${totals.balance > 0 ? "text-red-300" : "text-emerald-400"}`}><span>Balance due</span><span>{money(totals.balance)}</span></div>
          </div>
        </div>

        {/* delivery */}
        <div className={card}>
          <p className="mb-3 text-[10px] uppercase tracking-wide2 text-cream-dim">Delivery</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><span className={label}>Delivery status</span><select className={input} value={f.delivery_status} onChange={(e) => set("delivery_status", e.target.value)}>{DELIVERY_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><span className={label}>Delivery method</span><input className={input} value={f.delivery_method} onChange={(e) => set("delivery_method", e.target.value)} placeholder="Express DDP" /></div>
            <div><span className={label}>Courier</span><select className={input} value={f.courier} onChange={(e) => set("courier", e.target.value)}><option value="">—</option>{COURIERS.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><span className={label}>Tracking number</span><input className={input} value={f.tracking_number} onChange={(e) => set("tracking_number", e.target.value)} /></div>
            <div><span className={label}>Estimated delivery</span><div className="flex gap-1"><input className={input} type="date" value={f.estimated_delivery} onChange={(e) => set("estimated_delivery", e.target.value)} /><button type="button" title="Clear date" className="shrink-0 rounded-lg border border-line px-2 text-[12px] text-cream-muted hover:text-red-300" onClick={() => set("estimated_delivery", "")}>✕</button></div></div>
            <div className="sm:col-span-2"><span className={label}>Delivery notes</span><input className={input} value={f.delivery_notes} onChange={(e) => set("delivery_notes", e.target.value)} /></div>
          </div>
        </div>

        {/* notes + terms preview */}
        <div className={card}>
          <p className="mb-3 text-[10px] uppercase tracking-wide2 text-cream-dim">Notes & terms</p>
          <span className={label}>Notes (on invoice)</span>
          <textarea className={input} rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} />
          <span className={`${label} mt-3`}>Payment terms preview</span>
          <p className="whitespace-pre-line rounded-lg border border-cream/10 p-2 text-[11px] text-cream-muted">
            {paymentTermsText(f.payment_terms_type, f.payment_terms_custom)}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary disabled:opacity-50" disabled={saving} onClick={save}>{saving ? "Saving…" : "💾 Save Invoice"}</button>
      </div>
    </div>
  );
}
