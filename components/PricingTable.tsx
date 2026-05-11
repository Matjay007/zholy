"use client";

import Link from "next/link";
import { useState } from "react";
import RoadmapChip from "./RoadmapChip";

/* LOCAL / CLOUD / SOVEREIGN — deployment-model naming.
 * Each bullet is either verified-shipping today, or carries a RoadmapChip. */
const PLANS = [
  {
    id: "local",
    name: "LOCAL",
    pitch: "Self-host. Individual. Trial.",
    monthly: 0,
    yearlyPerMonth: 0,
    yearlyTotal: 0,
    minutes: "100 voice minutes · 1 agent",
    bullets: [
      { text: "Speech-to-speech via SenseVoice + OpenAI", roadmap: false },
      { text: "30+ languages, auto-detected per utterance", roadmap: false },
      { text: "Per-tenant RAG (vector store)", roadmap: false },
      { text: "DOM action dispatch (zro:action events)", roadmap: false },
      { text: "Self-host with Docker", roadmap: false },
      { text: "ZHOLY watermark on widget", roadmap: false },
    ],
    cta: { label: "Start free", href: "/signup", style: "ghost" as const },
    highlight: false,
  },
  {
    id: "cloud",
    name: "CLOUD",
    pitch: "Hosted SaaS. Teams. Production.",
    monthly: 79,
    yearlyPerMonth: 63,
    yearlyTotal: 756,
    minutes: "800 voice minutes · 3 agents",
    bullets: [
      { text: "Everything in LOCAL", roadmap: false },
      { text: "No watermark", roadmap: false },
      { text: "Hosted on zholy.ai (Swiss data centre)", roadmap: false },
      { text: "Full transcripts + Postgres-backed analytics", roadmap: false },
      { text: "URL ingest (up to 25 pages per job)", roadmap: false },
      { text: "Barge-in + push-to-talk", roadmap: false },
      { text: "Slack + email lead notifications", roadmap: true },
      { text: "Cal.com booking handler", roadmap: true },
      { text: "Generic CRM webhook OUT", roadmap: true },
    ],
    cta: { label: "Get started", href: "/signup?plan=cloud", style: "cyan" as const },
    highlight: true,
  },
  {
    id: "sovereign",
    name: "SOVEREIGN",
    pitch: "EU residency. On-prem. SLA.",
    monthly: 299,
    yearlyPerMonth: 199,
    yearlyTotal: 2388,
    minutes: "10,000+ minutes · unlimited agents",
    bullets: [
      { text: "Everything in CLOUD", roadmap: false },
      { text: "Dedicated EU node or on-prem Docker", roadmap: false },
      { text: "Camera vision (moondream, local)", roadmap: false },
      { text: "Custom company-profile JSON", roadmap: false },
      { text: "zro:action developer hooks + audit log", roadmap: false },
      { text: "GDPR Article 9 voice biometrics handling", roadmap: false },
      { text: "Voice cloning (ElevenLabs)", roadmap: true },
      { text: "Multi-step workflow planner", roadmap: true },
      { text: "Priority support + SLA", roadmap: false },
    ],
    cta: { label: "Talk to us", href: "/signup?plan=sovereign", style: "ghost" as const },
    highlight: false,
  },
] as const;

export default function PricingTable() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("yearly");

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex items-center gap-1 p-1 rounded-full border border-line bg-elevated/40">
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`px-4 py-2 rounded-full text-sm font-mono tracking-widest transition ${
              period === "monthly" ? "bg-cyan text-ink" : "text-cream/70 hover:text-cream"
            }`}
            aria-pressed={period === "monthly"}
          >
            MONTHLY
          </button>
          <button
            type="button"
            onClick={() => setPeriod("yearly")}
            className={`px-4 py-2 rounded-full text-sm font-mono tracking-widest transition flex items-center gap-2 ${
              period === "yearly" ? "bg-cyan text-ink" : "text-cream/70 hover:text-cream"
            }`}
            aria-pressed={period === "yearly"}
          >
            YEARLY
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                period === "yearly" ? "bg-ink/15 text-ink" : "bg-cyan/20 text-cyan"
              }`}
            >
              −20%
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const price = period === "yearly" ? plan.yearlyPerMonth : plan.monthly;
          const yearlyHint =
            period === "yearly" && plan.yearlyTotal
              ? `$${plan.yearlyTotal.toLocaleString()} billed yearly · saves $${(
                  plan.monthly * 12 -
                  plan.yearlyTotal
                ).toLocaleString()}/yr`
              : period === "monthly" && plan.yearlyPerMonth
                ? `or $${plan.yearlyPerMonth}/mo billed yearly`
                : "";

          return (
            <div
              key={plan.id}
              className={`card-cream relative flex flex-col ${
                plan.highlight ? "ring-2 ring-cyan" : ""
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan text-ink text-[11px] font-mono tracking-widest">
                  ★ MOST POPULAR
                </span>
              )}
              <p className="font-mono text-[11px] tracking-widest text-ink/60 mb-1">
                {plan.name}
              </p>
              <p className="font-mono text-[10px] tracking-widest text-ink/40 mb-3 uppercase">
                {plan.pitch}
              </p>
              <p className="serif text-5xl mb-1">
                ${price}
                <span className="text-xl text-ink/50">/mo</span>
              </p>
              <p className="text-ink/60 text-sm mb-1">{plan.minutes}</p>
              <p className="text-ink/45 text-xs mb-6 min-h-[1em]">{yearlyHint}</p>
              <ul className="space-y-2 text-sm text-ink/80 mb-8 flex-1">
                {plan.bullets.map((b) => (
                  <li key={b.text} className="leading-relaxed">
                    · {b.text}
                    {b.roadmap && <RoadmapChip />}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta.href}
                className={
                  plan.cta.style === "cyan"
                    ? "btn btn-cyan justify-center"
                    : "btn btn-ghost border-ink/15 text-ink hover:border-ink/40"
                }
              >
                {plan.cta.label}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Minute packs */}
      <div className="mt-10 grid md:grid-cols-4 gap-3 text-sm">
        {[
          { p: "+1,000 min", c: "$49" },
          { p: "+5,000 min", c: "$199" },
          { p: "+25,000 min", c: "$799" },
          { p: "Enterprise / on-prem", c: "Talk to us" },
        ].map((m) => (
          <div
            key={m.p}
            className="rounded-2xl border border-line p-4 flex justify-between text-cream/80"
          >
            <span>{m.p}</span>
            <span className="text-cream font-medium">{m.c}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs font-mono tracking-widest text-muted text-center">
        MINUTES NEVER EXPIRE · PACKS STACK ON ANY PLAN · CANCEL ANYTIME
      </p>
    </>
  );
}
