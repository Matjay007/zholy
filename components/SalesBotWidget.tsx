"use client";
/**
 * SalesBotWidget — client component that loads the ZHOLY embed for the landing page
 * and handles the zro:action custom events (navigate, scrollTo) dispatched by the widget.
 */

import { useEffect } from "react";
import Script from "next/script";

export default function SalesBotWidget() {
  useEffect(() => {
    function handleAction(e: Event) {
      const action = (e as CustomEvent).detail;
      if (!action) return;

      if (action.type === "navigate" && typeof action.url === "string") {
        const url = action.url.trim();
        // Internal links — navigate in same tab; external — new tab
        if (url.startsWith("/") || url.startsWith("https://zholy.com")) {
          window.location.href = url.startsWith("/") ? url : url.replace("https://zholy.com", "");
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }

      if (action.type === "scrollTo" && typeof action.id === "string") {
        const el = document.getElementById(action.id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    window.addEventListener("zro:action", handleAction);
    return () => window.removeEventListener("zro:action", handleAction);
  }, []);

  return (
    <Script
      id="zholy-salesbot"
      src="https://zholy.com/embed/zholy-embed.js?key=salesbot-landing-2026"
      strategy="afterInteractive"
    />
  );
}
