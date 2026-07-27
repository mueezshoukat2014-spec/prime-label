import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Exposes the current pathname to Server Components via a request header.
 *
 * The root layout needs it to decide whether to render the Meta Pixel — it
 * must be skipped on /admin so the owner's own dashboard sessions are never
 * tracked. Server Components can't read the URL directly, and Next does not
 * guarantee an equivalent built-in header.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip static assets and image optimisation — only page requests matter.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|photos|videos).*)"],
};
