"use client";
import { useState } from "react";
import Logo from "@/components/Logo";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: fd.get("username"),
        password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.reload();
    } else {
      setErr("Incorrect username or password.");
    }
  }

  return (
    <div className="notranslate flex min-h-screen items-center justify-center bg-ink px-6" translate="no" dir="ltr">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/10 blur-[130px]" />
      <form onSubmit={onSubmit} className="glass relative w-full max-w-sm rounded-4xl p-8">
        <div className="mb-7 text-center">
          <Logo size={52} className="mx-auto" />
          <h1 className="display mt-5 text-2xl text-cream">Admin Sign In</h1>
          <p className="mt-2 text-[13px] text-cream-muted">
            Prime Labels dashboard
          </p>
        </div>
        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-wide2 text-cream-dim">
            Username
          </span>
          <input
            name="username"
            defaultValue="admin"
            className="w-full rounded-xl border border-line bg-surface/40 px-4 py-3 text-[14px] text-cream outline-none focus:border-champagne/50"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-[11px] uppercase tracking-wide2 text-cream-dim">
            Password
          </span>
          <input
            name="password"
            type="password"
            className="w-full rounded-xl border border-line bg-surface/40 px-4 py-3 text-[14px] text-cream outline-none focus:border-champagne/50"
          />
        </label>
        {err && <p className="mt-4 text-[13px] text-red-300">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-6 w-full justify-center disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <a href="/" className="mt-5 block text-center text-[12px] text-cream-dim hover:text-champagne">
          ← Back to website
        </a>
      </form>
    </div>
  );
}
