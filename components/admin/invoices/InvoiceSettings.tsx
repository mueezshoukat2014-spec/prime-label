"use client";

import { useEffect, useState } from "react";
import { INV_CURRENCIES, PAYMENT_TERMS_TYPES, DEFAULT_TERMS_AND_CONDITIONS } from "@/lib/biz/invoice-types";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-[13px] text-cream outline-none focus:border-champagne/50";
const label = "mb-1 block text-[10px] uppercase tracking-wide2 text-cream-dim";
const card = "rounded-2xl border border-cream/10 bg-cream/[0.02] p-4";

export default function InvoiceSettings({ onBack }: { onBack: () => void }) {
  const [s, setS] = useState<any>(null);
  const [toast, setToast] = useState("");
  const set = (k: string, v: any) => setS((o: any) => ({ ...o, [k]: v }));

  useEffect(() => {
    fetch("/api/admin/biz/invoice-settings").then((r) => r.json()).then((j) => j?.ok && setS(j.settings)).catch(() => {});
  }, []);

  if (!s) return <p className="text-[12.5px] text-cream-muted">Loading settings…</p>;

  const save = async () => {
    const j = await fetch("/api/admin/biz/invoice-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) }).then((r) => r.json()).catch(() => ({}));
    setToast(j?.ok ? "Settings saved ✓" : j?.error || "Save failed");
    if (j?.ok) setS(j.settings);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button className="btn-ghost" onClick={onBack}>← Invoices</button>
          <h1 className="display text-2xl">Invoice Settings</h1>
        </div>
        <button className="btn-primary" onClick={save}>💾 Save Settings</button>
      </div>
      {toast && <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">{toast}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <p className="mb-3 text-[10px] uppercase tracking-wide2 text-cream-dim">Numbering & defaults</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><span className={label}>Invoice prefix</span><input className={input} value={s.prefix} onChange={(e) => set("prefix", e.target.value)} /></div>
            <div><span className={label}>Next invoice number</span><input className={input} type="number" min="1" value={s.nextSeq} onChange={(e) => set("nextSeq", e.target.value)} /></div>
            <div><span className={label}>Default currency</span><select className={input} value={s.defaultCurrency} onChange={(e) => set("defaultCurrency", e.target.value)}>{INV_CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><span className={label}>Default payment terms</span><select className={input} value={s.defaultPaymentTerms} onChange={(e) => set("defaultPaymentTerms", e.target.value)}>{PAYMENT_TERMS_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><span className={label}>Default tax</span><input className={input} type="number" min="0" value={s.defaultTax} onChange={(e) => set("defaultTax", e.target.value)} /></div>
            <div><span className={label}>Default delivery charge</span><input className={input} type="number" min="0" value={s.defaultDelivery} onChange={(e) => set("defaultDelivery", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>Default notes</span><textarea className={input} rows={2} value={s.defaultNotes} onChange={(e) => set("defaultNotes", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>Invoice footer</span><input className={input} value={s.footer} onChange={(e) => set("footer", e.target.value)} /></div>
          </div>
          <p className="mt-3 text-[11px] text-cream-dim">Preview of next number: <b className="text-champagne">{s.prefix}-{String(Number(s.nextSeq) || 1).padStart(6, "0")}</b> — historical numbers are never renumbered.</p>
        </div>

        <div className={card}>
          <p className="mb-3 text-[10px] uppercase tracking-wide2 text-cream-dim">Business & payment information</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><span className={label}>Business address (on invoice)</span><input className={input} value={s.address} onChange={(e) => set("address", e.target.value)} /></div>
            <div><span className={label}>Tax / VAT number</span><input className={input} value={s.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} /></div>
            <div><span className={label}>Bank name</span><input className={input} value={s.bankName} onChange={(e) => set("bankName", e.target.value)} /></div>
            <div><span className={label}>Account name</span><input className={input} value={s.accountName} onChange={(e) => set("accountName", e.target.value)} /></div>
            <div><span className={label}>Account number</span><input className={input} value={s.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>IBAN</span><input className={input} value={s.iban} onChange={(e) => set("iban", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>Payment instructions</span><textarea className={input} rows={3} value={s.paymentInstructions} onChange={(e) => set("paymentInstructions", e.target.value)} placeholder="Transfer fees, confirmation via WhatsApp, etc." /></div>
          </div>
        </div>
      </div>

      <div className={card}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wide2 text-cream-dim">Default Terms & Conditions (editable)</p>
          <button className="btn-ghost" onClick={() => set("termsAndConditions", DEFAULT_TERMS_AND_CONDITIONS)}>Reset to defaults</button>
        </div>
        <textarea className={input} rows={12} value={s.termsAndConditions} onChange={(e) => set("termsAndConditions", e.target.value)} />
      </div>
      <div className="flex justify-end"><button className="btn-primary" onClick={save}>💾 Save Settings</button></div>
    </div>
  );
}
