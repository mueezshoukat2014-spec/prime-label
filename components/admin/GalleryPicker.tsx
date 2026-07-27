"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_LABEL,
  formatBytes,
  validateProductImage,
} from "@/lib/upload-rules";

/** One slot in the gallery editor: either an existing URL or a pending file. */
export type GalleryItem =
  | { kind: "existing"; url: string }
  | { kind: "new"; file: File; previewUrl: string };

export function galleryItemKey(item: GalleryItem, i: number) {
  return item.kind === "existing" ? `u:${item.url}` : `f:${item.file.name}:${i}`;
}

/**
 * Multi-image gallery editor.
 *
 * Shows every secondary photo as a thumbnail with an "X" to remove it and
 * arrows to reorder. New files are previewed locally via object URLs and only
 * uploaded when the form is submitted.
 */
export default function GalleryPicker({
  items,
  onChange,
  disabled,
  suggested = 3,
}: {
  items: GalleryItem[];
  onChange: (next: GalleryItem[]) => void;
  disabled?: boolean;
  /** How many secondary photos the public site currently displays. */
  suggested?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const toast = useToast();

  // Release object URLs when the component unmounts.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => {
        if (it.kind === "new") URL.revokeObjectURL(it.previewUrl);
      });
    };
  }, []);

  function addFiles(list: FileList | null | undefined) {
    if (!list || list.length === 0) return;

    const accepted: GalleryItem[] = [];
    let rejected = 0;

    Array.from(list).forEach((file) => {
      const check = validateProductImage({ name: file.name, size: file.size });
      if (!check.ok) {
        rejected++;
        toast.error(check.error);
        return;
      }
      accepted.push({ kind: "new", file, previewUrl: URL.createObjectURL(file) });
    });

    if (accepted.length) {
      onChange([...items, ...accepted]);
      toast.success(
        accepted.length === 1
          ? `${accepted[0].kind === "new" ? accepted[0].file.name : ""} added to the gallery.`
          : `${accepted.length} images added to the gallery.`
      );
    }
    if (rejected && !accepted.length) {
      // errors already surfaced per file
    }
    if (ref.current) ref.current.value = "";
  }

  function remove(index: number) {
    const target = items[index];
    if (target.kind === "new") URL.revokeObjectURL(target.previewUrl);
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    onChange(next);
  }

  return (
    <div>
      <span className="mb-1.5 flex flex-wrap items-baseline gap-x-2 text-[10px] uppercase tracking-wide2 text-cream-dim">
        <span>Gallery images</span>
        <span className="normal-case tracking-normal text-cream-dim/70">
          (additional photos — the site shows the first {suggested})
        </span>
      </span>

      <input
        ref={ref}
        type="file"
        multiple
        accept={PRODUCT_IMAGE_ACCEPT}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => addFiles(e.target.files)}
      />

      {items.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item, i) => {
            const src = item.kind === "existing" ? item.url : item.previewUrl;
            const shownOnSite = i < suggested;
            return (
              <div
                key={galleryItemKey(item, i)}
                className={`group relative aspect-square overflow-hidden rounded-xl border ${
                  shownOnSite ? "border-champagne/40" : "border-line"
                } bg-surface/40`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />

                {/* Badges share one row so they can never overlap. */}
                <span className="pointer-events-none absolute left-1 top-1 flex gap-1">
                  {item.kind === "new" && (
                    <span className="rounded bg-champagne/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-ink">
                      New
                    </span>
                  )}
                  {!shownOnSite && (
                    <span className="rounded bg-ink/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-cream-dim">
                      Extra
                    </span>
                  )}
                </span>

                {/* remove */}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={disabled}
                  aria-label="Remove this image"
                  title="Remove this image"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-red-500/40 bg-ink/85 text-red-300 opacity-0 transition-opacity duration-200 hover:bg-red-500/25 focus:opacity-100 group-hover:opacity-100 disabled:opacity-40"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>

                {/* reorder */}
                <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={disabled || i === 0}
                    aria-label="Move earlier"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-ink/85 text-cream-muted hover:text-champagne disabled:opacity-30"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={disabled || i === items.length - 1}
                    aria-label="Move later"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-ink/85 text-cream-muted hover:text-champagne disabled:opacity-30"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
          addFiles(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center gap-1 rounded-xl border border-dashed px-4 py-5 text-center transition-colors duration-300 disabled:opacity-50 ${
          dragging
            ? "border-champagne/70 bg-champagne/[0.06]"
            : "border-line bg-surface/30 hover:border-champagne/45"
        }`}
      >
        <span className="text-[12.5px] text-cream">
          Drop images here or <span className="text-champagne">browse</span>
        </span>
        <span className="text-[11px] text-cream-dim">
          You can select several at once · PNG, JPG, JPEG, WEBP · max {PRODUCT_IMAGE_MAX_LABEL} each
        </span>
      </button>

      {items.length > 0 && (
        <p className="mt-2 text-[11.5px] text-cream-dim">
          {items.length} gallery image{items.length === 1 ? "" : "s"}
          {items.length > suggested
            ? ` — the first ${suggested} appear on the site, the rest are kept for the photo count.`
            : "."}
          {" "}Hover a photo to remove or reorder it.
          {items.some((i) => i.kind === "new") && (
            <>
              {" "}
              <span className="text-champagne">
                New images upload when you save.
              </span>
            </>
          )}
        </p>
      )}

      {items.some((i) => i.kind === "new") && (
        <p className="mt-1 text-[11px] text-cream-dim">
          Pending uploads:{" "}
          {items
            .filter((i): i is Extract<GalleryItem, { kind: "new" }> => i.kind === "new")
            .map((i) => `${i.file.name} (${formatBytes(i.file.size)})`)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
