"use client";

/* BusinessImpact — the ROI / pain-killer section.
 * Before/After comparison, then operational outcomes row.
 * No fabricated percentages — placeholders until real benchmarks land. */

const BEFORE = [
  "Visitor lands, can't find the answer, bounces.",
  "Support inbox fills with the same 10 questions.",
  "Sales-qualified leads slip through forms.",
  "Demos never get booked outside business hours.",
  "Sales team answers repetitive questions instead of closing.",
  "Onboarding takes a call you can't always staff.",
  "Lead enters the CRM hours later, cold.",
];

const AFTER = [
  "Visitor is greeted, guided, qualified — in their language.",
  "Repetitive support handled at the interaction layer.",
  "Pricing explained live, with the right tier highlighted on screen.",
  "Demo booked inside the conversation, calendar invite sent.",
  "CRM populated the moment intent is captured.",
  "Onboarding walks itself, narrated, with confirmations.",
  "Sales team focuses on the conversations that actually convert.",
];

const METRICS = [
  { label: "Lead-capture rate", baseline: "—", target: "—" },
  { label: "Time-to-first-response", baseline: "—", target: "—" },
  { label: "Meeting-booking conversion", baseline: "—", target: "—" },
  { label: "Repetitive support load", baseline: "—", target: "—" },
];

export default function BusinessImpact() {
  return (
    <section id="impact" className="section relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 100%, rgba(76,233,233,0.05), transparent 70%)",
        }}
      />
      <div className="wrap relative">
        <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
          <div>
            <p className="label">[ Business impact ]</p>
            <p className="mt-3 font-mono text-[11px] tracking-widest text-cyan/80 uppercase">
              Operational leverage, not buzzwords
            </p>
          </div>
          <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-3xl">
            What changes when interfaces<br />
            <span className="text-muted">stop being brochures.</span>
          </h2>
        </div>

        {/* Before / After two-column */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* BEFORE */}
          <div className="rounded-2xl border border-line p-8 bg-ink-2/30">
            <p className="font-mono text-[11px] tracking-widest text-cream/40 uppercase mb-6">
              Without ZHOLY
            </p>
            <ul className="space-y-3">
              {BEFORE.map((line, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-cream/55 text-sm leading-relaxed"
                >
                  <span
                    aria-hidden
                    className="shrink-0 mt-1"
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.18)",
                      textAlign: "center",
                      lineHeight: "12px",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    ×
                  </span>
                  <span style={{ textDecoration: "line-through", textDecorationColor: "rgba(255,255,255,0.15)" }}>
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* AFTER */}
          <div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "#EBEAE6",
              color: "#1C1D22",
              border: "1px solid rgba(28,29,34,0.08)",
            }}
          >
            <p className="font-mono text-[11px] tracking-widest mb-6 uppercase" style={{ color: "rgba(28,29,34,0.55)" }}>
              With ZHOLY
            </p>
            <ul className="space-y-3">
              {AFTER.map((line, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                  style={{ color: "rgba(28,29,34,0.85)" }}
                >
                  <span
                    aria-hidden
                    className="shrink-0 mt-1"
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#4CE9E9",
                      textAlign: "center",
                      lineHeight: "14px",
                      fontSize: 9,
                      color: "#1C1D22",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Operational outcomes row */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-line p-5 bg-ink-2/30"
            >
              <p className="font-mono text-[10px] tracking-widest text-cream/45 uppercase mb-3">
                {m.label}
              </p>
              <div className="flex items-baseline gap-3">
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-cream/35 uppercase">Today</p>
                  <p className="serif text-2xl text-cream/40 leading-none mt-1">{m.baseline}</p>
                </div>
                <span aria-hidden className="text-cream/30 text-xl">→</span>
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-cyan/70 uppercase">Target</p>
                  <p className="serif text-2xl text-cyan leading-none mt-1">{m.target}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing line */}
        <p className="mt-12 text-center font-mono text-[11px] tracking-[0.24em] text-cream/55 uppercase">
          Augments your team. Doesn&apos;t replace it.
        </p>
      </div>
    </section>
  );
}
