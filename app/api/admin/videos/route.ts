import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { extractYouTubeId, normaliseManagedVideos, youtubeWatchUrl } from "@/lib/youtube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEY = "youtubeShorts";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

async function readVideos() {
  const rows = await sql`SELECT value FROM site_content WHERE key = ${KEY} LIMIT 1`;
  if (!rows.length) return [];
  try {
    return normaliseManagedVideos(JSON.parse(String(rows[0].value || "[]")));
  } catch {
    return [];
  }
}

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  try {
    const videos = await readVideos();
    return NextResponse.json({ ok: true, videos });
  } catch (e: unknown) {
    console.error("Video list failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Could not load videos." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const incoming = Array.isArray(body.videos) ? body.videos.slice(0, 12) : [];

    const cleaned = incoming.map((row: any, index: number) => {
      const url = String(row.url || "").trim();
      const youtubeId = extractYouTubeId(url || row.youtubeId || "");
      if (!youtubeId) {
        throw new Error(`Video ${index + 1}: please enter a valid YouTube Shorts, YouTube, youtu.be or video ID link.`);
      }
      return {
        id: String(row.id || `yt-${youtubeId}-${Date.now()}-${index}`),
        url: url || youtubeWatchUrl(youtubeId),
        youtubeId,
        title: String(row.title || `YouTube Short ${index + 1}`).trim().slice(0, 120),
        caption: String(row.caption || "Watch our product process in motion.").trim().slice(0, 300),
        product: String(row.product || "Woven Labels").trim().slice(0, 120),
        active: row.active !== false,
        sort: index,
      };
    });

    await sql`
      INSERT INTO site_content (key, value)
      VALUES (${KEY}, ${JSON.stringify(cleaned)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;

    try {
      revalidatePath("/");
      revalidatePath("/quote");
    } catch {
      /* best effort */
    }

    return NextResponse.json({ ok: true, videos: cleaned });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not save videos.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
