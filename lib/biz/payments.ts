import "server-only";
import { sql } from "@/lib/db";
import { num, toPkr } from "./money";
import { refreshPaymentStatus } from "./calc";

/**
 * Record a payment with full dual-currency snapshots.
 * order_amount = agreed amount in the ORDER currency allocated to this
 * payment; received_* = the ACTUAL money in hand (e.g. PKR via Western Union).
 * rate = effective PKR per 1 unit of order currency for this payment.
 */
export async function recordPayment(b: Record<string, unknown>) {
  const orderId = b.order_id ? Number(b.order_id) : null;
  const orderCurrency = String(b.order_currency || "PKR");
  const orderAmount = num(b.order_amount ?? b.pay_amount);
  const receivedCurrency = String(b.received_currency || "PKR");
  const receivedAmount = num(b.received_amount ?? b.pay_amount);
  const receivedPkr =
    receivedCurrency === "PKR"
      ? receivedAmount
      : receivedAmount * (num(b.rate) > 0 ? num(b.rate) : toPkr(1, receivedCurrency));
  const fee = num(b.fee);
  const feeCurrency = String(b.fee_currency || "PKR");
  const feePkr = feeCurrency === "PKR" ? fee : fee * (num(b.fee_rate) || toPkr(1, feeCurrency));
  // Effective exchange rate: PKR received per 1 unit of order currency.
  const rate = orderAmount > 0 ? +(receivedPkr / orderAmount).toFixed(2) : 0;

  const [o] = orderId ? await sql`SELECT customer_id FROM orders WHERE id = ${orderId}` : [null];

  const [row] = await sql`
    INSERT INTO biz_payments
      (order_id, customer_id, date, order_currency, order_amount, method,
       received_currency, received_amount, received_pkr, rate, fee, fee_currency, fee_pkr,
       fee_paid_by, wu_ref, notes)
    VALUES
      (${orderId}, ${b.customer_id ? Number(b.customer_id) : o?.customer_id ?? null},
       ${String(b.date || new Date().toISOString().slice(0, 10))}, ${orderCurrency}, ${orderAmount},
       ${String(b.method || "Cash")}, ${receivedCurrency}, ${receivedAmount}, ${receivedPkr}, ${rate},
       ${fee}, ${feeCurrency}, ${feePkr}, ${String(b.fee_paid_by || "customer")},
       ${String(b.wu_ref || "")}, ${String(b.notes || "")})
    RETURNING *`;
  if (orderId) await refreshPaymentStatus(orderId);
  return row;
}
