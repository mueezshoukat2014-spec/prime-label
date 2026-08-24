import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function syncPages(slug?: string) {
  try {
    revalidatePath("/blog");
    if (slug) revalidatePath(`/blog/${slug}`);
    revalidatePath("/sitemap.xml");
  } catch {}
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

/* ------------------------------ READ ------------------------------ */
export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  try {
    const rows = await sql`
      SELECT id, slug, title, excerpt, cover, body, published, created_at, updated_at
      FROM blog_posts ORDER BY created_at DESC
    `;
    return NextResponse.json({ ok: true, posts: rows });
  } catch (e: unknown) {
    console.error("Blog list failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Could not load posts." }, { status: 500 });
  }
}

/* ----------------------------- CREATE / UPDATE ----------------------------- */
/** Multipart form: id?, title, excerpt, body, published, cover(file, optional). */
export async function POST(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  try {
    const form = await req.formData();
    const id = Number(form.get("id")) || 0;
    const title = String(form.get("title") ?? "").trim().slice(0, 200);
    const excerpt = String(form.get("excerpt") ?? "").trim().slice(0, 500);
    const body = String(form.get("body") ?? "").trim().slice(0, 60000);
    const published = String(form.get("published")) === "true";

    if (title.length < 4) {
      return NextResponse.json({ ok: false, error: "Title is too short." }, { status: 400 });
    }
    if (body.length < 50) {
      return NextResponse.json({ ok: false, error: "The article body is too short." }, { status: 400 });
    }

    // optional cover upload -> webp on blob storage
    let coverUrl = "";
    const file = form.get("cover");
    if (file && typeof file !== "string" && file.size > 0) {
      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json({ ok: false, error: "Cover image must be under 8 MB." }, { status: 400 });
      }
      const buf = Buffer.from(await file.arrayBuffer());
      const optimised = await sharp(buf)
        .rotate()
        .resize({ width: 1600, height: 1000, fit: "cover", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();
      const blob = await put(`blog/${slugify(title) || "cover"}.webp`, optimised, {
        access: "public",
        addRandomSuffix: true,
        contentType: "image/webp",
      });
      coverUrl = blob.url;
    }

    if (id) {
      const existing = await sql`SELECT slug, cover FROM blog_posts WHERE id = ${id} LIMIT 1`;
      if (!existing.length) {
        return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
      }
      await sql`
        UPDATE blog_posts SET
          title = ${title},
          excerpt = ${excerpt},
          body = ${body},
          published = ${published},
          cover = ${coverUrl || String(existing[0].cover || "")},
          updated_at = now()
        WHERE id = ${id}
      `;
      syncPages(String(existing[0].slug));
      return NextResponse.json({ ok: true, id });
    }

    // new post — unique slug from title
    let slug = slugify(title);
    const dupe = await sql`SELECT id FROM blog_posts WHERE slug = ${slug} LIMIT 1`;
    if (dupe.length) slug = `${slug}-${Date.now().toString(36)}`;

    const rows = await sql`
      INSERT INTO blog_posts (slug, title, excerpt, cover, body, published)
      VALUES (${slug}, ${title}, ${excerpt}, ${coverUrl}, ${body}, ${published})
      RETURNING id, slug
    `;
    syncPages(slug);
    return NextResponse.json({ ok: true, id: rows[0].id, slug });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not save the post.";
    console.error("Blog save failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

/* ----------------------------- DELETE ----------------------------- */
export async function DELETE(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: "Missing post." }, { status: 400 });
    }
    const rows = await sql`DELETE FROM blog_posts WHERE id = ${id} RETURNING slug`;
    if (rows.length) syncPages(String(rows[0].slug));
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not delete the post.";
    console.error("Blog delete failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
