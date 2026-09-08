/**
 * Single source of truth for the order pipeline.
 *
 * Used by:
 *  - components/admin/OrdersManager.tsx  (owner updates the stage)
 *  - components/OrderTracker.tsx         (customer sees the same stages live at /track)
 *  - app/api/admin/orders/route.ts       (validation)
 *
 * The customer page reads the status straight from the database, so the
 * moment the admin saves a change it is live on /track — same list, same
 * order, zero drift.
 */
export const ORDER_STATUSES = [
  "Payment received",
  "Proof approved",
  "In production",
  "Quality checking",
  "Waiting for photo/video proofs",
  "Packed",
  "Shipped",
  "Delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Default stage for a newly created order. */
export const DEFAULT_ORDER_STATUS: OrderStatus = "Payment received";
