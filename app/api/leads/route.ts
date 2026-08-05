import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import {
  MAX_FILE_BYTES,
  MAX_FILE_LABEL,
  buildBlobPath,
  formatBytes,
  validateArtwork,
} from "@/lib/upload-rules";
import { normalizePhone, validateQuote } from "@/lib/quote-validation";
import { sendQuoteAlert } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Uploading a 10 MB design file can take a moment on a slow connection.
export const maxDuration = 60;

const str = (v: FormDataEntryValue | null | undefined, max: number) =>
  String(v ?? "").trim().slice(0, max);

/**
 * Quote request endpoint.
 *
 * Accepts multipart/form-data (with an optional artwork file) and also plain
 * JSON, so any older client that posts JSON keeps working.
 *
 * Flow: validate -> upload artwork to Vercel Blob -> insert row into Neon.
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");

    let fields: Record<string, string> = {};
    let file: File | null = null;

    // Set when the browser already uploaded the file straight to Blob storage
    // (used for files above the ~4.5 MB serverless body limit).
    let preUploadedUrl = "";
    let preUploadedName = "";

    if (isMultipart) {
      const form = await req.formData();
      const entry = form.get("artwork");
      if (entry && typeof entry !== "string" && entry.size > 0) {
        file = entry as File;
      }
      preUploadedUrl = str(form.get("artworkUrl"), 800);
      preUploadedName = str(form.get("artworkName"), 255);
      fields = {
        name: str(form.get("name"), 200),
        email: str(form.get("email"), 200),
        phone: str(form.get("phone"), 60),
        company: str(form.get("company"), 200),
        country: str(form.get("country"), 120),
        product: str(form.get("product"), 500),
        quantity: str(form.get("quantity"), 120),
        details: str(form.get("details"), 4000),
      };
    } else {
      const body = await req.json().catch(() => ({}));
      fields = {
        name: str(body.name, 200),
        email: str(body.email, 200),
        phone: str(body.phone, 60),
        company: str(body.company, 200),
        country: str(body.country, 120),
        product: str(body.product, 500),
        quantity: str(body.quantity, 120),
        details: str(body.details, 4000),
      };
    }

    // Required: name, phone (WhatsApp) and at least one product.
    // Optional: email, quantity, details, artwork, company, country.
    // Re-validated here because the browser can always be bypassed.
    const errors = validateQuote({
      name: fields.name,
      phone: fields.phone,
      product: fields.product,
      email: fields.email,
    });

    if (Object.keys(errors).length > 0) {
      const first =
        errors.name || errors.phone || errors.product || errors.email || "Please check your details.";
      return NextResponse.json({ ok: false, error: first, errors }, { status: 400 });
    }

    // Store the phone in a consistent shape.
    fields.phone = normalizePhone(fields.phone);

    // ---- artwork upload (optional) --------------------------------------
    let artworkUrl = "";
    let artworkName = "";

    // Case A: the browser uploaded directly to Blob and sent us the URL.
    if (preUploadedUrl) {
      // Only trust URLs that actually live on Vercel Blob storage.
      if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(preUploadedUrl)) {
        return NextResponse.json(
          { ok: false, error: "That artwork link is not valid. Please re-attach your file." },
          { status: 400 }
        );
      }
      artworkUrl = preUploadedUrl;
      artworkName = preUploadedName;
    }

    // Case B: a small file came through in this request — upload it here.
    if (file) {
      // Re-validate server-side: never trust the browser.
      const check = validateArtwork({ name: file.name, size: file.size });
      if (!check.ok) {
        return NextResponse.json({ ok: false, error: check.error }, { status: 400 });
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          {
            ok: false,
            error: `That file is ${formatBytes(file.size)}. The maximum size is ${MAX_FILE_LABEL}.`,
          },
          { status: 413 }
        );
      }

      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error("BLOB_READ_WRITE_TOKEN is not configured");
        return NextResponse.json(
          {
            ok: false,
            error:
              "File uploads are temporarily unavailable. Please submit without the file and send it on WhatsApp.",
          },
          { status: 503 }
        );
      }

      try {
        const blob = await put(buildBlobPath(file.name), file, {
          access: "public",
          addRandomSuffix: true,
          contentType: file.type || undefined,
        });
        artworkUrl = blob.url;
        artworkName = file.name.slice(0, 255);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("Blob upload failed:", msg);
        return NextResponse.json(
          {
            ok: false,
            error:
              "We could not upload your artwork. Please try again, or submit without it and send the file on WhatsApp.",
          },
          { status: 502 }
        );
      }
    }

    // ---- persist to Neon --------------------------------------------------
    const rows = await sql`
      INSERT INTO leads
        (name, email, phone, company, country, product, quantity, details, artwork_url, artwork_name)
      VALUES
        (${fields.name}, ${fields.email}, ${fields.phone}, ${fields.company},
         ${fields.country}, ${fields.product}, ${fields.quantity}, ${fields.details},
         ${artworkUrl || null}, ${artworkName || null})
      RETURNING id, created_at
    `;

    // sql() returns [] when DATABASE_URL is absent; treat that as a failure so
    // the visitor is told rather than silently losing their enquiry.
    if (!rows.length) {
      console.error("Lead insert returned no row — database unavailable?");
      return NextResponse.json(
        {
          ok: false,
          error: "Could not save your request. Please try again or message us on WhatsApp.",
        },
        { status: 500 }
      );
    }

    // ---- notify the owner -------------------------------------------------
    // This MUST be awaited. On Vercel the serverless function is frozen the
    // moment the response is returned, so a fire-and-forget `void
    // sendQuoteAlert()` gets killed before the HTTP request to Resend is even
    // sent — the lead saves, the visitor sees success, and the alert silently
    // never arrives.
    //
    // Awaiting costs ~300ms and is safe: sendQuoteAlert never throws, so a
    // broken email provider still cannot turn a real enquiry into an error.
    const alert = await sendQuoteAlert();
    if (!alert.sent) {
      // Logged, not returned: the lead is already stored, so the customer must
      // still see success. This line is what makes a delivery problem
      // diagnosable instead of invisible.
      console.error(`[leads] quote alert NOT sent for lead ${rows[0]?.id}: ${alert.reason}`);
    }

    return NextResponse.json({
      ok: true,
      id: rows[0]?.id ?? null,
      artworkUrl: artworkUrl || null,
      artworkName: artworkName || null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Lead submission failed:", msg);
    return NextResponse.json(
      { ok: false, error: "Could not save your request. Please try again or message us on WhatsApp." },
      { status: 500 }
    );
  }
}
