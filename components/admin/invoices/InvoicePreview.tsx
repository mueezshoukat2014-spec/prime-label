"use client";

import { useEffect, useState } from "react";
import { printInvoiceHtml } from "@/lib/biz/invoice-print";
import { paymentTermsText } from "@/lib/biz/invoice-types";
import { LOGO_DATA_URI } from "@/lib/biz/logo-data";

const payLabel: Record<string, string> = { UNPAID: "Unpaid", PARTIALLY_PAID: "Partially Paid", PAID: "Paid", REFUNDED: "Refunded", CANCELLED: "Cancelled" };
const delLabel: Record<string, string> = { PENDING: "Pending", PROCESSING: "Processing", SHIPPED: "Shipped", OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled" };
const money = (n: number, c: string) => `${c} ${(Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InvoicePreview({ id, onBack, onEdit, onDuplicate }: {
  id: number; onBack: () => void; onEdit: (id: number) => void; onDuplicate: (id: number) => void;
}) {
  const [d, setD] = useState<any>(null);
  const [toast, setToast] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  useEffect(() => {
    fetch(`/api/admin/biz/invoices?id=${id}`).then((r) => r.json()).then((j) => j?.ok && setD(j)).catch(() => {});
  }, [id]);

  if (!d) return <p className="text-[12.5px] text-cream-muted">Loading invoice…</p>;
  const inv = d.invoice; const st = d.settings || {}; const snap = inv.customer_snapshot || {};
  const ccy = inv.currency || "PKR";
  const balance = Number(inv.grand_total) - Number(inv.amount_paid);
  const terms = String(st.termsAndConditions || "").split("\n").filter((l) => l.trim());

  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(printInvoiceHtml({ ...d, business: { name: "Prime Labels International", phone: "+92 324 4999224", email: "Primelabelsintl@gmail.com", website: "primelabelsintl.com" } }));
    w.document.close();
    // The browser's print footer shows the printed document's URL. The popup
    // starts as about:blank (same-origin), so rewrite it to the site root —
    // the footer then reads primelabelsintl.com instead of …/admin.
    try { w.history.replaceState(null, "", "/"); } catch { /* older browsers */ }
  };

  // Same trick when printing straight from the browser menu on /admin.
  useEffect(() => {
    let prev = "";
    const before = () => {
      prev = window.location.pathname + window.location.search;
      if (prev !== "/") { try { window.history.replaceState(null, "", "/"); } catch {} }
    };
    const after = () => { if (prev && prev !== "/") { try { window.history.replaceState(null, "", prev); } catch {} } };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => { window.removeEventListener("beforeprint", before); window.removeEventListener("afterprint", after); };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={onBack}>← Invoices</button>
          <h1 className="display text-2xl">Live Invoice Preview</h1>
          {inv.voided && <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">VOIDED</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => onEdit(id)}>✏ Edit Invoice</button>
          <button className="btn-ghost" onClick={async () => { await fetch("/api/admin/biz/invoices", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, notes: inv.notes }) }); flash("Saved ✓"); }}>💾 Save</button>
          <button className="btn-primary" onClick={() => window.open(`/api/admin/biz/invoices/pdf?id=${id}`, "_blank")}>⬇ Download PDF</button>
          <button className="btn-ghost" onClick={print}>🖨 Print</button>
          <button className="btn-ghost" onClick={() => onDuplicate(id)}>⧉ Duplicate</button>
        </div>
      </div>
      {toast && <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">{toast}</div>}

      {/* A4 sheet — swipe horizontally on phones instead of crushing the layout */}
      <p className="text-center text-[11px] text-cream-dim sm:hidden">← swipe left / right to view the full invoice →</p>
      <div className="overflow-x-auto pb-2">
      <div className="mx-auto min-w-[720px] max-w-[840px] bg-white p-10 text-[#141416] shadow-2xl" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
        <div className="flex items-start justify-between border-b-2 pb-4" style={{ borderColor: "#9e8046" }}>
          <div>
            <img src={LOGO_DATA_URI} alt="Prime Labels International" style={{ height: 46, width: 46, objectFit: "contain", marginBottom: 6 }} />
            <p className="text-[19px] font-bold">Prime Labels International</p>
            <p className="mt-1 whitespace-pre-line text-[9.5px] text-[#6e6c68]">{[st.address, st.taxNumber && `Tax / VAT No: ${st.taxNumber}`, "Phone / WhatsApp: +92 324 4999224", "Primelabelsintl@gmail.com", "primelabelsintl.com"].filter(Boolean).join("\n")}</p>
          </div>
          <div className="text-right">
            <p className="text-[22px] font-bold tracking-[2px]" style={{ color: "#9e8046" }}>INVOICE</p>
            <p className="text-[12.5px] font-bold">{inv.inv_number}</p>
            <p className="mt-1 whitespace-pre-line text-[9.5px] text-[#6e6c68]">{`Invoice date: ${inv.date || ""}\nDue date: ${inv.due_date || "—"}`}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-between gap-8">
          <div>
            <p className="text-[8.5px] font-bold tracking-[1.2px] text-[#6e6c68]">BILLED TO</p>
            <p className="mt-1 text-[11px] font-bold">{snap.name || "Customer"}</p>
            <p className="whitespace-pre-line text-[10px] text-[#444]">{[snap.company, snap.address, [snap.city, snap.country].filter(Boolean).join(", "), [snap.phone, snap.whatsapp].filter(Boolean).join(" / "), snap.email, snap.reference && `Ref: ${snap.reference}`].filter(Boolean).join("\n")}</p>
          </div>
          <div>
            <p className="text-[8.5px] font-bold tracking-[1.2px] text-[#6e6c68]">INVOICE INFORMATION</p>
            <p className="mt-1 whitespace-pre-line text-[10px]">{`Payment status: ${payLabel[inv.payment_status] || inv.payment_status}\nPayment method: ${inv.payment_method || "—"}\nDelivery status: ${delLabel[inv.delivery_status] || inv.delivery_status}${inv.order_id ? `\nOrder ref: ${d.order?.order_ref || "—"}` : ""}${inv.design_attachment ? "\nDesign Attached ✓" : ""}`}</p>
          </div>
        </div>

        <table className="mt-5 w-full border-collapse">
          <thead>
            <tr className="bg-[#f6f3ee] text-left text-[8.5px] tracking-[0.8px]">
              <th className="p-2">PRODUCT / SERVICE</th><th className="p-2">DETAILS</th>
              <th className="p-2 text-right">QTY</th><th className="p-2 text-right">UNIT PRICE</th>
              <th className="p-2 text-right">DISC.</th><th className="p-2 text-right">LINE TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {(d.items || []).map((it: any) => (
              <tr key={it.id} className="border-b border-[#ebe7e0] align-top text-[10px]">
                <td className="p-2 font-medium">{it.product}</td>
                <td className="whitespace-pre-line p-2 text-[9px] text-[#6e6c68]">{[it.description, [it.size && `Size: ${it.size}`, it.shape && `Shape: ${it.shape}`, it.color && `Color: ${it.color}`].filter(Boolean).join("  ")].filter(Boolean).join("\n")}</td>
                <td className="p-2 text-right">{Number(it.quantity)}</td>
                <td className="p-2 text-right">{money(it.unit_price, ccy)}</td>
                <td className="p-2 text-right">{money(it.discount, ccy)}</td>
                <td className="p-2 text-right font-bold">{money(it.subtotal, ccy)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-[260px] text-[10px]">
          <div className="flex justify-between py-0.5"><span className="text-[#6e6c68]">Subtotal</span><span>{money(inv.subtotal, ccy)}</span></div>
          {Number(inv.discount) > 0 && <div className="flex justify-between py-0.5"><span className="text-[#6e6c68]">Discount</span><span>− {money(inv.discount, ccy)}</span></div>}
          {Number(inv.delivery) > 0 && <div className="flex justify-between py-0.5"><span className="text-[#6e6c68]">Delivery / Shipping</span><span>{money(inv.delivery, ccy)}</span></div>}
          {Number(inv.tax) > 0 && <div className="flex justify-between py-0.5"><span className="text-[#6e6c68]">Tax</span><span>{money(inv.tax, ccy)}</span></div>}
          <div className="mt-1 flex justify-between border-t py-1 text-[12.5px] font-bold" style={{ borderColor: "#9e8046", color: "#9e8046" }}><span>GRAND TOTAL</span><span>{money(inv.grand_total, ccy)}</span></div>
          <div className="flex justify-between py-0.5"><span className="text-[#6e6c68]">Amount Paid</span><span>{money(inv.amount_paid, ccy)}</span></div>
          {balance > 0.004 && <div className="flex justify-between py-1 text-[11.5px] font-bold text-red-600"><span>BALANCE DUE</span><span>{money(balance, ccy)}</span></div>}
        </div>

        <div className="mt-6 flex gap-8">
          <div className="flex-1">
            <p className="text-[8.5px] font-bold tracking-[1.2px] text-[#6e6c68]">PAYMENT TERMS</p>
            <p className="mt-1 whitespace-pre-line text-[9.5px]">{paymentTermsText(inv.payment_terms_type, inv.payment_terms_custom)}</p>
            {[st.bankName, st.accountName && `Account name: ${st.accountName}`, st.accountNumber && `Account no: ${st.accountNumber}`, st.iban && `IBAN: ${st.iban}`, st.paymentInstructions].filter(Boolean).length > 0 && (<>
              <p className="mt-3 text-[8.5px] font-bold tracking-[1.2px] text-[#6e6c68]">PAYMENT INFORMATION</p>
              <p className="mt-1 whitespace-pre-line text-[9.5px]">{[st.bankName, st.accountName && `Account name: ${st.accountName}`, st.accountNumber && `Account no: ${st.accountNumber}`, st.iban && `IBAN: ${st.iban}`, st.paymentInstructions].filter(Boolean).join("\n")}</p></>)}
          </div>
          <div className="flex-1">
            <p className="text-[8.5px] font-bold tracking-[1.2px] text-[#6e6c68]">DELIVERY</p>
            <p className="mt-1 whitespace-pre-line text-[9.5px]">{[`Method: ${inv.delivery_method || "—"}`, `Courier: ${inv.courier || "—"}${inv.tracking_number ? `   Tracking: ${inv.tracking_number}` : ""}`, `Estimated: ${inv.estimated_delivery || "—"}`, inv.delivery_notes && `Notes: ${inv.delivery_notes}`].filter(Boolean).join("\n")}</p>
            {inv.notes && (<><p className="mt-3 text-[8.5px] font-bold tracking-[1.2px] text-[#6e6c68]">NOTES</p><p className="mt-1 whitespace-pre-line text-[9.5px]">{inv.notes}</p></>)}
          </div>
        </div>

        {terms.length > 0 && (
          <div className="mt-6">
            <p className="text-[8.5px] font-bold tracking-[1.2px] text-[#6e6c68]">TERMS &amp; CONDITIONS</p>
            <ol className="mt-1 list-decimal pl-4 text-[8.8px] leading-relaxed text-[#6e6c68]">{terms.map((t, i) => <li key={i}>{t}</li>)}</ol>
          </div>
        )}
        <div className="mt-8 flex justify-between border-t border-[#ebe7e0] pt-2 text-[9px] text-[#6e6c68]">
          <span>{st.footer || ""}</span><span>primelabelsintl.com</span>
        </div>
      </div>
      </div>
    </div>
  );
}
