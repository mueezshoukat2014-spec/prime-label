import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { DEFAULT_INVOICE_SETTINGS, getInvoiceSettings, saveInvoiceSettings } from "@/lib/biz/invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, settings: await getInvoiceSettings() });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const cur = await getInvoiceSettings();
  const s = (v: unknown, max = 4000) => String(v ?? "").slice(0, max);

  const next = {
    ...cur,
    prefix: (s(b.prefix, 20).trim() || DEFAULT_INVOICE_SETTINGS.prefix).replace(/[^\w-]/g, ""),
    nextSeq: Math.max(1, Math.floor(Number(b.nextSeq) || cur.nextSeq)),
    pad: Math.min(10, Math.max(3, Math.floor(Number(b.pad) || cur.pad))),
    defaultCurrency: s(b.defaultCurrency, 10) || cur.defaultCurrency,
    defaultPaymentTerms: s(b.defaultPaymentTerms, 20) || cur.defaultPaymentTerms,
    defaultTax: Math.max(0, Number(b.defaultTax) || 0),
    defaultDelivery: Math.max(0, Number(b.defaultDelivery) || 0),
    defaultNotes: s(b.defaultNotes, 4000),
    footer: s(b.footer, 500),
    paymentInstructions: s(b.paymentInstructions, 4000),
    termsAndConditions: s(b.termsAndConditions, 8000) || DEFAULT_INVOICE_SETTINGS.termsAndConditions,
    address: s(b.address, 600),
    bankName: s(b.bankName, 200),
    accountName: s(b.accountName, 200),
    accountNumber: s(b.accountNumber, 100),
    iban: s(b.iban, 100),
    taxNumber: s(b.taxNumber, 100),
  };
  await saveInvoiceSettings(next);
  return NextResponse.json({ ok: true, settings: next });
}
