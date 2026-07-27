"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";

const input =
  "w-full rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] text-cream outline-none transition-colors focus:border-champagne/50";
const label = "mb-1.5 block text-[10px] uppercase tracking-wide2 text-cream-dim";

export type ReplyTarget = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string | null;
};

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Reply to a contact message without leaving the dashboard.
 *
 * Replaces the old `mailto:` link, which handed the conversation off to
 * whatever mail client the browser happened to open.
 */
export default function ReplyModal({
  target,
  onClose,
  onSent,
}: {
  target: ReplyTarget;
  onClose: () => void;
  onSent: () => void;
}) {
  const toast = useToast();

  const [subject, setSubject] = useState(
    target.subject ? `Re: ${target.subject}` : "Re: your message to Prime Labels International"
  );
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Focus the part that actually needs typing.
  useEffect(() => {
    bodyRef.current?.focus();
  }, []);

  // Escape closes — but never mid-send, or the user loses their draft with no
  // way to know whether it went out.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, sending]);

  const canSend = body.trim().length > 0 && subject.trim().length > 0 && !sending;

  async function send() {
    if (!canSend) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/reply-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: target.id,
          to: target.email,
          subject: subject.trim(),
          replyMessage: body.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) {
        toast.error(json?.error || "Could not send the reply. Please try again.");
        setSending(false);
        return;
      }

      toast.success(`Reply sent to ${target.email}`);
      if (json.statusSaved === false) {
        // The customer got the email; only the bookkeeping failed. Say so
        // rather than letting the card silently look unanswered.
        toast.toast("Sent, but the message could not be marked as replied.", "info");
      }
      onSent();
      onClose();
    } catch {
      toast.error("Could not send the reply. Please check your connection.");
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[2500] flex items-start justify-center overflow-y-auto bg-ink/80 p-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Reply to ${target.name}`}
      onClick={() => {
        if (!sending) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-champagne/30 bg-surface-2 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="display text-2xl text-cream">Reply by email</h2>
            <p className="mt-1 text-[12.5px] text-cream-muted">
              To <span className="text-cream">{target.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-cream-muted transition-colors hover:border-champagne/40 hover:text-champagne disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className={label}>To</span>
            <input className={`${input} text-cream-muted`} value={target.email} readOnly />
          </label>

          <label className="block">
            <span className={label}>Subject</span>
            <input
              className={input}
              value={subject}
              disabled={sending}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>

          <label className="block">
            <span className={label}>Your reply</span>
            <textarea
              ref={bodyRef}
              className={`${input} resize-y`}
              rows={9}
              value={body}
              disabled={sending}
              placeholder={`Write your reply to ${target.name}…`}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>

          {target.message && (
            <details className="rounded-xl border border-line bg-surface/30 p-4">
              <summary className="cursor-pointer text-[11px] uppercase tracking-wide2 text-cream-dim">
                Their original message
              </summary>
              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-cream-muted">
                {target.message}
              </p>
            </details>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className="btn-primary !py-2.5 !px-5 text-[12px] disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Spinner /> Sending…
                </>
              ) : (
                "Send Email"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="rounded-md border border-line px-4 py-2 text-[12px] text-cream-muted transition-colors hover:border-champagne/40 hover:text-cream disabled:opacity-40"
            >
              Cancel
            </button>
            <span className="ml-auto text-[11px] text-cream-dim">
              Sent from reply@primelabelsintl.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
