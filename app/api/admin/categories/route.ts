import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function syncPublicPages() {
  try {
    revalidatePath("/");
    revalidatePath("/gallery");
  } catch {}
}

const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

/* ------------------------------ READ ------------------------------ */
export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  try {
    const cats = await sql`SELECT id, slug, name FROM categories ORDER BY id`;
    return NextResponse.json({ ok: true, categories: cats });
  } catch (e: unknown) {
    console.error("Categories list failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Could not load categories." }, { status: 500 });
  }
}

/* ----------------------------- CREATE ----------------------------- */
export async function POST(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim().slice(0, 80);
    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "Category name is too short." }, { status: 400 });
    }
    const slug = slugify(name);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "That name has no usable letters." }, { status: 400 });
    }
    const dupe = await sql`SELECT id FROM categories WHERE slug = ${slug} OR LOWER(name) = ${name.toLowerCase()} LIMIT 1`;
    if (dupe.length) {
      return NextResponse.json({ ok: false, error: "That category already exists." }, { status: 400 });
    }
    const rows = await sql`INSERT INTO categories (slug, name) VALUES (${slug}, ${name}) RETURNING id, slug, name`;
    syncPublicPages();
    return NextResponse.json({ ok: true, category: rows[0] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not add the category.";
    console.error("Category create failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

/* ----------------------------- RENAME ----------------------------- */
export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);
    const name = String(body.name ?? "").trim().slice(0, 80);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: "Missing category." }, { status: 400 });
    }
    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "Category name is too short." }, { status: 400 });
    }
    const rows = await sql`UPDATE categories SET name = ${name} WHERE id = ${id} RETURNING id, slug, name`;
    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "Category not found." }, { status: 404 });
    }
    syncPublicPages();
    return NextResponse.json({ ok: true, category: rows[0] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not rename the category.";
    console.error("Category rename failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

/* ----------------------------- DELETE ----------------------------- */
/** Deleting a category never deletes photos — they just become Uncategorised. */
export async function DELETE(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: "Missing category." }, { status: 400 });
    }
    const rows = await sql`SELECT slug FROM categories WHERE id = ${id} LIMIT 1`;
    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "Category not found." }, { status: 404 });
    }
    const slug = String(rows[0].slug);
    await sql`UPDATE gallery_images SET category = NULL WHERE category = ${slug}`;
    try {
      await sql`UPDATE gallery_overrides SET category = NULL WHERE category = ${slug}`;
    } catch {}
    await sql`DELETE FROM categories WHERE id = ${id}`;
    syncPublicPages();
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not delete the category.";
    console.error("Category delete failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
