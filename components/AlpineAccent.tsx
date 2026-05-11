"use client";
import { useEffect, useRef, useState } from "react";

/* Swiss alpine silhouette — scroll-reactive morph (visual move #3).
 *
 * As the section enters the viewport: peaks rise sharper, line opacity climbs.
 * As it leaves: peaks flatten back, line fades. Tied to IntersectionObserver
 * + a per-element scroll progress 0..1. Cheap and pretty. */
export default function AlpineAccent() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0); // 0..1 visible

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    function recompute() {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Distance from element's centre to viewport centre, normalised
      const elCenter = r.top + r.height / 2;
      const vpCenter = vh / 2;
      const dist = Math.abs(elCenter - vpCenter);
      // Within ~half viewport, scale 1 → 0
      const p = Math.max(0, 1 - dist / (vh * 0.6));
      setProgress(p);
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        recompute();
      });
    }

    recompute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Morph the peaks — higher progress = sharper peaks (smaller min Y values)
  // baseline Y's (when progress=0, flat-ish around 28-32)
  // sharp Y's (when progress=1, range 6-32 — dramatic peaks)
  const flatRow = [40, 30, 32, 30, 32, 30, 32, 30, 32, 30, 32, 30, 32, 30, 32, 30, 32, 28];
  const sharpRow = [40, 22, 32, 8, 24, 14, 30, 18, 6, 26, 16, 28, 12, 24, 20, 32, 18, 28];
  const xs = [0, 120, 180, 260, 320, 420, 500, 580, 660, 740, 820, 900, 980, 1080, 1180, 1260, 1340, 1440];

  const points = xs
    .map((x, i) => {
      const y = flatRow[i] + (sharpRow[i] - flatRow[i]) * progress;
      return `${x} ${y.toFixed(1)}`;
    })
    .join(" L ");

  const fillPath = `M ${points} L 1440 48 L 0 48 Z`;
  const strokePath = `M ${points}`;

  const opacity = 0.25 + 0.65 * progress;

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative w-full h-12 overflow-hidden pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(76,233,233,0.02) 100%)",
      }}
    >
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        fill="none"
        style={{ opacity }}
      >
        <defs>
          <linearGradient id="alpine-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#4CE9E9" stopOpacity="0" />
            <stop offset="20%" stopColor="#4CE9E9" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#4CE9E9" stopOpacity="0.55" />
            <stop offset="80%" stopColor="#4CE9E9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4CE9E9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#alpine-fade)" fillOpacity={0.06 + 0.1 * progress} />
        <path
          d={strokePath}
          stroke="url(#alpine-fade)"
          strokeWidth={1 + 0.6 * progress}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
