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

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section id="hero" className="relative pt-40 pb-32 overflow-hidden">
        <div className="aurora" />
        <div className="grain" />
        <div className="wrap relative">
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 items-center">
            <div>
              <p className="label mb-6">[ Voice AI for any website ]</p>
              <h1 className="serif text-[56px] sm:text-[80px] leading-[0.95] tracking-tightest text-cream">
                Your website<br />finally <em className="text-cyan not-italic" style={{ fontStyle: "italic" }}>speaks.</em>
              </h1>
              <p className="mt-6 text-lg text-cream/70 max-w-xl leading-relaxed">
                One script tag turns any site into a conversation. ZHOLY talks to your visitors, sees the page, scrolls and highlights as it answers, books appointments, captures leads, switches language mid-call — in 30+ languages, 24/7. Open-source. Swiss-sovereign.
              </p>
              <div className="mt-10 flex flex-wrap gap-3 items-center">
                <Link href="/signup" className="btn btn-cyan">Start free <span className="btn-arrow">→</span></Link>
                <Link href="#try" className="btn btn-ghost">Try it live</Link>
                <span className="text-xs font-mono tracking-widest text-muted ml-2">NO CREDIT CARD · LAUNCH IN 2 MIN</span>
              </div>
            </div>

            <div className="relative h-[460px] flex flex-col items-center justify-center gap-6">
              <Orb size={340} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(76,233,233,0.85)",
                  fontFamily: "var(--font-satoshi, sans-serif)",
                }}>
                  Tap to talk
                </span>
                <span style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "var(--font-satoshi, sans-serif)",
                }}>
                  Click the orb to start a voice session
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* SWISS TRUST STRIP — flag + compliance badges, prominent */}
      <TrustStrip />

      {/* PROBLEM */}
      <section id="problem" className="section">
        <div className="wrap grid md:grid-cols-[260px,1fr] gap-12">
          <p className="label">[ The problem ]</p>
          <div>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-3xl">
              Your website is a brochure.<br />
              <span className="text-muted">ZHOLY makes it a conversation.</span>
            </h2>
            <div className="mt-10 grid md:grid-cols-2 gap-10 text-cream/70 text-base leading-relaxed">
              <p>
                97% of visitors leave without saying a word. Forms feel like paperwork. Chatbots feel like quizzes. The only person who could actually answer their question — your salesperson — isn&apos;t online at 11pm in São Paulo.
              </p>
              <p>
                <span className="text-cream">With ZHOLY, your site talks back.</span> A visitor lands, taps the orb, and gets answers from a voice that knows your product, your pricing, your booking calendar, your FAQ — in their language, on every page, instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap"><div className="hairline" /></div>

      {/* PRODUCT */}
      <section id="product" className="section">
        <div className="wrap">
          <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
            <p className="label">[ The product ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-2xl">
              One embed.<br />A full sales motion.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                t: "Speaks for your brand",
                p: "On install we crawl your site, embed every page into a per-tenant vector store, and ground the agent in your real content. No hallucinations. The voice is yours — choose from 50+ studio presets or clone your own from a short reference clip.",
              },
              {
                n: "02",
                t: "Navigates in real time",
                p: "When a visitor asks where to book, the agent says “let me show you” and physically scrolls to the calendar — highlighting, expanding, opening the right tab. Conversation and DOM stay in lockstep, with zro:action events your code can hook.",
              },
              {
                n: "03",
                t: "Captures and converts",
                p: "Reads intent, captures name + email + context mid-call, books appointments via Cal.com / Calendly / Google Calendar, fires webhooks to your CRM, and drops the full transcript in your dashboard.",
              },
            ].map((c) => (
              <div key={c.n} className="card-ink">
                <span className="font-mono text-[11px] tracking-widest text-cyan">{c.n}</span>
                <h3 className="serif text-[28px] mt-3 mb-3 leading-tight">{c.t}</h3>
                <p className="text-cream/70 text-sm leading-relaxed">{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap"><div className="hairline" /></div>

      {/* HOW IT WORKS */}
      <section id="how" className="section">
        <div className="wrap">
          <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
            <p className="label">[ How it works ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-2xl">
              Live on your site<br />in three steps.
            </h2>
          </div>

          <ol className="space-y-12 max-w-4xl">
            <li className="grid md:grid-cols-[80px,1fr] gap-6 items-start">
              <span className="font-mono text-[13px] tracking-widest text-muted pt-2">01 / PASTE</span>
              <div>
                <h3 className="serif text-3xl mb-4 text-cream">Paste your embed snippet</h3>
                <p className="text-cream/70 mb-6 max-w-2xl">Drop one line into the &lt;head&gt; of your site. Same script tag works on Webflow, WordPress, Shopify, Framer, Squarespace, Next.js, anything that renders HTML.</p>
                <CodeSnippet />
              </div>
            </li>

            <li className="grid md:grid-cols-[80px,1fr] gap-6 items-start">
              <span className="font-mono text-[13px] tracking-widest text-muted pt-2">02 / INDEX</span>
              <div>
                <h3 className="serif text-3xl mb-4 text-cream">We index your site</h3>
                <p className="text-cream/70 max-w-2xl">Our crawler reads every page (sitemap-aware), strips the chrome, embeds the content into a private vector store keyed to your tenant ID. Typical site: 2 minutes. Re-indexes nightly or on webhook.</p>
              </div>
            </li>

            <li className="grid md:grid-cols-[80px,1fr] gap-6 items-start">
              <span className="font-mono text-[13px] tracking-widest text-muted pt-2">03 / GO LIVE</span>
              <div>
                <h3 className="serif text-3xl mb-4 text-cream">Your agent goes live</h3>
                <p className="text-cream/70 max-w-2xl mb-6">The ZHOLY orb appears on your site. Visitor taps, mic permission prompt, then the agent listens. Sub-second first reply on a good connection. Talks. Scrolls. Books. Captures leads. Interruptible like a real call.</p>
                <Link href="#try" className="btn btn-cyan">Try the agent now <span className="btn-arrow">→</span></Link>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* TRY IT — DEMO */}
      <section id="try" className="section relative overflow-hidden">
        <div className="aurora aurora-amber" />
        <div className="grain" />
        <div className="wrap relative">
          <p className="label mb-6">[ Try it ]</p>
          <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream mb-12 max-w-2xl">
            Watch it work on a real site.
          </h2>

          <div className="grid lg:grid-cols-[1fr,1.2fr] gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="font-mono text-[11px] tracking-widest text-muted mb-3">TAP THE ORB</p>
              <div className="text-muted text-3xl leading-none mb-6 font-mono">- - - - &gt;<br /><span className="opacity-60">- - - - &gt;</span></div>
              <p className="text-cream/70 max-w-md mb-6">
                Tap the <strong className="text-cream font-semibold">ZHOLY orb</strong>, allow the microphone, then ask:
              </p>
              <ul className="space-y-2 text-cream/85 font-mono text-sm">
                <li>· &quot;How does pricing work?&quot;</li>
                <li>· &quot;Book me a demo for next Tuesday.&quot;</li>
                <li>· &quot;Show me the dashboard features.&quot;</li>
                <li>· &quot;Compare Starter and Growth for me.&quot;</li>
              </ul>
              <p className="text-cream/50 text-xs mt-6 font-mono tracking-widest">INTERRUPT IT MID-SENTENCE — IT&apos;LL STOP AND LISTEN</p>
            </div>
            <div className="order-1 lg:order-2 grid place-items-center">
              <div className="relative p-6 border-2 border-cyan/60 rounded-3xl">
                <Orb size={320} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap"><div className="hairline" /></div>

      {/* DASHBOARD */}
      <section id="dashboard" className="section">
        <div className="wrap">
          <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
            <p className="label">[ The dashboard ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-3xl">
              Every conversation.<br />Every lead. Every signal.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "Full transcripts", p: "Every call, fully transcribed and searchable. Filter by intent, sentiment, country, page. Audio kept only when you opt in to recording." },
              { t: "Lead capture", p: "Names, emails, phones, companies. Auto-pushed to your CRM, Slack, or CSV export. HubSpot, Salesforce, Pipedrive, Attio, Notion, Airtable, Google Sheets." },
              { t: "Visitor analytics", p: "Country, device, browser, OS, referrer, pages viewed before the call, time-on-call, conversion. See exactly which RAG chunk was retrieved for every answer." },
              { t: "Returning memory", p: "Agent recognizes a returning visitor and picks up the conversation. Cross-device when they identify themselves. Retention window you control." },
            ].map((c) => (
              <div key={c.t} className="card-ink">
                <h3 className="text-cream font-medium mb-2">{c.t}</h3>
                <p className="text-cream/65 text-sm leading-relaxed">{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap"><div className="hairline" /></div>

      {/* THE EDGE — what ZHOLY does that the rest don't */}
      <section id="edge" className="section">
        <div className="wrap">
          <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
            <p className="label">[ The edge ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-3xl">
              Things a generic voice<br />chatbot can&apos;t do.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                t: "Sees the page",
                p: "Every utterance, the agent receives a semantic snapshot of the DOM — visible sections, headings, prices, buttons. It answers about what's actually on screen, not what was there at page-load.",
                tag: "DOM SEMANTICS",
              },
              {
                t: "Acts on the page",
                p: "Smooth-scrolls to the right anchor, pulse-highlights the element it's talking about, opens tabs and accordions. Every action emits a zro:action event your code can hook for deep integrations.",
                tag: "DOM ACTION",
              },
              {
                t: "Camera vision",
                p: "Opt-in camera mode runs a local moondream vision model. Visitor points at a product, a shelf, an error screen — the agent describes it in your catalogue's language. No frame leaves the host you choose.",
                tag: "VISION",
              },
              {
                t: "Hears how they feel",
                p: "Real-time emotion detection routes the agent's tone — slows down, lowers pitch, leads with empathy when frustrated; picks up energy when excited. Their mood, not yours.",
                tag: "EMOTION",
              },
              {
                t: "Sounds like you",
                p: "50+ studio voices, every one of them naturally human. Clone your founder's voice from a short reference clip. Switch voices live from the dashboard — none of the robotic TTS of a 2018 chatbot.",
                tag: "VOICE",
              },
              {
                t: "Switches language mid-call",
                p: "Visitor starts in English, slips into French — the agent follows without a reset. Auto-detect runs per utterance. 30+ languages with native STT + TTS pairs.",
                tag: "MULTILINGUAL",
              },
              {
                t: "Interrupt-friendly",
                p: "Barge-in detection cuts TTS the moment the visitor starts talking. Push-to-talk mode available for noisy environments. The conversation breathes like a real one.",
                tag: "BARGE-IN",
              },
              {
                t: "Books and converts",
                p: "Cal.com, Calendly, Google Calendar — the agent books the meeting in-call and emails the confirm. CRM webhooks fire to HubSpot, Salesforce, Pipedrive, Attio, Notion, Airtable, Google Sheets.",
                tag: "BOOKING",
              },
              {
                t: "Self-host or sovereign",
                p: "Swiss-hosted by default, EU residency on request, on-prem with Docker on enterprise. Voice biometrics are GDPR Article 9 — most competitors send audio to US clouds. We don't have to.",
                tag: "SOVEREIGN",
              },
              {
                t: "No vendor lock-in",
                p: "Every layer is auditable and swappable — voices, models, languages, hosting region. ZHOLY is open-source; the embed is a plain ES module; the gateway is Node.js + Postgres you can audit.",
                tag: "OPEN",
              },
              {
                t: "Developer hooks",
                p: "window.ZRO_VOICE_EMBED_API (toggle / start / stop) for custom triggers. zro:action CustomEvents on the DOM. Per-tenant config via window.ZRO_COMPANY_PROFILE. No proprietary SDK.",
                tag: "HOOKS",
              },
              {
                t: "One login across ZHOLY",
                p: "Same account works across the ZHOLY ecosystem. Single sign-on, single billing, single support. Grow into the family without re-onboarding.",
                tag: "SSO",
              },
            ].map((c) => (
              <div key={c.t} className="card-ink">
                <span className="font-mono text-[11px] tracking-widest text-cyan">{c.tag}</span>
                <h3 className="serif text-[24px] mt-3 mb-3 leading-tight">{c.t}</h3>
                <p className="text-cream/70 text-sm leading-relaxed">{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap"><div className="hairline" /></div>

      {/* PRICING */}
      <section id="pricing" className="section">
        <div className="wrap">
          <div className="grid md:grid-cols-[260px,1fr] gap-12 mb-16">
            <p className="label">[ Pricing ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream max-w-2xl">
              Simple pricing.<br />No surprises.
            </h2>
          </div>

          <PricingTable />
        </div>
      </section>

      <div className="wrap"><div className="hairline" /></div>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="wrap grid md:grid-cols-[260px,1fr] gap-12">
          <div>
            <p className="label mb-4">[ FAQ ]</p>
            <h2 className="serif text-[44px] sm:text-[56px] leading-[1.05] tracking-tighter text-cream">Common questions.</h2>
            <p className="text-cream/65 mt-4 max-w-xs text-sm leading-relaxed">Setup, voices, languages, vision, booking, lead capture, self-hosting — all answered.</p>
          </div>
          <FAQ />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative section overflow-hidden">
        <div className="aurora" />
        <div className="grain" />
        <div className="wrap relative text-center">
          <p className="label mb-6 justify-center">[ Ready to talk ]</p>
          <h2 className="serif text-[56px] sm:text-[88px] leading-[0.98] tracking-tightest text-cream max-w-4xl mx-auto">
            Your next customer is<br />already on your site.
          </h2>
          <p className="mt-6 text-lg text-cream/75">Give them someone to talk to.</p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link href="/signup" className="btn btn-cyan">Start free <span className="btn-arrow">→</span></Link>
            <Link href="#try" className="btn btn-ghost">Try it live</Link>
          </div>
          <p className="mt-6 font-mono text-[11px] tracking-widest text-muted">FREE PLAN · NO CREDIT CARD · LAUNCH IN 2 MIN</p>
        </div>
      </section>

      <Footer />
      <SalesBotWidget />
    </>
  );
}
