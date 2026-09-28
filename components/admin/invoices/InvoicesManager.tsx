"use client";

import { useCallback, useEffect, useState } from "react";
import InvoiceEditor from "./InvoiceEditor";
import InvoicePreview from "./InvoicePreview";
import InvoiceSettings from "./InvoiceSettings";
import { printInvoiceHtml } from "@/lib/biz/invoice-print";
import { INV_CURRENCIES, PAYMENT_STATUSES, DELIVERY_STATUSES } from "@/lib/biz/invoice-types";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-[13px] text-cream outline-none focus:border-champagne/50";
const label = "mb-1 block text-[10px] uppercase tracking-wide2 text-cream-dim";

type View =
  | { t: "list" }
  | { t: "edit"; id?: number; orderId?: number; dup?: boolean }
  | { t: "preview"; id: number }
  | { t: "settings" };

const payLabel: Record<string, string> = { UNPAID: "Unpaid", PARTIALLY_PAID: "Partially Paid", PAID: "Paid", REFUNDED: "Refunded", CANCELLED: "Cancelled" };
const delLabel: Record<string, string> = { PENDING: "Pending", PROCESSING: "Processing", SHIPPED: "Shipped", OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled" };

export default function InvoicesManager({ initialOrderId, onOrderConsumed }: {
  initialOrderId?: number | null; onOrderConsumed?: () => void;
}) {
  const [view, setView] = useState<View>({ t: "list" });
  const [reload, setReload] = useState(0);

  // Orders tab → "Invoice →" cross-tab hand-off.
  useEffect(() => {
    if (initialOrderId) {
      setView({ t: "edit", orderId: initialOrderId });
      onOrderConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId]);

  if (view.t === "edit")
    return <InvoiceEditor id={view.id} orderId={view.orderId} dup={view.dup}
      onDone={(id) => setView(id ? { t: "preview", id } : { t: "list" })}
      onBack={() => setView({ t: "list" })} />;
  if (view.t === "preview")
    return <InvoicePreview id={view.id} onBack={() => { setView({ t: "list" }); setReload((r) => r + 1); }}
      onEdit={(id) => setView({ t: "edit", id })}
      onDuplicate={(id) => setView({ t: "edit", id, dup: true })} />;
  if (view.t === "settings") return <InvoiceSettings onBack={() => setView({ t: "list" })} />;
  return <List reload={reload} open={(v) => setView(v)} />;
}

function List({ reload, open }: { reload: number; open: (v: View) => void }) {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [q, setQ] = useState("");
  const [pay, setPay] = useState("");
  const [del, setDel] = useState("");
  const [ccy, setCcy] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [showVoid, setShowVoid] = useState(false);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q); if (pay) p.set("payment_status", pay); if (del) p.set("delivery_status", del);
    if (ccy) p.set("currency", ccy); if (from) p.set("from", from); if (to) p.set("to", to); p.set("sort", sort);
    const j = await fetch(`/api/admin/biz/invoices?${p}`).then((r) => r.json()).catch(() => ({}));
    if (j?.ok) setRows(j.invoices);
  }, [q, pay, del, ccy, from, to, sort]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q, reload]);

  const act = async (id: number, action: string, r: any) => {
    if (action === "view") return open({ t: "preview", id });
    if (action === "edit") return open({ t: "edit", id });
    if (action === "duplicate") return open({ t: "edit", id, dup: true });
    if (action === "pdf") { window.open(`/api/admin/biz/invoices/pdf?id=${id}`, "_blank"); return; }
    if (action === "print") {
      const j = await fetch(`/api/admin/biz/invoices?id=${id}`).then((x) => x.json()).catch(() => ({}));
      if (j?.ok) {
        const w = window.open("", "_blank");
        if (w) { w.document.write(printInvoiceHtml({ ...j, business: { name: "Prime Labels International", website: "primelabelsintl.com" } })); w.document.close(); }
      }
      return;
    }
    if (action === "paid") {
      const j = await fetch("/api/admin/biz/invoices", { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, amount_paid: r.grand_total, payment_status: "PAID", payment_date: new Date().toISOString().slice(0, 10), payment_method: r.payment_method || "Bank Transfer" }) }).then((x) => x.json()).catch(() => ({}));
      flash(j?.ok ? `${r.inv_number} marked paid` : j?.error || "Failed"); load(); return;
    }
    if (action === "archive") {
      if (!confirm(`Archive ${r.inv_number}? It stays in the database but hides from the list.`)) return;
      await fetch("/api/admin/biz/invoices", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, archived: true }) });
      flash("Archived"); load(); return;
    }
    if (action === "void") {
      const reason = prompt(`Void ${r.inv_number}? Reason (kept on record):`);
      if (reason === null) return;
      const j = await fetch("/api/admin/biz/invoices", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, voided: true, void_reason: reason }) }).then((x) => x.json()).catch(() => ({}));
      flash(j?.ok ? "Voided" : j?.error || "Failed"); load(); return;
    }
  };

  const visible = showVoid ? rows : rows.filter((r) => !r.voided);
  const money = (n: number, c: string) => `${c} ${(Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="display text-3xl">Invoices</h1>
          <p className="mt-1 text-[12.5px] text-cream-muted">Professional invoicing with persistent numbering, PDF and print.</p></div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => open({ t: "settings" })}>⚙ Invoice Settings</button>
          <button className="btn-primary" onClick={() => open({ t: "edit" })}>+ New Invoice</button>
        </div>
      </div>

      {toast && <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">{toast}</div>}

      <div className="grid gap-2 rounded-2xl border border-cream/10 p-3 sm:grid-cols-3 lg:grid-cols-8">
        <div className="sm:col-span-3 lg:col-span-2"><input className={input} placeholder="Search #, customer, phone, email, order…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div><select className={input} value={pay} onChange={(e) => setPay(e.target.value)}><option value="">Payment: all</option>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><select className={input} value={del} onChange={(e) => setDel(e.target.value)}><option value="">Delivery: all</option>{DELIVERY_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><select className={input} value={ccy} onChange={(e) => setCcy(e.target.value)}><option value="">Currency: all</option>{INV_CURRENCIES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><input className={input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="From date" /></div>
        <div><input className={input} type="date" value={to} onChange={(e) => setTo(e.target.value)} title="To date" /></div>
        <div><select className={input} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option><option value="oldest">Oldest</option>
          <option value="highest">Highest amount</option><option value="lowest">Lowest amount</option></select></div>
      </div>
      <label className="flex items-center gap-2 text-[11.5px] text-cream-dim">
        <input type="checkbox" checked={showVoid} onChange={(e) => setShowVoid(e.target.checked)} /> Show voided invoices
      </label>

      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[980px] text-left text-[12.5px]">
          <thead className="bg-cream/[0.04] text-[10px] uppercase tracking-wide2 text-cream-dim">
            <tr>{["Invoice #", "Customer", "Date", "Due", "Ccy", "Grand Total", "Paid", "Balance", "Payment", "Delivery", "Actions"].map((h) => (
              <th key={h} className="px-3 py-2.5">{h}</th>))}</tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const bal = Number(r.grand_total) - Number(r.amount_paid);
              return (
                <tr key={r.id} className={`border-t border-cream/5 hover:bg-cream/[0.03] ${r.voided ? "opacity-50" : ""}`}>
                  <td className="px-3 py-2.5 text-champagne">{r.inv_number}{r.voided && <span className="ml-1 rounded-full bg-red-500/15 px-1.5 text-[9.5px] text-red-300">VOID</span>}</td>
                  <td className="px-3 py-2.5 text-cream">{(r.customer_snapshot || {}).name || r.cust_name || r.brand_name || "—"}</td>
                  <td className="px-3 py-2.5 text-cream-muted">{r.date}</td>
                  <td className="px-3 py-2.5 text-cream-muted">{r.due_date || "—"}</td>
                  <td className="px-3 py-2.5 text-cream-muted">{r.currency}</td>
                  <td className="px-3 py-2.5 text-cream">{money(r.grand_total, r.currency)}</td>
                  <td className="px-3 py-2.5 text-emerald-400">{money(r.amount_paid, r.currency)}</td>
                  <td className={`px-3 py-2.5 ${bal > 0 ? "text-red-300" : "text-cream-dim"}`}>{money(bal, r.currency)}</td>
                  <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.payment_status === "PAID" ? "bg-emerald-500/15 text-emerald-400" : r.payment_status === "UNPAID" ? "bg-red-500/10 text-red-300" : "bg-champagne/15 text-champagne"}`}>{payLabel[r.payment_status] || r.payment_status}</span></td>
                  <td className="px-3 py-2.5 text-cream-muted">{delLabel[r.delivery_status] || r.delivery_status}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      <button className="rounded-md border border-line px-2.5 py-1.5 text-[11px] text-cream-muted hover:text-champagne" onClick={() => act(r.id, "view", r)}>View</button>
                      <button className="rounded-md border border-line px-2.5 py-1.5 text-[11px] text-cream-muted hover:text-champagne" onClick={() => act(r.id, "edit", r)}>Edit</button>
                      <button className="rounded-md border border-line px-2.5 py-1.5 text-[11px] text-cream-muted hover:text-champagne" onClick={() => open({ t: "edit", id: r.id, dup: true })} title="Duplicate (new number)">Dup</button>
                      <button className="rounded-md border border-line px-2.5 py-1.5 text-[11px] text-cream-muted hover:text-champagne" onClick={() => act(r.id, "pdf", r)}>PDF</button>
                      <button className="rounded-md border border-line px-2.5 py-1.5 text-[11px] text-cream-muted hover:text-champagne" onClick={() => act(r.id, "print", r)}>Print</button>
                      {r.payment_status !== "PAID" && !r.voided && (
                        <button className="rounded-md border border-emerald-500/30 px-2.5 py-1.5 text-[11px] text-emerald-400" onClick={() => act(r.id, "paid", r)}>Mark Paid</button>)}
                      {!r.voided && (<>
                        <button className="rounded-md border border-line px-2.5 py-1.5 text-[11px] text-cream-muted" onClick={() => act(r.id, "archive", r)}>Archive</button>
                        <button className="rounded-md border border-red-400/30 px-2.5 py-1.5 text-[11px] text-red-300" onClick={() => act(r.id, "void", r)}>Void</button></>)}
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && <tr><td colSpan={11} className="px-3 py-8 text-center text-cream-dim">No invoices yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
