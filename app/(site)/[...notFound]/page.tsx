import { notFound } from "next/navigation";

// With separate English (app/(site)) and Arabic (app/ar) root layouts there is
// no top-level layout for Next's built-in 404, so unmatched URLs land here and
// render the styled (site)/not-found.tsx with a real 404 status. Never cached.
export const dynamic = "force-dynamic";

export default function CatchAllNotFound() {
  notFound();
}
