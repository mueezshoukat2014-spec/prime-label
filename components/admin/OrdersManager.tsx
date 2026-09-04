"use client";

import { useCallback, useEffect, useState } from "react";

const input =
  "w-full rounded-lg border border-line bg-ink/40 px-3 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50";

const STATUSES = [
  "Proof approved",
  "In production",
  "Quality check",
  "Packed",
  "Shipped",
  "Delivered",
];

type Order = {
  id: number;
  code: string;
  customer_name: string;
  phone: string | null;
  product: string | null;
  status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  eta: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function waShareLink(o: { code: string; phone?: string | null; status?: string }) {
  const msg = `Hi! Your Prime Labels order ${o.code} is confirmed ✅\n\nTrack it live anytime here:\nhttps://primelabelsintl.com/track?code=${o.code}\n\nCurrent status: ${o.status || "Proof approved"}`;
  const digits = String(o.phone || "").replace(/\D/g, "");
  return digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setOrders(j.orders);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setCreating(true);
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: fd.get("customer_name"),
        phone: fd.get("phone"),
        product: fd.get("product"),
        code: fd.get("code"),
      }),
    });
    const j = await res.json().catch(() => ({}));
    setCreating(false);
    if (!j?.ok) return flash(j?.error || "Failed");
    (e.target as HTMLFormElement).reset();
    flash(`Created ${j.order.code}`);
    load();
  }

  async function save(o: Order) {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(o),
    });
    const j = await res.json().catch(() => ({}));
    flash(j?.ok ? "Saved" : j?.error || "Failed");
    load();
  }

  async function del(id: number, code: string) {
    if (!confirm(`Delete order ${code}?`)) return;
    await fetch("/api/admin/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    flash("Deleted");
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="display text-3xl">Orders</h1>
      <p className="text-[12.5px] leading-relaxed text-cream-muted">
        Create an order when it&apos;s confirmed, send the customer their tracking link on
        WhatsApp, then update the status as production moves. Customers see it live at{" "}
        <span className="text-champagne">/track</span>.
      </p>

      {/* create */}
      <div className="rounded-2xl border border-line bg-surface/40 p-5">
        <h3 className="mb-3 text-[13px] font-medium">New order</h3>
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
          <input name="customer_name" placeholder="Customer name *" className={input} required />
          <input name="phone" placeholder="WhatsApp e.g. +9665…" className={input} />
          <input name="product" placeholder="Product(s) e.g. Woven Labels × 500" className={input} />
          <input name="code" placeholder="Code (blank = auto PL-XXXX)" className={input} />
          <button
            disabled={creating}
            className="btn-primary !py-2.5 !px-5 text-[12px] disabled:opacity-50 sm:col-span-2 sm:justify-self-start"
          >
            {creating ? "Creating…" : "Create Order"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-[13px] text-cream-dim">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-[13px] text-cream-dim">No orders yet — create the first one above.</p>
      ) : (
        orders.map((o) => <OrderRow key={o.id} order={o} onSave={save} onDelete={del} />)
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-champagne/40 bg-surface px-5 py-3 text-[13px] text-champagne shadow-soft">
          {toast}
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
  onSave,
  onDelete,
}: {
  order: Order;
  onSave: (o: Order) => void;
  onDelete: (id: number, code: string) => void;
}) {
  const [o, setO] = useState<Order>(order);
  const [open, setOpen] = useState(false);
  const set = (k: keyof Order, v: string) => setO((p) => ({ ...p, [k]: v }));

  const statusIdx = STATUSES.indexOf(o.status);

  return (
    <div className="rounded-2xl border border-line bg-surface/40 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="display text-lg text-champagne">{o.code}</span>
        <span className="text-[13px] text-cream">{o.customer_name}</span>
        {o.product && <span className="text-[12px] text-cream-dim">· {o.product}</span>}
        <span
          className={`ml-auto rounded-full border px-3 py-1 text-[11px] ${
            o.status === "Delivered"
              ? "border-green-400/40 bg-green-400/10 text-green-300"
              : "border-champagne/40 bg-champagne/10 text-champagne"
          }`}
        >
          {o.status}
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-line px-3 py-1.5 text-[12px] hover:border-champagne/40"
        >
          {open ? "Close" : "Edit"}
        </button>
      </div>

      {/* quick status advance */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STATUSES.map((s, i) => (
          <button
            key={s}
            onClick={() => onSave({ ...o, status: s })}
            className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
              i === statusIdx
                ? "border-champagne bg-champagne/15 text-champagne"
                : i < statusIdx
                  ? "border-line text-cream-muted"
                  : "border-line text-cream-dim hover:border-champagne/40 hover:text-cream"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {open && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className={input} value={o.customer_name} onChange={(e) => set("customer_name", e.target.value)} placeholder="Customer name" />
          <input className={input} value={o.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="WhatsApp" />
          <input className={input} value={o.product ?? ""} onChange={(e) => set("product", e.target.value)} placeholder="Product(s)" />
          <input className={input} value={o.eta ?? ""} onChange={(e) => set("eta", e.target.value)} placeholder="ETA e.g. 18–22 Jan" />
          <input className={input} value={o.tracking_number ?? ""} onChange={(e) => set("tracking_number", e.target.value)} placeholder="Courier tracking number" />
          <input className={input} value={o.tracking_url ?? ""} onChange={(e) => set("tracking_url", e.target.value)} placeholder="Courier tracking URL" />
          <textarea rows={2} className={input + " resize-none sm:col-span-2"} value={o.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Private notes (never shown to customer)" />
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button onClick={() => onSave(o)} className="rounded-md border border-line px-4 py-2 text-[12px] hover:border-champagne/40">
              Save changes
            </button>
            <a
              href={waShareLink(o)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-[12px] text-green-300 hover:bg-green-500/20"
            >
              Send tracking link on WhatsApp
            </a>
            <button
              onClick={() => onDelete(o.id, o.code)}
              className="ml-auto rounded-md border border-red-500/30 px-4 py-2 text-[12px] text-red-300 hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
