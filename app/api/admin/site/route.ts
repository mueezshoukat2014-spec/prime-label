import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Keys the admin form is allowed to write. Anything else is ignored. */
const ALLOWED_KEYS = new Set([
  "notificationEmail",
  "announcementText",
  "announcementEnabled",
  "businessName",
  "tagline",
  "heroHeadline",
  "heroSub",
  "bio",
  "email",
  "phone",
  "whatsapp",
  "instagram",
  "website",
  "serviceArea",
  "shipping",
  "quoteProducts",
  "aboutStats",
  "aboutText",
  "aboutHeroTitle",
  "aboutHeroSub",
  "aboutStory",
  "aboutImg1",
  "aboutImg2",
  "aboutImg3",
]);

/**
 * Fields that are legitimately allowed to be blank.
 * Everything else is protected: an empty submission is treated as
 * "not edited" and the stored value is kept.
 */
const MAY_BE_EMPTY = new Set([
  "phone",
  "announcementText",
  "announcementEnabled",
  "quoteProducts",
  "aboutStats",
  "aboutText",
  "aboutHeroTitle",
  "aboutHeroSub",
  "aboutStory",
  "aboutImg1",
  "aboutImg2",
  "aboutImg3",
]);

/** Common typos of the big free mail providers, mapped to the real thing. */
const DOMAIN_TYPOS: Record<string, string> = {
  "gmail.om": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gnail.com": "gmail.com",
  "hotmail.om": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com",
};

function suggestDomain(domain: string): string {
  return DOMAIN_TYPOS[domain.toLowerCase()] ?? "gmail.com";
}

/**
 * Does this domain actually accept email?
 *
 * Uses DNS-over-HTTPS because the Node `dns` module is not available on every
 * runtime. A domain accepts mail if it has an MX record, or (per RFC 5321) an
 * A record it can fall back to.
 *
 * Returns "unknown" on any network/parse failure so a lookup problem can never
 * block the admin from saving.
 */
async function domainAcceptsMail(domain: string): Promise<"ok" | "no-mail-server" | "unknown"> {
  if (!domain) return "no-mail-server";

  async function lookup(type: "MX" | "A"): Promise<{ status: number; count: number } | null> {
    try {
      const res = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
        { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(4000) }
      );
      if (!res.ok) return null;
      const json = (await res.json()) as { Status?: number; Answer?: unknown[] };
      return { status: json.Status ?? -1, count: (json.Answer ?? []).length };
    } catch {
      return null;
    }
  }

  const mx = await lookup("MX");
  if (mx === null) return "unknown";
  // Status 3 = NXDOMAIN: the domain does not exist at all.
  if (mx.status === 3) return "no-mail-server";
  if (mx.count > 0) return "ok";

  const a = await lookup("A");
  if (a === null) return "unknown";
  if (a.status === 3) return "no-mail-server";
  return a.count > 0 ? "ok" : "no-mail-server";
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await sql`SELECT key, value FROM site_content`;
    const content: Record<string, string> = {};
    rows.forEach((r: { key: string; value: string }) => (content[r.key] = r.value));
    return NextResponse.json({ ok: true, content });
  } catch (e: unknown) {
    console.error("Site content load failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Could not load site content." }, { status: 500 });
  }
}

/**
 * Partial-merge update.
 *
 * Previously this wrote every key it received, so a form that had not finished
 * loading would submit blanks and erase real content. Now:
 *   - unknown keys are rejected
 *   - keys not present in the body are left completely untouched
 *   - a blank value for a protected key does NOT overwrite existing data
 *     (mirrors COALESCE(NULLIF($1,''), value) semantics)
 */
export async function PUT(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }

    const updated: string[] = [];
    const skipped: string[] = [];

    for (const [key, raw] of Object.entries(body as Record<string, unknown>)) {
      if (!ALLOWED_KEYS.has(key)) {
        skipped.push(key);
        continue;
      }
      // `undefined`/`null` means "field was not part of this edit".
      if (raw === undefined || raw === null) {
        skipped.push(key);
        continue;
      }

      const value = String(raw).trim().slice(0, 5000);

      // A typo here silently disables every quote alert, so reject it loudly
      // rather than saving a broken address.
      if (key === "notificationEmail" && value !== "") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          return NextResponse.json(
            {
              ok: false,
              error: "That notification email doesn't look right. Please check the address.",
            },
            { status: 400 }
          );
        }

        // Shape alone is not enough: "gmail.om" and "gmial.com" both pass the
        // regex but can never receive mail. Confirm the domain actually has a
        // mail server before accepting it.
        const domain = (value.split("@")[1] ?? "").toLowerCase();

        // Known typo-squats (gmial.com etc.) are real registered domains with
        // real MX records, so DNS can never catch them. Block by name.
        if (DOMAIN_TYPOS[domain]) {
          return NextResponse.json(
            {
              ok: false,
              error: `"${domain}" looks like a typo. Did you mean ${DOMAIN_TYPOS[domain]}?`,
            },
            { status: 400 }
          );
        }

        const check = await domainAcceptsMail(domain);
        if (check === "no-mail-server") {
          return NextResponse.json(
            {
              ok: false,
              error: `"${domain}" is not a real mail domain — alerts sent there would vanish. Did you mean ${suggestDomain(domain)}?`,
            },
            { status: 400 }
          );
        }
        // "unknown" (DNS lookup failed) falls through: never block a save just
        // because our own network hiccuped.
      }

      if (value === "" && !MAY_BE_EMPTY.has(key)) {
        // Protected field submitted blank -> keep whatever is stored.
        skipped.push(key);
        continue;
      }

      // NULLIF/COALESCE guard: even on the UPDATE branch a blank can never
      // replace a non-blank stored value.
      await sql`
        INSERT INTO site_content (key, value)
        VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE
        SET value = COALESCE(NULLIF(EXCLUDED.value, ''), site_content.value)
      `;
      updated.push(key);
    }

    try {
      revalidatePath("/");
      revalidatePath("/contact");
      revalidatePath("/quote");
      revalidatePath("/gallery");
    } catch {
      /* best effort */
    }

    return NextResponse.json({ ok: true, updated, skipped });
  } catch (e: unknown) {
    console.error("Site content save failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Could not save changes." }, { status: 500 });
  }
}
