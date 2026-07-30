import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthed } from "@/lib/auth";
import { VIDEO_MAX_BYTES, VIDEO_MIME, getVideoExtension, VIDEO_EXTENSIONS } from "@/lib/video";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const ext = getVideoExtension(pathname);
        if (!VIDEO_EXTENSIONS.includes(ext as (typeof VIDEO_EXTENSIONS)[number])) {
          throw new Error("Please upload MP4, WEBM, MOV or M4V video only.");
        }
        return {
          allowedContentTypes: VIDEO_MIME,
          maximumSizeInBytes: VIDEO_MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ uploadedAt: Date.now(), kind: "admin-video" }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Admin video uploaded:", blob.pathname);
      },
    });

    return NextResponse.json(result);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Video upload failed." },
      { status: 400 }
    );
  }
}
