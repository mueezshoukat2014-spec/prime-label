import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OK_TYPES: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "application/pdf": "pdf",
  "image/svg+xml": "svg", "application/postscript": "ai", "application/illustrator": "ai",
};
const MAX = 10 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: false, error: "Blob storage is not configured in this environment." }, { status: 503 });
  }
  const fd = await req.formData().catch(() => null);
  const file = fd?.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
  const f = file as File;
  const kind = OK_TYPES[f.type];
  if (!kind) return NextResponse.json({ ok: false, error: "Allowed types: PNG, JPG, PDF, SVG, AI/EPS." }, { status: 400 });
  if (f.size > MAX) return NextResponse.json({ ok: false, error: "Max 10 MB." }, { status: 400 });

  const safe = f.name.replace(/[^\w.-]+/g, "-").slice(0, 80);
  const blob = await put(`invoices/attach/${Date.now()}-${safe}.${kind}`, Buffer.from(await f.arrayBuffer()), {
    access: "private",
    contentType: f.type,
  });
  return NextResponse.json({ ok: true, attachment: { name: f.name, type: f.type, size: f.size, url: blob.url } });
}
