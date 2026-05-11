"use client";

/* Bento mosaic — varied tile sizes break Foyer's uniform 3-column rhythm.
 * Hero tile (vision) spans 2x2, others are 1x1 or 2x1. */

type Tile = {
  t: string;
  p: string;
  tag: string;
  span?: "lg" | "wide" | "tall";
  bg?: "ink" | "cream" | "glow";
  art?: "vision" | "wave" | "globe" | "shield" | "code";
};

const TILES: Tile[] = [
  // Hero tile — vision (the differentiator) — 2x2
  {
    t: "Sees what they see.",
    p: "Optional camera mode runs a local moondream vision model. Visitor points at a product, a shelf, an error screen — ZHOLY describes it in your catalogue's language. No frame leaves the host you choose.",
    tag: "CAMERA VISION",
    span: "lg",
    bg: "glow",
    art: "vision",
  },
  {
    t: "Acts on the page",
    p: "Smooth-scrolls to anchors, pulse-highlights elements, opens accordions. Every action fires a zro:action event your code can hook.",
    tag: "DOM ACTION",
    art: "wave",
  },
  {
    t: "30+ languages, mid-call",
    p: "Visitor slips from English into French — agent follows without a reset. Auto-detect per utterance.",
    tag: "MULTILINGUAL",
    art: "globe",
  },
  // Cream invert — breaks dark monotony — 2x1
  {
    t: "A Swiss company.",
    p: "ZHOLY is Polare Group Sàrl (CHE-221.062.769), incorporated and operated in Geneva. Voice biometrics are GDPR Article 9 special-category data under Swiss nFADP. EU residency on request, on-prem via Docker. Not a US startup with a Swiss data centre.",
    tag: "SWISS COMPANY",
    span: "wide",
    bg: "cream",
    art: "shield",
  },
  {
    t: "Interrupt-friendly",
    p: "Barge-in cuts TTS the moment you start speaking. Push-to-talk for noisy environments.",
    tag: "BARGE-IN",
  },
  {
    t: "Sounds like you",
    p: "50+ studio voices. Clone your brand voice from a short reference clip. Switch live from the dashboard.",
    tag: "VOICE",
  },
  {
    t: "Books, captures, converts",
    p: "Cal.com / Calendly / Google Calendar in-call. Lead webhooks to HubSpot, Salesforce, Pipedrive, Attio, Notion, Airtable, Google Sheets.",
    tag: "BOOKING",
    span: "wide",
  },
  {
    t: "Grounded — no hallucination",
    p: "Per-tenant vector store, top-3 retrieval, the retrieved snippet logged for every answer.",
    tag: "RAG",
  },
  {
    t: "Open source",
    p: "Node.js gateway + ES-module embed + Postgres. Audit it. Swap any layer.",
    tag: "OPEN",
    art: "code",
  },
  {
    t: "Developer hooks",
    p: "window.ZRO_VOICE_EMBED_API · zro:action CustomEvents · window.ZRO_COMPANY_PROFILE JSON. No proprietary SDK.",
    tag: "HOOKS",
  },
  {
    t: "Hears how they feel",
    p: "Emotion routes the agent's tone — slows down, leads with empathy when the visitor sounds frustrated.",
    tag: "EMOTION",
  },
  {
    t: "One login across ZHOLY",
    p: "Single sign-on, single billing, single support across the ZHOLY ecosystem.",
    tag: "SSO",
  },
];

export default function EdgeBento() {
  return (
    <section id="edge" className="section relative">
      <div className="wrap">
        <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
          <p className="label">[ The edge ]</p>
          <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-3xl">
            Things a generic voice<br />chatbot can&apos;t do.
          </h2>
        </div>

        {/* Bento grid — 6 columns on desktop, tiles span 1-4 cols / 1-2 rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-[200px]">
          {TILES.map((tile, i) => (
            <BentoTile key={i} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoTile({ tile }: { tile: Tile }) {
  // Tailwind grid spans
  let span = "lg:col-span-2 lg:row-span-1";
  if (tile.span === "lg") span = "lg:col-span-3 lg:row-span-2";
  else if (tile.span === "wide") span = "lg:col-span-3 lg:row-span-1";
  else if (tile.span === "tall") span = "lg:col-span-2 lg:row-span-2";

  const isCream = tile.bg === "cream";
  const isGlow = tile.bg === "glow";

  const surface = isCream
    ? "bg-[#EBEAE6] text-[#1C1D22] border border-[#1C1D22]/10"
    : isGlow
      ? "border border-cyan/30"
      : "bg-ink-2/60 border border-line";

  return (
    <article
      className={`${span} ${surface} rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden`}
      style={
        isGlow
          ? {
              background:
                "radial-gradient(ellipse 80% 70% at 30% 20%, rgba(76,233,233,0.12), rgba(28,29,34,0.95) 70%)",
            }
          : undefined
      }
    >
      {/* Optional inline art */}
      {tile.art && (
        <div className="absolute right-4 top-4 opacity-30 pointer-events-none">
          <TileArt kind={tile.art} cream={isCream} />
        </div>
      )}

      <span
        className={`font-mono text-[11px] tracking-widest ${
          isCream ? "text-[#1C1D22]/60" : "text-cyan"
        }`}
      >
        {tile.tag}
      </span>

      <div className="mt-4">
        <h3
          className={`serif leading-tight tracking-tight ${
            tile.span === "lg"
              ? "text-[36px] sm:text-[44px]"
              : tile.span === "wide"
                ? "text-[28px] sm:text-[32px]"
                : "text-[22px]"
          } ${isCream ? "text-[#1C1D22]" : "text-cream"}`}
        >
          {tile.t}
        </h3>
        <p
          className={`mt-3 text-sm leading-relaxed ${
            isCream ? "text-[#1C1D22]/70" : "text-cream/70"
          }`}
        >
          {tile.p}
        </p>
      </div>
    </article>
  );
}

function TileArt({
  kind,
  cream,
}: {
  kind: "vision" | "wave" | "globe" | "shield" | "code";
  cream: boolean;
}) {
  const stroke = cream ? "#1C1D22" : "#4CE9E9";
  const common = { width: 56, height: 56, fill: "none", stroke, strokeWidth: 1.4 } as const;
  if (kind === "vision")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      </svg>
    );
  if (kind === "wave")
    return (
      <svg viewBox="0 0 64 24" {...common} width={80}>
        <path
          d="M2 12 L8 12 L10 4 L14 20 L18 8 L22 16 L26 12 L34 12 L36 6 L40 18 L44 10 L48 14 L62 12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (kind === "globe")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="12" cy="12" r="10" />
        <ellipse cx="12" cy="12" rx="4" ry="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    );
  if (kind === "shield")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M12 2l9 4v6c0 5-3.5 9.5-9 10-5.5-.5-9-5-9-10V6l9-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" {...common}>
      <path d="M8 4 L2 12 L8 20 M16 4 L22 12 L16 20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
