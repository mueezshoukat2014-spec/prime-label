"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useToast } from "@/components/Toast";
import AppliedBadge from "@/components/admin/AppliedBadge";
import { PRODUCT_CATEGORIES } from "@/lib/quote-validation";
import {
  buildVideoPath,
  validateVideoFile,
  VIDEO_ACCEPT,
  VIDEO_MAX_LABEL,
  type ManagedVideo,
} from "@/lib/video";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50";
const label = "mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream-dim";

const emptyVideo = (): ManagedVideo => ({
  id: `draft-${Date.now()}`,
  url: "",
  title: "",
  caption: "",
  product: "Woven Labels",
  active: true,
  sort: 0,
});

function formatBytes(bytes?: number) {
  const n = Number(bytes || 0);
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return n ? `${n} B` : "";
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function VideoManager() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos] = useState<ManagedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [applied, setApplied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/videos", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Could not load videos.");
      setVideos(json.videos?.length ? json.videos : [emptyVideo()]);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not load videos.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const activeCount = useMemo(() => videos.filter((v) => v.active && v.url).length, [videos]);

  function patch(index: number, changes: Partial<ManagedVideo>) {
    setVideos((list) => list.map((video, i) => (i === index ? { ...video, ...changes } : video)));
  }

  function addEmpty() {
    setVideos((list) => [...list, { ...emptyVideo(), sort: list.length }]);
  }

  function removeVideo(index: number) {
    setVideos((list) => list.filter((_, i) => i !== index));
  }

  async function uploadVideoFile(file: File) {
    const check = validateVideoFile({ name: file.name, size: file.size });
    if (!check.ok) {
      toast.error(check.error);
      return;
    }

    setUploading(true);
    try {
      const blob = await upload(buildVideoPath(file.name), file, {
        access: "public",
        handleUploadUrl: "/api/admin/videos/upload",
        contentType: file.type || undefined,
      });

      const baseTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      setVideos((list) => [
        ...list.filter((v) => v.url || v.title || v.caption),
        {
          id: `video-${Date.now()}`,
          url: blob.url,
          title: baseTitle,
          caption: baseTitle || "Watch our product process in motion.",
          product: "Woven Labels",
          active: true,
          sort: list.length,
          fileName: file.name,
          size: file.size,
        },
      ]);
      toast.success(`${file.name} uploaded. Add caption/product, then Save videos.`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Video upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    if (saving) return;
    const rows = videos
      .filter((v) => v.url.trim())
      .map((v, i) => ({ ...v, sort: i }));

    if (rows.length === 0) {
      toast.error("Upload at least one video, or keep using the built-in video section.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: rows }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Could not save videos.");
      setVideos(json.videos || rows);
      toast.success("Video section updated and live on the website.");
      setApplied(true);
      window.setTimeout(() => setApplied(false), 2600);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save videos.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-surface/30 p-8 text-[13px] text-cream-muted">
        <span className="inline-flex items-center gap-3"><Spinner /> Loading video settings…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Videos</h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-cream-muted">
            Upload your own MP4/WEBM/MOV videos here. The website plays them as native videos, so there is no YouTube title, logo, watermark, controls or audio.
          </p>
        </div>
        <AppliedBadge show={applied} />
      </div>

      <div className="rounded-2xl border border-champagne/25 bg-champagne/[0.04] p-4 text-[12.5px] leading-relaxed text-cream-muted">
        Active videos on site: <span className="text-champagne">{activeCount}</span>. Supported: MP4, WEBM, MOV, M4V up to {VIDEO_MAX_LABEL}. Videos are muted, looped and shown in 9:16 on mobile.
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={VIDEO_ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadVideoFile(file);
        }}
      />

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary !py-2.5 !px-5 text-[12px] disabled:opacity-60">
          {uploading ? "Uploading…" : "Upload video"}
        </button>
        <button type="button" onClick={addEmpty} className="btn-ghost !py-2.5 !px-5 text-[12px]">
          Add empty row
        </button>
      </div>

      <div className="space-y-4">
        {videos.map((video, index) => (
          <div key={video.id || index} className="rounded-2xl border border-line bg-surface/30 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="display text-xl">Video {index + 1}</h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-[12px] text-cream-muted">
                  <input type="checkbox" checked={video.active} onChange={(e) => patch(index, { active: e.target.checked })} className="h-4 w-4 accent-[#C9A86A]" />
                  Active
                </label>
                <button type="button" onClick={() => removeVideo(index)} className="rounded-md border border-red-500/30 px-3 py-1.5 text-[12px] text-red-300 hover:bg-red-500/10">
                  Remove
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[140px_1fr]">
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl border border-line bg-ink">
                {video.url ? (
                  <video src={video.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-4 text-center text-[11px] text-cream-dim">
                    Upload or paste a video URL
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={label}>Video URL</span>
                  <input className={input} value={video.url} onChange={(e) => patch(index, { url: e.target.value })} placeholder="Upload a video or paste a direct MP4/WebM URL" />
                  <span className="mt-1.5 block text-[11.5px] text-cream-dim">
                    {video.fileName ? `${video.fileName}${video.size ? ` · ${formatBytes(video.size)}` : ""}` : "Direct video file URL only — YouTube links are no longer used."}
                  </span>
                </label>

                <label className="block">
                  <span className={label}>Product CTA</span>
                  <select className={input} value={video.product} onChange={(e) => patch(index, { product: e.target.value })}>
                    {PRODUCT_CATEGORIES.map((product) => (
                      <option key={product} value={product} className="bg-ink">{product}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={label}>Title</span>
                  <input className={input} value={video.title} onChange={(e) => patch(index, { title: e.target.value })} placeholder="e.g. Woven label finishing" />
                </label>

                <label className="block sm:col-span-2">
                  <span className={label}>Caption</span>
                  <textarea rows={3} className={input + " resize-none"} value={video.caption} onChange={(e) => patch(index, { caption: e.target.value })} placeholder="Short description shown on the video section" />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={save} disabled={saving} className="btn-primary !py-2.5 !px-5 text-[12px] disabled:opacity-60">
        {saving ? "Saving…" : "Save videos"}
      </button>
    </div>
  );
}
