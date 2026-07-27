import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import {
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_MAX_LABEL,
  buildProductImagePath,
  formatBytes,
  slugify,
  validateProductImage,
} from "@/lib/upload-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const str = (v: FormDataEntryValue | null | undefined, max: number) =>
  String(v ?? "").trim().slice(0, max);

const numOrNull = (v: FormDataEntryValue | null | undefined) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

/** Only delete blobs we own — never touch a static /photos path. */
function isOwnBlob(url: string | null | undefined): url is string {
  return (
    !!url && /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(url)
  );
}

/**
 * Upload a product image to Vercel Blob.
 * Returns the public URL, or throws with a human-readable message.
 */
async function uploadImage(file: File): Promise<string> {
  const check = validateProductImage({ name: file.name, size: file.size });
  if (!check.ok) throw new Error(check.error);

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    throw new Error(
      `That image is ${formatBytes(file.size)}. The maximum size is ${PRODUCT_IMAGE_MAX_LABEL}.`
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Image uploads are not configured. Please contact support.");
  }

  const blob = await put(buildProductImagePath(file.name), file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || undefined,
  });
  return blob.url;
}

/**
 * Resolve the full gallery for a save.
 *
 * The client sends:
 *   - `gallery_urls`  JSON array of images to KEEP (already-hosted URLs), in order
 *   - `gallery_files` zero or more newly-picked files to upload and append
 *
 * Returns the ordered list of secondary images (main image excluded).
 */
async function resolveGallery(form: FormData): Promise<string[] | null> {
  const sentUrls = form.has("gallery_urls");
  const files = form
    .getAll("gallery_files")
    .filter((f): f is File => typeof f !== "string" && !!f && f.size > 0);

  // Neither field present => caller isn't touching the gallery at all.
  if (!sentUrls && files.length === 0) return null;

  let kept: string[] = [];
  if (sentUrls) {
    try {
      const parsed = JSON.parse(str(form.get("gallery_urls"), 20000) || "[]");
      if (Array.isArray(parsed)) {
        kept = parsed.filter((u): u is string => typeof u === "string" && !!u.trim());
      }
    } catch {
      throw new Error("Could not read the gallery images. Please try again.");
    }
  }

  const uploaded: string[] = [];
  for (const file of files) {
    uploaded.push(await uploadImage(file));
  }

  // De-duplicate while preserving order.
  return Array.from(new Set([...kept, ...uploaded]));
}

/** Delete blobs we own that are no longer referenced by the product. */
async function pruneBlobs(before: string[], after: string[]) {
  const stillUsed = new Set(after);
  const orphans = before.filter((u) => u && !stillUsed.has(u) && isOwnBlob(u));
  await Promise.all(orphans.map((u) => del(u).catch(() => undefined)));
  return orphans.length;
}

/** Refresh the public pages so catalogue edits appear immediately. */
function syncPublicPages() {
  try {
    revalidatePath("/");
    revalidatePath("/quote");
    revalidatePath("/gallery");
  } catch {
    /* revalidation is best-effort */
  }
}

/* ----------------------------- READ ----------------------------- */

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  try {
    const rows = await sql`
      SELECT id, slug, title, tagline, description, specs, image, gallery,
             price_from, moq, turnaround, category, active, sort, created_at, updated_at
      FROM products
      ORDER BY sort, id
    `;
    return NextResponse.json({ ok: true, products: rows });
  } catch (e: unknown) {
    console.error("Product list failed:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { ok: false, error: "Could not load products." },
      { status: 500 }
    );
  }
}

/* ---------------------------- CREATE ---------------------------- */

export async function POST(req: Request) {
  if (!(await isAuthed())) return unauthorized();

  try {
    const form = await req.formData();

    const title = str(form.get("title"), 200);
    if (!title) {
      return NextResponse.json(
        { ok: false, error: "Product name is required." },
        { status: 400 }
      );
    }

    const category = str(form.get("category"), 120);
    const tagline = str(form.get("tagline"), 400);
    const description = str(form.get("description"), 4000);
    const specs = str(form.get("specs"), 20000);
    const priceFrom = str(form.get("price_from"), 120) || "On request";
    const moq = numOrNull(form.get("moq"));
    const turnaround = numOrNull(form.get("turnaround"));

    // Unique slug: derive from the title, then suffix if taken.
    const base = slugify(title) || `product-${Date.now()}`;
    let slug = base;
    for (let i = 2; i < 60; i++) {
      const clash = await sql`SELECT 1 FROM products WHERE slug = ${slug} LIMIT 1`;
      if (!clash.length) break;
      slug = `${base}-${i}`;
    }

    // Optional image
    let imageUrl = "";
    const fileEntry = form.get("image");
    if (fileEntry && typeof fileEntry !== "string" && fileEntry.size > 0) {
      imageUrl = await uploadImage(fileEntry as File);
    } else {
      const provided = str(form.get("image_url"), 800);
      if (provided) imageUrl = provided;
    }

    // Optional secondary gallery images.
    const extras = (await resolveGallery(form)) ?? [];

    // gallery[0] is always the main image — the public site relies on this.
    const gallery = imageUrl
      ? Array.from(new Set([imageUrl, ...extras]))
      : Array.from(new Set(extras));

    const nextSort = await sql`SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM products`;
    const sort = nextSort[0]?.n ?? 0;

    const rows = await sql`
      INSERT INTO products
        (slug, title, tagline, description, specs, image, gallery,
         price_from, moq, turnaround, category, active, sort, updated_at)
      VALUES
        (${slug}, ${title}, ${tagline}, ${description}, ${specs},
         ${imageUrl || null}, ${JSON.stringify(gallery)}::jsonb,
         ${priceFrom}, ${moq}, ${turnaround}, ${category || null}, TRUE, ${sort}, now())
      RETURNING id, slug, title, image, category
    `;

    syncPublicPages();

    return NextResponse.json({
      ok: true,
      product: rows[0] ?? { slug, title },
      slug,
      imageUrl: imageUrl || null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not create the product.";
    console.error("Product create failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

/* ---------------------------- UPDATE ---------------------------- */

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();

  try {
    const contentType = req.headers.get("content-type") || "";

    // ---- JSON path: legacy inline price/description editing ----
    if (!contentType.includes("multipart/form-data")) {
      const b = await req.json();
      const slug = String(b.slug || "").trim();
      if (!slug) {
        return NextResponse.json({ ok: false, error: "Missing product." }, { status: 400 });
      }
      // Partial merge: a key that is absent (undefined) or blank must never
      // erase stored content. COALESCE(NULLIF($1,''), column) keeps the
      // existing value whenever the incoming one is empty.
      const pick = (v: unknown) =>
        v === undefined || v === null ? null : String(v).trim() || null;

      await sql`
        UPDATE products SET
          title       = COALESCE(${pick(b.title)},       title),
          tagline     = COALESCE(${pick(b.tagline)},     tagline),
          description = COALESCE(${pick(b.description)}, description),
          price_from  = COALESCE(${pick(b.price_from)},  price_from),
          moq         = COALESCE(${b.moq != null && b.moq !== "" ? Number(b.moq) : null}, moq),
          turnaround  = COALESCE(${b.turnaround != null && b.turnaround !== "" ? Number(b.turnaround) : null}, turnaround),
          updated_at  = now()
        WHERE slug = ${slug}
      `;
      syncPublicPages();
      return NextResponse.json({ ok: true });
    }

    // ---- multipart path: full edit, optional image swap ----
    const form = await req.formData();
    const slug = str(form.get("slug"), 120);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing product." }, { status: 400 });
    }

    const existing = await sql`SELECT id, image, gallery FROM products WHERE slug = ${slug} LIMIT 1`;
    if (!existing.length) {
      return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
    }

    const title = str(form.get("title"), 200);
    if (!title) {
      return NextResponse.json(
        { ok: false, error: "Product name is required." },
        { status: 400 }
      );
    }

    // Presence-aware reads.
    //
    // A key the client did NOT send must keep its stored value, while a key
    // sent deliberately blank must be clearable. So we track both the value
    // and whether it was provided, and let SQL decide per column.
    const has = (k: string) => form.has(k);

    const category = str(form.get("category"), 120) || null;
    const tagline = str(form.get("tagline"), 400);
    const description = str(form.get("description"), 4000);
    const specs = str(form.get("specs"), 20000);
    const priceFrom = str(form.get("price_from"), 120) || "On request";
    const moq = numOrNull(form.get("moq"));
    const turnaround = numOrNull(form.get("turnaround"));
    const activeRaw = str(form.get("active"), 10);
    const active = activeRaw === "" ? true : activeRaw === "true" || activeRaw === "1";

    const oldImage: string | null = existing[0].image ?? null;
    let imageUrl = oldImage;

    const fileEntry = form.get("image");
    if (fileEntry && typeof fileEntry !== "string" && fileEntry.size > 0) {
      imageUrl = await uploadImage(fileEntry as File);
    } else {
      const provided = str(form.get("image_url"), 800);
      if (provided && provided !== oldImage) imageUrl = provided;
    }

    const currentGallery: string[] = Array.isArray(existing[0].gallery)
      ? existing[0].gallery
      : typeof existing[0].gallery === "string"
        ? JSON.parse(existing[0].gallery || "[]")
        : [];

    // Secondary images. `null` means the client didn't touch the gallery, so
    // we keep whatever is stored (minus the old main image if it was swapped).
    const submittedExtras = await resolveGallery(form);
    const extras =
      submittedExtras ??
      currentGallery.filter((g) => g !== oldImage && g !== imageUrl);

    // gallery[0] must always be the main image — the public site slices
    // gallery[1..3] for the thumbnail strip.
    const gallery = imageUrl
      ? Array.from(new Set([imageUrl, ...extras.filter((g) => g !== imageUrl)]))
      : Array.from(new Set(extras));

    await sql`
      UPDATE products SET
        title       = ${title},
        tagline     = CASE WHEN ${has("tagline")}     THEN ${tagline}     ELSE tagline     END,
        description = CASE WHEN ${has("description")} THEN ${description} ELSE description END,
        specs       = CASE WHEN ${has("specs")}       THEN ${specs}       ELSE specs       END,
        category    = CASE WHEN ${has("category")}    THEN ${category}    ELSE category    END,
        price_from  = CASE WHEN ${has("price_from")}  THEN ${priceFrom}   ELSE price_from  END,
        moq         = CASE WHEN ${has("moq")}         THEN ${moq}         ELSE moq         END,
        turnaround  = CASE WHEN ${has("turnaround")}  THEN ${turnaround}  ELSE turnaround  END,
        image       = ${imageUrl},
        gallery     = ${JSON.stringify(gallery)}::jsonb,
        active      = CASE WHEN ${has("active")}      THEN ${active}      ELSE active      END,
        updated_at  = now()
      WHERE slug = ${slug}
    `;

    // Only after the row is safely updated, remove blobs we own that are no
    // longer referenced (a swapped main image, or gallery photos removed
    // with the "X" button). Static /photos/... paths are never touched.
    const before = Array.from(new Set([...(oldImage ? [oldImage] : []), ...currentGallery]));
    const after = Array.from(new Set([...(imageUrl ? [imageUrl] : []), ...gallery]));
    const pruned = await pruneBlobs(before, after);

    syncPublicPages();
    return NextResponse.json({ ok: true, slug, imageUrl, gallery, pruned });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not update the product.";
    console.error("Product update failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

/* ---------------------------- DELETE ---------------------------- */

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return unauthorized();

  try {
    const body = await req.json().catch(() => ({}));
    const slug = String(body.slug || "").trim();
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing product." }, { status: 400 });
    }

    const rows = await sql`SELECT image, gallery FROM products WHERE slug = ${slug} LIMIT 1`;
    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
    }

    await sql`DELETE FROM products WHERE slug = ${slug}`;

    // Clean up any blobs this product owned.
    const urls: string[] = [];
    if (rows[0].image) urls.push(rows[0].image);
    const g = rows[0].gallery;
    const list: string[] = Array.isArray(g) ? g : typeof g === "string" ? JSON.parse(g || "[]") : [];
    list.forEach((u) => urls.push(u));

    await Promise.all(
      Array.from(new Set(urls))
        .filter(isOwnBlob)
        .map((u) => del(u).catch(() => undefined))
    );

    syncPublicPages();
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not delete the product.";
    console.error("Product delete failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
