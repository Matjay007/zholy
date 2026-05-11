import Link from "next/link";
import SalesBotWidget from "@/components/SalesBotWidget";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import Orb from "@/components/Orb";
import CodeSnippet from "@/components/CodeSnippet";
import FAQ from "@/components/FAQ";
import PricingTable from "@/components/PricingTable";
import TrustStrip from "@/components/TrustStrip";
import LiveDemo from "@/components/LiveDemo";
import EdgeBento from "@/components/EdgeBento";
import AlpineAccent from "@/components/AlpineAccent";
import WhyZholy from "@/components/WhyZholy";
import BusinessImpact from "@/components/BusinessImpact";

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO — asymmetric. Orb overflows into headline column via negative margin + plasma blur. */}
      <section id="hero" className="relative pt-40 pb-32 overflow-hidden">
        <div className="aurora" />
        <div className="grain" />

        {/* Plasma blur — bleeds from orb into headline column, breaking the grid */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            right: "-8%",
            top: "8%",
            width: "60vw",
            height: "60vw",
            maxWidth: 900,
            maxHeight: 900,
            background:
              "radial-gradient(circle at 60% 40%, rgba(76,233,233,0.18), rgba(76,233,233,0.06) 30%, transparent 60%)",
            filter: "blur(40px)",
          }}
        />

        <div className="wrap relative">
          <div className="grid lg:grid-cols-[1.25fr,1fr] gap-12 items-center">
            <div className="relative z-10">
              <p className="label mb-6">[ Interfaces that act ]</p>
              <h1 className="serif text-[56px] sm:text-[88px] leading-[0.92] tracking-tightest text-cream">
                Your website<br />finally{" "}
                <em className="text-cyan not-italic" style={{ fontStyle: "italic" }}>
                  speaks.
                </em>
              </h1>
              <p className="mt-8 text-lg text-cream/75 max-w-xl leading-relaxed">
                ZHOLY turns websites and apps into conversational interfaces that guide, navigate, and execute in real time.
              </p>
              <p className="mt-4 text-base text-cream/55 max-w-xl leading-relaxed">
                Reduce support load, qualify visitors automatically, and convert more traffic — without expanding your team.
              </p>
              <div className="mt-10 flex flex-wrap gap-3 items-center">
                <Link href="/signup" className="btn btn-cyan">
                  Start free <span className="btn-arrow">→</span>
                </Link>
                <Link href="#flagship" className="btn btn-ghost">
                  See the flagship
                </Link>
                <span className="text-xs font-mono tracking-widest text-muted ml-2">
                  A SWISS COMPANY · NO CREDIT CARD
                </span>
              </div>
            </div>

            {/* Orb column — pushed slightly left to overlap the text column on wide screens */}
            <div
              className="relative h-[460px] flex flex-col items-center justify-center gap-6"
              style={{ marginLeft: "-3vw" }}
            >
              <Orb size={360} />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(76,233,233,0.85)",
                    fontFamily: "var(--font-satoshi, sans-serif)",
                  }}
                >
                  Tap to talk
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    fontFamily: "var(--font-satoshi, sans-serif)",
                  }}
                >
                  Or type in the transcript panel
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      <TrustStrip />

      {/* FLAGSHIP — anchor for hero CTA */}
      <section id="flagship" className="relative">
        <LiveDemo />
      </section>

      <AlpineAccent />

      {/* BUSINESS IMPACT — ROI / pain-killer section */}
      <BusinessImpact />

      <AlpineAccent />

      <WhyZholy />

      <AlpineAccent />

      {/* CATEGORY CLARITY */}
      <section id="category" className="section">
        <div className="wrap">
          <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
            <p className="label">[ Category ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-3xl">
              ZHOLY is not a voice chatbot.<br />
              <span className="text-muted">It&apos;s the interaction agent layer.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-line p-8">
              <p className="font-mono text-[11px] tracking-widest text-cream/40 uppercase mb-4">
                Voice chatbots
              </p>
              <ul className="space-y-3 text-cream/60 text-sm leading-relaxed">
                <li>· Listen.</li>
                <li>· Answer from a knowledge base.</li>
                <li>· End the call.</li>
                <li>· Live in a corner of the page, ignored.</li>
              </ul>
              <p className="mt-6 text-xs font-mono tracking-widest text-cream/30 uppercase">
                Foyer · Intercom · Vapi · Synthflow
              </p>
            </div>
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background:
                  "radial-gradient(ellipse 90% 80% at 30% 20%, rgba(76,233,233,0.10), rgba(28,29,34,0.95) 70%)",
                border: "1px solid rgba(76,233,233,0.3)",
              }}
            >
              <p className="font-mono text-[11px] tracking-widest text-cyan uppercase mb-4">
                ZHOLY — Interaction agent
              </p>
              <ul className="space-y-3 text-cream/90 text-sm leading-relaxed">
                <li>
                  · <strong className="text-cream">Perceives</strong> the surface — DOM semantics + camera vision.
                </li>
                <li>
                  · <strong className="text-cream">Navigates</strong> it — scrolls, highlights, opens.
                </li>
                <li>
                  · <strong className="text-cream">Dispatches</strong> actions — your handlers fill, click, submit, book.
                </li>
                <li>
                  · <strong className="text-cream">Narrates</strong> every step in conversation.
                </li>
              </ul>
              <p className="mt-6 text-xs font-mono tracking-widest text-cyan/70 uppercase">
                A new category: conversational execution
              </p>
            </div>
          </div>

          <p className="mt-12 text-center font-mono text-[11px] tracking-widest text-cream/40 max-w-2xl mx-auto leading-relaxed">
            TODAY ZHOLY SHIPS PERCEPTION · NAVIGATION · NARRATION · ACTION DISPATCH.<br />
            AUTONOMOUS FORM-FILL, MULTI-STEP WORKFLOW EXECUTION, AND CROSS-APP ORCHESTRATION ARE ON THE ROADMAP.
          </p>
        </div>
      </section>

      <AlpineAccent />

      {/* HOW IT WORKS */}
      <section id="how" className="section">
        <div className="wrap">
          <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
            <p className="label">[ How it works ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-2xl">
              Drop in.<br />Connect handlers.<br />Speak to your app.
            </h2>
          </div>

          <ol className="space-y-12 max-w-4xl">
            <li className="grid md:grid-cols-[80px,1fr] gap-6 items-start">
              <span className="font-mono text-[13px] tracking-widest text-muted pt-2">01 / EMBED</span>
              <div>
                <h3 className="serif text-3xl mb-4 text-cream">Paste one script tag</h3>
                <p className="text-cream/70 mb-6 max-w-2xl">
                  ES-module, async-loaded, never blocks paint. Works on Webflow, WordPress, Shopify, Framer, Next.js, Astro, plain HTML.
                </p>
                <CodeSnippet />
              </div>
            </li>

            <li className="grid md:grid-cols-[80px,1fr] gap-6 items-start">
              <span className="font-mono text-[13px] tracking-widest text-muted pt-2">02 / GROUND</span>
              <div>
                <h3 className="serif text-3xl mb-4 text-cream">Index your surface</h3>
                <p className="text-cream/70 max-w-2xl">
                  Sitemap-aware crawler (up to 25 URLs per ingest), chunk-and-embed with Xenova/nomic-embed into a per-tenant vector store. Or paste a structured company-profile JSON directly. The agent is grounded — no hallucinations.
                </p>
              </div>
            </li>

            <li className="grid md:grid-cols-[80px,1fr] gap-6 items-start">
              <span className="font-mono text-[13px] tracking-widest text-muted pt-2">03 / HOOK</span>
              <div>
                <h3 className="serif text-3xl mb-4 text-cream">Wire your action handlers</h3>
                <p className="text-cream/70 max-w-2xl mb-6">
                  ZHOLY dispatches <code className="text-cyan font-mono text-[13px]">zro:action</code> CustomEvents — navigate, scroll, highlight, fill-form, click, submit, book. Your code listens and decides what to execute. The agent gets the conversation; you keep the keys to your app.
                </p>
                <Link href="#flagship" className="btn btn-cyan">
                  See the flagship <span className="btn-arrow">→</span>
                </Link>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* TRY IT */}
      <section id="try" className="section relative overflow-hidden">
        <div className="aurora aurora-amber" />
        <div className="grain" />
        <div className="wrap relative">
          <p className="label mb-6">[ Try it ]</p>
          <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream mb-12 max-w-2xl">
            Watch it act on this page.
          </h2>

          <div className="grid lg:grid-cols-[1fr,1.2fr] gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="font-mono text-[11px] tracking-widest text-muted mb-3">
                TAP THE ORB · OR TYPE IN THE PANEL
              </p>
              <div className="text-muted text-3xl leading-none mb-6 font-mono">
                - - - - &gt;<br />
                <span className="opacity-60">- - - - &gt;</span>
              </div>
              <p className="text-cream/70 max-w-md mb-6">
                Tap the orb, allow the microphone, then ask:
              </p>
              <ul className="space-y-2 text-cream/85 font-mono text-sm">
                <li>· &quot;Scroll to pricing.&quot;</li>
                <li>· &quot;Highlight the SOVEREIGN card.&quot;</li>
                <li>· &quot;What languages do you support?&quot;</li>
                <li>· &quot;Take me to the FAQ.&quot;</li>
              </ul>
              <p className="text-cream/50 text-xs mt-6 font-mono tracking-widest">
                INTERRUPT MID-SENTENCE · OR TYPE INSTEAD
              </p>
            </div>
            <div className="order-1 lg:order-2 grid place-items-center">
              <div className="relative p-6 border-2 border-cyan/60 rounded-3xl">
                <Orb size={320} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <AlpineAccent />

      {/* DASHBOARD */}
      <section id="dashboard" className="section">
        <div className="wrap">
          <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
            <p className="label">[ The dashboard ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-3xl">
              Every conversation.<br />Every action. Every transcript.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                t: "Full transcripts",
                p: "Turn-by-turn in Postgres. Searchable, filterable, exportable. Audio is in-memory unless you opt in to call recording.",
              },
              {
                t: "Action ledger",
                p: "Every dispatched zro:action event logged with target, payload, and the handler outcome. Audit what the agent did and what your code did with it.",
              },
              {
                t: "Knowledge tab",
                p: "See exactly what got indexed, the chunk count per page, which snippet was retrieved for each answer. No black box.",
              },
              {
                t: "Agent config",
                p: "Voice, persona prompt, refusal scope, languages enabled, camera vision on/off, allowed action types — per agent, per surface.",
              },
            ].map((c) => (
              <div key={c.t} className="card-ink">
                <h3 className="text-cream font-medium mb-2">{c.t}</h3>
                <p className="text-cream/65 text-sm leading-relaxed">{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AlpineAccent />

      <EdgeBento />

      <AlpineAccent />

      <section id="pricing" className="section">
        <div className="wrap">
          <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
            <p className="label">[ Pricing ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-2xl">
              Local. Cloud. Sovereign.
            </h2>
          </div>
          <PricingTable />
        </div>
      </section>

      <AlpineAccent />

      <section id="faq" className="section">
        <div className="wrap grid md:grid-cols-[260px,1fr] gap-12">
          <div>
            <p className="label mb-4">[ FAQ ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream">
              Common questions.
            </h2>
            <p className="text-cream/65 mt-4 max-w-xs text-sm leading-relaxed">
              Action dispatch, vision, RAG, languages, self-hosting, GDPR — all answered.
            </p>
          </div>
          <FAQ />
        </div>
      </section>

      {/* FINAL CTA — new tagline */}
      <section className="relative section overflow-hidden">
        <div className="aurora" />
        <div className="grain" />
        <div className="wrap relative text-center">
          <p className="label mb-6 justify-center">[ Ready ]</p>
          <h2 className="serif text-[56px] sm:text-[100px] leading-[0.96] tracking-tightest text-cream max-w-4xl mx-auto">
            Interfaces<br />
            <span className="text-cyan italic" style={{ fontStyle: "italic" }}>
              that act.
            </span>
          </h2>
          <p className="mt-6 text-lg text-cream/75 max-w-2xl mx-auto">
            ZHOLY automates the repetitive interaction layer — so your team focuses on the conversations that matter.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link href="/signup" className="btn btn-cyan">
              Start free <span className="btn-arrow">→</span>
            </Link>
            <Link href="#flagship" className="btn btn-ghost">
              See the flagship
            </Link>
          </div>
          <p className="mt-6 font-mono text-[11px] tracking-widest text-muted">
            FREE TIER · NO CREDIT CARD · LAUNCH IN 2 MIN
          </p>
        </div>
      </section>

      <Footer />
      <SalesBotWidget />
    </>
  );
}
