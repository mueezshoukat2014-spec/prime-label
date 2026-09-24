import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { ensureBizSchema } from "@/lib/biz/schema";
import { num } from "@/lib/biz/money";
import { computeOrderTotals, cashPosition } from "@/lib/biz/calc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Real-data reports — every figure is derived from stored snapshots, never
 * hardcoded. PKR is the reporting base; historical rows keep their own rates.
 */
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  await ensureBizSchema();

  const [orders, costs, payments, expenses, quotes, customers, ownerTxns] = await Promise.all([
    sql`SELECT * FROM orders WHERE COALESCE(archived, FALSE) = FALSE ORDER BY id`,
    sql`SELECT * FROM biz_order_costs`,
    sql`SELECT * FROM biz_payments WHERE void = FALSE`,
    sql`SELECT * FROM biz_expenses WHERE void = FALSE`,
    sql`SELECT * FROM biz_quotations`,
    sql`SELECT * FROM biz_customers WHERE archived = FALSE`,
    sql`SELECT * FROM biz_owner_txns`,
  ]);

  const costsByOrder = new Map<number, any[]>();
  for (const c of costs) {
    const arr = costsByOrder.get(Number(c.order_id)) || [];
    arr.push(c);
    costsByOrder.set(Number(c.order_id), arr);
  }
  const paysByOrder = new Map<number, any[]>();
  for (const p of payments) {
    if (!p.order_id) continue;
    const arr = paysByOrder.get(Number(p.order_id)) || [];
    arr.push(p);
    paysByOrder.set(Number(p.order_id), arr);
  }
  const nameOf = (cid: number | null) => {
    const c = customers.find((x) => x.id === Number(cid));
    return c ? c.brand_name || c.full_name : "Direct / walk-in";
  };
  // postgres.js returns Date objects for timestamptz, strings for DATE.
  const monthKey = (v: unknown): string => {
    if (!v) return "";
    if (v instanceof Date) return v.toISOString().slice(0, 7);
    return String(v).slice(0, 7);
  };

  // ---- per-order enrichment ------------------------------------------------
  const monthly = new Map<string, any>();
  const byCountry = new Map<string, { count: number; billedPkr: number; grossPkr: number }>();
  const byProduct = new Map<string, { count: number; billedPkr: number; grossPkr: number }>();
  const byCustomer = new Map<number, { name: string; orders: number; billedPkr: number; receivedPkr: number; grossPkr: number; outstandingPkr: number }>();
  const outstanding: any[] = [];
  let totBilledPkr = 0, totGrossPkr = 0, totReceivedPkr = 0, totCostsPkr = 0;

  for (const o of orders) {
    const t = computeOrderTotals(o, costsByOrder.get(o.id) || [], paysByOrder.get(o.id) || []);
    totBilledPkr += t.billedPkr; totGrossPkr += t.grossPkr;
    totReceivedPkr += t.receivedPkr; totCostsPkr += t.costsPkr;

    const month = monthKey(o.created_at);
    const m = monthly.get(month) || { month, orders: 0, billedPkr: 0, costsPkr: 0, grossPkr: 0, receivedPkr: 0, expensesPkr: 0, adSpendPkr: 0, investmentsPkr: 0, withdrawalsPkr: 0, newCustomers: 0, netCashPkr: 0 };
    m.orders += 1; m.billedPkr += t.billedPkr; m.costsPkr += t.costsPkr; m.grossPkr += t.grossPkr;
    monthly.set(month, m);

    const country = String(o.country || "").trim() || "Unknown";
    const cc = byCountry.get(country) || { count: 0, billedPkr: 0, grossPkr: 0 };
    cc.count += 1; cc.billedPkr += t.billedPkr; cc.grossPkr += t.grossPkr;
    byCountry.set(country, cc);

    const product = String(o.product || "").trim() || "Other";
    const pp = byProduct.get(product) || { count: 0, billedPkr: 0, grossPkr: 0 };
    pp.count += 1; pp.billedPkr += t.billedPkr; pp.grossPkr += t.grossPkr;
    byProduct.set(product, pp);

    const cid = Number(o.customer_id || 0);
    const cn = nameOf(o.customer_id);
    const cu = byCustomer.get(cid) || { name: cn, orders: 0, billedPkr: 0, receivedPkr: 0, grossPkr: 0, outstandingPkr: 0 };
    cu.orders += 1; cu.billedPkr += t.billedPkr; cu.receivedPkr += t.receivedPkr; cu.grossPkr += t.grossPkr;
    cu.outstandingPkr += t.outstandingCcy * (num(o.rate) > 0 ? num(o.rate) : 1);
    byCustomer.set(cid, cu);

    if (t.outstandingCcy > 0.009 && String(o.status) !== "CANCELLED") {
      outstanding.push({
        order_ref: o.order_ref, name: o.name, brand: cn, country,
        currency: o.currency, outstandingCcy: t.outstandingCcy,
        outstandingPkr: +(t.outstandingCcy * (num(o.rate) > 0 ? num(o.rate) : 1)).toFixed(2),
        status: o.status, payment_status: o.payment_status,
      });
    }
  }

  // ---- payments by month ----------------------------------------------------
  for (const p of payments) {
    const month = monthKey(p.date);
    const m = monthly.get(month) || { month, orders: 0, billedPkr: 0, costsPkr: 0, grossPkr: 0, receivedPkr: 0, expensesPkr: 0, adSpendPkr: 0, investmentsPkr: 0, withdrawalsPkr: 0, newCustomers: 0, netCashPkr: 0 };
    m.receivedPkr += num(p.received_pkr);
    if (String(p.fee_paid_by) === "business") m.netCashPkr -= num(p.fee_pkr);
    monthly.set(month, m);
  }
  // ---- order costs + actual delivery by month (cash out) ---------------------
  for (const c of costs) {
    const month = monthKey(c.date);
    const m = monthly.get(month) || { month, orders: 0, billedPkr: 0, costsPkr: 0, grossPkr: 0, receivedPkr: 0, expensesPkr: 0, adSpendPkr: 0, investmentsPkr: 0, withdrawalsPkr: 0, newCustomers: 0, netCashPkr: 0 };
    m.netCashPkr -= num(c.pkr);
    monthly.set(month, m);
  }
  for (const o of orders) {
    if (num(o.actual_delivery_pkr) <= 0) continue;
    const month = monthKey(o.updated_at || o.created_at);
    const m = monthly.get(month) || { month, orders: 0, billedPkr: 0, costsPkr: 0, grossPkr: 0, receivedPkr: 0, expensesPkr: 0, adSpendPkr: 0, investmentsPkr: 0, withdrawalsPkr: 0, newCustomers: 0, netCashPkr: 0 };
    m.netCashPkr -= num(o.actual_delivery_pkr);
    monthly.set(month, m);
  }
  // ---- expenses by month (+ advertising split) --------------------------------
  const ads: any[] = [];
  for (const e of expenses) {
    const month = monthKey(e.date);
    const m = monthly.get(month) || { month, orders: 0, billedPkr: 0, costsPkr: 0, grossPkr: 0, receivedPkr: 0, expensesPkr: 0, adSpendPkr: 0, investmentsPkr: 0, withdrawalsPkr: 0, newCustomers: 0, netCashPkr: 0 };
    m.expensesPkr += num(e.pkr);
    m.netCashPkr -= num(e.pkr);
    monthly.set(month, m);
    const isAd = String(e.expense_type).toUpperCase().includes("ADVERT") || e.category === "Advertising";
    if (isAd) {
      m.adSpendPkr += num(e.pkr);
      ads.push({ month, platform: e.platform || "Other", campaign: e.campaign || "", pkr: num(e.pkr) });
    }
  }
  // ---- owner money by month ---------------------------------------------------
  for (const tx of ownerTxns) {
    const month = monthKey(tx.date);
    const m = monthly.get(month) || { month, orders: 0, billedPkr: 0, costsPkr: 0, grossPkr: 0, receivedPkr: 0, expensesPkr: 0, adSpendPkr: 0, investmentsPkr: 0, withdrawalsPkr: 0, newCustomers: 0, netCashPkr: 0 };
    if (tx.kind === "INVESTMENT") { m.investmentsPkr += num(tx.pkr); m.netCashPkr += num(tx.pkr); }
    else { m.withdrawalsPkr += num(tx.pkr); m.netCashPkr -= num(tx.pkr); }
    monthly.set(month, m);
  }
  // ---- new customers by month ---------------------------------------------------
  for (const c of customers) {
    const month = monthKey(c.created_at);
    const m = monthly.get(month) || { month, orders: 0, billedPkr: 0, costsPkr: 0, grossPkr: 0, receivedPkr: 0, expensesPkr: 0, adSpendPkr: 0, investmentsPkr: 0, withdrawalsPkr: 0, newCustomers: 0, netCashPkr: 0 };
    m.newCustomers += 1;
    monthly.set(month, m);
  }

  const r2 = (x: any) => {
    const out: any = { ...x };
    for (const k of Object.keys(out)) if (typeof out[k] === "number") out[k] = +out[k].toFixed(2);
    return out;
  };
  const monthlyArr = [...monthly.values()].sort((a, b) => a.month.localeCompare(b.month)).map(r2);
  const adTotals = new Map<string, number>();
  for (const a of ads) adTotals.set(a.platform, (adTotals.get(a.platform) || 0) + a.pkr);

  const cash = await cashPosition();
  const openQuotes = quotes.filter((q) => !["ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED"].includes(String(q.status)));
  const dueFollowUps = openQuotes.filter((q) => q.follow_up_at && String(q.follow_up_at).slice(0, 10) <= new Date().toISOString().slice(0, 10));

  return NextResponse.json({
    ok: true,
    totals: {
      orders: orders.length,
      billedPkr: +totBilledPkr.toFixed(2),
      costsPkr: +totCostsPkr.toFixed(2),
      grossPkr: +totGrossPkr.toFixed(2),
      receivedPkr: +totReceivedPkr.toFixed(2),
      outstandingPkr: +outstanding.reduce((s, x) => s + x.outstandingPkr, 0).toFixed(2),
      customers: customers.length,
      quotes: quotes.length,
      openQuotes: openQuotes.length,
      dueFollowUps: dueFollowUps.length,
    },
    monthly: monthlyArr,
    byCountry: [...byCountry.entries()].map(([k, v]) => ({ country: k, ...r2(v) })).sort((a, b) => b.billedPkr - a.billedPkr),
    byProduct: [...byProduct.entries()].map(([k, v]) => ({ product: k, ...r2(v) })).sort((a, b) => b.billedPkr - a.billedPkr),
    byCustomer: [...byCustomer.values()].map(r2).sort((a, b) => b.grossPkr - a.grossPkr).slice(0, 20),
    outstanding: outstanding.sort((a, b) => b.outstandingPkr - a.outstandingPkr),
    ads: { rows: ads, byPlatform: [...adTotals.entries()].map(([platform, pkr]) => ({ platform, pkr: +pkr.toFixed(2) })).sort((a, b) => b.pkr - a.pkr) },
    followUps: openQuotes.map((q) => ({ id: q.id, q_number: q.q_number, status: q.status, follow_up_at: q.follow_up_at, notes: q.follow_up_notes, grand_total: num(q.grand_total), currency: q.currency })),
    cash,
  });
}
