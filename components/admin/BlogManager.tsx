"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import AppliedBadge from "@/components/admin/AppliedBadge";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  body: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50";
const label = "mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream-dim";

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const EMPTY: Post = {
  id: 0, slug: "", title: "", excerpt: "", cover: "", body: "", published: true,
  created_at: "", updated_at: "",
};

export default function BlogManager() {
  const toast = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Post | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = useCallback(() => {
    setApplied(true);
    window.setTimeout(() => setApplied(false), 2600);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/blog", { cache: "no-store" });
      const j = await r.json();
      if (j?.ok) setPosts(j.posts || []);
      else toast.error(j?.error || "Could not load posts.");
    } catch {
      toast.error("Could not load posts.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!form || saving) return;
    if (form.title.trim().length < 4) { toast.error("Title is too short."); return; }
    if (form.body.trim().length < 50) { toast.error("Article body is too short."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      if (form.id) fd.append("id", String(form.id));
      fd.append("title", form.title);
      fd.append("excerpt", form.excerpt);
      fd.append("body", form.body);
      fd.append("published", String(form.published));
      if (coverFile) fd.append("cover", coverFile, coverFile.name);

      const res = await fetch("/api/admin/blog", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not save.");
      toast.success(form.id ? "Post updated and live." : "Post published.");
      setForm(null);
      setCoverFile(null);
      await load();
      flash();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingDelete.id }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not delete.");
      toast.success("Post deleted.");
      setPendingDelete(null);
      await load();
      flash();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setDeleting(false);
    }
  }

  const set = (k: keyof Post, v: unknown) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Blog</h1>
          <p className="mt-1 text-[13px] text-cream-muted">
            Guides that bring Google traffic. Posts appear at /blog and in the sitemap automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AppliedBadge show={applied} />
          <button
            type="button"
            onClick={() => { setForm({ ...EMPTY }); setCoverFile(null); }}
            className="btn-primary !py-2.5 !px-5 text-[12px]"
          >
            + New post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/30 p-8 text-[13px] text-cream-muted">
          <Spinner /> Loading posts…
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/30 p-10 text-center">
          <p className="text-[14px] text-cream">No posts yet.</p>
          <p className="mt-2 text-[12.5px] text-cream-dim">Click “New post” to write your first guide.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {posts.map((p) => (
            <div key={p.id} className="flex gap-4 rounded-2xl border border-line bg-surface/30 p-4">
              {p.cover ? (
                <img src={p.cover} alt="" className="h-20 w-28 shrink-0 rounded-xl border border-line object-cover" />
              ) : (
                <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border border-line bg-ink text-[10px] uppercase tracking-wide text-cream-dim">
                  No cover
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-[13.5px] font-medium leading-snug text-cream">{p.title}</p>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] uppercase tracking-wide ${p.published ? "bg-emerald-500/15 text-emerald-300" : "bg-cream/10 text-cream-dim"}`}>
                    {p.published ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-cream-dim">
                  {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setForm({ ...p }); setCoverFile(null); }}
                    className="rounded-md border border-line px-3 py-1 text-[11.5px] text-cream-muted transition-colors hover:border-champagne/50 hover:text-champagne"
                  >
                    Edit
                  </button>
                  {p.published && (
                    <a
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-line px-3 py-1 text-[11.5px] text-cream-muted transition-colors hover:border-champagne/50 hover:text-champagne"
                    >
                      View ↗
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setPendingDelete(p)}
                    className="rounded-md border border-line px-3 py-1 text-[11.5px] text-cream-muted transition-colors hover:border-red-500/50 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -------- editor modal -------- */}
      {form && (
        <div className="fixed inset-0 z-[2500] flex items-start justify-center overflow-y-auto bg-ink/85 p-4 backdrop-blur-sm sm:py-10" role="dialog" aria-modal="true">
          <div className="w-full max-w-3xl rounded-2xl border border-champagne/25 bg-surface-2 p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="display text-2xl text-cream">{form.id ? "Edit post" : "New post"}</h3>
              <button
                type="button"
                onClick={() => { setForm(null); setCoverFile(null); }}
                disabled={saving}
                aria-label="Close"
                className="rounded-full border border-line p-2 text-cream-dim transition-colors hover:border-champagne/40 hover:text-cream"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className={label}>Title</span>
                <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} disabled={saving} placeholder="Woven vs Printed Labels: Which Is Right for Your Brand?" />
              </label>

              <label className="block">
                <span className={label}>Excerpt — 1–2 lines shown in the list & Google</span>
                <textarea className={`${input} min-h-[70px] resize-y`} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} disabled={saving} />
              </label>

              <label className="block">
                <span className={label}>Cover image {form.cover && "(current cover stays unless you pick a new one)"}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  disabled={saving}
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-[12.5px] text-cream-muted file:mr-3 file:rounded-lg file:border file:border-champagne/40 file:bg-champagne/10 file:px-4 file:py-2 file:text-[12px] file:text-champagne"
                />
              </label>

              <label className="block">
                <span className={label}>
                  Article body — Markdown: ## heading, **bold**, - bullets, [link](/quote), | tables |
                </span>
                <textarea
                  className={`${input} min-h-[320px] resize-y font-mono text-[12.5px] leading-relaxed`}
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                  disabled={saving}
                  placeholder={"## Why labels matter\n\nYour label is the first thing..."}
                />
              </label>

              <label className="flex w-fit items-center gap-2.5 text-[12.5px] text-cream-muted">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => set("published", e.target.checked)}
                  disabled={saving}
                  className="h-4 w-4 accent-[#C9A86A]"
                />
                Published (visible on the website)
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setForm(null); setCoverFile(null); }}
                disabled={saving}
                className="rounded-lg border border-line px-4 py-2 text-[12.5px] text-cream-muted hover:border-champagne/40 disabled:opacity-50"
              >
                Cancel
              </button>
              <button type="button" onClick={save} disabled={saving} className="btn-primary !py-2.5 !px-5 text-[12px] disabled:opacity-50">
                {saving ? (<><Spinner /> Saving…</>) : form.id ? "Save changes" : "Publish post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------- delete modal -------- */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[2500] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          role="dialog" aria-modal="true"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-surface-2 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="display text-xl text-cream">Delete this post?</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">
              “{pendingDelete.title}” will be removed from the website permanently.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-line px-4 py-2 text-[12.5px] text-cream-muted hover:border-champagne/40 disabled:opacity-50"
              >
                Keep it
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2 text-[12.5px] text-red-200 hover:bg-red-500/25 disabled:opacity-50"
              >
                {deleting && <Spinner size={13} />}
                {deleting ? "Deleting…" : "Delete post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
