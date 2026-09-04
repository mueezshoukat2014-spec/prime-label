"use client";

import { useCallback, useEffect, useState } from "react";

type Referral = {
  id: number;
  code: string;
  name: string;
  phone: string;
  uses: number;
  created_at: string;
};

export default function ReferralsManager() {
  const [refs, setRefs] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/referrals");
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setRefs(j.referrals);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  async function bump(id: number, delta: 1 | -1) {
    await fetch("/api/admin/referrals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, delta }),
    });
    flash(delta > 0 ? "Redemption logged" : "Redemption removed");
    load();
  }

  async function del(id: number, code: string) {
    if (!confirm(`Delete referral code ${code}?`)) return;
    await fetch("/api/admin/referrals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const totalUses = refs.reduce((s, r) => s + r.uses, 0);

  return (
    <div className="space-y-4">
      <h1 className="display text-3xl">Referrals</h1>
      <p className="text-[12.5px] leading-relaxed text-cream-muted">
        Codes created at <span className="text-champagne">/refer</span>. When an order confirms
        with a code, press <span className="text-cream">+1 redeemed</span> — that logs the
        referrer&apos;s earned 10% (their WhatsApp number is here for when they claim it).
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface/40 p-4 text-center">
          <p className="display text-3xl text-champagne">{refs.length}</p>
          <p className="mt-1 text-[11.5px] uppercase tracking-wide2 text-cream-dim">Codes created</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface/40 p-4 text-center">
          <p className="display text-3xl text-champagne">{totalUses}</p>
          <p className="mt-1 text-[11.5px] uppercase tracking-wide2 text-cream-dim">Orders via referral</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface/40 p-4 text-center">
          <p className="display text-3xl text-champagne">{refs.filter((r) => r.uses > 0).length}</p>
          <p className="mt-1 text-[11.5px] uppercase tracking-wide2 text-cream-dim">Active referrers</p>
        </div>
      </div>

      {loading ? (
        <p className="text-[13px] text-cream-dim">Loading…</p>
      ) : refs.length === 0 ? (
        <p className="text-[13px] text-cream-dim">
          No referral codes yet — share the /refer page with existing customers to seed it.
        </p>
      ) : (
        refs.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface/40 p-4">
            <span className="display text-lg text-champagne">{r.code}</span>
            <div className="min-w-0">
              <p className="text-[13px] text-cream">{r.name}</p>
              <p className="text-[11.5px] text-cream-dim">{r.phone}</p>
            </div>
            <span className="ml-auto rounded-full border border-line px-3 py-1 text-[11.5px] text-cream-muted">
              {r.uses} redeemed
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => bump(r.id, 1)}
                className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-[12px] text-green-300 hover:bg-green-500/20"
              >
                +1 redeemed
              </button>
              {r.uses > 0 && (
                <button
                  onClick={() => bump(r.id, -1)}
                  className="rounded-md border border-line px-3 py-1.5 text-[12px] text-cream-muted hover:border-champagne/40"
                >
                  −1
                </button>
              )}
              <button
                onClick={() => del(r.id, r.code)}
                className="rounded-md border border-red-500/30 px-3 py-1.5 text-[12px] text-red-300 hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-champagne/40 bg-surface px-5 py-3 text-[13px] text-champagne shadow-soft">
          {toast}
        </div>
      )}
    </div>
  );
}
