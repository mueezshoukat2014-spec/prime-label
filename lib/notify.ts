import "server-only";
import { sql } from "@/lib/db";

/**
 * Quote-request email alerts via Resend.
 *
 * Design rules:
 *  - The recipient is stored in the DB (site_content.notificationEmail) so it
 *    can be changed from the admin panel without a deploy.
 *  - Sending is entirely best-effort. Every failure is caught and logged; a
 *    broken email provider must never turn a real customer enquiry into an
 *    error on the frontend.
 */

/** Fallback used when the DB has no value (e.g. first run before seeding). */
export const DEFAULT_NOTIFICATION_EMAIL = "mueezshoukat2014@gmail.com";

/** Verified sender. Resend's shared domain works with no DNS setup. */
const FROM = process.env.RESEND_FROM || "Prime Labels <onboarding@resend.dev>";

/**
 * Sender for replies written by the owner in the dashboard.
 *
 * Kept separate from FROM: internal alerts come from a notifications address,
 * but a reply lands in a customer's inbox and should look like a person at the
 * business wrote it. Falls back to FROM when the domain is not verified yet.
 */
const REPLY_FROM =
  process.env.RESEND_REPLY_FROM || "Prime Labels <reply@primelabelsintl.com>";

const SITE_URL = "https://primelabelsintl.com";
const ADMIN_URL = `${SITE_URL}/admin`;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Read the active recipient from the DB, falling back to the default. */
export async function getNotificationEmail(): Promise<string> {
  try {
    const rows = await sql`SELECT value FROM site_content WHERE key = 'notificationEmail' LIMIT 1`;
    const value = String(rows[0]?.value ?? "").trim();
    if (value && isEmail(value)) return value;
  } catch (e: unknown) {
    console.error("[notify] could not read notificationEmail:", e instanceof Error ? e.message : e);
  }
  return DEFAULT_NOTIFICATION_EMAIL;
}

/** Read the business name so the subject line stays correct after a rebrand. */
async function getBrandName(): Promise<string> {
  try {
    const rows = await sql`SELECT value FROM site_content WHERE key = 'businessName' LIMIT 1`;
    const value = String(rows[0]?.value ?? "").trim();
    if (value) return value;
  } catch {
    /* fall through */
  }
  return "Prime Labels";
}

/** Minimal, clean alert email. Deliberately contains no customer data. */
function buildHtml(brand: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0E0E12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0E0E12;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:520px;background:#16161C;border:1px solid rgba(244,240,232,0.09);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 8px;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A86A;">
                  New enquiry
                </p>
                <h1 style="margin:0;font-size:22px;line-height:1.3;color:#F4F0E8;font-weight:600;">
                  Someone requested a quote on ${brand}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 0;">
                <p style="margin:0;font-size:14px;line-height:1.65;color:#A59D8E;">
                  A new quote request has been submitted on your website. Log in to your
                  Admin Dashboard to view full details, artwork, and contact info.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 32px 34px;">
                <a href="${ADMIN_URL}"
                   style="display:inline-block;background:#C9A86A;color:#0E0E12;text-decoration:none;
                          font-size:14px;font-weight:600;padding:13px 26px;border-radius:999px;">
                  Open Admin Dashboard
                </a>
                <p style="margin:16px 0 0;font-size:12px;color:#6F685D;">
                  Or paste this link: <span style="color:#A59D8E;">${ADMIN_URL}</span>
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:11px;color:#6F685D;">
            You are receiving this because you are the notification contact for ${brand}.<br />
            Change this address in Admin Dashboard → Site Content.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildText(brand: string): string {
  return [
    `Someone requested a quote on ${brand}`,
    "",
    "A new quote request has been submitted on your website. Log in to your",
    "Admin Dashboard to view full details, artwork, and contact info.",
    "",
    `Open Admin Dashboard: ${ADMIN_URL}`,
  ].join("\n");
}

export type NotifyResult =
  | { sent: true; id: string | null; to: string }
  | { sent: false; reason: string };

/** Escape user-supplied text before putting it in the HTML email. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ContactMessage = {
  name: string;
  email?: string;
  subject?: string;
  message: string;
};

/**
 * Alert email for the contact form.
 *
 * Unlike the quote alert (which is a bare "go look at the dashboard" nudge),
 * this one includes the message itself — the whole point of a contact message
 * is to read it, and a short note should not require logging in.
 */
function buildContactHtml(brand: string, m: ContactMessage): string {
  const row = (label: string, value: string) =>
    value
      ? `<tr>
           <td style="padding:4px 0;font-size:12px;color:#6F685D;width:74px;vertical-align:top;">${label}</td>
           <td style="padding:4px 0;font-size:13.5px;color:#F4F0E8;">${esc(value)}</td>
         </tr>`
      : "";

  const replyBtn = m.email
    ? `<a href="mailto:${esc(m.email)}?subject=${encodeURIComponent(
        m.subject ? `Re: ${m.subject}` : `Re: your message to ${brand}`
      )}"
         style="display:inline-block;background:#C9A86A;color:#0E0E12;text-decoration:none;
                font-size:14px;font-weight:600;padding:13px 26px;border-radius:999px;">
        Reply to ${esc(m.name)}
      </a>`
    : `<a href="${ADMIN_URL}"
         style="display:inline-block;background:#C9A86A;color:#0E0E12;text-decoration:none;
                font-size:14px;font-weight:600;padding:13px 26px;border-radius:999px;">
        Open Admin Dashboard
      </a>`;

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0E0E12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0E0E12;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:520px;background:#16161C;border:1px solid rgba(244,240,232,0.09);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 8px;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A86A;">
                  New message
                </p>
                <h1 style="margin:0;font-size:22px;line-height:1.3;color:#F4F0E8;font-weight:600;">
                  ${esc(m.name)} sent you a message
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${row("From", m.name)}
                  ${row("Email", m.email || "")}
                  ${row("Subject", m.subject || "")}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 0;">
                <div style="border-radius:12px;background:rgba(244,240,232,0.03);
                            border:1px solid rgba(244,240,232,0.07);padding:16px 18px;">
                  <p style="margin:0;font-size:14px;line-height:1.7;color:#F4F0E8;white-space:pre-wrap;">${esc(
                    m.message
                  )}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 32px 34px;">
                ${replyBtn}
                <p style="margin:16px 0 0;font-size:12px;color:#6F685D;">
                  All messages: <span style="color:#A59D8E;">${ADMIN_URL}</span>
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:11px;color:#6F685D;">
            You are receiving this because you are the notification contact for ${brand}.<br />
            Change this address in Admin Dashboard → Site Content.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildContactText(brand: string, m: ContactMessage): string {
  return [
    `${m.name} sent you a message on ${brand}`,
    "",
    `From:    ${m.name}`,
    m.email ? `Email:   ${m.email}` : "",
    m.subject ? `Subject: ${m.subject}` : "",
    "",
    m.message,
    "",
    `All messages: ${ADMIN_URL}`,
  ]
    .filter((line, i, all) => !(line === "" && all[i - 1] === ""))
    .join("\n");
}

/**
 * Send the "new contact message" alert.
 *
 * NEVER throws — same contract as sendQuoteAlert. A broken email provider must
 * not turn a real message into an error for the visitor.
 */
export async function sendContactAlert(m: ContactMessage): Promise<NotifyResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[notify] RESEND_API_KEY not set — skipping contact alert email.");
      return { sent: false, reason: "RESEND_API_KEY not configured" };
    }

    const [to, brand] = await Promise.all([getNotificationEmail(), getBrandName()]);

    if (!isEmail(to)) {
      console.error("[notify] notification email is invalid, skipping:", to);
      return { sent: false, reason: "invalid recipient" };
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    // A subject the owner can scan in a crowded inbox.
    const subject = m.subject
      ? `💬 ${m.name}: ${m.subject}`.slice(0, 120)
      : `💬 New message from ${m.name} on ${brand}`.slice(0, 120);

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html: buildContactHtml(brand, m),
      text: buildContactText(brand, m),
      // Hitting reply in the inbox goes straight to the customer.
      ...(m.email && isEmail(m.email) ? { replyTo: m.email } : {}),
    });

    if (error) {
      console.error("[notify] Resend rejected the contact alert:", error.message || error);
      return { sent: false, reason: error.message || "resend error" };
    }

    console.log(`[notify] contact alert sent to ${to} (id: ${data?.id ?? "n/a"})`);
    return { sent: true, id: data?.id ?? null, to };
  } catch (e: unknown) {
    console.error("[notify] contact alert failed:", e instanceof Error ? e.message : e);
    return { sent: false, reason: e instanceof Error ? e.message : "unknown error" };
  }
}

/**
 * Send the "new quote request" alert.
 *
 * NEVER throws. Callers can await it without a try/catch and can safely
 * ignore the result — it exists only for tests and logging.
 */
export async function sendQuoteAlert(): Promise<NotifyResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Not an error: the site is simply running without email configured.
      console.warn("[notify] RESEND_API_KEY not set — skipping quote alert email.");
      return { sent: false, reason: "RESEND_API_KEY not configured" };
    }

    const [to, brand] = await Promise.all([getNotificationEmail(), getBrandName()]);

    if (!isEmail(to)) {
      console.error("[notify] notification email is invalid, skipping:", to);
      return { sent: false, reason: "invalid recipient" };
    }

    // Imported lazily so the SDK never loads on requests that don't email.
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: `🔔 Someone requested a quote on ${brand}!`,
      html: buildHtml(brand),
      text: buildText(brand),
    });

    if (error) {
      console.error("[notify] Resend rejected the message:", error.message || error);
      return { sent: false, reason: error.message || "resend error" };
    }

    console.log(`[notify] quote alert sent to ${to} (id: ${data?.id ?? "n/a"})`);
    return { sent: true, id: data?.id ?? null, to };
  } catch (e: unknown) {
    // Catch-all: network failure, SDK crash, anything. The caller carries on.
    console.error("[notify] quote alert failed:", e instanceof Error ? e.message : e);
    return { sent: false, reason: e instanceof Error ? e.message : "unknown error" };
  }
}

export type AdminReply = {
  to: string;
  subject: string;
  replyMessage: string;
  /** Used for the greeting. Optional — omitted cleanly when unknown. */
  customerName?: string;
  /** The message being answered, quoted at the bottom for context. */
  originalMessage?: string;
};

/**
 * A reply written by the owner in the dashboard, sent to a customer.
 *
 * This is the only outbound mail that a customer actually reads, so the layout
 * is branded rather than utilitarian.
 *
 * NEVER throws — same contract as the alert senders.
 */
function buildReplyHtml(brand: string, r: AdminReply): string {
  const greeting = r.customerName ? `Hi ${esc(r.customerName)},` : "Hello,";

  const quoted = r.originalMessage
    ? `<tr>
         <td style="padding:6px 32px 0;">
           <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6F685D;">
             Your original message
           </p>
           <div style="border-left:2px solid rgba(201,168,106,0.35);padding:2px 0 2px 14px;">
             <p style="margin:0;font-size:13px;line-height:1.65;color:#A59D8E;white-space:pre-wrap;">${esc(
               r.originalMessage
             )}</p>
           </div>
         </td>
       </tr>`
    : "";

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0E0E12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0E0E12;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:560px;background:#16161C;border:1px solid rgba(244,240,232,0.09);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:30px 32px 0;">
                <p style="margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A86A;">
                  ${esc(brand)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px 0;">
                <p style="margin:0 0 14px;font-size:15px;color:#F4F0E8;">${greeting}</p>
                <p style="margin:0;font-size:14.5px;line-height:1.75;color:#F4F0E8;white-space:pre-wrap;">${esc(
                  r.replyMessage
                )}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 32px 0;">
                <div style="height:1px;background:rgba(244,240,232,0.09);"></div>
              </td>
            </tr>
            ${quoted}
            <tr>
              <td style="padding:26px 32px 32px;">
                <p style="margin:0 0 4px;font-size:14px;color:#F4F0E8;font-weight:600;">${esc(brand)}</p>
                <p style="margin:0;font-size:12.5px;line-height:1.7;color:#6F685D;">
                  Custom woven labels, hang tags, stickers &amp; packaging<br />
                  <a href="${SITE_URL}" style="color:#C9A86A;text-decoration:none;">primelabelsintl.com</a>
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:11px;color:#6F685D;">
            You are receiving this because you contacted ${esc(brand)}.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildReplyText(brand: string, r: AdminReply): string {
  const lines = [r.customerName ? `Hi ${r.customerName},` : "Hello,", "", r.replyMessage, "", "—", brand, SITE_URL];
  if (r.originalMessage) {
    lines.push("", "--- Your original message ---", r.originalMessage);
  }
  return lines.join("\n");
}

export async function sendAdminReply(r: AdminReply): Promise<NotifyResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[notify] RESEND_API_KEY not set — cannot send reply.");
      return { sent: false, reason: "RESEND_API_KEY not configured" };
    }
    if (!isEmail(r.to)) {
      return { sent: false, reason: "invalid recipient" };
    }

    const brand = await getBrandName();

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    // Replies from the customer should reach the owner's real inbox, not the
    // no-reply sending address.
    const owner = await getNotificationEmail();

    const { data, error } = await resend.emails.send({
      from: REPLY_FROM,
      to: [r.to],
      subject: r.subject,
      html: buildReplyHtml(brand, r),
      text: buildReplyText(brand, r),
      ...(isEmail(owner) ? { replyTo: owner } : {}),
    });

    if (error) {
      console.error("[notify] Resend rejected the reply:", error.message || error);
      return { sent: false, reason: error.message || "resend error" };
    }

    console.log(`[notify] reply sent to ${r.to} (id: ${data?.id ?? "n/a"})`);
    return { sent: true, id: data?.id ?? null, to: r.to };
  } catch (e: unknown) {
    console.error("[notify] reply failed:", e instanceof Error ? e.message : e);
    return { sent: false, reason: e instanceof Error ? e.message : "unknown error" };
  }
}
