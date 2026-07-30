export type ManagedVideo = {
  id: string;
  url: string;
  title: string;
  caption: string;
  product: string;
  active: boolean;
  sort: number;
  fileName?: string;
  size?: number;
};

export const VIDEO_MAX_BYTES = 100 * 1024 * 1024; // direct browser upload to Blob
export const VIDEO_MAX_LABEL = "100 MB";
export const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v"] as const;
export const VIDEO_MIME = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];
export const VIDEO_ACCEPT = ".mp4,.webm,.mov,.m4v,video/mp4,video/webm,video/quicktime,video/x-m4v";

export function getVideoExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop()! : "";
}

export function validateVideoFile(file: { name: string; size: number }) {
  const ext = getVideoExtension(file.name);
  if (!VIDEO_EXTENSIONS.includes(ext as (typeof VIDEO_EXTENSIONS)[number])) {
    return { ok: false as const, error: "Please upload MP4, WEBM, MOV or M4V video only." };
  }
  if (file.size <= 0) return { ok: false as const, error: "That video file is empty." };
  if (file.size > VIDEO_MAX_BYTES) {
    return { ok: false as const, error: `That video is too large. Maximum size is ${VIDEO_MAX_LABEL}.` };
  }
  return { ok: true as const };
}

export function buildVideoPath(originalName: string): string {
  const ext = getVideoExtension(originalName) || "mp4";
  const base = originalName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "video";
  const stamp = new Date().toISOString().slice(0, 10);
  return `videos/${stamp}/${base}.${ext}`;
}

export function normaliseManagedVideos(raw: unknown): ManagedVideo[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((item, index) => {
      const row = (item || {}) as Partial<ManagedVideo>;
      const url = String(row.url || "").trim();
      if (!url) return null;
      return {
        id: String(row.id || `video-${index}`),
        url,
        title: String(row.title || `Product video ${index + 1}`).slice(0, 120),
        caption: String(row.caption || row.title || "Watch our product process in motion.").slice(0, 300),
        product: String(row.product || "Woven Labels").slice(0, 120),
        active: row.active !== false,
        sort: Number.isFinite(Number(row.sort)) ? Number(row.sort) : index,
        fileName: row.fileName ? String(row.fileName).slice(0, 180) : undefined,
        size: Number.isFinite(Number(row.size)) ? Number(row.size) : undefined,
      } satisfies ManagedVideo;
    })
    .filter((v): v is ManagedVideo => !!v)
    .sort((a, b) => a.sort - b.sort);
}
