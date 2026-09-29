import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { paymentTermsText } from "@/lib/biz/invoice";

const A4W = 595.28;
const M = 44;
const IW = A4W - M * 2;
const BOTTOM = 800;

const INK: [number, number, number] = [18, 18, 22];
const MUT: [number, number, number] = [110, 108, 104];
const GOLD: [number, number, number] = [158, 128, 70];

const money = (n: number, ccy: string) =>
  `${ccy} ${(Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface PdfData {
  invoice: any;
  items: any[];
  customer: any;
  order: any;
  settings: any;
  business: { name: string; phone: string; email: string; website: string; instagram?: string };
}

export function buildInvoicePdf(d: PdfData): Promise<Buffer> {
  const inv = d.invoice;
  const ccy = inv.currency || "PKR";
  const st = d.settings;
  const snap = inv.customer_snapshot || {};
  const custName = snap.name || d.customer?.full_name || "Customer";

  const doc = new PDFDocument({ size: "A4", margin: M, bufferPages: true, info: { Title: `Invoice ${inv.inv_number}` } });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise<Buffer>((res) => doc.on("end", () => res(Buffer.concat(chunks))));

  const logoPath = path.join(process.cwd(), "public", "pl-monogram.png");

  /* header */
  if (fs.existsSync(logoPath)) doc.image(logoPath, M, M - 6, { width: 46 });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(15).text(d.business.name, M + 60, M, { width: 240 });
  doc.font("Helvetica").fontSize(8.2).fillColor(MUT);
  const bizLines = [
    st.address, st.taxNumber ? `Tax / VAT No: ${st.taxNumber}` : "",
    `Phone / WhatsApp: ${d.business.phone}`, d.business.email, d.business.website,
  ].filter(Boolean);
  doc.text(bizLines.join("\n"), M + 60, M + 20, { width: 250, lineGap: 1.5 });

  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(21).text("INVOICE", A4W - M - 170, M, { width: 170, align: "right" });
  doc.fillColor(INK).fontSize(10.5).text(String(inv.inv_number), A4W - M - 170, doc.y + 2, { width: 170, align: "right" });
  doc.fillColor(MUT).font("Helvetica").fontSize(8.4);
  doc.text(`Invoice date: ${inv.date || ""}\nDue date: ${inv.due_date || "—"}`, A4W - M - 170, doc.y + 4, { width: 170, align: "right" });

  let y = Math.max(doc.y, M + 78) + 14;
  doc.strokeColor([225, 220, 210]).lineWidth(0.8).moveTo(M, y).lineTo(A4W - M, y).stroke();
  y += 16;

  /* bill-to + meta */
  doc.fillColor(MUT).font("Helvetica-Bold").fontSize(7.6).text("BILLED TO", M, y);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(10).text(String(custName).slice(0, 60), M, y + 12, { width: 250 });
  doc.font("Helvetica").fontSize(8.4).fillColor(MUT);
  const custLines = [
    snap.company, snap.address, [snap.city, snap.country].filter(Boolean).join(", "),
    [snap.phone, snap.whatsapp].filter(Boolean).join(" / "), snap.email,
    snap.reference ? `Ref: ${snap.reference}` : "",
  ].filter(Boolean);
  const custBlockH = doc.heightOfString(custLines.join("\n"), { width: 250, lineGap: 1.4 });
  doc.text(custLines.join("\n"), M, y + 26, { width: 250, lineGap: 1.4 });

  const metaX = M + 290;
  doc.fillColor(MUT).font("Helvetica-Bold").fontSize(7.6).text("INVOICE INFORMATION", metaX, y);
  doc.font("Helvetica").fontSize(8.4).fillColor(INK);
  const payLabel: Record<string, string> = { UNPAID: "Unpaid", PARTIALLY_PAID: "Partially Paid", PAID: "Paid", REFUNDED: "Refunded", CANCELLED: "Cancelled" };
  const delLabel: Record<string, string> = { PENDING: "Pending", PROCESSING: "Processing", SHIPPED: "Shipped", OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled" };
  const metaLines = [
    `Payment status: ${payLabel[inv.payment_status] || inv.payment_status}`,
    inv.payment_method ? `Payment method: ${inv.payment_method}` : "",
    `Delivery status: ${delLabel[inv.delivery_status] || inv.delivery_status}`,
    inv.order_id || inv.order_ref ? `Order ref: ${d.order?.order_ref || inv.order_ref || "—"}` : "",
    inv.design_attachment ? "Design Attached ✓" : "",
  ].filter(Boolean);
  doc.text(metaLines.filter(Boolean).join("\n"), metaX, y + 12, { width: IW - 290, lineGap: 1.6 });
  y += Math.max(custBlockH + 40, 96) + 8;

  /* items table */
  const anyDisc = d.items.some((it: any) => Number(it.discount) > 0);
  const cols = [
    { w: 150, label: "PRODUCT / SERVICE" },
    { w: 92, label: "DETAILS" },
    { w: 38, label: "QTY", right: true },
    { w: 62, label: "UNIT PRICE", right: true },
    ...(anyDisc ? [{ w: 52, label: "DISC.", right: true }] : []),
    { w: 66, label: "LINE TOTAL", right: true },
  ];
  const tableHeader = (yy: number) => {
    doc.rect(M, yy, IW, 16).fill([246, 243, 238]);
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(7);
    let x = M;
    for (const c of cols) {
      doc.text(c.label, x + 4, yy + 5, { width: c.w - 8, align: c.right ? "right" : "left" });
      x += c.w + (IW - cols.reduce((s, cc) => s + cc.w, 0)) / (cols.length - 1);
    }
    return yy + 16;
  };
  const colX = (i: number) => {
    const gap = (IW - cols.reduce((s, c) => s + c.w, 0)) / (cols.length - 1);
    let x = M;
    for (let k = 0; k < i; k++) x += cols[k].w + gap;
    return x;
  };

  y = tableHeader(y);
  doc.font("Helvetica").fontSize(8.2);
  for (const it of d.items) {
    const details = [
      it.description,
      [it.size && `Size: ${it.size}`, it.shape && `Shape: ${it.shape}`, it.color && `Color: ${it.color}`].filter(Boolean).join("  "),
    ].filter(Boolean).join("\n");
    const lineH = Math.max(
      doc.heightOfString(String(it.product), { width: cols[0].w - 8 }),
      doc.heightOfString(details || " ", { width: cols[1].w - 8, lineGap: 1 }),
      12
    ) + 8;
    if (y + lineH > BOTTOM - 60) {
      doc.addPage();
      y = tableHeader(M);
      doc.font("Helvetica").fontSize(8.2);
    }
    doc.fillColor(INK).text(String(it.product), colX(0) + 4, y + 4, { width: cols[0].w - 8 });
    doc.fillColor(MUT).fontSize(7.6).text(details || " ", colX(1) + 4, y + 4, { width: cols[1].w - 8, lineGap: 1 });
    doc.fontSize(8.2).fillColor(INK);
    doc.text(`${Number(it.quantity)}`, colX(2) + 4, y + 4, { width: cols[2].w - 8, align: "right" });
    doc.text(money(Number(it.unit_price), ccy), colX(3) + 4, y + 4, { width: cols[3].w - 8, align: "right" });
    if (anyDisc) doc.text(money(Number(it.discount), ccy), colX(4) + 4, y + 4, { width: cols[4].w - 8, align: "right" });
    doc.font("Helvetica-Bold").text(money(Number(it.subtotal), ccy), colX(anyDisc ? 5 : 4) + 4, y + 4, { width: cols[anyDisc ? 5 : 4].w - 8, align: "right" });
    doc.font("Helvetica");
    y += lineH;
    doc.strokeColor([235, 231, 224]).lineWidth(0.5).moveTo(M, y).lineTo(A4W - M, y).stroke();
    y += 2;
  }

  /* totals */
  if (y > BOTTOM - 190) { doc.addPage(); y = M; }
  y += 12;
  const tX = A4W - M - 220;
  const row = (label: string, val: string, bold = false, gold = false) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 9.4 : 8.6)
      .fillColor(gold ? GOLD : bold ? INK : MUT).text(label, tX, y, { width: 120 });
    doc.text(val, tX + 120, y, { width: 100, align: "right" });
    y += bold ? 17 : 13;
  };
  row("Subtotal", money(Number(inv.subtotal), ccy));
  if (Number(inv.discount)) row("Discount", `− ${money(Number(inv.discount), ccy)}`);
  if (Number(inv.delivery) && (inv.delivery_paid_by || "CLIENT") !== "SELLER") row("Delivery (estimate)", money(Number(inv.delivery), ccy));
  if (Number(inv.tax)) row("Tax", money(Number(inv.tax), ccy));
  y += 2;
  row("GRAND TOTAL", money(Number(inv.grand_total), ccy), true, true);
  row("Amount Paid", money(Number(inv.amount_paid), ccy));
  const balance = Number(inv.grand_total) - Number(inv.amount_paid);
  if (balance > 0.004) row("BALANCE DUE", money(balance, ccy), true);

  /* left column: payment terms + delivery */
  let ly = y - 90;
  if (ly < M + 10) ly = M + 10;
  doc.fillColor(MUT).font("Helvetica-Bold").fontSize(7.6).text("PAYMENT TERMS", M, ly, { width: 260 });
  doc.font("Helvetica").fontSize(8).fillColor(INK);
  ly = doc.y + 4;
  const ptText = paymentTermsText(inv.payment_terms_type, inv.payment_terms_custom);
  doc.text(ptText, M, ly, { width: 260, lineGap: 1.4 });
  ly = doc.y + 8;
  const bankLines = [st.bankName && `Bank: ${st.bankName}`, st.accountName && `Account name: ${st.accountName}`,
    st.accountNumber && `Account no: ${st.accountNumber}`, st.iban && `IBAN: ${st.iban}`, st.paymentInstructions]
    .filter(Boolean) as string[];
  if (bankLines.length) {
    doc.fillColor(MUT).font("Helvetica-Bold").fontSize(7.6).text("PAYMENT INFORMATION", M, ly, { width: 260 });
    doc.font("Helvetica").fontSize(8).fillColor(INK);
    doc.text(bankLines.join("\n"), M, doc.y + 4, { width: 260, lineGap: 1.4 });
  }

  /* delivery block full width after totals if space, else new page */
  y = Math.max(y, doc.y) + 14;
  const delLines = [
    (inv.delivery_paid_by || "CLIENT") === "SELLER"
      ? "Delivery: arranged & paid by Prime Labels"
      : Number(inv.delivery) ? "Delivery charge is an estimate — final amount to be confirmed before dispatch." : "",
    inv.delivery_method ? `Delivery method: ${inv.delivery_method}` : "",
    inv.courier || inv.tracking_number ? `Courier: ${inv.courier || "—"}${inv.tracking_number ? `   Tracking: ${inv.tracking_number}` : ""}` : "",
    inv.estimated_delivery ? `Estimated delivery: ${inv.estimated_delivery}` : "",
    inv.delivery_notes ? `Notes: ${inv.delivery_notes}` : "",
  ].filter(Boolean);
  if (y + 60 > BOTTOM) { doc.addPage(); y = M; }
  doc.fillColor(MUT).font("Helvetica-Bold").fontSize(7.6).text("DELIVERY", M, y);
  doc.font("Helvetica").fontSize(8).fillColor(INK);
  doc.text(delLines.join("\n"), M, y + 11, { width: IW, lineGap: 1.5 });
  y = doc.y + 10;
  if (inv.notes) {
    doc.fillColor(MUT).font("Helvetica-Bold").fontSize(7.6).text("NOTES", M, y);
    doc.font("Helvetica").fontSize(8).fillColor(INK);
    y = doc.y + 4;
    doc.text(String(inv.notes), M, y, { width: IW, lineGap: 1.4 });
    y = doc.y + 10;
  }

  /* terms & conditions */
  const tc = String(st.termsAndConditions || "");
  if (tc) {
    if (y + 80 > BOTTOM) { doc.addPage(); y = M; }
    doc.fillColor(MUT).font("Helvetica-Bold").fontSize(7.6).text("TERMS & CONDITIONS", M, y);
    doc.font("Helvetica").fontSize(7.4).fillColor(MUT);
    y = doc.y + 4;
    const lines = tc.split("\n").filter((l) => l.trim());
    let n = 1;
    for (const l of lines) {
      const t = /^\d+\./.test(l.trim()) ? l.trim() : `${n++}. ${l.trim()}`;
      const h = doc.heightOfString(t, { width: IW, lineGap: 1.2 });
      if (y + h > BOTTOM - 30) { doc.addPage(); y = M; }
      doc.text(t, M, y, { width: IW, lineGap: 1.2 });
      y = doc.y + 2.5;
    }
  }

  /* footers on every page */
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(MUT).font("Helvetica").fontSize(7.4);
    doc.text(`${st.footer || ""}   ·   ${d.business.website}`, M, 812, { width: IW - 60, align: "left" });
    doc.text(`Page ${i + 1} of ${range.count}`, A4W - M - 80, 812, { width: 80, align: "right" });
  }
  doc.end();
  return done;
}
