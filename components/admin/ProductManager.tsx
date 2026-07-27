"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import AppliedBadge from "@/components/admin/AppliedBadge";
import GalleryPicker, { type GalleryItem } from "@/components/admin/GalleryPicker";
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_LABEL,
  formatBytes,
  validateProductImage,
} from "@/lib/upload-rules";

/* ------------------------------- types ------------------------------- */

export type AdminProduct = {
  id: number;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  specs: string | null;
  image: string | null;
  gallery: string[] | string | null;
  price_from: string | null;
  moq: number | null;
  turnaround: number | null;
  category: string | null;
  active: boolean;
  sort: number;
};

/** Suggested categories — the field also accepts any free-text value. */
const CATEGORY_SUGGESTIONS = [
  "Woven Labels",
  "Satin Labels",
  "Hang Tags",
  "Tag Cards",
  "Custom Stickers",
  "Brand Packaging",
  "Packaging",
  "Zipper Bags",
  "Woven Patches",
  "Steel Logo Tags",
];

/* ------------------------------ styling ------------------------------ */

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

/* --------------------------- image picker ---------------------------- */

function ImagePicker({
  currentUrl,
  file,
  onPick,
  onClear,
  disabled,
}: {
  currentUrl?: string | null;
  file: File | null;
  onPick: (f: File | null | undefined) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Build (and revoke) an object URL for the chosen file.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview || currentUrl || null;

  return (
    <div>
      <span className={label}>Product image</span>

      <input
        ref={ref}
        type="file"
        accept={PRODUCT_IMAGE_ACCEPT}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-surface/40">
          {shown ? (
            // Preview can be a blob: URL, so a plain <img> is correct here.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-cream-dim">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="8.5" cy="9.5" r="1.6" fill="currentColor" />
                <path d="M4 17l5-5 4 4 3-2 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          {preview && (
            <span className="absolute inset-x-0 bottom-0 bg-champagne/90 py-0.5 text-center text-[9px] font-medium uppercase tracking-wide text-ink">
              New
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => ref.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onPick(e.dataTransfer.files?.[0]);
            }}
            className={`w-full rounded-lg border border-dashed px-4 py-3 text-left text-[12.5px] transition-colors disabled:opacity-50 ${
              dragging
                ? "border-champagne/70 bg-champagne/[0.06] text-cream"
                : "border-line bg-surface/30 text-cream-muted hover:border-champagne/45"
            }`}
          >
            {file ? (
              <span className="text-cream">
                {file.name}{" "}
                <span className="text-cream-dim">· {formatBytes(file.size)}</span>
              </span>
            ) : (
              <>
                Drop an image or <span className="text-champagne">browse</span>
                <span className="mt-0.5 block text-[11px] text-cream-dim">
                  PNG, JPG, JPEG, WEBP · max {PRODUCT_IMAGE_MAX_LABEL}
                </span>
              </>
            )}
          </button>

          {file && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="mt-2 text-[11.5px] text-cream-dim underline underline-offset-4 hover:text-red-300 disabled:opacity-50"
            >
              Cancel this image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- product form --------------------------- */

type FormState = {
  title: string;
  category: string;
  tagline: string;
  description: string;
  specs: string;
  price_from: string;
  moq: string;
  turnaround: string;
  active: boolean;
};

const emptyForm: FormState = {
  title: "",
  category: "",
  tagline: "",
  description: "",
  specs: "",
  price_from: "",
  moq: "",
  turnaround: "",
  active: true,
};

function ProductForm({
  mode,
  initial,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: AdminProduct;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          title: initial.title ?? "",
          category: initial.category ?? "",
          tagline: initial.tagline ?? "",
          description: initial.description ?? "",
          specs: initial.specs ?? "",
          price_from: initial.price_from ?? "",
          moq: initial.moq != null ? String(initial.moq) : "",
          turnaround: initial.turnaround != null ? String(initial.turnaround) : "",
          active: initial.active ?? true,
        }
      : emptyForm
  );
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Secondary photos. gallery[0] mirrors the main image, so it is excluded
  // here and re-attached by the API on save.
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    if (!initial) return [];
    const raw = initial.gallery;
    const list: string[] = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
        ? (() => {
            try {
              const p = JSON.parse(raw || "[]");
              return Array.isArray(p) ? p : [];
            } catch {
              return [];
            }
          })()
        : [];
    return list
      .filter((u) => typeof u === "string" && u && u !== initial.image)
      .map((url) => ({ kind: "existing", url }) as GalleryItem);
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function pickImage(chosen: File | null | undefined) {
    if (!chosen) return;
    const check = validateProductImage({ name: chosen.name, size: chosen.size });
    if (!check.ok) {
      toast.error(check.error);
      return;
    }
    setFile(chosen);
    toast.success(`${chosen.name} ready (${formatBytes(chosen.size)})`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    if (!form.title.trim()) {
      toast.error("Product name is required.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("tagline", form.tagline);
      fd.append("description", form.description);
      fd.append("specs", form.specs);
      fd.append("price_from", form.price_from);
      fd.append("moq", form.moq);
      fd.append("turnaround", form.turnaround);
      if (file) fd.append("image", file, file.name);

      // Gallery: URLs to keep (in order) + any newly picked files.
      fd.append(
        "gallery_urls",
        JSON.stringify(
          galleryItems.filter((g) => g.kind === "existing").map((g) => (g as { url: string }).url)
        )
      );
      galleryItems.forEach((g) => {
        if (g.kind === "new") fd.append("gallery_files", g.file, g.file.name);
      });

      if (mode === "edit" && initial) {
        fd.append("slug", initial.slug);
        fd.append("active", String(form.active));
      }

      const res = await fetch("/api/admin/products", {
        method: mode === "create" ? "POST" : "PUT",
        body: fd,
      });
      const json = await res.json().catch(() => ({}) as Record<string, unknown>);

      if (!res.ok || !json?.ok) {
        throw new Error(
          typeof json?.error === "string" ? json.error : "Could not save the product."
        );
      }

      toast.success(
        mode === "create" ? `“${form.title}” added and live on the site.` : "Product updated."
      );
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save the product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-champagne/30 bg-surface/40 p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="display text-xl">
          {mode === "create" ? "Add new product" : `Edit — ${initial?.title}`}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-line px-3 py-1.5 text-[12px] text-cream-muted hover:border-champagne/40 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Product name *</span>
          <input
            className={input}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Damask Woven Labels"
            required
          />
        </label>

        <label className="block">
          <span className={label}>Category / tag</span>
          <input
            className={input}
            list="pl-category-options"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="e.g. Woven Labels"
          />
          <datalist id="pl-category-options">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label className="block sm:col-span-2">
          <span className={label}>Short description / tagline</span>
          <input
            className={input}
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="One line shown under the product name"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={label}>Description</span>
          <textarea
            rows={3}
            className={input + " resize-none"}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="The paragraph shown on the product card."
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={label}>Full specifications / details (Markdown supported)</span>
          <textarea
            rows={5}
            className={input + " resize-none font-mono text-[12.5px]"}
            value={form.specs}
            onChange={(e) => set("specs", e.target.value)}
            placeholder={"- Material: high-density damask\n- Sizes: 15mm – 60mm\n- Finish: centre fold, double face"}
          />
        </label>

        <label className="block">
          <span className={label}>Price label</span>
          <input
            className={input}
            value={form.price_from}
            onChange={(e) => set("price_from", e.target.value)}
            placeholder="e.g. From $0.12 / pc"
          />
        </label>

        <label className="block">
          <span className={label}>Minimum order quantity</span>
          <input
            type="number"
            min="0"
            className={input}
            value={form.moq}
            onChange={(e) => set("moq", e.target.value)}
            placeholder="e.g. 500"
          />
        </label>

        <label className="block">
          <span className={label}>Turnaround (days)</span>
          <input
            type="number"
            min="0"
            className={input}
            value={form.turnaround}
            onChange={(e) => set("turnaround", e.target.value)}
            placeholder="e.g. 10"
          />
        </label>

        {mode === "edit" && (
          <label className="flex items-center gap-3 self-end pb-1">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
              className="h-4 w-4 accent-[#C9A86A]"
            />
            <span className="text-[12.5px] text-cream-muted">
              Visible on the website
            </span>
          </label>
        )}

        <div className="sm:col-span-2">
          <ImagePicker
            currentUrl={initial?.image}
            file={file}
            onPick={pickImage}
            onClear={() => setFile(null)}
            disabled={saving}
          />
          {mode === "edit" && (
            <p className="mt-2 text-[11.5px] text-cream-dim">
              Leave empty to keep the current image. Uploading a new one replaces it
              and removes the old file from storage.
            </p>
          )}

          <div className="mt-5 border-t border-line pt-5">
            <GalleryPicker
              items={galleryItems}
              onChange={setGalleryItems}
              disabled={saving}
              suggested={3}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary !py-2.5 !px-5 text-[12px] disabled:opacity-60"
        >
          {saving ? (
            <>
              <Spinner />
              {file || galleryItems.some((g) => g.kind === "new") ? "Uploading…" : "Saving…"}
            </>
          ) : mode === "create" ? (
            "Add product"
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </form>
  );
}

/* --------------------------- delete modal ---------------------------- */

function DeleteModal({
  product,
  busy,
  onCancel,
  onConfirm,
}: {
  product: AdminProduct;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[2500] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => !busy && onCancel()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-red-500/30 bg-surface-2 p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/40 text-red-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0l1 13a1 1 0 001 1h6a1 1 0 001-1l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="display text-xl text-cream">Delete this product?</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-cream-muted">
              <span className="text-cream">{product.title}</span> will be removed from
              the website immediately, along with its uploaded image. This cannot be
              undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-line px-4 py-2 text-[12.5px] text-cream-muted hover:border-champagne/40 disabled:opacity-50"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2 text-[12.5px] text-red-200 hover:bg-red-500/25 disabled:opacity-50"
          >
            {busy && <Spinner size={13} />}
            {busy ? "Deleting…" : "Delete product"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- main manager ---------------------------- */

export default function ProductManager() {
  const toast = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState(false);

  const flashApplied = useCallback(() => {
    setApplied(true);
    window.setTimeout(() => setApplied(false), 2600);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/products", { cache: "no-store" });
      const j = await r.json();
      if (j?.ok) setProducts(j.products || []);
      else toast.error(j?.error || "Could not load products.");
    } catch {
      toast.error("Could not load products.");
    } finally {
      setLoading(false);
    }
    // toast identity is stable; excluded to avoid a reload loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q)
    );
  }, [products, query]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: pendingDelete.slug }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Could not delete the product.");
      toast.success(`“${pendingDelete.title}” deleted.`);
      setPendingDelete(null);
      await load();
      flashApplied();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not delete the product.");
    } finally {
      setDeleting(false);
    }
  }

  if (mode === "create") {
    return (
      <ProductForm
        mode="create"
        onCancel={() => setMode("list")}
        onSaved={() => {
          setMode("list");
          load();
          flashApplied();
        }}
      />
    );
  }

  if (mode === "edit" && editing) {
    return (
      <ProductForm
        mode="edit"
        initial={editing}
        onCancel={() => {
          setMode("list");
          setEditing(null);
        }}
        onSaved={() => {
          setMode("list");
          setEditing(null);
          load();
          flashApplied();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl">Products</h1>
          <p className="mt-1 text-[13px] text-cream-muted">
            {loading
              ? "Loading catalogue…"
              : `${products.length} product${products.length === 1 ? "" : "s"} · changes appear on the website immediately.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
        <AppliedBadge show={applied} />
        <button
          onClick={() => setMode("create")}
          className="btn-primary !py-2.5 !px-5 text-[12px]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add new product
        </button>
        </div>
      </div>

      <input
        className={input + " max-w-xs"}
        placeholder="Search by name or category…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/30 p-8 text-[13px] text-cream-muted">
          <Spinner /> Loading products…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/30 p-10 text-center">
          <p className="text-[14px] text-cream">
            {products.length === 0 ? "No products yet." : "No products match that search."}
          </p>
          {products.length === 0 && (
            <button
              onClick={() => setMode("create")}
              className="btn-primary mt-5 !py-2.5 !px-5 text-[12px]"
            >
              Add your first product
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          {/* header row (desktop) */}
          <div className="hidden bg-surface/50 px-4 py-3 text-[10px] uppercase tracking-wide2 text-cream-dim sm:grid sm:grid-cols-[64px_1fr_170px_150px]">
            <span>Image</span>
            <span>Product</span>
            <span>Category</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-line">
            {filtered.map((p) => (
              <div
                key={p.slug}
                className="grid grid-cols-[56px_1fr] items-center gap-3 bg-ink px-4 py-3 sm:grid-cols-[64px_1fr_170px_150px] sm:gap-4"
              >
                <div className="h-12 w-12 overflow-hidden rounded-lg border border-line bg-surface/40 sm:h-14 sm:w-14">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-cream-dim">
                      —
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13.5px] text-cream">{p.title}</span>
                    {!p.active && (
                      <span className="shrink-0 rounded bg-cream/10 px-1.5 py-0.5 text-[9.5px] uppercase tracking-wide text-cream-dim">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[11px] text-cream-dim">{p.slug}</div>
                  <div className="mt-1 text-[11px] text-cream-muted sm:hidden">
                    {p.category || "—"}
                  </div>
                </div>

                <div className="hidden text-[12.5px] text-cream-muted sm:block">
                  {p.category || "—"}
                </div>

                <div className="col-span-2 flex gap-2 sm:col-span-1 sm:justify-end">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setMode("edit");
                    }}
                    className="rounded-md border border-line px-3 py-1.5 text-[12px] text-cream-muted transition-colors hover:border-champagne/50 hover:text-champagne"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(p)}
                    className="rounded-md border border-line px-3 py-1.5 text-[12px] text-cream-muted transition-colors hover:border-red-500/50 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingDelete && (
        <DeleteModal
          product={pendingDelete}
          busy={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
