import { notFound } from "next/navigation";

// Unmatched /ar/* URLs → the Arabic 404 (app/ar/not-found.tsx), status 404.
export const dynamic = "force-dynamic";

export default function ArCatchAllNotFound() {
  notFound();
}
