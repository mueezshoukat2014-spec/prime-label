"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };

type ToastApi = {
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastCtx = createContext<ToastApi | null>(null);

/**
 * Lightweight toast system — no external dependency, matches the site theme.
 * Wrap any subtree in <ToastProvider> and call useToast() inside it.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = Date.now() + Math.random();
      setItems((list) => [...list, { id, kind, message }]);
      // errors linger a little longer so they can actually be read
      setTimeout(() => remove(id), kind === "error" ? 6500 : 4500);
    },
    [remove]
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (m: string) => toast(m, "success"),
      error: (m: string) => toast(m, "error"),
    }),
    [toast]
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[3000] flex flex-col items-center gap-2 px-4 sm:bottom-8">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={() => remove(t.id)}
              role="status"
              aria-live="polite"
              className={`pointer-events-auto flex max-w-md cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-[13px] leading-snug shadow-soft backdrop-blur-md ${
                t.kind === "error"
                  ? "border-red-500/35 bg-red-500/12 text-red-200"
                  : t.kind === "success"
                    ? "border-champagne/40 bg-surface-2/90 text-cream"
                    : "border-line bg-surface-2/90 text-cream-muted"
              }`}
            >
              <span className="mt-px shrink-0">
                {t.kind === "success" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="#C9A86A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : t.kind === "error" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="16.4" r="1.1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 11v5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="7.6" r="1.1" fill="currentColor" />
                  </svg>
                )}
              </span>
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/** Access the toast API. Falls back to a no-op-ish console logger if unwrapped. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (ctx) return ctx;
  const noop: ToastApi = {
    toast: (m) => console.warn("[toast]", m),
    success: (m) => console.warn("[toast:success]", m),
    error: (m) => console.warn("[toast:error]", m),
  };
  return noop;
}
