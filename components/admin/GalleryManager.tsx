"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import AppliedBadge from "@/components/admin/AppliedBadge";
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_LABEL,
  formatBytes,
  validateProductImage,
} from "@/lib/upload-rules";

type GalleryRow = {
  id: number;
  url: string;
  caption: string | null;
  category: string | null;
  active: boolean;
  sort: number;
  created_at: string;
};

type Category = { slug: string; name: string };

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

export default function GalleryManager() {
  const toast = useToast();
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [filter, setFilter] = useState("");

  // upload form
  const [pending, setPending] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // delete confirmation
  const [pendingDelete, setPendingDelete] = useState<GalleryRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const flash = useCallback(() => {
    setApplied(true);
    window.setTimeout(() => setApplied(false), 2600);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/gallery", { cache: "no-store" });
      const j = await r.json();
      if (j?.ok) {
        setRows(j.images || []);
        setCats(j.categories || []);
      } else {
        toast.error(j?.error || "Could not load the gallery.");
      }
    } catch {
      toast.error("Could not load the gallery.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // "" = show everything; "uncategorised" = rows with no category set.
  const filtered = useMemo(() => {
    if (!filter) return rows;
    if (filter === "uncategorised") return rows.filter((r) => !r.category);
    return rows.filter((r) => r.category === filter);
  }, [rows, filter]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    rows.forEach((r) => {
      const k = r.category || "uncategorised";
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }, [rows]);

  function addFiles(list: FileList | null | undefined) {
    if (!list?.length) return;
    const ok: File[] = [];
    Array.from(list).forEach((f) => {
      const check = validateProductImage({ name: f.name, size: f.size });
      if (!check.ok) {
        toast.error(check.error);
        return;
      }
      ok.push(f);
    });
    if (ok.length) {
      setPending((p) => [...p, ...ok]);
      toast.success(`${ok.length} image${ok.length === 1 ? "" : "s"} ready to upload.`);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function upload() {
    if (!pending.length || uploading) return;
    setUploading(true);
    try {
      const fd = new FormData();
      pending.forEach((f) => fd.append("images", f, f.name));
      fd.append("caption", caption);
      fd.append("category", category);

      const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Upload failed.");

      toast.success(`${j.count} photo${j.count === 1 ? "" : "s"} added to the gallery.`);
      setPending([]);
      setCaption("");
      await load();
      flash();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function patch(id: number, changes: Record<string, unknown>) {
    // optimistic
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...changes } as GalleryRow : r)));
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...changes }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not save.");
      flash();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save.");
      load();
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingDelete.id }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Could not delete.");
      toast.success("Photo deleted.");
      setPendingDelete(null);
      await load();
      flash();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Gallery / Portfolio</h1>
          <p className="mt-1 text-[13px] text-cream-muted">
            {loading
              ? "Loading photos…"
              : `${rows.length} uploaded photo${rows.length === 1 ? "" : "s"} · shown before your original Instagram set on the website.`}
          </p>
        </div>
        <AppliedBadge show={applied} />
      </div>

      {/* ---------------- upload ---------------- */}
      <div className="rounded-2xl border border-champagne/30 bg-surface/40 p-5">
        <h2 className="display mb-4 text-xl">Upload photos</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Category</span>
            <select
              className={input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
            >
              <option value="" className="bg-ink">
                Uncategorised
              </option>
              {cats.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-ink">
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={label}>Caption (applied to all in this batch)</span>
            <input
              className={input}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Damask woven labels for ARHAM"
              disabled={uploading}
            />
          </label>
        </div>

        <input
          ref={fileRef}
          type="file"
          multiple
          accept={PRODUCT_IMAGE_ACCEPT}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => addFiles(e.target.files)}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`mt-4 flex w-full flex-col items-center gap-1 rounded-xl border border-dashed px-4 py-6 text-center transition-colors disabled:opacity-50 ${
            dragging
              ? "border-champagne/70 bg-champagne/[0.06]"
              : "border-line bg-surface/30 hover:border-champagne/45"
          }`}
        >
          <span className="text-[13px] text-cream">
            Drop high-resolution photos here or <span className="text-champagne">browse</span>
          </span>
          <span className="text-[11px] text-cream-dim">
            Select several at once · PNG, JPG, JPEG, WEBP · max {PRODUCT_IMAGE_MAX_LABEL} each
          </span>
        </button>

        {pending.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {pending.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-champagne/40 bg-surface/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPending((p) => p.filter((_, j) => j !== i))}
                    disabled={uploading}
                    aria-label="Remove"
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-red-500/40 bg-ink/85 text-red-300 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11.5px] text-cream-dim">
              {pending.length} file{pending.length === 1 ? "" : "s"} ·{" "}
              {formatBytes(pending.reduce((a, f) => a + f.size, 0))} total
            </p>
            <button
              type="button"
              onClick={upload}
              disabled={uploading}
              className="btn-primary mt-3 !py-2.5 !px-5 text-[12px] disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Spinner /> Uploading…
                </>
              ) : (
                `Upload ${pending.length} photo${pending.length === 1 ? "" : "s"}`
              )}
            </button>
          </div>
        )}
      </div>

      {/* ---------------- filter ---------------- */}
      {rows.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("")}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${
              filter === "" ? "border-champagne/60 text-champagne" : "border-line text-cream-muted hover:border-champagne/40"
            }`}
          >
            All ({rows.length})
          </button>
          {Object.entries(counts).map(([slug, n]) => {
            const name =
              slug === "uncategorised"
                ? "Uncategorised"
                : cats.find((c) => c.slug === slug)?.name || slug;
            return (
              <button
                key={slug}
                onClick={() => setFilter(slug)}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${
                  filter === slug
                    ? "border-champagne/60 text-champagne"
                    : "border-line text-cream-muted hover:border-champagne/40"
                }`}
              >
                {name} ({n})
              </button>
            );
          })}
        </div>
      )}

      {/* ---------------- grid ---------------- */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/30 p-8 text-[13px] text-cream-muted">
          <Spinner /> Loading photos…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/30 p-10 text-center">
          <p className="text-[14px] text-cream">No photos uploaded yet.</p>
          <p className="mt-2 text-[12.5px] text-cream-dim">
            Your website is currently showing the original 163 Instagram photos.
            Anything you upload here appears before them.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-2xl border border-line bg-surface/30">
              <div className="relative aspect-[4/3] bg-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt={r.caption || ""} className="h-full w-full object-cover" />
                {!r.active && (
                  <span className="absolute left-2 top-2 rounded bg-ink/85 px-2 py-1 text-[10px] uppercase tracking-wide text-cream-dim">
                    Hidden
                  </span>
                )}
              </div>
              <div className="space-y-2.5 p-3.5">
                <input
                  className={input}
                  defaultValue={r.caption || ""}
                  placeholder="Caption"
                  onBlur={(e) => {
                    if (e.target.value !== (r.caption || "")) patch(r.id, { caption: e.target.value });
                  }}
                />
                <select
                  className={input}
                  value={r.category || ""}
                  onChange={(e) => patch(r.id, { category: e.target.value })}
                >
                  <option value="" className="bg-ink">
                    Uncategorised
                  </option>
                  {cats.map((c) => (
                    <option key={c.slug} value={c.slug} className="bg-ink">
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <label className="flex items-center gap-2 text-[12px] text-cream-muted">
                    <input
                      type="checkbox"
                      checked={r.active}
                      onChange={(e) => patch(r.id, { active: e.target.checked })}
                      className="h-3.5 w-3.5 accent-[#C9A86A]"
                    />
                    Visible
                  </label>
                  <button
                    onClick={() => setPendingDelete(r)}
                    className="rounded-md border border-line px-3 py-1.5 text-[12px] text-cream-muted transition-colors hover:border-red-500/50 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- delete modal ---------------- */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[2500] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-red-500/30 bg-surface-2 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="display text-xl text-cream">Delete this photo?</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">
              It will be removed from your website and permanently deleted from storage.
              This cannot be undone.
            </p>
            <div className="mt-5 aspect-video overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingDelete.url} alt="" className="h-full w-full object-cover" />
            </div>
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
                {deleting ? "Deleting…" : "Delete photo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
