"use client";

const ITEMS = [
  "Voice Concierge",
  "Sees The Page",
  "Camera Vision",
  "Scrolls + Highlights",
  "Real-Time RAG",
  "Mid-Call Language Switch",
  "Barge-In Natural",
  "Push-To-Talk Mode",
  "30+ Languages",
  "Open Source",
  "Self-Hostable",
  "Swiss Sovereign",
  "GDPR Article 9",
  "Per-Tenant Vector Store",
  "Custom Action Hooks",
  "One Script Tag",
];

export default function Marquee() {
  const stream = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-line bg-ink-2/40 backdrop-blur">
      <div className="flex gap-12 py-4 animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
        {stream.map((item, i) => (
          <span key={i} className="font-mono text-xs tracking-widest uppercase text-cream/60 flex items-center gap-12">
            <span>· {item}</span>
          </span>
        ))}
      </div>
      <span className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <span className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}
