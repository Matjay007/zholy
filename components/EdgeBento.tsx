"use client";
import RoadmapChip from "./RoadmapChip";

/* Bento mosaic — Sales Concierge as the hero 3x2 tile.
 * Roadmap features carry chips inline. */

type Tile = {
  t: string;
  p: string;
  tag: string;
  span?: "lg" | "wide" | "tall";
  bg?: "ink" | "cream" | "glow";
  art?: "concierge" | "vision" | "wave" | "globe" | "shield" | "code";
  roadmap?: boolean;
};

const TILES: Tile[] = [
  {
    t: "AI Sales Concierge.",
    p: "The flagship workflow. Visitor lands, agent qualifies intent, answers product questions, highlights pricing live, books the demo, fires the CRM event, remembers the visitor on return. One conversation, the whole motion.",
    tag: "FLAGSHIP",
    span: "lg",
    bg: "glow",
    art: "concierge",
  },
  {
    t: "Sees + acts on the surface",
    p: "DOM semantic snapshot every turn. Smooth-scroll, pulse-highlight, anchor jump, accordion open — agent emits zro:action events, your code executes.",
    tag: "PERCEPTION + ACTION",
    art: "wave",
  },
  {
    t: "Camera vision",
    p: "Local moondream model identifies what the visitor points at — products, error screens, parts. Frames stay on your chosen host.",
    tag: "VISION",
    art: "vision",
  },
  {
    t: "A Swiss company.",
    p: "Polare Group Sàrl (CHE-221.062.769), incorporated and operated in Geneva. Voice biometrics are GDPR Article 9 special-category data under Swiss nFADP. EU residency on request, on-prem via Docker. Not a US startup with a Swiss data centre.",
    tag: "SWISS COMPANY",
    span: "wide",
    bg: "cream",
    art: "shield",
  },
  {
    t: "Interrupt-friendly",
    p: "Barge-in cuts TTS the moment you start speaking. Push-to-talk for noisy environments. Type-to-chat for keyboard users.",
    tag: "BARGE-IN",
  },
  {
    t: "Switches language mid-call",
    p: "30+ languages with auto-detect per utterance. Visitor slips from English into French — agent follows without a reset.",
    tag: "MULTILINGUAL",
  },
  {
    t: "Booking, lead, CRM",
    p: "Cal.com / Calendly / Google Calendar handlers ship from the dispatch layer. Generic webhook OUT to your CRM the moment intent is captured.",
    tag: "BOOKING",
    span: "wide",
    roadmap: true,
  },
  {
    t: "Grounded — no hallucination",
    p: "Per-tenant vector store, top-3 retrieval, the snippet logged for every answer. Banking, medical, legal refused by default.",
    tag: "RAG",
  },
  {
    t: "Developer hooks",
    p: "window.ZRO_VOICE_EMBED_API · zro:action CustomEvents · window.ZRO_COMPANY_PROFILE JSON. No proprietary SDK. Swap any layer (STT, LLM, TTS, vision) for your own endpoints.",
    tag: "DEV HOOKS",
    art: "code",
  },
  {
    t: "Hears how they feel",
    p: "Emotion routes the agent's tone — slower and lower when frustrated, brighter when excited. SenseVoice provides the signal, ElevenLabs handles the prosody.",
    tag: "EMOTION",
    roadmap: true,
  },
  {
    t: "Developer hooks",
    p: "window.ZRO_VOICE_EMBED_API · zro:action CustomEvents · window.ZRO_COMPANY_PROFILE. No proprietary SDK to learn.",
    tag: "HOOKS",
  },
  {
    t: "Voice cloning",
    p: "Clone your brand voice from a short reference clip via ElevenLabs. Gated to the SOVEREIGN tier.",
    tag: "VOICE",
    roadmap: true,
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
                "radial-gradient(ellipse 80% 70% at 30% 20%, rgba(76,233,233,0.14), rgba(28,29,34,0.95) 70%)",
            }
          : undefined
      }
    >
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
          {tile.roadmap && <RoadmapChip />}
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
  kind: "concierge" | "vision" | "wave" | "globe" | "shield" | "code";
  cream: boolean;
}) {
  const stroke = cream ? "#1C1D22" : "#4CE9E9";
  const common = { width: 56, height: 56, fill: "none", stroke, strokeWidth: 1.4 } as const;
  if (kind === "concierge")
    return (
      <svg viewBox="0 0 64 56" {...common} width={84} height={72}>
        {/* Concentric arcs evoking a sales funnel + conversation */}
        <path d="M4 28 Q32 4 60 28" />
        <path d="M12 32 Q32 14 52 32" />
        <path d="M20 36 Q32 24 44 36" />
        <circle cx="32" cy="42" r="3" fill={stroke} />
      </svg>
    );
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
