import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME,
  MAX_FILE_BYTES,
  getExtension,
} from "@/lib/upload-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Client-upload token endpoint for artwork files.
 *
 * Why this exists: Vercel serverless functions cap the request body at ~4.5 MB,
 * so a 10 MB design file can never be proxied through an API route. Instead the
 * browser uploads straight to Vercel Blob and this route only mints a
 * short-lived, restricted token for that single upload.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Enforce the extension allow-list before handing out any token.
        const ext = getExtension(pathname);
        if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
          throw new Error("Unsupported file type.");
        }
        return {
          allowedContentTypes: ALLOWED_MIME,
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ uploadedAt: Date.now() }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Fires from Vercel's servers after the upload finishes.
        console.log("Artwork uploaded:", blob.pathname);
      },
    });

    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
