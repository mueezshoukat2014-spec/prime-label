import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import {
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_MAX_LABEL,
  formatBytes,
  getExtension,
  validateProductImage,
} from "@/lib/upload-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const str = (v: FormDataEntryValue | null | undefined, max: number) =>
  String(v ?? "").trim().slice(0, max);

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

/** Only ever delete blobs we own — never a static /photos/... path. */
function isOwnBlob(url: string | null | undefined): url is string {
  return !!url && /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(url);
}

function buildGalleryPath(originalName: string): string {
  const ext = getExtension(originalName);
  const base =
    originalName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "photo";
  return `gallery/${base}.${ext}`;
}

async function uploadOne(file: File): Promise<string> {
  const check = validateProductImage({ name: file.name, size: file.size });
  if (!check.ok) throw new Error(check.error);
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    throw new Error(
      `That image is ${formatBytes(file.size)}. The maximum size is ${PRODUCT_IMAGE_MAX_LABEL}.`
    );
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Image uploads are not configured.");
  }
  const input = Buffer.from(await file.arrayBuffer());
  const optimised = await sharp(input)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toBuffer();

  const pathname = buildGalleryPath(file.name).replace(/\.[^.]+$/, ".webp");
  const blob = await put(pathname, optimised, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/webp",
  });
  return blob.url;
}

function syncPublicPages() {
  try {
    revalidatePath("/");
    revalidatePath("/gallery");
  } catch {
    /* best effort */
  }
}

/* ------------------------------ READ ------------------------------ */

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  try {
    const rows = await sql`
      SELECT id, url, caption, category, width, height, active, sort, created_at
      FROM gallery_images
      ORDER BY sort, id DESC
    `;
    const cats = await sql`SELECT slug, name FROM categories ORDER BY id`;

    // The original static photo set, with any saved admin overrides applied.
    // These are editable (caption/category/hide) but never deletable from
    // storage because the files live in the repo.
    let overrides: Record<string, { caption: string | null; category: string | null; hidden: boolean }> = {};
    try {
      const ov = await sql`SELECT shortcode, caption, category, hidden FROM gallery_overrides`;
      ov.forEach((o: any) => {
        overrides[String(o.shortcode)] = {
          caption: o.caption,
          category: o.category,
          hidden: !!o.hidden,
        };
      });
    } catch {
      /* table may not exist yet */
    }
    const { gallery } = await import("@/lib/content");
    const statics = gallery.map((g: any) => {
      const o = overrides[String(g.shortcode)];
      return {
        shortcode: String(g.shortcode),
        url: String(g.src),
        caption: o?.caption ?? String(g.caption ?? ""),
        category: o?.category ?? String(g.category ?? ""),
        hidden: o?.hidden ?? false,
        edited: !!o,
      };
    });

    return NextResponse.json({ ok: true, images: rows, categories: cats, statics });
  } catch (e: unknown) {
    console.error("Gallery list failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Could not load the gallery." }, { status: 500 });
  }
}

/* ----------------------------- CREATE ----------------------------- */
/** Accepts one or many files in a single request. */

export async function POST(req: Request) {
  if (!(await isAuthed())) return unauthorized();

  try {
    const form = await req.formData();
    const caption = str(form.get("caption"), 300);
    const category = str(form.get("category"), 120);

    const files = form
      .getAll("images")
      .filter((f): f is File => typeof f !== "string" && !!f && f.size > 0);

    if (files.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Please choose at least one image." },
        { status: 400 }
      );
    }

    const startRow = await sql`SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM gallery_images`;
    let sort = Number(startRow[0]?.n ?? 0);

    const created: { id: number; url: string }[] = [];
    for (const file of files) {
      const url = await uploadOne(file);
      const rows = await sql`
        INSERT INTO gallery_images (url, caption, category, active, sort, updated_at)
        VALUES (${url}, ${caption || null}, ${category || null}, TRUE, ${sort}, now())
        RETURNING id, url
      `;
      if (rows[0]) created.push({ id: rows[0].id, url: rows[0].url });
      sort += 1;
    }

    syncPublicPages();
    return NextResponse.json({ ok: true, created, count: created.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not upload the images.";
    console.error("Gallery create failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

/* ----------------------------- UPDATE ----------------------------- */
/** Partial: only the keys actually sent are written. */

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();

  try {
    const body = await req.json().catch(() => ({}));

    // ---- static (repo) photo edit: stored as an override row ----
    if (typeof body.shortcode === "string" && body.shortcode.trim()) {
      const shortcode = body.shortcode.trim().slice(0, 80);
      const { gallery } = await import("@/lib/content");
      const item = (gallery as any[]).find((g) => String(g.shortcode) === shortcode);
      if (!item) {
        return NextResponse.json({ ok: false, error: "Photo not found." }, { status: 404 });
      }
      await sql`CREATE TABLE IF NOT EXISTS gallery_overrides (
        shortcode TEXT PRIMARY KEY,
        caption TEXT,
        category TEXT,
        hidden BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
      const hasCaption = Object.prototype.hasOwnProperty.call(body, "caption");
      const hasCategory = Object.prototype.hasOwnProperty.call(body, "category");
      const hasHidden = Object.prototype.hasOwnProperty.call(body, "hidden");
      const caption = hasCaption ? String(body.caption ?? "").slice(0, 300) : null;
      const category = hasCategory ? String(body.category ?? "").slice(0, 120) : null;
      const hidden = hasHidden ? !!body.hidden : null;
      await sql`
        INSERT INTO gallery_overrides (shortcode, caption, category, hidden)
        VALUES (
          ${shortcode},
          ${hasCaption ? caption : String(item.caption ?? "")},
          ${hasCategory ? category : String(item.category ?? "")},
          ${hasHidden ? hidden : false}
        )
        ON CONFLICT (shortcode) DO UPDATE SET
          caption  = CASE WHEN ${hasCaption}  THEN ${caption}  ELSE gallery_overrides.caption  END,
          category = CASE WHEN ${hasCategory} THEN ${category} ELSE gallery_overrides.category END,
          hidden   = CASE WHEN ${hasHidden}   THEN ${hidden}   ELSE gallery_overrides.hidden   END,
          updated_at = now()
      `;
      syncPublicPages();
      return NextResponse.json({ ok: true });
    }

    const id = Number(body.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: "Missing image." }, { status: 400 });
    }

    const exists = await sql`SELECT id FROM gallery_images WHERE id = ${id} LIMIT 1`;
    if (!exists.length) {
      return NextResponse.json({ ok: false, error: "Image not found." }, { status: 404 });
    }

    const hasCaption = Object.prototype.hasOwnProperty.call(body, "caption");
    const hasCategory = Object.prototype.hasOwnProperty.call(body, "category");
    const hasActive = Object.prototype.hasOwnProperty.call(body, "active");
    const hasSort = Object.prototype.hasOwnProperty.call(body, "sort");

    await sql`
      UPDATE gallery_images SET
        caption  = CASE WHEN ${hasCaption}  THEN ${String(body.caption ?? "").slice(0, 300) || null} ELSE caption  END,
        category = CASE WHEN ${hasCategory} THEN ${String(body.category ?? "").slice(0, 120) || null} ELSE category END,
        active   = CASE WHEN ${hasActive}   THEN ${!!body.active} ELSE active END,
        sort     = CASE WHEN ${hasSort}     THEN ${Number(body.sort) || 0} ELSE sort END,
        updated_at = now()
      WHERE id = ${id}
    `;

    syncPublicPages();
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not update the image.";
    console.error("Gallery update failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

/* ----------------------------- DELETE ----------------------------- */

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return unauthorized();

  try {
    const body = await req.json().catch(() => ({}));
    const ids: number[] = Array.isArray(body.ids)
      ? body.ids.map(Number).filter(Number.isFinite)
      : Number.isFinite(Number(body.id))
        ? [Number(body.id)]
        : [];

    if (ids.length === 0) {
      return NextResponse.json({ ok: false, error: "Missing image." }, { status: 400 });
    }

    const rows = await sql`SELECT id, url FROM gallery_images WHERE id = ANY(${ids})`;
    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "Image not found." }, { status: 404 });
    }

    await sql`DELETE FROM gallery_images WHERE id = ANY(${ids})`;

    await Promise.all(
      rows
        .map((r: { url: string }) => r.url)
        .filter(isOwnBlob)
        .map((u: string) => del(u).catch(() => undefined))
    );

    syncPublicPages();
    return NextResponse.json({ ok: true, deleted: rows.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not delete the image.";
    console.error("Gallery delete failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
