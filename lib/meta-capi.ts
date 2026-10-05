import "server-only";
import crypto from "crypto";

/**
 * Meta Conversions API — "Qualified Leads" CRM upload.
 *
 * Sends server-side Lead events to the Meta dataset so CRM leads are matched
 * back to ad campaigns (see Meta Events Manager → dataset 1554256332856113).
 *
 * Required env (Vercel → Project → Environment Variables, and .env.local):
 *   META_CAPI_ACCESS_TOKEN  — generated in Meta's CAPI setup ("Generate Access Token")
 *   META_CAPI_DATASET_ID    — optional override (default below)
 *
 * Follows Meta's instruction guide: event_name "Lead", action_source
 * "system_generated", event_source "crm", hashed email/phone (SHA-256),
 * lead_id from our CRM. Failures are logged and NEVER block the lead flow.
 */

const DATASET_ID = process.env.META_CAPI_DATASET_ID || "1554256332856113";
const API_VERSION = "v26.0";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function sendCapiLead(opts: {
  leadId: number | string;
  email?: string;
  phone?: string;
  source?: string;
}): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) {
    console.error("[meta-capi] META_CAPI_ACCESS_TOKEN not set — CRM event skipped.");
    return;
  }

  const em = (opts.email || "").trim().toLowerCase();
  const ph = (opts.phone || "").replace(/[^0-9]/g, "");
  const user_data: Record<string, string> = {};
  if (em) user_data.em = sha256(em);
  if (ph) user_data.ph = sha256(ph);

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "system_generated",
        event_source: "crm",
        lead_id: String(opts.leadId),
        custom_data: {
          event_source: "crm",
          lead_event_source: opts.source || "Prime Labels Website CRM",
        },
        user_data,
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${DATASET_ID}/events?access_token=${token}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
    );
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[meta-capi] upload failed:", res.status, JSON.stringify(j).slice(0, 300));
    } else {
      console.log("[meta-capi] Lead uploaded — events_received:", (j as any)?.events_received);
    }
  } catch (e) {
    console.error("[meta-capi] network error:", e instanceof Error ? e.message : e);
  }
}
