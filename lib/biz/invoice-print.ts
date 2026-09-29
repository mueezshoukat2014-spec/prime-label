/* Client-safe: builds a clean A4 print document for an invoice (no admin UI). */
import { LOGO_DATA_URI } from "@/lib/biz/logo-data";

export function printInvoiceHtml(d: any): string {
  const inv = d.invoice;
  const items = d.items || [];
  const st = d.settings || {};
  const snap = inv.customer_snapshot || {};
  const ccy = inv.currency || "PKR";
  const money = (n: number) => `${ccy} ${(Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const esc = (s: any) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const payLabel: Record<string, string> = { UNPAID: "Unpaid", PARTIALLY_PAID: "Partially Paid", PAID: "Paid", REFUNDED: "Refunded", CANCELLED: "Cancelled" };
  const delLabel: Record<string, string> = { PENDING: "Pending", PROCESSING: "Processing", SHIPPED: "Shipped", OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled" };
  const balance = Number(inv.grand_total) - Number(inv.amount_paid);
  const terms = st.termsAndConditions ? String(st.termsAndConditions).split("\n").filter((l) => l.trim()) : [];
  const payTerms =
    inv.payment_terms_type === "ADVANCE_100"
      ? "<b>100% Advance Payment:</b> Full payment must be received before production starts."
      : inv.payment_terms_type === "ADVANCE_50"
        ? "<b>50% Advance Payment:</b> 50% payment is required before production starts.<br><b>Remaining 50%:</b> The remaining balance must be paid before dispatch."
        : esc(inv.payment_terms_custom || "As agreed.");

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(inv.pdf_name || inv.inv_number)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { font: 10.5px/1.45 "Helvetica Neue", Arial, sans-serif; color: #141416; margin: 0; }
  .hd { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #9e8046; padding-bottom: 10px; }
  .hd .biz { font-size: 17px; font-weight: 700; }
  .hd .sub { color: #6e6c68; font-size: 9px; margin-top: 3px; white-space: pre-line; }
  .ttl { text-align: right; }
  .ttl .t { font-size: 20px; font-weight: 700; color: #9e8046; letter-spacing: 2px; }
  .ttl .n { font-size: 12px; font-weight: 700; margin-top: 2px; }
  .ttl .d { color: #6e6c68; font-size: 9px; margin-top: 4px; white-space: pre-line; }
  .cols { display: flex; justify-content: space-between; margin: 12px 0; gap: 20px; }
  .lbl { font-size: 8px; letter-spacing: 1.2px; color: #6e6c68; font-weight: 700; margin-bottom: 4px; }
  .blk { font-size: 9.5px; white-space: pre-line; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { background: #f6f3ee; font-size: 8px; letter-spacing: .8px; text-align: left; padding: 5px 6px; }
  th.r, td.r { text-align: right; }
  td { padding: 6px; border-bottom: 1px solid #ebe7e0; font-size: 9.5px; vertical-align: top; }
  td .det { color: #6e6c68; font-size: 8.5px; white-space: pre-line; }
  .tot { width: 240px; margin-left: auto; margin-top: 10px; font-size: 9.5px; }
  .tot .row { display: flex; justify-content: space-between; padding: 2px 0; }
  .tot .gt { font-weight: 700; font-size: 11.5px; color: #9e8046; border-top: 1px solid #9e8046; margin-top: 3px; padding-top: 4px; }
  .sec3 { display: flex; gap: 24px; margin-top: 14px; }
  .sec3 > div { flex: 1; }
  .small { font-size: 8.5px; white-space: pre-line; }
  .tc { margin-top: 12px; }
  .tc ol { margin: 4px 0 0; padding-left: 14px; font-size: 8.3px; color: #6e6c68; }
  .ft { margin-top: 16px; border-top: 1px solid #ebe7e0; padding-top: 6px; font-size: 8.5px; color: #6e6c68; display: flex; justify-content: space-between; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
</style></head><body>
<div class="hd">
  <div><img src="${LOGO_DATA_URI}" alt="Prime Labels International" style="height:46px;width:46px;object-fit:contain;margin-bottom:6px;display:block"><div class="biz">${esc(d.business?.name || "Prime Labels International")}</div>
    <div class="sub">${esc([st.address, st.taxNumber && "Tax / VAT No: " + st.taxNumber, "Phone / WhatsApp: " + (d.business?.phone || ""), (d.business?.email || "Primelabelsintl@gmail.com"), d.business?.website || "primelabelsintl.com"].filter(Boolean).join("\n"))}</div></div>
  <div class="ttl"><div class="t">INVOICE</div><div class="n">${esc(inv.inv_number)}</div>
    <div class="d">Invoice date: ${esc(inv.date || "")}\nDue date: ${esc(inv.due_date || "—")}</div></div>
</div>
<div class="cols">
  <div><div class="lbl">BILLED TO</div>
    <div class="blk"><b>${esc(snap.name || d.customer?.full_name || "Customer")}</b>\n${esc([snap.company, snap.address, [snap.city, snap.country].filter(Boolean).join(", "), [snap.phone, snap.whatsapp].filter(Boolean).join(" / "), snap.email, snap.reference && "Ref: " + snap.reference].filter(Boolean).join("\n"))}</div></div>
  <div><div class="lbl">INVOICE INFORMATION</div>
    <div class="blk">Payment status: ${esc(payLabel[inv.payment_status] || inv.payment_status)}${inv.payment_method ? "\nPayment method: " + esc(inv.payment_method) : ""}\nDelivery status: ${esc(delLabel[inv.delivery_status] || inv.delivery_status)}${inv.order_id || inv.order_ref ? "\nOrder ref: " + esc(d.order?.order_ref || inv.order_ref || "—") : ""}${inv.design_attachment ? "\nDesign Attached ✓" : ""}</div></div>
</div>
<table><thead><tr><th>PRODUCT / SERVICE</th><th>DETAILS</th><th class="r">QTY</th><th class="r">UNIT PRICE</th>${items.some((it: any) => Number(it.discount) > 0) ? '<th class="r">DISC.</th>' : ""}<th class="r">LINE TOTAL</th></tr></thead>
<tbody>${items.map((it: any) => `<tr><td>${esc(it.product)}</td><td><span class="det">${esc([it.description, [it.size && "Size: " + it.size, it.shape && "Shape: " + it.shape, it.color && "Color: " + it.color].filter(Boolean).join("  ")].filter(Boolean).join("\n"))}</span></td><td class="r">${Number(it.quantity)}</td><td class="r">${money(it.unit_price)}</td>${items.some((x: any) => Number(x.discount) > 0) ? `<td class="r">${money(it.discount)}</td>` : ""}<td class="r"><b>${money(it.subtotal)}</b></td></tr>`).join("")}</tbody></table>
<div class="tot">
  <div class="row"><span>Subtotal</span><span>${money(inv.subtotal)}</span></div>
  ${Number(inv.discount) ? `<div class="row"><span>Discount</span><span>− ${money(inv.discount)}</span></div>` : ""}
  ${Number(inv.delivery) && (inv.delivery_paid_by || "CLIENT") !== "SELLER" ? `<div class="row"><span>Delivery / Shipping (estimate)</span><span>${money(inv.delivery)}</span></div>` : ""}
  ${Number(inv.tax) ? `<div class="row"><span>Tax</span><span>${money(inv.tax)}</span></div>` : ""}
  <div class="row gt"><span>GRAND TOTAL</span><span>${money(inv.grand_total)}</span></div>
  <div class="row"><span>Amount Paid</span><span>${money(inv.amount_paid)}</span></div>
  ${balance > 0.004 ? `<div class="row gt"><span>BALANCE DUE</span><span>${money(balance)}</span></div>` : ""}
</div>
<div class="sec3">
  <div><div class="lbl">PAYMENT TERMS</div><div class="small">${payTerms}</div>
    ${[st.bankName, st.accountName && "Account name: " + st.accountName, st.accountNumber && "Account no: " + st.accountNumber, st.iban && "IBAN: " + st.iban, st.paymentInstructions].filter(Boolean).length ? `<div class="lbl" style="margin-top:8px">PAYMENT INFORMATION</div><div class="small">${esc([st.bankName, st.accountName && "Account name: " + st.accountName, st.accountNumber && "Account no: " + st.accountNumber, st.iban && "IBAN: " + st.iban, st.paymentInstructions].filter(Boolean).join("\n"))}</div>` : ""}</div>
  <div><div class="lbl">DELIVERY</div><div class="small">${esc([ (inv.delivery_paid_by || "CLIENT") === "SELLER" ? "Delivery: arranged & paid by Prime Labels" : (Number(inv.delivery) ? "Delivery charge is an estimate — final amount to be confirmed before dispatch." : ""), inv.delivery_method && "Method: " + inv.delivery_method, (inv.courier || inv.tracking_number) ? "Courier: " + (inv.courier || "—") + (inv.tracking_number ? "   Tracking: " + inv.tracking_number : "") : "", inv.estimated_delivery && "Estimated: " + inv.estimated_delivery, inv.delivery_notes && "Notes: " + inv.delivery_notes].filter(Boolean).join("\n"))}</div>
    ${inv.notes ? `<div class="lbl" style="margin-top:8px">NOTES</div><div class="small">${esc(inv.notes)}</div>` : ""}</div>
</div>
${terms.length ? `<div class="tc"><div class="lbl">TERMS &amp; CONDITIONS</div><ol>${terms.map((t) => `<li>${esc(t)}</li>`).join("")}</ol></div>` : ""}
<div class="ft"><span>${esc(st.footer || "")}</span><span>${esc(d.business?.website || "primelabelsintl.com")}</span></div>
<script>window.onload = () => window.print();</script>
</body></html>`;
}
