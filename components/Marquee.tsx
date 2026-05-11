"use client";

/* Marquee chips — leads with the new tagline + concierge framing. */
const ITEMS = [
  "Interfaces That Act",
  "AI Sales Concierge",
  "Perceives The Surface",
  "Navigates In Real Time",
  "Dispatches Actions",
  "Narrates Every Step",
  "30+ Languages · Mid-Call Switch",
  "Camera Vision",
  "Barge-In + Push-To-Talk",
  "Type-To-Chat",
  "Per-Tenant RAG",
  "A Swiss Company",
  "GDPR Article 9",
];

export default function Marquee() {
  const stream = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-line bg-ink-2/40 backdrop-blur">
      <div
        className="flex gap-12 py-4 animate-marquee whitespace-nowrap"
        style={{ width: "max-content" }}
      >
        {stream.map((item, i) => (
          <span
            key={i}
            className="font-mono text-xs tracking-widest uppercase text-cream/60 flex items-center gap-12"
          >
            <span>· {item}</span>
          </span>
        ))}
      </div>
      <span className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <span className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}
