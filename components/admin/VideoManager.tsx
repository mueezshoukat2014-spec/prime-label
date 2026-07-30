"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/Toast";
import AppliedBadge from "@/components/admin/AppliedBadge";
import { PRODUCT_CATEGORIES } from "@/lib/quote-validation";
import { extractYouTubeId, youtubeThumbUrl, type ManagedVideo } from "@/lib/youtube";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50";
const label = "mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream-dim";

const emptyVideo = (): ManagedVideo => ({
  id: `draft-${Date.now()}`,
  url: "",
  youtubeId: "",
  title: "",
  caption: "",
  product: "Woven Labels",
  active: true,
  sort: 0,
});

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
  const [videos, setVideos] = useState<ManagedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const activeCount = useMemo(() => videos.filter((v) => v.active && extractYouTubeId(v.url || v.youtubeId)).length, [videos]);

  function patch(index: number, changes: Partial<ManagedVideo>) {
    setVideos((list) =>
      list.map((video, i) => {
        if (i !== index) return video;
        const next = { ...video, ...changes };
        const id = extractYouTubeId(next.url || next.youtubeId || "");
        return { ...next, youtubeId: id };
      })
    );
  }

  function addVideo() {
    setVideos((list) => [...list, { ...emptyVideo(), sort: list.length }]);
  }

  function removeVideo(index: number) {
    setVideos((list) => list.filter((_, i) => i !== index));
  }

  async function save() {
    if (saving) return;
    const rows = videos
      .map((v, i) => ({ ...v, sort: i, youtubeId: extractYouTubeId(v.url || v.youtubeId || "") }))
      .filter((v) => v.url.trim() || v.youtubeId);

    if (rows.length === 0) {
      toast.error("Add at least one YouTube Shorts link, or leave this page and the site will keep using the built-in videos.");
      return;
    }

    const invalid = rows.findIndex((v) => !v.youtubeId);
    if (invalid >= 0) {
      toast.error(`Video ${invalid + 1}: please paste a valid YouTube Shorts/unlisted link.`);
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
          <h1 className="display text-3xl">Videos / YouTube Shorts</h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-cream-muted">
            Paste unlisted YouTube Shorts links here. The website will stream them from YouTube using a custom Prime Labels video section.
            YouTube may still show minimal player branding internally because their embed policy requires it.
          </p>
        </div>
        <AppliedBadge show={applied} />
      </div>

      <div className="rounded-2xl border border-champagne/25 bg-champagne/[0.04] p-4 text-[12.5px] leading-relaxed text-cream-muted">
        Active Shorts on site: <span className="text-champagne">{activeCount}</span>. Use YouTube Shorts, youtu.be, watch links, embed links, or a bare 11-character YouTube video ID.
      </div>

      <div className="space-y-4">
        {videos.map((video, index) => {
          const id = extractYouTubeId(video.url || video.youtubeId || "");
          return (
            <div key={video.id || index} className="rounded-2xl border border-line bg-surface/30 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="display text-xl">Short {index + 1}</h2>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-[12px] text-cream-muted">
                    <input
                      type="checkbox"
                      checked={video.active}
                      onChange={(e) => patch(index, { active: e.target.checked })}
                      className="h-4 w-4 accent-[#C9A86A]"
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="rounded-md border border-red-500/30 px-3 py-1.5 text-[12px] text-red-300 hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[140px_1fr]">
                <div className="relative aspect-[9/12] overflow-hidden rounded-xl border border-line bg-ink">
                  {id ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={youtubeThumbUrl(id)} alt="YouTube thumbnail preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] text-cream-dim">Preview</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className={label}>YouTube Short / unlisted link *</span>
                    <input
                      className={input}
                      value={video.url}
                      onChange={(e) => patch(index, { url: e.target.value })}
                      placeholder="https://youtube.com/shorts/VIDEO_ID"
                    />
                    <span className="mt-1.5 block text-[11.5px] text-cream-dim">
                      Detected video ID: {id ? <span className="text-champagne">{id}</span> : "—"}
                    </span>
                  </label>

                  <label className="block">
                    <span className={label}>Product CTA</span>
                    <select
                      className={input}
                      value={video.product}
                      onChange={(e) => patch(index, { product: e.target.value })}
                    >
                      {PRODUCT_CATEGORIES.map((product) => (
                        <option key={product} value={product} className="bg-ink">
                          {product}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className={label}>Title</span>
                    <input
                      className={input}
                      value={video.title}
                      onChange={(e) => patch(index, { title: e.target.value })}
                      placeholder="e.g. Woven label finishing"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className={label}>Caption</span>
                    <textarea
                      rows={3}
                      className={input + " resize-none"}
                      value={video.caption}
                      onChange={(e) => patch(index, { caption: e.target.value })}
                      placeholder="Short description shown on the video section"
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={addVideo} className="btn-ghost !py-2.5 !px-5 text-[12px]">
          Add another Short
        </button>
        <button type="button" onClick={save} disabled={saving} className="btn-primary !py-2.5 !px-5 text-[12px] disabled:opacity-60">
          {saving ? "Saving…" : "Save videos"}
        </button>
      </div>
    </div>
  );
}
