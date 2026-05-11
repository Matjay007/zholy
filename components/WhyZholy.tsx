"use client";

/* WHY ZHOLY — repositioned. Four stamps of the interaction-agent layer.
 * Each stamp = a verb the agent actually does today (verified in gateway). */

const POINTS = [
  {
    n: "01",
    title: "Perceives",
    line: "Sees what's on screen.",
    body: "Every turn ZHOLY receives a semantic snapshot of the surface — headings, prices, buttons, sections, visibility. Optional camera mode adds a local moondream vision model so the agent can identify physical objects the visitor points at.",
    foyer: "Generic voice bots answer from a knowledge base, not the surface in front of them.",
  },
  {
    n: "02",
    title: "Navigates",
    line: "Moves through the interface.",
    body: "Smooth-scroll to anchors, pulse-highlight elements as it talks, jump between routes. The conversation and the interface stay in lockstep, not parallel.",
    foyer: "Chat widgets sit in a corner. They never touch the page.",
  },
  {
    n: "03",
    title: "Dispatches",
    line: "Fires actions your code executes.",
    body: "Every interaction emits a zro:action CustomEvent — navigate, scroll, highlight, fill-form, click, submit. Your handler decides what runs. The agent owns the conversation; you keep the keys to your app.",
    foyer: "Closed widgets force you through their proprietary action API.",
  },
  {
    n: "04",
    title: "A Swiss company.",
    line: "Incorporated, built, and hosted in Switzerland.",
    body: "ZHOLY is Polare Group Sàrl (CHE-221.062.769), a Geneva-incorporated company — not a US startup with a Swiss data centre. Voice biometrics treated as GDPR Article 9 special-category data under Swiss nFADP. EU residency on request, on-prem via Docker.",
    foyer: "US-incorporated competitors fall under US-cloud jurisdiction by default.",
  },
];

export default function WhyZholy() {
  return (
    <section id="why" className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(218,41,28,0.7) 45%, rgba(218,41,28,0.7) 55%, transparent)",
        }}
      />
      <div className="wrap pt-24 pb-24">
        <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-20">
          <div>
            <p className="label">[ Why ZHOLY ]</p>
            <p className="mt-3 font-mono text-[11px] tracking-widest text-cyan/80">
              FOUR THINGS A VOICE CHATBOT CAN&apos;T DO
            </p>
          </div>
          <h2 className="serif text-[44px] sm:text-[64px] leading-[1.0] tracking-tighter text-cream max-w-3xl">
            Generic voice AI<br />stops at the microphone.<br />
            <span className="text-cyan italic">ZHOLY doesn&apos;t.</span>
          </h2>
        </div>

        <div className="divide-y divide-line border-y border-line">
          {POINTS.map((p, i) => (
            <div
              key={p.n}
              className={`grid md:grid-cols-[120px,1fr,1fr] gap-8 py-12 items-start ${
                i % 2 === 1 ? "md:pl-8" : ""
              }`}
            >
              <div>
                <span className="serif block leading-none text-cream/15" style={{ fontSize: 84 }}>
                  {p.n}
                </span>
              </div>
              <div>
                <p className="font-mono text-[11px] tracking-widest text-cyan uppercase mb-3">
                  {p.title}
                </p>
                <p className="serif text-[36px] sm:text-[44px] leading-[1.05] tracking-tighter text-cream">
                  {p.line}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-cream/80 text-base leading-relaxed">{p.body}</p>
                <p className="flex items-start gap-2 text-cream/40 text-xs italic leading-relaxed">
                  <span
                    aria-hidden
                    style={{
                      flex: "0 0 auto",
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.2)",
                      textAlign: "center",
                      lineHeight: "12px",
                      fontSize: 10,
                      marginTop: 2,
                    }}
                  >
                    ×
                  </span>
                  <span>{p.foyer}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 font-mono text-[11px] tracking-widest text-cream/40 text-center">
          PERCEIVE · NAVIGATE · DISPATCH · NARRATE
        </p>
      </div>
    </section>
  );
}
