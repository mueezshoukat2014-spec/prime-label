// Shared artwork upload rules.
// Imported by BOTH the client form and the API route so the browser and the
// server can never disagree about what is allowed.

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILE_LABEL = "10 MB";

/**
 * Vercel serverless functions reject request bodies larger than ~4.5 MB, so
 * anything above this threshold is uploaded straight from the browser to
 * Vercel Blob instead of being proxied through /api/leads.
 */
export const DIRECT_UPLOAD_THRESHOLD = 3.5 * 1024 * 1024; // 3.5 MB

/** Extensions the customer may upload. */
export const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "pdf", "ai", "psd", "cdr"] as const;

/**
 * MIME types we accept. Design formats (.ai/.psd) are unreliable across
 * browsers and operating systems — Illustrator files often arrive as
 * application/pdf, and PSDs as application/octet-stream — so the extension is
 * the authoritative check and MIME is only a helper for the file picker.
 */
export const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
  "application/postscript",
  "application/illustrator",
  "image/vnd.adobe.photoshop",
  "application/x-photoshop",
  "application/photoshop",
  "application/octet-stream",
  // CorelDRAW — browsers report these inconsistently.
  "application/cdr",
  "application/x-cdr",
  "image/x-coreldraw",
  "application/coreldraw",
];

/** `accept` attribute for the <input type="file"> element. */
export const FILE_ACCEPT =
  ".png,.jpg,.jpeg,.pdf,.ai,.psd,.cdr,image/png,image/jpeg,application/pdf";

/* ------------------------------------------------------------------ *
 * Product images (admin dashboard) — stricter than customer artwork.
 * ------------------------------------------------------------------ */

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const PRODUCT_IMAGE_MAX_LABEL = "5 MB";

export const PRODUCT_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;

export const PRODUCT_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export const PRODUCT_IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";

export function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop()! : "";
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export type FileCheck = { ok: true } | { ok: false; error: string };

/**
 * Validate a chosen file. Returns a human-readable error suitable for a toast.
 */
export function validateArtwork(file: { name: string; size: number }): FileCheck {
  const ext = getExtension(file.name);

  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return {
      ok: false,
      error: `"${file.name}" is not a supported format. Please upload a PDF, PNG, JPG, AI or CDR file.`,
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: `That file is ${formatBytes(file.size)}. The maximum size is ${MAX_FILE_LABEL} — please compress it or send a link instead.`,
    };
  }

  if (file.size === 0) {
    return { ok: false, error: "That file appears to be empty. Please choose another file." };
  }

  return { ok: true };
}

/**
 * Validate a product image chosen in the admin dashboard.
 * Stricter than customer artwork: images only, 5 MB cap.
 */
export function validateProductImage(file: { name: string; size: number }): FileCheck {
  const ext = getExtension(file.name);

  if (!PRODUCT_IMAGE_EXTENSIONS.includes(ext as (typeof PRODUCT_IMAGE_EXTENSIONS)[number])) {
    return {
      ok: false,
      error: `"${file.name}" is not a supported image. Please use a PNG, JPG, JPEG or WEBP file.`,
    };
  }

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: `That image is ${formatBytes(file.size)}. The maximum size is ${PRODUCT_IMAGE_MAX_LABEL} — please compress it and try again.`,
    };
  }

  if (file.size === 0) {
    return { ok: false, error: "That image appears to be empty. Please choose another file." };
  }

  return { ok: true };
}

/** Build a safe, unique-ish blob pathname for a product image. */
export function buildProductImagePath(originalName: string): string {
  const ext = getExtension(originalName);
  const base =
    originalName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product";
  return `products/${base}.${ext}`;
}

/** Turn a product name into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Build a safe, unique-ish blob pathname for an upload. */
export function buildBlobPath(originalName: string): string {
  const ext = getExtension(originalName);
  const base = originalName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "artwork";
  const stamp = new Date().toISOString().slice(0, 10);
  return `artwork/${stamp}/${base}.${ext}`;
}
