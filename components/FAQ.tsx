"use client";
import { useState } from "react";

const QUESTIONS: Array<{ q: string; a: string }> = [
  {
    q: "Does ZHOLY support multiple languages?",
    a: "Yes. 30+ languages out of the box including English, French, Spanish, Portuguese, German, Italian, Dutch, Polish, Czech, Russian, Ukrainian, Turkish, Arabic, Hebrew, Japanese, Korean, Mandarin, Cantonese, Hindi, Bengali, Tamil, Indonesian, Vietnamese, Thai, Greek, Romanian, Hungarian, Swedish, Norwegian, Danish, Finnish. The agent auto-detects per utterance — a visitor can slip from English into French mid-call and the agent follows without a reset.",
  },
  {
    q: "How does the agent learn about my product?",
    a: "On install we crawl your site (sitemap, then page-by-page) and embed every paragraph into a per-tenant vector store using Xenova/nomic-embed-text-v1. Updates are picked up automatically on a configurable cadence. You can also paste docs, a help center, a Notion link, or a JSON company profile directly in the dashboard.",
  },
  {
    q: "Will the agent hallucinate?",
    a: "It's RAG-grounded. Each user turn runs a top-3 retrieval against your vector store; the prompt only includes those chunks plus your company profile. The dashboard shows you exactly which snippet was retrieved for each answer. Banking, medical, and legal advice are refused by default — configurable per agent.",
  },
  {
    q: "Can it see the page?",
    a: "Two layers. (1) DOM semantics — every turn the embed sends a structured snapshot of what is currently visible (headings, prices, buttons, sections). The agent answers about what is on screen right now, not the page as it loaded. (2) Optional camera mode — the visitor's camera feed runs through a local moondream vision model so the agent can identify physical products, error screens, or anything they point at.",
  },
  {
    q: "Can it scroll and click on the page?",
    a: "It smooth-scrolls to any anchor and pulse-highlights elements as it talks. For deeper actions — opening a cart, applying a coupon, navigating routed pages — the embed emits zro:action CustomEvents your code can listen for. You wire the action handler; ZHOLY decides when to fire it from the conversation.",
  },
  {
    q: "Can I interrupt it?",
    a: "Yes. Barge-in detection cancels TTS playback the moment the visitor starts speaking — like a phone call, not a walkie-talkie. Push-to-talk mode is also available for noisy environments.",
  },
  {
    q: "Can I customize the voice?",
    a: "50+ voices in the default library, ranging from warm conversational to authoritative narrator. You can clone your own brand voice from a short reference clip — preview and switch voices live from the dashboard.",
  },
  {
    q: "Can it book appointments?",
    a: "Yes — Cal.com, Calendly, and Google Calendar are supported out of the box. The agent reads the visitor's intent, asks for the right details, confirms the slot, and emails the calendar invite. Custom booking endpoints can be wired via webhook on the Growth tier.",
  },
  {
    q: "Where do leads go?",
    a: "Real-time to your dashboard, optional email digest, optional Slack notification, CSV export, and webhook out to your CRM (HubSpot, Salesforce, Pipedrive, Attio, Notion, Airtable, Google Sheets).",
  },
  {
    q: "Does ZHOLY recognize returning visitors?",
    a: "Yes. The agent remembers prior conversations on the same browser by default, and across devices when the visitor identifies themselves. You control the retention window per tenant.",
  },
  {
    q: "What analytics do I get?",
    a: "Full transcripts, lead capture details, country / device / browser / OS breakdown, time-on-page during call, scroll-to-action conversion, voice quality scores, per-question intent classification, and the exact RAG chunk retrieved for every answer. Free tier shows last 7 days.",
  },
  {
    q: "Does it work on my CMS?",
    a: "Anywhere you can paste a <script type=\"module\"> tag: Webflow, WordPress, Shopify, Squarespace, Framer, Wix, custom Next.js / React / Vue / Svelte / Astro / static HTML, mobile webviews. Native iOS and Android SDKs ship for the apps tier.",
  },
  {
    q: "What about GDPR and data residency?",
    a: "Voice biometrics are GDPR Article 9 special-category data. Default ZHOLY infrastructure is Swiss-hosted with nFADP + GDPR coverage. EU dedicated tier available. Audio frames stream through the gateway in-memory and are not retained unless you explicitly opt in to call recording.",
  },
  {
    q: "Can I self-host the gateway?",
    a: "Yes — Enterprise tier ships the full gateway as Docker images you run on your own infrastructure (or our EU-hosted dedicated tier). Customer audio never leaves your network. Includes white-label branding, SSO, and a signed support agreement.",
  },
  {
    q: "Can my developers build custom integrations?",
    a: "The embed exposes window.ZRO_VOICE_EMBED_API with toggle / start / stop methods — wire any button on your site to it. Custom DOM actions land as zro:action CustomEvents. Per-tenant config goes through window.ZRO_COMPANY_PROFILE. No proprietary SDK to learn.",
  },
  {
    q: "What happens if I run out of minutes?",
    a: "The orb hides itself gracefully on next page load — no error toasts, no broken UI. All conversations, leads, and analytics stay in your dashboard. Top up with a minute pack or upgrade your plan and the agent comes back instantly. Minutes never expire.",
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
            className={`text-cream/60 text-2xl mt-1 transition-transform ${open === i ? "rotate-45" : ""}`}
            aria-hidden
          >
            +
          </span>
        </button>
      ))}
    </div>
  );
}
