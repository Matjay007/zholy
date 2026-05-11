"use client";
import { useState, type ReactNode } from "react";
import RoadmapChip from "./RoadmapChip";

type Item = { q: string; a: ReactNode; chip?: string };

const QUESTIONS: Array<Item> = [
  {
    q: "Does ZHOLY support multiple languages?",
    a: "30+ via SenseVoice STT for input and OpenAI TTS for output, with auto-detect per utterance. A visitor can switch from English to French mid-call and the agent follows without a reset.",
  },
  {
    q: "How does the agent learn about my product?",
    a: "Two ways. (1) URL ingest — point us at your sitemap or paste up to 25 URLs; we crawl, chunk, and embed everything into a per-tenant vector store using Xenova/nomic-embed-text-v1. (2) Company-profile JSON — paste a structured profile (services, out-of-scope topics, claims you must not make) directly in the dashboard and it's injected into every conversation.",
  },
  {
    q: "Will the agent hallucinate?",
    a: "It's RAG-grounded. Each turn runs a top-3 retrieval against your vector store; the prompt only includes those chunks plus your company profile. The dashboard shows you which snippet was retrieved for each answer. Banking, medical, and legal advice are refused by default — configurable per agent.",
  },
  {
    q: "Can it see the page?",
    a: "Two layers. (1) DOM semantics — every turn the embed sends a structured snapshot of what's currently visible (headings, prices, buttons, sections). The agent answers about what's on screen right now, not the page as it loaded. (2) Optional camera mode — the visitor's camera feed runs through a local moondream vision model so the agent can identify physical products, error screens, or anything they point at.",
  },
  {
    q: "Can it scroll, highlight, and act on the page?",
    a: "Yes. The agent emits zro:action CustomEvents for navigate, scroll, highlight, fill-form, click, submit. Your whitelisted handlers run the actual execution. You keep the keys to your app; the agent owns the conversational layer.",
  },
  {
    q: "Can I interrupt it? Or chat by typing?",
    a: "Both. Barge-in detection cuts TTS playback the moment the visitor starts speaking — like a phone call, not a walkie-talkie. Push-to-talk available for noisy environments. And the transcript panel has a text input — type a message and the agent answers in the same conversation.",
  },
  {
    q: "Which voices are available?",
    a: (
      <>
        Six studio voices via OpenAI TTS today (alloy, echo, fable, onyx, nova, shimmer), selected per agent. Voice cloning from a short reference clip via ElevenLabs <RoadmapChip /> ships on the SOVEREIGN tier. Self-hosted gateway can be pointed at Kokoro or any espeak-ng compatible engine for local-only TTS.
      </>
    ),
  },
  {
    q: "Can it book appointments?",
    a: (
      <>
        The agent dispatches booking-intent events (provider, slot, attendee) over the zro:action channel. A reference Cal.com handler <RoadmapChip /> ships in Phase 2 — drop it into the embed quickstart and bookings land on your calendar. Calendly and Google Calendar follow the same pattern, also Phase 2. Custom booking endpoints are wireable today via your own zro:action handler.
      </>
    ),
  },
  {
    q: "Where do leads go?",
    a: (
      <>
        Real-time to your dashboard (Postgres-backed), with full transcript. CSV export from the UI today. Generic webhook OUT and per-service CRM templates (HubSpot, Salesforce, Pipedrive, Attio, Notion, Airtable, Google Sheets) <RoadmapChip /> ship in Phase 2 in priority order. Email + Slack notifications <RoadmapChip /> ship in Phase 2 once SMTP/Slack credentials are wired.
      </>
    ),
  },
  {
    q: "Does ZHOLY recognize returning visitors?",
    a: (
      <>
        Per-browser conversation history is on by default. Cross-device memory <RoadmapChip /> (visitor self-identifies via email; history follows across devices) ships in Phase 3. Retention windows configurable per tenant.
      </>
    ),
  },
  {
    q: "What analytics do I get?",
    a: "Full transcripts, lead capture details, country / device / browser / OS breakdown, time-on-page during call, scroll-to-action conversion, per-question intent classification, and the exact RAG chunk retrieved for every answer. Free tier shows the last 7 days.",
  },
  {
    q: "Does it work on my CMS?",
    a: (
      <>
        Any HTML surface that accepts a &lt;script type=&quot;module&quot;&gt; tag: Webflow, WordPress, Shopify, Squarespace, Framer, Wix, custom Next.js / React / Vue / Svelte / Astro / static HTML, mobile webviews. React Native wrapper <RoadmapChip /> ships in Phase 3; native iOS (Swift) and Android (Kotlin) SDKs <RoadmapChip /> follow in Phase 4.
      </>
    ),
  },
  {
    q: "What about GDPR and data residency?",
    a: "ZHOLY is Polare Group Sàrl (CHE-221.062.769), a Swiss-incorporated company. Voice biometrics are GDPR Article 9 special-category data, treated accordingly under Swiss nFADP. Default infrastructure is Swiss-hosted; EU dedicated tier on request; on-prem via Docker on SOVEREIGN. Audio frames stream through the gateway in-memory and aren't retained unless you opt in to call recording.",
  },
  {
    q: "Can I self-host?",
    a: "Yes — the gateway is a Node.js + Express + WebSocket server with Postgres, the embed is a vanilla ES module, the vector store is a JSON file. You can swap in your own STT (whisper.cpp included), LLM (any OpenAI-compatible endpoint, including Ollama), and TTS. Source is public at github.com/Matjay007/zholy-gateway. SOVEREIGN tier ships Docker images + signed support contract.",
  },
  {
    q: "Can my developers build custom integrations?",
    a: "The embed exposes window.ZRO_VOICE_EMBED_API with toggle / start / stop methods. zro:action CustomEvents land on the DOM for every dispatched action. Per-tenant config via window.ZRO_COMPANY_PROFILE. No proprietary SDK to learn; everything is a plain script tag and standard DOM events.",
  },
  {
    q: "What happens if I run out of minutes?",
    a: "The orb hides itself gracefully on next page load — no error toasts, no broken UI. All conversations and leads remain in your dashboard. Top up with a minute pack or upgrade and the agent reappears instantly. Minutes never expire.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line border-y border-line">
      {QUESTIONS.map((item, i) => (
        <button
          key={i}
          onClick={() => setOpen(open === i ? null : i)}
          className="w-full text-left py-6 flex items-start gap-6 group"
        >
          <span className="font-mono text-[11px] tracking-widest text-muted pt-1.5 w-8 shrink-0">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="flex-1">
            <span className="font-serif text-2xl text-cream block">{item.q}</span>
            <span
              className={`block overflow-hidden transition-all duration-300 ease-out text-cream/70 leading-relaxed ${
                open === i ? "max-h-[600px] mt-4 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {item.a}
            </span>
          </span>
          <span
            className={`text-cream/60 text-2xl mt-1 transition-transform ${
              open === i ? "rotate-45" : ""
            }`}
            aria-hidden
          >
            +
          </span>
        </button>
      ))}
    </div>
  );
}
