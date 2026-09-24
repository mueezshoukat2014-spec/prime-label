import "server-only";
import { sql } from "@/lib/db";
import { num, toPkr } from "./money";

/**
 * All financial math for the business system.
 *
 * Everything is DERIVED from stored snapshot values (rate/pkr columns) —
 * nothing is materialised, so historical records can never drift when
 * current rates or product costs change.
 */

export type OrderRow = Record<string, any>;

export interface OrderTotals {
  /** Billed total in order currency (sale - discount + customer delivery). */
  billedCcy: number;
  billedPkr: number;
  costsPkr: number;
  grossPkr: number;
  paidCcy: number;
  outstandingCcy: number;
  receivedPkr: number;
  feesPkr: number;
}

export async function orderRows(orderId: number) {
  const [costs, payments, items] = await Promise.all([
    sql`SELECT * FROM biz_order_costs WHERE order_id = ${orderId}`,
    sql`SELECT * FROM biz_payments WHERE order_id = ${orderId} AND void = FALSE`,
    sql`SELECT * FROM biz_order_items WHERE order_id = ${orderId}`,
  ]);
  return { costs, payments, items };
}

export function computeOrderTotals(o: OrderRow, costs: any[], payments: any[]): OrderTotals {
  const ccy = o.currency || "PKR";
  const rate = num(o.rate) > 0 ? num(o.rate) : ccy === "PKR" ? 1 : 0;
  const sale = num(o.sale_amount);
  const discount = num(o.discount);
  const custDelivery = num(o.customer_delivery_charge);
  const billedCcy = sale - discount + custDelivery;
  const billedPkr = ccy === "PKR" ? billedCcy : billedCcy * rate;

  const costsPkr =
    costs.reduce((s, c) => s + num(c.pkr), 0) + num(o.actual_delivery_pkr);

  const grossPkr = billedPkr - costsPkr;

  const paidCcy = payments.reduce((s, p) => s + num(p.order_amount), 0);
  const outstandingCcy = Math.max(0, billedCcy - paidCcy);

  const receivedPkr = payments.reduce((s, p) => s + num(p.received_pkr), 0);
  const feesPkr = payments.reduce(
    (s, p) => s + (String(p.fee_paid_by) === "business" ? num(p.fee_pkr) : 0),
    0
  );

  return {
    billedCcy: +billedCcy.toFixed(2),
    billedPkr: +billedPkr.toFixed(2),
    costsPkr: +costsPkr.toFixed(2),
    grossPkr: +grossPkr.toFixed(2),
    paidCcy: +paidCcy.toFixed(2),
    outstandingCcy: +outstandingCcy.toFixed(2),
    receivedPkr: +receivedPkr.toFixed(2),
    feesPkr: +feesPkr.toFixed(2),
  };
}

export async function orderTotals(o: OrderRow): Promise<OrderTotals> {
  const { costs, payments } = await orderRows(o.id);
  return computeOrderTotals(o, costs, payments);
}

/** Recompute and store an order's payment status from its live payments. */
export async function refreshPaymentStatus(orderId: number): Promise<void> {
  const [o] = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
  if (!o) return;
  const t = await orderTotals(o);
  const status =
    t.billedCcy <= 0
      ? "UNPAID"
      : t.outstandingCcy <= 0.009
        ? "PAID"
        : t.paidCcy > 0
          ? "PARTIAL"
          : "UNPAID";
  await sql`UPDATE orders SET payment_status = ${status}, updated_at = now() WHERE id = ${orderId}`;
}

/** Suggest a default cost (PKR) from the product cost book for a quantity. */
export async function suggestCostPkr(
  productName: string,
  quantity: number
): Promise<number | null> {
  const rows = await sql`SELECT tiers FROM product_costs WHERE lower(product_name) = lower(${productName}) AND active = TRUE LIMIT 1`;
  if (!rows.length) return null;
  let tiers: Array<{ qty: number; pkr: number }> = [];
  try {
    tiers = typeof rows[0].tiers === "string" ? JSON.parse(rows[0].tiers) : rows[0].tiers || [];
  } catch {
    return null;
  }
  if (!tiers.length) return null;
  // nearest tier at or below the quantity, else the smallest tier
  const sorted = [...tiers].sort((a, b) => num(a.qty) - num(b.qty));
  let best = sorted[0];
  for (const t of sorted) if (num(t.qty) <= quantity) best = t;
  const q = num(best.qty);
  if (q > 0 && quantity > 0) return +((num(best.pkr) / q) * quantity).toFixed(2);
  return num(best.pkr);
}

/**
 * Business cash position from real stored transactions (PKR).
 *
 * CASH ≠ PROFIT: this only sums actual money movements —
 * opening + customer receipts + owner investment
 * − direct order costs paid − general expenses − business-paid fees
 * − owner withdrawals.
 */
export async function cashPosition(from?: string, to?: string) {
  const f = from || "0001-01-01";
  const t = to || "9999-12-31";

  const pays = await sql`
    SELECT COALESCE(SUM(received_pkr),0)::float AS in_pkr,
           COALESCE(SUM(CASE WHEN fee_paid_by='business' THEN fee_pkr ELSE 0 END),0)::float AS fee_out
    FROM biz_payments WHERE void = FALSE AND date BETWEEN ${f} AND ${t}`;
  const orderCosts = await sql`
    SELECT COALESCE(SUM(pkr),0)::float AS out_pkr FROM biz_order_costs
    WHERE date BETWEEN ${f} AND ${t}`;
  const delivery = await sql`
    SELECT COALESCE(SUM(actual_delivery_pkr),0)::float AS out_pkr FROM orders
    WHERE COALESCE(actual_delivery_pkr,0) > 0
      AND COALESCE(updated_at, created_at) BETWEEN ${f}::timestamptz AND (${t}::date + 1)::timestamptz`;
  const expenses = await sql`
    SELECT COALESCE(SUM(pkr),0)::float AS out_pkr FROM biz_expenses
    WHERE void = FALSE AND date BETWEEN ${f} AND ${t}`;
  const owner = await sql`
    SELECT kind, COALESCE(SUM(pkr),0)::float AS pkr FROM biz_owner_txns
    WHERE date BETWEEN ${f} AND ${t} GROUP BY kind`;
  const openingRows = await sql`SELECT value FROM biz_settings WHERE key = 'opening_cash_pkr'`;

  const openingCash = parseFloat(String(openingRows[0]?.value ?? "0")) || 0;
  const moneyIn = pays[0]?.in_pkr ?? 0;
  const feesOut = pays[0]?.fee_out ?? 0;
  const costsOut = orderCosts[0]?.out_pkr ?? 0;
  const deliveryOut = delivery[0]?.out_pkr ?? 0;
  const expensesOut = expenses[0]?.out_pkr ?? 0;
  const invest = owner.find((r) => r.kind === "INVESTMENT")?.pkr ?? 0;
  const withdraw = owner.find((r) => r.kind === "WITHDRAWAL")?.pkr ?? 0;

  const current =
    openingCash + moneyIn + invest - costsOut - deliveryOut - expensesOut - feesOut - withdraw;

  return {
    openingCash,
    moneyIn,
    invest,
    costsOut,
    deliveryOut,
    expensesOut,
    feesOut,
    withdraw,
    current: +current.toFixed(2),
  };
}
