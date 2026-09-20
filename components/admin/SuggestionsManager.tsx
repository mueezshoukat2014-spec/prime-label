"use client";

import { useCallback, useEffect, useState } from "react";

type Suggestion = {
  id: number;
  name: string;
  contact: string;
  message: string;
  status: string;
  created_at: string;
};

/**
 * Admin Dashboard → Suggestions.
 *
 * Shows everything visitors submitted through the floating suggestion box,
 * newest first, with who said it (name/contact when provided), what they
 * asked for, and when. Entries can be marked done or deleted.
 */
export default function SuggestionsManager() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/suggestions");
    const j = await res.json().catch(() => ({}));
    if (j?.ok) setItems(j.suggestions || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  async function setStatus(id: number, status: "new" | "done") {
    await fetch("/api/admin/suggestions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    flash(status === "done" ? "Marked as done" : "Reopened");
    load();
  }

  async function del(id: number) {
    if (!confirm("Delete this suggestion?")) return;
    await fetch("/api/admin/suggestions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    flash("Deleted");
    load();
  }

  const fresh = items.filter((i) => i.status !== "done").length;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="display text-3xl">Suggestions</h1>
          <p className="mt-1 text-[12.5px] leading-relaxed text-cream-muted">
            Website feedback submitted by visitors through the floating
            suggestion box — who asked for what, and when.
          </p>
        </div>
        {fresh > 0 && (
          <span className="rounded-full bg-champagne/15 px-3 py-1 text-[11px] font-semibold text-champagne">
            {fresh} new
          </span>
        )}
      </div>

      {toast && (
        <div className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2 text-[12px] text-champagne">
          {toast}
        </div>
      )}

      {loading ? (
        <p className="text-[13px] text-cream-dim">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-cream/10 bg-cream/[0.03] p-8 text-center">
          <p className="text-[13px] text-cream-muted">
            No suggestions yet. The light-bulb button on your live website
            collects them here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-cream/10 bg-cream/[0.03] p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-cream">
                      {s.name || "Anonymous visitor"}
                    </span>
                    {s.contact && (
                      <span className="truncate text-[12px] text-champagne">{s.contact}</span>
                    )}
                    <span
                      className={
                        s.status === "done"
                          ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400"
                          : "rounded-full bg-champagne/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-champagne"
                      }
                    >
                      {s.status === "done" ? "Done" : "New"}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-cream">
                    {s.message}
                  </p>
                  <p className="mt-2 text-[11px] text-cream-dim">
                    {new Date(s.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(s.id, s.status === "done" ? "new" : "done")}
                    className="rounded-full border border-cream/15 px-3 py-1.5 text-[11.5px] text-cream-muted transition-colors hover:border-champagne/40 hover:text-champagne"
                  >
                    {s.status === "done" ? "Reopen" : "Mark done"}
                  </button>
                  <button
                    type="button"
                    onClick={() => del(s.id)}
                    className="rounded-full border border-cream/15 px-3 py-1.5 text-[11.5px] text-cream-muted transition-colors hover:border-red-400/40 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
