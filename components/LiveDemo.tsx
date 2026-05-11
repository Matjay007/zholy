"use client";
import { useEffect, useState } from "react";

/* Live conversation demo — shows the agent talking, scrolling, highlighting in
 * a faux website preview. Loops every ~20s. This is the visual differentiator
 * Foyer doesn't have: PROOF the agent acts on the page, not just talks. */

type Turn = {
  who: "v" | "a";   // visitor / agent
  text: string;
  action?: {        // optional DOM-action visualization
    type: "scroll" | "highlight" | "navigate";
    target: string;
  };
};

const SCRIPT: Turn[] = [
  { who: "v", text: "What languages do you support?" },
  { who: "a", text: "30+ — English, French, Spanish, German, Italian, Portuguese, Dutch, Arabic, Mandarin, Japanese and more. I auto-detect per utterance, so you can switch mid-conversation.", action: { type: "scroll", target: "Languages section" } },
  { who: "v", text: "Can you see this page?" },
  { who: "a", text: "Yes — every turn I get a semantic snapshot of what's visible on screen: headings, prices, buttons. Watch me highlight where this is explained.", action: { type: "highlight", target: "DOM semantics card" } },
  { who: "v", text: "Show me the FAQ." },
  { who: "a", text: "Scrolling to the FAQ now. Ask me anything once you've read it — or just speak.", action: { type: "navigate", target: "#faq" } },
];

export default function LiveDemo() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");

  // Type out the current turn, then advance after a pause
  useEffect(() => {
    const turn = SCRIPT[step];
    setTyped("");
    let i = 0;
    const type = setInterval(() => {
      i++;
      setTyped(turn.text.slice(0, i));
      if (i >= turn.text.length) {
        clearInterval(type);
        // pause then advance
        setTimeout(() => setStep((s) => (s + 1) % SCRIPT.length), turn.who === "a" ? 2200 : 900);
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
            <p className="label">[ Live ]</p>
            {/* Pulse dot */}
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
              REAL CONVERSATION
            </p>
          </div>
          <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-3xl">
            Listen. Speak. <span className="text-muted">Act on the page.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[1.1fr,1fr] gap-8 items-stretch">
          {/* Faux browser frame with live transcript */}
          <div
            className="rounded-2xl border border-line overflow-hidden"
            style={{ background: "linear-gradient(180deg, #1F2025 0%, #16171B 100%)" }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-ink-2/60">
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
              <span className="ml-4 font-mono text-[11px] text-cream/40 tracking-wider">
                zholy.ai — voice session
              </span>
            </div>

            {/* Transcript area */}
            <div className="p-6 space-y-4 min-h-[360px]">
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
                            {turn.action.type === "scroll" && `Scrolling to ${turn.action.target}`}
                            {turn.action.type === "highlight" &&
                              `Highlighting ${turn.action.target}`}
                            {turn.action.type === "navigate" &&
                              `Navigating to ${turn.action.target}`}
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

          {/* Right column — what makes this different */}
          <div className="flex flex-col justify-center gap-6">
            <p className="font-mono text-[11px] tracking-widest text-cyan uppercase">
              What you just saw
            </p>
<ul className="space-y-5">
              <li className="flex gap-4">
                <span className="font-mono text-[11px] tracking-widest text-muted pt-1.5 w-8 shrink-0">
                  01
                </span>
                <div>
                  <p className="text-cream font-medium mb-1">Grounded in your content</p>
                  <p className="text-cream/65 text-sm leading-relaxed">
                    Answers come from your tenant&apos;s vector store — your real site content,
                    top-3 retrieval, logged per answer.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-[11px] tracking-widest text-muted pt-1.5 w-8 shrink-0">
                  02
                </span>
                <div>
                  <p className="text-cream font-medium mb-1">Mid-call language auto-switch</p>
                  <p className="text-cream/65 text-sm leading-relaxed">
                    Visitor switches from English to French mid-sentence — the agent follows
                    without a reset.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-[11px] tracking-widest text-muted pt-1.5 w-8 shrink-0">
                  03
                </span>
                <div>
                  <p className="text-cream font-medium mb-1">DOM action in real time</p>
                  <p className="text-cream/65 text-sm leading-relaxed">
                    Scrolls, highlights, navigates — every action emits a zro:action event your
                    code can hook.
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

function ActionGlyph({ type }: { type: "scroll" | "highlight" | "navigate" }) {
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
  return (
    <svg viewBox="0 0 24 24" {...common}>
      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
