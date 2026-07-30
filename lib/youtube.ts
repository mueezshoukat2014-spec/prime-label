export type ManagedVideo = {
  id: string;
  url: string;
  youtubeId: string;
  title: string;
  caption: string;
  product: string;
  active: boolean;
  sort: number;
};

export function extractYouTubeId(input: string): string {
  const raw = String(input || "").trim();
  if (!raw) return "";

  // Accept a bare video ID too.
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" && parts[1]) return parts[1];
      if (parts[0] === "embed" && parts[1]) return parts[1];
      const v = url.searchParams.get("v");
      if (v) return v;
    }
  } catch {
    // fall through
  }

  const match = raw.match(/(?:shorts\/|watch\?v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || "";
}

export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/shorts/${id}`;
}

export function youtubeEmbedUrl(id: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "0",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
    iv_load_policy: "3",
    fs: "0",
    disablekb: "1",
    enablejsapi: "1",
    origin: "https://primelabelsintl.com",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function youtubeThumbUrl(id: string) {
  // hqdefault is smaller/faster and works reliably for Shorts.
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function normaliseManagedVideos(raw: unknown): ManagedVideo[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((item, index) => {
      const row = (item || {}) as Partial<ManagedVideo> & { url?: string };
      const youtubeId = extractYouTubeId(row.youtubeId || row.url || "");
      if (!youtubeId) return null;
      return {
        id: String(row.id || `yt-${youtubeId}-${index}`),
        url: String(row.url || youtubeWatchUrl(youtubeId)),
        youtubeId,
        title: String(row.title || `YouTube Short ${index + 1}`).slice(0, 120),
        caption: String(row.caption || row.title || "Watch our product process in motion.").slice(0, 300),
        product: String(row.product || "Woven Labels").slice(0, 120),
        active: row.active !== false,
        sort: Number.isFinite(Number(row.sort)) ? Number(row.sort) : index,
      } satisfies ManagedVideo;
    })
    .filter((v): v is ManagedVideo => !!v)
    .sort((a, b) => a.sort - b.sort);
}
