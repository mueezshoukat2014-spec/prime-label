import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import {
  getPdpContent,
  linesToText,
  specsToText,
  faqsToText,
} from "@/lib/pdp-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

async function ensureTable() {
  await sql`CREATE TABLE IF NOT EXISTS pdp_content (
    slug TEXT PRIMARY KEY,
    h1 TEXT,
    intro TEXT,
    folds TEXT,
    finishes TEXT,
    specs TEXT,
    faqs TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
}

/**
 * GET: for every active product return the EFFECTIVE editable text
 * (override if saved, otherwise the built-in default serialised to text)
 * plus a flag showing whether a custom override exists.
 */
export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  try {
    await ensureTable();
    const products = await sql`SELECT slug, title FROM products WHERE active = TRUE ORDER BY sort`;
    const overrides = await sql`SELECT slug, h1, intro, folds, finishes, specs, faqs FROM pdp_content`;
    const ovMap = new Map(overrides.map((o: any) => [String(o.slug), o]));

    const items = products.map((p: any) => {
      const base = getPdpContent(String(p.slug), String(p.title));
      const ov = ovMap.get(String(p.slug));
      return {
        slug: p.slug,
        title: p.title,
        customised: !!ov,
        h1: ov?.h1 || base.h1,
        intro: ov?.intro || base.intro,
        folds: ov?.folds || linesToText(base.folds),
        finishes: ov?.finishes || linesToText(base.finishes),
        specs: ov?.specs || specsToText(base.specs),
        faqs: ov?.faqs || faqsToText(base.faqs),
      };
    });
    return NextResponse.json({ ok: true, items });
  } catch (e: unknown) {
    console.error("PDP list failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Could not load product pages." }, { status: 500 });
  }
}

/** PUT: save an override for one product page. */
export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const slug = String(body.slug ?? "").trim().slice(0, 80);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing product." }, { status: 400 });
    }
    const exists = await sql`SELECT slug FROM products WHERE slug = ${slug} LIMIT 1`;
    if (!exists.length) {
      return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
    }
    await ensureTable();

    const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
    const h1 = clean(body.h1, 200);
    const intro = clean(body.intro, 600);
    const folds = clean(body.folds, 2000);
    const finishes = clean(body.finishes, 2000);
    const specs = clean(body.specs, 8000);
    const faqs = clean(body.faqs, 16000);

    await sql`
      INSERT INTO pdp_content (slug, h1, intro, folds, finishes, specs, faqs)
      VALUES (${slug}, ${h1}, ${intro}, ${folds}, ${finishes}, ${specs}, ${faqs})
      ON CONFLICT (slug) DO UPDATE SET
        h1 = EXCLUDED.h1,
        intro = EXCLUDED.intro,
        folds = EXCLUDED.folds,
        finishes = EXCLUDED.finishes,
        specs = EXCLUDED.specs,
        faqs = EXCLUDED.faqs,
        updated_at = now()
    `;
    try {
      revalidatePath(`/products/${slug}`);
      revalidatePath("/sitemap.xml");
    } catch {}
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not save the page.";
    console.error("PDP save failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

/** DELETE: remove the override — the page falls back to the built-in default copy. */
export async function DELETE(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const slug = String(body.slug ?? "").trim().slice(0, 80);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing product." }, { status: 400 });
    }
    await ensureTable();
    await sql`DELETE FROM pdp_content WHERE slug = ${slug}`;
    try {
      revalidatePath(`/products/${slug}`);
    } catch {}
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not reset the page.";
    console.error("PDP reset failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
