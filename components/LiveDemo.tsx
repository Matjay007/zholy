"use client";
import { useEffect, useState } from "react";

/* LiveDemo — AI Sales Concierge flow.
 * 5 turns showing the flagship: visitor lands on pricing page,
 * agent qualifies, highlights, books a demo, captures lead.
 * Every action chip is a real zro:action dispatch shape. */

type Turn = {
  who: "v" | "a";
  text: string;
  action?: {
    type: "scroll" | "highlight" | "navigate" | "book" | "collect-lead";
    target: string;
  };
};

const SCRIPT: Turn[] = [
  {
    who: "a",
    text:
      "Hi — looks like you're comparing tiers. Want me to walk you through what's included in each? I can highlight the right one for your use case.",
  },
  {
    who: "v",
    text: "What's the difference between CLOUD and SOVEREIGN?",
  },
  {
    who: "a",
    text:
      "SOVEREIGN runs on a dedicated EU node or your own infra via Docker — useful when voice biometrics need to stay on home turf. CLOUD is our managed Swiss data centre. Let me highlight the SOVEREIGN card.",
    action: { type: "highlight", target: "SOVEREIGN tier card" },
  },
  {
    who: "v",
    text: "Can I book a demo for next Tuesday at 2pm?",
  },
  {
    who: "a",
    text:
      "Tuesday at 2pm CET works. I'm dispatching the booking now and capturing your details so we can confirm by email.",
    action: { type: "book", target: "cal.com · tue 14:00 CET" },
  },
];

export default function LiveDemo() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const turn = SCRIPT[step];
    setTyped("");
    let i = 0;
    const type = setInterval(() => {
      i++;
      setTyped(turn.text.slice(0, i));
      if (i >= turn.text.length) {
        clearInterval(type);
        setTimeout(
          () => setStep((s) => (s + 1) % SCRIPT.length),
          turn.who === "a" ? 2200 : 900
        );
      }
    }, turn.who === "v" ? 28 : 22);
    return () => clearInterval(type);
  }, [step]);

  return (
    <section className="relative section overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(76,233,233,0.06), transparent 70%)",
        }}
      />
      <div className="wrap relative">
        <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
          <div>
            <p className="label">[ Flagship · AI Sales Concierge ]</p>
            <p className="mt-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-cyan/80">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#4CE9E9",
                  boxShadow: "0 0 10px rgba(76,233,233,0.7)",
                  animation: "pulse 1.4s ease-in-out infinite",
                }}
              />
              LIVE FLOW
            </p>
          </div>
          <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-3xl">
            Qualify. Highlight.<br />
            <span className="text-muted">Book. Capture.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[1.1fr,1fr] gap-8 items-stretch">
          {/* Faux browser frame with live transcript */}
          <div
            className="rounded-2xl border border-line overflow-hidden"
            style={{ background: "linear-gradient(180deg, #1F2025 0%, #16171B 100%)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-ink-2/60">
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
              <span className="ml-4 font-mono text-[11px] text-cream/40 tracking-wider">
                zholy.ai — sales concierge session
              </span>
            </div>

            <div className="p-6 space-y-4 min-h-[420px]">
              {SCRIPT.slice(0, step + 1).map((turn, i) => {
                const isLast = i === step;
                const text = isLast ? typed : turn.text;
                const showCursor = isLast && text.length < turn.text.length;
                return (
                  <div
                    key={i}
                    className={`flex gap-3 ${turn.who === "v" ? "justify-end" : "justify-start"}`}
                  >
                    {turn.who === "a" && (
                      <span
                        className="font-mono text-[10px] tracking-widest text-cyan/70 mt-1.5 shrink-0"
                        style={{ width: 56 }}
                      >
                        ZHOLY
                      </span>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        turn.who === "v"
                          ? "bg-cream/10 text-cream"
                          : "bg-cyan/10 text-cream border border-cyan/20"
                      }`}
                    >
                      {text}
                      {showCursor && (
                        <span
                          aria-hidden
                          style={{
                            display: "inline-block",
                            width: 7,
                            height: 14,
                            marginLeft: 2,
                            background: "#4CE9E9",
                            verticalAlign: "middle",
                            animation: "blink 1s steps(2) infinite",
                          }}
                        />
                      )}
                      {turn.action && !showCursor && (
                        <div className="mt-2 flex items-center gap-2 font-mono text-[10px] tracking-widest text-cyan/80 uppercase">
                          <ActionGlyph type={turn.action.type} />
                          <span>
                            {turn.action.type === "scroll" && `Scroll → ${turn.action.target}`}
                            {turn.action.type === "highlight" && `Highlight → ${turn.action.target}`}
                            {turn.action.type === "navigate" && `Navigate → ${turn.action.target}`}
                            {turn.action.type === "book" && `Dispatch book → ${turn.action.target}`}
                            {turn.action.type === "collect-lead" && `Collect lead → ${turn.action.target}`}
                          </span>
                        </div>
                      )}
                    </div>
                    {turn.who === "v" && (
                      <span
                        className="font-mono text-[10px] tracking-widest text-cream/40 mt-1.5 shrink-0"
                        style={{ width: 56, textAlign: "right" }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column — proof points */}
          <div className="flex flex-col justify-center gap-6">
            <p className="font-mono text-[11px] tracking-widest text-cyan uppercase">
              What you just saw
            </p>
            <ul className="space-y-5">
              <li className="flex gap-4">
                <span className="font-mono text-[11px] tracking-widest text-muted pt-1.5 w-8 shrink-0">01</span>
                <div>
                  <p className="text-cream font-medium mb-1">Grounded answers</p>
                  <p className="text-cream/65 text-sm leading-relaxed">
                    Tier details come from your per-tenant vector store — your real pricing, your real positioning. Top-3 retrieval logged for every reply.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-[11px] tracking-widest text-muted pt-1.5 w-8 shrink-0">02</span>
                <div>
                  <p className="text-cream font-medium mb-1">DOM action in real time</p>
                  <p className="text-cream/65 text-sm leading-relaxed">
                    The agent emits <code className="font-mono text-cyan">zro:action</code> events. Your handlers scroll, highlight, navigate, book — execution stays in your code.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-[11px] tracking-widest text-muted pt-1.5 w-8 shrink-0">03</span>
                <div>
                  <p className="text-cream font-medium mb-1">Booking + lead in-call</p>
                  <p className="text-cream/65 text-sm leading-relaxed">
                    Booking handler (Cal.com integration shipping in Phase 2) fires inside the conversation. Lead webhook OUT to your CRM the moment intent is confirmed.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.5} }
      `}</style>
    </section>
  );
}

function ActionGlyph({ type }: { type: Turn["action"] extends infer A ? A extends { type: infer T } ? T : never : never }) {
  const common = { width: 12, height: 12, fill: "none", stroke: "#4CE9E9", strokeWidth: 2 } as const;
  if (type === "scroll")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (type === "highlight")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
    );
  if (type === "book")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
      </svg>
    );
  if (type === "collect-lead")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" {...common}>
      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
