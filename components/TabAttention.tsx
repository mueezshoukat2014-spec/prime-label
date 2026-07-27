"use client";
import { useEffect } from "react";

/**
 * Changes the browser tab title when the visitor switches away,
 * to gently bring them back. Restores the real title when they return.
 */
export default function TabAttention() {
  useEffect(() => {
    const original = document.title;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const onVisibility = () => {
      if (document.hidden) {
        timer = setTimeout(() => {
          document.title = "Hey! Come Back 👋  ·  Prime Labels";
        }, 800);
      } else {
        if (timer) clearTimeout(timer);
        document.title = original;
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onVisibility);
    window.addEventListener("focus", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onVisibility);
      window.removeEventListener("focus", onVisibility);
      if (timer) clearTimeout(timer);
      document.title = original;
    };
  }, []);

  return null;
}
