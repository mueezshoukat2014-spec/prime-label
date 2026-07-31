"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Logo from "@/components/Logo";
import ProductManager from "@/components/admin/ProductManager";
import AppliedBadge from "@/components/admin/AppliedBadge";
import GalleryManager from "@/components/admin/GalleryManager";
import VideoManager from "@/components/admin/VideoManager";
import QuoteGenerator from "@/components/admin/QuoteGenerator";
import SiteSettings from "@/components/admin/SiteSettings";
import SendQuoteModal, { type QuoteLead } from "@/components/admin/SendQuoteModal";
import ReplyModal, { type ReplyTarget } from "@/components/admin/ReplyModal";
import { useToast } from "@/components/Toast";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none focus:border-champagne/50";
const label = "mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream-dim";

type Tab =
  | "overview"
  | "leads"
  | "messages"
  | "products"
  | "content"
  | "faqs"
  | "testimonials"
  | "gallery"
  | "videos"
  | "quotegen"
  | "settings";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "leads", label: "Leads" },
  { id: "messages", label: "Messages" },
  { id: "products", label: "Products" },
  { id: "content", label: "Content & Copy" },
  { id: "faqs", label: "FAQs" },
  { id: "testimonials", label: "Testimonials" },
  { id: "gallery", label: "Gallery / Portfolio" },
  { id: "videos", label: "Videos" },
  { id: "quotegen", label: "Quote Generator" },
  { id: "settings", label: "Site Settings" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  async function logout() {
    await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logout: true }),
    });
    window.location.href = "/";
  }

  return (
    <div className="notranslate min-h-screen bg-ink text-cream" translate="no" dir="ltr">
      <header className="sticky top-0 z-30 border-b border-line bg-ink-2/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <div className="text-[14px] font-medium">Admin Dashboard</div>
              <div className="text-[11px] text-cream-dim">Prime Labels International</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-[12px] text-cream-muted hover:text-champagne">
              View site →
            </a>
            <button onClick={logout} className="rounded-full border border-line px-4 py-2 text-[12px] text-cream-muted hover:border-red-500/40 hover:text-red-300">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 lg:flex-row">
        <nav className="flex gap-1 overflow-x-auto lg:w-52 lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-left text-[13px] transition-colors ${
                tab === t.id ? "bg-champagne/10 text-champagne" : "text-cream-muted hover:bg-cream/5 hover:text-cream"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {tab === "overview" && <Overview onJump={setTab} />}
          {tab === "leads" && <Leads />}
          {tab === "messages" && <Messages />}
          {tab === "products" && <ProductManager />}
          {tab === "content" && <SiteContent />}
          {tab === "faqs" && <Faqs />}
          {tab === "testimonials" && <Testimonials />}
          {tab === "gallery" && <GalleryManager />}
          {tab === "videos" && <VideoManager />}
          {tab === "quotegen" && <QuoteGenerator />}
          {tab === "settings" && <SiteSettings />}
        </div>
      </div>
    </div>
  );
}

function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(url);
      const j = await r.json();
      setData(j);
    } catch {}
    setLoading(false);
  }, [url]);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, reload, setData };
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface/30 p-5 ${className}`}>{children}</div>;
}

function MiniSpinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return <div className="fixed bottom-6 right-6 z-50 rounded-full bg-champagne px-5 py-2.5 text-[13px] text-ink shadow-glow">{msg}</div>;
}

/* ---------------- Overview ---------------- */
function Overview({ onJump }: { onJump: (t: Tab) => void }) {
  const { data } = useFetch<any>("/api/admin/stats");
  const s = data?.stats;
  return (
    <div className="space-y-6">
      <h1 className="display text-3xl">Overview</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { k: "leads", label: "Quote leads", v: s?.leads ?? "—", to: "leads" as Tab },
          { k: "messages", label: "Messages", v: s?.messages ?? "—", to: "messages" as Tab },
          { k: "orders", label: "Orders", v: s?.orders ?? "—", to: null },
        ].map((x) => {
          const card = (
            <Card className={x.to ? "transition-colors hover:border-champagne/40" : ""}>
              <div className="display text-4xl text-champagne">{x.v}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wide2 text-cream-dim">{x.label}</div>
            </Card>
          );
          // The counters used to be dead text — clicking "Messages" now opens
          // the tab that actually shows them.
          return x.to ? (
            <button key={x.k} type="button" onClick={() => onJump(x.to as Tab)} className="text-left">
              {card}
            </button>
          ) : (
            <div key={x.k}>{card}</div>
          );
        })}
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[14px] font-medium">Recent quote requests</h3>
          <button onClick={() => onJump("leads")} className="text-[12px] text-champagne hover:underline">
            View all →
          </button>
        </div>
        {(data?.recent || []).length === 0 ? (
          <p className="text-[13px] text-cream-dim">No leads yet. They will appear here when customers submit a quote.</p>
        ) : (
          <div className="space-y-2">
            {(data?.recent || []).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-cream/[0.03] px-4 py-3 text-[13px]">
                <span className="font-medium">{r.name}</span>
                <span className="text-cream-muted">{r.product || "—"}</span>
                <span className="text-cream-dim">{r.country || "—"}</span>
                <span className="text-cream-dim">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <h3 className="mb-2 text-[14px] font-medium">Quick tip</h3>
        <p className="text-[13px] leading-relaxed text-cream-muted">
          Edit your products, prices, FAQs, testimonials and contact details here.
          Changes save instantly to the database and appear on your live website.
        </p>
      </Card>
    </div>
  );
}

/* ---------------- Leads ---------------- */
function Leads() {
  const { data, reload } = useFetch<any>("/api/admin/leads");
  const [toast, setToast] = useState("");
  const [quoteLead, setQuoteLead] = useState<QuoteLead | null>(null);
  const leads = data?.leads || [];

  async function setStatus(id: number, status: string) {
    await fetch("/api/admin/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    reload();
  }
  async function del(id: number) {
    if (!confirm("Delete this lead?")) return;
    await fetch("/api/admin/leads", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setToast("Lead deleted");
    reload();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="display text-3xl">Quote Leads</h1>
        <span className="text-[12px] text-cream-dim">{leads.length} total</span>
      </div>
      {leads.length === 0 ? (
        <Card><p className="text-[13px] text-cream-dim">No leads yet.</p></Card>
      ) : (
        <div className="space-y-3">
          {leads.map((l: any) => (
            <Card key={l.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium">{l.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${l.status === "new" ? "bg-champagne/15 text-champagne" : "bg-cream/10 text-cream-muted"}`}>{l.status}</span>
                  </div>
                  <div className="mt-1 text-[12px] text-cream-muted">
                    {l.email && <span>{l.email}</span>}
                    {l.company && <span>{l.email ? " · " : ""}{l.company}</span>}
                  </div>
                </div>
                <span className="text-[11px] text-cream-dim">{new Date(l.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-3 grid gap-2 text-[12px] text-cream-muted sm:grid-cols-2 lg:grid-cols-4">
                {l.phone && (
                  <span className="rounded bg-champagne/[0.07] px-2 py-1 text-champagne">
                    WhatsApp: {l.phone}
                  </span>
                )}
                {l.country && <span className="rounded bg-cream/5 px-2 py-1">Country: {l.country}</span>}
                {l.product && <span className="rounded bg-cream/5 px-2 py-1">Product: {l.product}</span>}
                {l.quantity && <span className="rounded bg-cream/5 px-2 py-1">Qty: {l.quantity}</span>}
              </div>
              {l.details && <p className="mt-3 rounded-lg bg-cream/[0.03] p-3 text-[13px] text-cream">{l.details}</p>}
              {l.artwork_url && (
                <a
                  href={l.artwork_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-champagne/35 bg-champagne/[0.06] px-3 py-2 text-[12.5px] text-champagne transition-colors hover:bg-champagne/[0.12]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {l.artwork_name || "Download artwork"}
                </a>
              )}
              <div className="mt-4 flex gap-2">
                <button onClick={() => setStatus(l.id, "contacted")} className="rounded-md border border-line px-3 py-1.5 text-[12px] hover:border-champagne/40">Mark contacted</button>
                <button onClick={() => setStatus(l.id, "done")} className="rounded-md border border-line px-3 py-1.5 text-[12px] hover:border-champagne/40">Mark done</button>
                <button
                  onClick={() =>
                    setQuoteLead({
                      id: l.id,
                      name: l.name,
                      phone: l.phone,
                      product: l.product,
                      quantity: l.quantity,
                      email: l.email,
                      country: l.country,
                    })
                  }
                  className="rounded-md border border-champagne/45 bg-champagne/[0.08] px-3 py-1.5 text-[12px] text-champagne transition-colors hover:bg-champagne/[0.16]"
                >
                  Send Quote
                </button>
                {l.phone && <a href={`https://wa.me/${l.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi, regarding your enquiry with Prime Labels International")}`} target="_blank" rel="noopener noreferrer" className="rounded-md border border-line px-3 py-1.5 text-[12px] hover:border-champagne/40">WhatsApp</a>}
                <button onClick={() => del(l.id)} className="ml-auto rounded-md border border-red-500/30 px-3 py-1.5 text-[12px] text-red-300 hover:bg-red-500/10">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Toast msg={toast} />
      {quoteLead && (
        <SendQuoteModal lead={quoteLead} onClose={() => setQuoteLead(null)} />
      )}
    </div>
  );
}

/* ---------------- Contact messages ---------------- */
function Messages() {
  const { data, reload } = useFetch<any>("/api/admin/messages");
  const [toast, setToast] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const messages = data?.messages || [];

  async function del(id: number) {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    const r = await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const j = await r.json().catch(() => ({}));
    setToast(r.ok && j?.ok ? "Message deleted" : j?.error || "Could not delete the message");
    reload();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="display text-3xl">Contact Messages</h1>
        <span className="text-[12px] text-cream-dim">{messages.length} total</span>
      </div>

      {messages.length === 0 ? (
        <Card>
          <p className="text-[13px] text-cream-dim">
            No messages yet. Anything sent through the contact form on your website will
            appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m: any) => {
            const replyEmail = String(m.email || "").trim();
            return (
              <Card key={m.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium">{m.name}</span>
                      {m.status === "replied" && (
                        <span className="rounded-full bg-champagne/15 px-2 py-0.5 text-[10px] uppercase text-champagne">
                          Replied
                        </span>
                      )}
                    </div>
                    {replyEmail && (
                      <div className="mt-1 text-[12px] text-cream-muted">{replyEmail}</div>
                    )}
                  </div>
                  <span className="text-[11px] text-cream-dim">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>

                {m.subject && (
                  <div className="mt-3 text-[12px] text-cream-muted">
                    <span className="rounded bg-cream/5 px-2 py-1">Subject: {m.subject}</span>
                  </div>
                )}

                {m.message && (
                  <p className="mt-3 whitespace-pre-wrap rounded-lg bg-cream/[0.03] p-3 text-[13px] text-cream">
                    {m.message}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  {replyEmail && (
                    <button
                      type="button"
                      onClick={() =>
                        setReplyTo({
                          id: m.id,
                          name: m.name,
                          email: replyEmail,
                          subject: m.subject,
                          message: m.message,
                        })
                      }
                      className="rounded-md border border-champagne/45 bg-champagne/[0.08] px-3 py-1.5 text-[12px] text-champagne transition-colors hover:bg-champagne/[0.16]"
                    >
                      {m.status === "replied" ? "Reply again" : "Reply by email"}
                    </button>
                  )}
                  <button
                    onClick={() => del(m.id)}
                    className="ml-auto rounded-md border border-red-500/30 px-3 py-1.5 text-[12px] text-red-300 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Toast msg={toast} />
      {replyTo && (
        <ReplyModal target={replyTo} onClose={() => setReplyTo(null)} onSent={reload} />
      )}
    </div>
  );
}

/* ---------------- Site content ---------------- */
const SITE_FIELDS: [string, string][] = [
  ["notificationEmail", "Notification email address"],
  ["businessName", "Business name"],
  ["tagline", "Tagline"],
  ["heroHeadline", "Hero headline"],
  ["heroSub", "Hero subtext"],
  ["bio", "Meta description / bio"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["whatsapp", "WhatsApp link"],
  ["instagram", "Instagram URL"],
  ["website", "Website"],
  ["serviceArea", "Service area"],
  ["shipping", "Shipping note"],
];

function SiteContent() {
  const toast = useToast();
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(false);
  const [testing, setTesting] = useState(false);

  async function sendTest() {
    if (testing) return;
    setTesting(true);
    try {
      const r = await fetch("/api/admin/notify-test", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.ok) toast.success(`Test alert sent to ${j.to}. Check your inbox (and spam).`);
      else toast.error(j?.error || "Could not send the test email.");
    } catch {
      toast.error("Could not send the test email.");
    } finally {
      setTesting(false);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/site", { cache: "no-store" });
      const j = await r.json();
      if (j?.ok) {
        const c: Record<string, string> = j.content || {};
        setContent(c);
        // Seed the editable copy with EVERY existing value.
        const seeded: Record<string, string> = {};
        SITE_FIELDS.forEach(([k]) => (seeded[k] = c[k] ?? ""));
        setForm(seeded);
      } else {
        toast.error(j?.error || "Could not load site content.");
      }
    } catch {
      toast.error("Could not load site content.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Only fields the user actually changed.
  const dirtyKeys = useMemo(() => {
    if (!content) return [];
    return SITE_FIELDS.map(([k]) => k).filter((k) => (form[k] ?? "") !== (content[k] ?? ""));
  }, [form, content]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !content) return;

    if (dirtyKeys.length === 0) {
      toast.toast("Nothing to save — no fields were changed.", "info");
      return;
    }

    // Guard the alert recipient before hitting the server.
    if (dirtyKeys.includes("notificationEmail")) {
      const v = (form.notificationEmail ?? "").trim();
      if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        toast.error("That notification email doesn't look right. Please check the address.");
        return;
      }
    }

    setSaving(true);
    try {
      // Send ONLY changed keys. Untouched fields are never transmitted, so the
      // server cannot overwrite them.
      const body: Record<string, string> = {};
      dirtyKeys.forEach((k) => (body[k] = form[k]));

      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Could not save changes.");

      toast.success(
        `${dirtyKeys.length} field${dirtyKeys.length === 1 ? "" : "s"} updated and live on the website.`
      );
      setApplied(true);
      window.setTimeout(() => setApplied(false), 2600);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="display text-3xl">Site Content</h1>
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/30 p-8 text-[13px] text-cream-muted">
          <MiniSpinner /> Loading current content…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Site Content</h1>
          <p className="mt-1 text-[13px] text-cream-muted">
            Hero text, contact details and social links shown across the site.
          </p>
        </div>
        <AppliedBadge show={applied} />
      </div>

      {dirtyKeys.length > 0 && (
        <p className="rounded-xl border border-champagne/30 bg-champagne/[0.06] px-4 py-2.5 text-[12.5px] text-champagne">
          {dirtyKeys.length} unsaved change{dirtyKeys.length === 1 ? "" : "s"}:{" "}
          {dirtyKeys
            .map((k) => SITE_FIELDS.find(([f]) => f === k)?.[1] ?? k)
            .join(", ")}
        </p>
      )}

      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        {SITE_FIELDS.map(([k, label2]) => {
          const isDirty = dirtyKeys.includes(k);
          const wide = k === "heroSub" || k === "bio";
          return (
            <label key={k} className={`block ${wide ? "sm:col-span-2" : ""}`}>
              <span className={label}>
                {label2}
                {isDirty && <span className="ml-2 text-champagne">• edited</span>}
              </span>
              {wide ? (
                <textarea
                  name={k}
                  rows={2}
                  disabled={saving}
                  className={`${input} resize-none ${isDirty ? "border-champagne/50" : ""}`}
                  value={form[k] ?? ""}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              ) : (
                <input
                  name={k}
                  type={k === "notificationEmail" ? "email" : "text"}
                  disabled={saving}
                  placeholder={k === "notificationEmail" ? "you@example.com" : undefined}
                  className={`${input} ${isDirty ? "border-champagne/50" : ""}`}
                  value={form[k] ?? ""}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              )}
              {k === "notificationEmail" && (
                <span className="mt-1.5 block text-[11.5px] leading-snug text-cream-dim">
                  Quote-request alerts are sent here. Change it any time — it takes
                  effect immediately, no deploy needed.
                </span>
              )}
            </label>
          );
        })}
        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving || dirtyKeys.length === 0}
            className="btn-primary mt-2 !py-2.5 !px-5 text-[12px] disabled:opacity-50"
          >
            {saving ? (
              <>
                <MiniSpinner /> Saving…
              </>
            ) : (
              "Save all changes"
            )}
          </button>
          {dirtyKeys.length > 0 && !saving && (
            <button
              type="button"
              onClick={() => content && setForm(Object.fromEntries(SITE_FIELDS.map(([k]) => [k, content[k] ?? ""])))}
              className="mt-2 text-[12px] text-cream-dim underline underline-offset-4 hover:text-cream"
            >
              Discard changes
            </button>
          )}
          <button
            type="button"
            onClick={sendTest}
            disabled={testing || saving}
            className="mt-2 ml-auto flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[12px] text-cream-muted transition-colors hover:border-champagne/50 hover:text-champagne disabled:opacity-50"
          >
            {testing && <MiniSpinner />}
            {testing ? "Sending…" : "Send test alert"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- FAQs ---------------- */
function Faqs() {
  const { data, reload } = useFetch<any>("/api/admin/faqs");
  const [toast, setToast] = useState("");
  const faqs = data?.faqs || [];

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/faqs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: fd.get("q"), answer: fd.get("a") }) });
    (e.target as HTMLFormElement).reset();
    setToast("Added");
    setTimeout(() => setToast(""), 1500);
    reload();
  }
  async function save(id: number, q: string, a: string) {
    await fetch("/api/admin/faqs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, question: q, answer: a }) });
    setToast("Saved");
    setTimeout(() => setToast(""), 1500);
  }
  async function del(id: number) {
    if (!confirm("Delete this FAQ?")) return;
    await fetch("/api/admin/faqs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    reload();
  }

  return (
    <div className="space-y-4">
      <h1 className="display text-3xl">FAQs</h1>
      <Card>
        <h3 className="mb-3 text-[13px] font-medium">Add new</h3>
        <form onSubmit={add} className="space-y-3">
          <input name="q" placeholder="Question" className={input} required />
          <textarea name="a" rows={2} placeholder="Answer" className={input + " resize-none"} required />
          <button className="btn-primary !py-2.5 !px-5 text-[12px]">Add FAQ</button>
        </form>
      </Card>
      {faqs.map((f: any) => (
        <FaqRow key={f.id} f={f} onSave={save} onDelete={del} />
      ))}
      <Toast msg={toast} />
    </div>
  );
}
function FaqRow({ f, onSave, onDelete }: any) {
  const [q, setQ] = useState(f.question);
  const [a, setA] = useState(f.answer);
  return (
    <Card>
      <input className={input + " mb-2"} value={q} onChange={(e) => setQ(e.target.value)} />
      <textarea rows={2} className={input + " resize-none"} value={a} onChange={(e) => setA(e.target.value)} />
      <div className="mt-3 flex gap-2">
        <button onClick={() => onSave(f.id, q, a)} className="rounded-md border border-line px-3 py-1.5 text-[12px] hover:border-champagne/40">Save</button>
        <button onClick={() => onDelete(f.id)} className="ml-auto rounded-md border border-red-500/30 px-3 py-1.5 text-[12px] text-red-300 hover:bg-red-500/10">Delete</button>
      </div>
    </Card>
  );
}

/* ---------------- Testimonials ---------------- */
function Testimonials() {
  const { data, reload } = useFetch<any>("/api/admin/testimonials");
  const [toast, setToast] = useState("");
  const list = data?.testimonials || [];

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/testimonials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(fd)) });
    (e.target as HTMLFormElement).reset();
    setToast("Added");
    setTimeout(() => setToast(""), 1500);
    reload();
  }
  async function save(t: any) {
    await fetch("/api/admin/testimonials", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
    setToast("Saved");
    setTimeout(() => setToast(""), 1500);
  }
  async function del(id: number) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch("/api/admin/testimonials", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    reload();
  }

  return (
    <div className="space-y-4">
      <h1 className="display text-3xl">Testimonials</h1>
      <Card>
        <h3 className="mb-3 text-[13px] font-medium">Add new</h3>
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Name" className={input} required />
          <input name="role" placeholder="Role" className={input} />
          <input name="company" placeholder="Company" className={input} />
          <input name="country" placeholder="Country" className={input} />
          <input name="rating" type="number" min={1} max={5} defaultValue={5} className={input} />
          <input name="content" placeholder="Quote" className={input + " sm:col-span-2"} required />
          <button className="btn-primary !py-2.5 !px-5 text-[12px] sm:col-span-2">Add testimonial</button>
        </form>
      </Card>
      {list.map((t: any) => (
        <TestiRow key={t.id} t={t} onSave={save} onDelete={del} />
      ))}
      <Toast msg={toast} />
    </div>
  );
}
function TestiRow({ t, onSave, onDelete }: any) {
  const [v, setV] = useState(t);
  const set = (k: string, val: any) => setV({ ...v, [k]: val });
  return (
    <Card>
      <div className="grid gap-2 sm:grid-cols-2">
        <input className={input} value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" />
        <input className={input} value={v.role} onChange={(e) => set("role", e.target.value)} placeholder="Role" />
        <input className={input} value={v.company} onChange={(e) => set("company", e.target.value)} placeholder="Company" />
        <input className={input} value={v.country} onChange={(e) => set("country", e.target.value)} placeholder="Country" />
        <input className={input} value={v.content} onChange={(e) => set("content", e.target.value)} placeholder="Quote" />
        <label className="flex items-center gap-2 text-[12px] text-cream-muted">
          <input type="checkbox" checked={v.approved} onChange={(e) => set("approved", e.target.checked)} /> Show on site
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => onSave(v)} className="rounded-md border border-line px-3 py-1.5 text-[12px] hover:border-champagne/40">Save</button>
        <button onClick={() => onDelete(t.id)} className="ml-auto rounded-md border border-red-500/30 px-3 py-1.5 text-[12px] text-red-300 hover:bg-red-500/10">Delete</button>
      </div>
    </Card>
  );
}
