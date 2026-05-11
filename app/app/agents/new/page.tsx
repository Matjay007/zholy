"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* ── Constants ── */
const LANGUAGES = [
  { code: "en", label: "English" }, { code: "es", label: "Spanish" },
  { code: "fr", label: "French" }, { code: "de", label: "German" },
  { code: "it", label: "Italian" }, { code: "pt", label: "Portuguese" },
  { code: "nl", label: "Dutch" }, { code: "pl", label: "Polish" },
  { code: "ru", label: "Russian" }, { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" }, { code: "zh", label: "Chinese (Mandarin)" },
  { code: "ar", label: "Arabic" }, { code: "hi", label: "Hindi" },
  { code: "tr", label: "Turkish" }, { code: "sv", label: "Swedish" },
  { code: "da", label: "Danish" }, { code: "no", label: "Norwegian" },
  { code: "fi", label: "Finnish" }, { code: "cs", label: "Czech" },
];

const VOICES = [
  { provider: "kokoro", id: "af_heart",       name: "Heart",   gender: "female",  desc: "Warm & natural",         badge: "FREE",  badgeColor: "#059669" },
  { provider: "kokoro", id: "af_bella",       name: "Bella",   gender: "female",  desc: "Friendly & bright",      badge: "FREE",  badgeColor: "#059669" },
  { provider: "kokoro", id: "am_michael",     name: "Michael", gender: "male",    desc: "Clear & confident",      badge: "FREE",  badgeColor: "#059669" },
  { provider: "openai", id: "nova",           name: "Nova",    gender: "female",  desc: "Warm, energetic flow",   badge: "CLOUD", badgeColor: "#D97706" },
  { provider: "openai", id: "alloy",          name: "Alloy",   gender: "neutral", desc: "Balanced, professional", badge: "CLOUD", badgeColor: "#D97706" },
  { provider: "openai", id: "shimmer",        name: "Shimmer", gender: "female",  desc: "Calm & reassuring",      badge: "CLOUD", badgeColor: "#D97706" },
  { provider: "openai", id: "echo",           name: "Echo",    gender: "male",    desc: "Deep & authoritative",   badge: "CLOUD", badgeColor: "#D97706" },
  { provider: "openai", id: "fable",          name: "Fable",   gender: "male",    desc: "Expressive & engaging",  badge: "CLOUD", badgeColor: "#D97706" },
  { provider: "openai", id: "onyx",           name: "Onyx",    gender: "male",    desc: "Rich & compelling",      badge: "CLOUD", badgeColor: "#D97706" },
  { provider: "deepgram", id: "aura-asteria-en", name: "Asteria", gender: "female", desc: "Conversational & natural", badge: "CLOUD", badgeColor: "#D97706" },
  { provider: "deepgram", id: "aura-zeus-en",    name: "Zeus",    gender: "male",   desc: "Strong & decisive",        badge: "CLOUD", badgeColor: "#D97706" },
  { provider: "deepgram", id: "aura-luna-en",    name: "Luna",    gender: "female", desc: "Soft & empathetic",        badge: "CLOUD", badgeColor: "#D97706" },
];

const CLOUD_MODELS = [
  { id: "gpt-4o-mini",       name: "GPT-4o Mini",        desc: "Fast & efficient — best for most agents",      cost: "~0.2¢/min", badge: "FREE",    badgeColor: "#059669" },
  { id: "gpt-4o",            name: "GPT-4o",              desc: "Top reasoning, great for demos",               cost: "~1.2¢/min", badge: "STARTER", badgeColor: "#D97706" },
  { id: "claude-haiku-3-5",  name: "Claude Haiku 3.5",   desc: "Anthropic's fastest, detail-oriented",         cost: "~0.8¢/min", badge: "STARTER", badgeColor: "#D97706" },
  { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5",  desc: "Best reasoning + long context",                cost: "~3¢/min",   badge: "GROWTH",  badgeColor: "#7C3AED" },
  { id: "gemini-2-flash",    name: "Gemini 2.0 Flash",   desc: "Google's speed champion, multilingual",        cost: "~0.6¢/min", badge: "STARTER", badgeColor: "#D97706" },
];

const LOCAL_MODELS = [
  { id: "qwen3:0.6b",  name: "Qwen 3 · 0.6B",  desc: "Ultra-fast — runs on any machine",       size: "~400 MB", tag: "Ultra-light" },
  { id: "qwen3:8b",    name: "Qwen 3 · 8B",    desc: "Excellent quality, strong multilingual",  size: "~5 GB",   tag: "Recommended" },
  { id: "dolphin3:8b", name: "Dolphin 3 · 8B", desc: "Uncensored, ideal for sales agents",      size: "~5 GB",   tag: "Sales" },
  { id: "llava:7b",    name: "LLaVA · 7B",     desc: "Vision-capable — required for Video mode", size: "~4.5 GB", tag: "Video" },
  { id: "gemma4:26b",  name: "Gemma 4 · 26B",  desc: "Google's best open-weight model",         size: "~16 GB",  tag: "High quality" },
];

const GOALS = [
  { id: "answer_questions",  label: "Answer questions"  },
  { id: "capture_leads",     label: "Capture leads"     },
  { id: "reduce_support",    label: "Reduce support"    },
  { id: "demo_product",      label: "Demo product"      },
  { id: "close_sales",       label: "Close sales"       },
  { id: "book_appointments", label: "Book appointments" },
];

const POSITIONS     = [{ id: "bottom-right", label: "Bottom Right" }, { id: "bottom-left", label: "Bottom Left" }, { id: "bottom-center", label: "Bottom Center" }];
const WIDGET_COLORS = ["#4CE9E9", "#F77C27", "#7B5CFF", "#E5484D", "#22C55E", "#3B82F6", "#F59E0B", "#EC4899"];
const STEP_LABELS   = ["Site", "Mode", "Language", "Voice", "Brain", "Brand", "Widget", "Launch"];
const TOTAL_STEPS   = 8;

interface FormState {
  site_url: string; mode: "voice" | "video" | ""; language: string; auto_language: boolean;
  voice_provider: string; voice_id: string; voice_name: string; voiceSearch: string;
  brain_tab: "cloud" | "local"; llm_model: string; agent_name: string; persona: string;
  goals: string[]; widget_position: string; widget_label: string; widget_color: string;
  push_to_talk: boolean; brand_name: string;
}

/* ── Design tokens — warm premium light ── */
const D = {
  page:    "#F5F4F1",   /* warm off-white bg */
  card:    "#FFFFFF",   /* card surface */
  subtle:  "#EFEDE9",   /* inset / subtle bg */
  border:  "#E3E0DA",   /* borders */
  borderFocus: "#4CE9E9",
  cyan:    "#0ABFBF",   /* darker cyan for text on light bg */
  cyanBg:  "#4CE9E9",   /* cyan for fills */
  amber:   "#D97706",
  amberBg: "#F77C27",
  green:   "#059669",
  red:     "#DC2626",
  text:    "#111118",
  text2:   "#6B6977",
  text3:   "#A09DAA",
  white:   "#FFFFFF",
};

/* ── Animated waveform (playing indicator) ── */
function WaveIcon({ color = D.cyanBg }: { color?: string }) {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" style={{ display: "block" }}>
      <style>{`
        @keyframes wv1{0%,100%{height:3px;y:5.5px}50%{height:13px;y:0px}}
        @keyframes wv2{0%,100%{height:7px;y:3.5px}50%{height:5px;y:4.5px}}
        @keyframes wv3{0%,100%{height:11px;y:1.5px}50%{height:3px;y:5.5px}}
        @keyframes wv4{0%,100%{height:5px;y:4.5px}50%{height:11px;y:1.5px}}
        @keyframes wv5{0%,100%{height:3px;y:5.5px}50%{height:9px;y:2.5px}}
        .wv1{animation:wv1 .7s ease-in-out infinite}
        .wv2{animation:wv2 .7s ease-in-out infinite .1s}
        .wv3{animation:wv3 .7s ease-in-out infinite .2s}
        .wv4{animation:wv4 .7s ease-in-out infinite .3s}
        .wv5{animation:wv5 .7s ease-in-out infinite .4s}
      `}</style>
      <rect className="wv1" x="0"    y="5.5" width="2.5" height="3"  rx="1.25" fill={color}/>
      <rect className="wv2" x="3.75" y="3.5" width="2.5" height="7"  rx="1.25" fill={color}/>
      <rect className="wv3" x="7.5"  y="1.5" width="2.5" height="11" rx="1.25" fill={color}/>
      <rect className="wv4" x="11.25"y="4.5" width="2.5" height="5"  rx="1.25" fill={color}/>
      <rect className="wv5" x="15"   y="5.5" width="2.5" height="3"  rx="1.25" fill={color}/>
    </svg>
  );
}

/* ── Small pill badge ── */
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
      background: `${color}18`, color, border: `1px solid ${color}30`,
      letterSpacing: "0.05em", flexShrink: 0,
    }}>{label}</span>
  );
}

/* ── Differentiator callout strip ── */
function Differentiator({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
      background: `${D.cyanBg}12`, color: D.cyan,
      border: `1px solid ${D.cyanBg}30`,
    }}>
      {icon}
      {text}
    </div>
  );
}

export default function NewAgentWizard() {
  const router = useRouter();
  const [step, setStep]           = useState(1);
  const [saving, setSaving]       = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [embedSnippet, setEmbedSnippet] = useState<string | null>(null);
  const [buildStep, setBuildStep] = useState(0);
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [pulling, setPulling]     = useState<string | null>(null);
  const [pullDone, setPullDone]   = useState<string[]>([]);

  const [form, setForm] = useState<FormState>({
    site_url: "", mode: "", language: "en", auto_language: true,
    voice_provider: "kokoro", voice_id: "af_heart", voice_name: "Heart",
    voiceSearch: "", brain_tab: "cloud", llm_model: "gpt-4o-mini",
    agent_name: "", persona: "You are a helpful, friendly voice assistant for this website. Speak naturally and concisely.",
    goals: ["answer_questions"], widget_position: "bottom-right",
    widget_label: "Talk to us", widget_color: "#4CE9E9",
    push_to_talk: false, brand_name: "",
  });

  const upd = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val })), []);

  // Force light background on the app shell when this page mounts
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#F5F4F1";
    const contentEl = document.querySelector("main") as HTMLElement | null;
    const prevContent = contentEl?.style.background ?? "";
    if (contentEl) contentEl.style.background = "#F5F4F1";
    return () => {
      document.body.style.background = prev;
      if (contentEl) contentEl.style.background = prevContent;
    };
  }, []);

  useEffect(() => {
    if (step === 5)
      fetch("/api/ollama/pull").then(r => r.json()).then(d => setDownloadedModels(d.models || [])).catch(() => {});
  }, [step]);

  async function previewVoice(voice: typeof VOICES[0]) {
    if (previewingVoice === voice.id) { audioRef.current?.pause(); setPreviewingVoice(null); return; }
    setPreviewingVoice(voice.id);
    try {
      const res = await fetch("/api/tts-preview", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice_id: voice.id, provider: voice.provider }),
      });
      if (!res.ok) { setPreviewingVoice(null); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPreviewingVoice(null);
      audio.onerror = () => setPreviewingVoice(null);
      audio.play();
    } catch { setPreviewingVoice(null); }
  }

  async function pullModel(modelId: string) {
    setPulling(modelId);
    try {
      const res = await fetch("/api/ollama/pull", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelId }),
      });
      if (res.ok) { setPullDone(p => [...p, modelId]); setDownloadedModels(p => [...p, modelId]); }
    } finally { setPulling(null); }
  }

  const filteredVoices = VOICES.filter(v => {
    const q = form.voiceSearch.toLowerCase();
    return !q || v.name.toLowerCase().includes(q) || v.provider.includes(q) || v.gender.includes(q);
  });

  async function handleSubmit() {
    setSaving(true); setError(null);
    try {
      for (let i = 1; i <= 3; i++) { setBuildStep(i); await new Promise(r => setTimeout(r, 900)); }
      const res = await fetch("/api/agents", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.agent_name || "My Agent", site_url: form.site_url,
          config: {
            voice_provider: form.voice_provider, voice_id: form.voice_id, voice_name: form.voice_name,
            llm_model: form.llm_model, language: form.language, auto_language: form.auto_language,
            persona: form.persona, goals: form.goals, widget_position: form.widget_position,
            widget_label: form.widget_label, widget_color: form.widget_color,
            video_mode: form.mode === "video", push_to_talk: form.push_to_talk, brand_name: form.brand_name,
          },
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Error ${res.status}`); }
      const data = await res.json();
      setCreatedId(data.id); setEmbedSnippet(data.embed_snippet);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Unknown error"); setSaving(false); setBuildStep(0); }
  }

  function copySnippet() {
    if (!embedSnippet) return;
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const canAdvance = () => {
    if (step === 1) return form.site_url.trim().length > 0;
    if (step === 2) return form.mode !== "";
    if (step === 4) return form.voice_id.length > 0;
    if (step === 5) return form.llm_model.length > 0;
    return true;
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
    color: D.text, border: `1.5px solid ${D.border}`, background: D.white,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.15s",
  };

  const card: React.CSSProperties = {
    background: D.card, borderRadius: 14, border: `1.5px solid ${D.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  };

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        ::placeholder{color:${D.text3}}
        select option{background:${D.white};color:${D.text}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${D.border};border-radius:4px}
        input:focus,textarea:focus,select:focus{border-color:${D.cyanBg}!important;outline:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        /* Force light theme on the app shell content area for this page */
        .zrv-new-agent-page { background:${D.page} !important; color:${D.text} !important; }
        .zrv-new-agent-page * { color: inherit; }
      `}</style>

      <div className="zrv-new-agent-page" style={{
        minHeight: "100vh", background: D.page, padding: "0 40px 64px",
        fontFamily: "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
        color: D.text,
      }}>

        {/* ── Top bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 0 22px", borderBottom: `1.5px solid ${D.border}`, marginBottom: 36,
        }}>
          <button onClick={() => router.push("/app/agents")} style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            color: D.text2, fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke={D.text2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Agents
          </button>
          <span style={{ fontSize: 12, color: D.text3, fontWeight: 500, letterSpacing: "0.03em" }}>
            {step} of {TOTAL_STEPS}
          </span>
          <div style={{ width: 60 }}/>
        </div>

        {/* ── Step indicator ── */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 44, justifyContent: "center" }}>
          {STEP_LABELS.map((label, i) => {
            const idx = i + 1;
            const done   = idx < step;
            const active = idx === step;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <button onClick={() => done && setStep(idx)} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  background: "none", border: "none", cursor: done ? "pointer" : "default", padding: "0 3px",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                    transition: "all 0.2s",
                    background: done ? D.cyanBg : active ? D.text : D.border,
                    color: done ? "#fff" : active ? D.white : D.text3,
                    boxShadow: active ? `0 0 0 3px ${D.cyanBg}30` : "none",
                  }}>
                    {done ? (
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : idx}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
                    color: done ? D.cyan : active ? D.text : D.text3, transition: "color 0.2s",
                  }}>{label}</span>
                </button>
                {i < STEP_LABELS.length - 1 && (
                  <div style={{
                    width: 28, height: 1.5, marginBottom: 16,
                    background: i + 1 < step ? D.cyanBg : D.border, transition: "background 0.3s",
                  }}/>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 660, margin: "0 auto", animation: "fadeUp 0.22s ease-out" }} key={step}>

          {/* ════════════════ STEP 1 — SITE ════════════════ */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: D.cyan, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Step 1</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.1, color: D.text }}>
                What&apos;s your website?
              </h1>
              <p style={{ fontSize: 15, color: D.text2, marginBottom: 28, lineHeight: 1.6 }}>
                Your agent learns from your site automatically — up to 50 pages crawled and embedded.
              </p>

              {/* Unique callout */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 20 }}>
                <Differentiator icon={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.25"/><path d="M4 6.5h5M6.5 4v5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>} text="50-page auto-crawl, no setup" />
                <Differentiator icon={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5L8.5 5l4 .5-3 2.8.7 4-3.7-2-3.7 2 .7-4L1 5.5 5 5l1.5-3.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/></svg>} text="Live in under 2 minutes" />
              </div>

              <div style={{ position: "relative" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <circle cx="8" cy="8" r="6.5" stroke={D.text3} strokeWidth="1.25"/>
                  <path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5M1.5 8h13" stroke={D.text3} strokeWidth="1.25"/>
                </svg>
                <input type="url" placeholder="https://yourcompany.com" value={form.site_url}
                  onChange={e => upd("site_url", e.target.value)} autoFocus
                  style={{ ...inp, paddingLeft: 40, fontSize: 16, ...card, border: `1.5px solid ${D.border}`, padding: "14px 16px 14px 40px" }} />
              </div>
            </div>
          )}

          {/* ════════════════ STEP 2 — MODE ════════════════ */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: D.cyan, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Step 2</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Voice or Video?
              </h1>
              <p style={{ fontSize: 15, color: D.text2, marginBottom: 28, lineHeight: 1.6 }}>
                Choose how your agent interacts with visitors.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Voice Only */}
                {[
                  {
                    id: "voice" as const,
                    icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="9" y="2" width="8" height="13" rx="4" stroke="currentColor" strokeWidth="1.75"/><path d="M5 13c0 4.418 3.582 8 8 8s8-3.582 8-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/><line x1="13" y1="21" x2="13" y2="25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>,
                    title: "Voice Only",
                    sub: "Microphone-based interaction — works on every device, no camera needed.",
                    bullets: ["Works on any browser", "No camera permission", "Fastest to deploy", "Ideal for support & FAQs"],
                    unique: null,
                  },
                  {
                    id: "video" as const,
                    icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="2" y="6" width="16" height="13" rx="3" stroke="currentColor" strokeWidth="1.75"/><path d="M18 10.5l6-3v11l-6-3V10.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/></svg>,
                    title: "Voice + Video",
                    sub: "Visitor points their camera at anything — your agent sees it and responds.",
                    bullets: ["Real-time AI vision", "Visual + voice context", "Works for products & demos", "Camera permission required"],
                    unique: "Only ZHOLY offers live visual AI context",
                  },
                ].map(m => {
                  const sel = form.mode === m.id;
                  return (
                    <button key={m.id} onClick={() => upd("mode", m.id)}
                      style={{
                        ...card, textAlign: "left", padding: "22px 20px", cursor: "pointer",
                        borderColor: sel ? D.cyanBg : D.border, transition: "all 0.18s",
                        background: sel ? `${D.cyanBg}08` : D.card,
                        outline: "none",
                      }}>
                      <div style={{ color: sel ? D.cyan : D.text2, marginBottom: 14 }}>{m.icon}</div>
                      <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: D.text }}>{m.title}</p>
                      <p style={{ fontSize: 13, color: D.text2, marginBottom: 14, lineHeight: 1.5 }}>{m.sub}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: m.unique ? 14 : 0 }}>
                        {m.bullets.map(b => (
                          <div key={b} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: D.text2 }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <circle cx="6" cy="6" r="5" fill={sel ? `${D.cyanBg}20` : D.subtle}/>
                              <path d="M3.5 6l1.8 1.8 3.2-3.2" stroke={sel ? D.cyanBg : D.text3} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {b}
                          </div>
                        ))}
                      </div>
                      {m.unique && (
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                          background: `${D.cyanBg}15`, color: D.cyan, border: `1px solid ${D.cyanBg}35`,
                        }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1l1.2 2.5 2.8.4-2 1.9.5 2.8L5 7.2 2.5 8.6l.5-2.8L1 3.9l2.8-.4L5 1Z" fill={D.cyanBg}/></svg>
                          {m.unique}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════ STEP 3 — LANGUAGE ════════════════ */}
          {step === 3 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: D.cyan, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Step 3</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Choose a language.</h1>
              <p style={{ fontSize: 15, color: D.text2, marginBottom: 28, lineHeight: 1.6 }}>
                Your agent&apos;s default language — with the option to auto-detect and switch mid-call.
              </p>

              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <Differentiator icon={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M6.5 2v9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.25"/></svg>} text="20 languages supported" />
                <Differentiator icon={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5C3 2 10 2 11.5 6.5M1.5 6.5C3 11 10 11 11.5 6.5M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>} text="Auto-switches mid-call" />
              </div>

              <button onClick={() => upd("auto_language", !form.auto_language)}
                style={{
                  ...card, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 20px", cursor: "pointer", textAlign: "left",
                  borderColor: form.auto_language ? D.cyanBg : D.border,
                  background: form.auto_language ? `${D.cyanBg}06` : D.card, marginBottom: 18,
                }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: D.text, marginBottom: 3 }}>Auto-detect visitor language</p>
                  <p style={{ fontSize: 12, color: D.text2 }}>Detects & switches languages mid-call — included free</p>
                </div>
                <div style={{
                  width: 42, height: 23, borderRadius: 99, position: "relative", flexShrink: 0, marginLeft: 16,
                  background: form.auto_language ? D.cyanBg : D.border, transition: "background 0.2s",
                }}>
                  <div style={{
                    position: "absolute", top: 2.5, left: form.auto_language ? 21 : 2.5,
                    width: 18, height: 18, borderRadius: "50%", background: D.white,
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}/>
                </div>
              </button>

              <label style={{ fontSize: 11, fontWeight: 600, color: D.text2, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Default Language</label>
              <select value={form.language} onChange={e => upd("language", e.target.value)} style={{ ...inp }}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          )}

          {/* ════════════════ STEP 4 — VOICE ════════════════ */}
          {step === 4 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: D.cyan, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Step 4</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Pick a voice.</h1>
              <p style={{ fontSize: 15, color: D.text2, marginBottom: 20, lineHeight: 1.6 }}>
                Press play on any voice to preview it. FREE voices run on your own server — zero cost.
              </p>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 20 }}>
                <Differentiator icon={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5v10M2 4l4.5 2L11 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>} text="Self-hosted Kokoro TTS — no API fees" />
                <Differentiator icon={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="2" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.25"/><path d="M5 5.5h3M5 7.5h2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>} text="3 providers: Kokoro · OpenAI · Deepgram" />
              </div>

              <div style={{ position: "relative", marginBottom: 14 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <circle cx="6" cy="6" r="5" stroke={D.text3} strokeWidth="1.25"/>
                  <path d="M10 10l2.5 2.5" stroke={D.text3} strokeWidth="1.25" strokeLinecap="round"/>
                </svg>
                <input type="text" placeholder="Search voices…" value={form.voiceSearch}
                  onChange={e => upd("voiceSearch", e.target.value)}
                  style={{ ...inp, paddingLeft: 36 }}/>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto", paddingRight: 2 }}>
                {filteredVoices.map(v => {
                  const sel = form.voice_id === v.id;
                  const playing = previewingVoice === v.id;
                  return (
                    <div key={v.id} onClick={() => { upd("voice_provider", v.provider); upd("voice_id", v.id); upd("voice_name", v.name); }}
                      style={{
                        ...card, display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", cursor: "pointer", transition: "all 0.15s",
                        borderColor: sel ? D.cyanBg : D.border,
                        background: sel ? `${D.cyanBg}06` : D.card,
                      }}>
                      <button onClick={e => { e.stopPropagation(); previewVoice(v); }}
                        style={{
                          width: 38, height: 38, borderRadius: "50%", border: "none", flexShrink: 0,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.15s",
                          background: playing ? `${D.cyanBg}20` : D.subtle,
                        }}>
                        {playing
                          ? <WaveIcon color={D.cyanBg}/>
                          : <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><path d="M1 1.5L10 6.5L1 11.5V1.5Z" fill={D.text2}/></svg>
                        }
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: D.text }}>{v.name}</span>
                          <Badge label={v.badge} color={v.badgeColor}/>
                          <span style={{ fontSize: 11, color: D.text3 }}>{v.gender}</span>
                        </div>
                        <p style={{ fontSize: 12, color: D.text2 }}>{v.desc}</p>
                      </div>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${sel ? D.cyanBg : D.border}`,
                        background: sel ? D.cyanBg : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                      }}>
                        {sel && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════ STEP 5 — BRAIN ════════════════ */}
          {step === 5 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: D.cyan, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Step 5</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Choose a brain.</h1>
              <p style={{ fontSize: 15, color: D.text2, marginBottom: 20, lineHeight: 1.6 }}>
                Pick the AI model that powers your agent. All run on ZHOLY infrastructure — no setup needed.
              </p>

              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <Differentiator icon={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="4" width="9" height="7" rx="2" stroke="currentColor" strokeWidth="1.25"/><path d="M5 4V3a1.5 1.5 0 013 0v1" stroke="currentColor" strokeWidth="1.25"/></svg>} text="Switch models anytime" />
                <Differentiator icon={<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5L8.5 5l4 .5-3 2.8.7 4L6.5 10l-3.7 2.3.7-4L.5 5.5 4.5 5l2-3.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/></svg>} text="GPT-4o · Claude · Gemini" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CLOUD_MODELS.map(m => {
                  const locked = m.badge !== "FREE";
                  const sel = form.llm_model === m.id;
                  return (
                    <button key={m.id} onClick={() => !locked && upd("llm_model", m.id)}
                      style={{
                        ...card, textAlign: "left", padding: "14px 16px", width: "100%", fontFamily: "inherit",
                        cursor: locked ? "not-allowed" : "pointer", transition: "all 0.15s",
                        borderColor: sel ? D.cyanBg : D.border, background: sel ? `${D.cyanBg}06` : D.card,
                        opacity: locked ? 0.55 : 1, outline: "none",
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: D.text, marginBottom: 2 }}>{m.name}</p>
                          <p style={{ fontSize: 12, color: D.text2 }}>{m.desc}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, color: D.text3, fontFamily: "monospace" }}>{m.cost}</span>
                          <Badge label={m.badge} color={m.badgeColor}/>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Self-hosted note */}
              <div style={{ marginTop: 16, padding: "11px 14px", borderRadius: 10, background: D.subtle, border: `1px solid ${D.border}` }}>
                <p style={{ fontSize: 12, color: D.text2, lineHeight: 1.6, margin: 0 }}>
                  🖥 <strong style={{ color: D.text }}>Self-hosted?</strong> Connect your own Ollama instance under <strong>Settings → Advanced</strong> after setup. One click to download any model — ZHOLY detects your server capacity automatically.
                </p>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 6 — BRAND ════════════════ */}
          {step === 6 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: D.cyan, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Step 6</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Define your brand.</h1>
              <p style={{ fontSize: 15, color: D.text2, marginBottom: 28, lineHeight: 1.6 }}>
                Give your agent a name, personality, and mission.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: D.text2, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Agent Name</label>
                  <input type="text" placeholder="Aria, Max, Sage…" value={form.agent_name}
                    onChange={e => upd("agent_name", e.target.value)} style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: D.text2, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Company Name</label>
                  <input type="text" placeholder="Your company name" value={form.brand_name}
                    onChange={e => upd("brand_name", e.target.value)} style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: D.text2, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Persona & Instructions</label>
                  <textarea rows={4} value={form.persona} onChange={e => upd("persona", e.target.value)}
                    style={{ ...inp, resize: "none" as const, lineHeight: 1.6 }}
                    placeholder="You are a helpful, friendly voice assistant…"/>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: D.text2, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Goals</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {GOALS.map(g => {
                      const active = form.goals.includes(g.id);
                      return (
                        <button key={g.id}
                          onClick={() => upd("goals", active ? form.goals.filter(x => x !== g.id) : [...form.goals, g.id])}
                          style={{
                            ...card, display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                            cursor: "pointer", fontFamily: "inherit", outline: "none",
                            borderColor: active ? D.cyanBg : D.border,
                            background: active ? `${D.cyanBg}06` : D.card,
                            fontSize: 13, fontWeight: 500, color: active ? D.text : D.text2, transition: "all 0.15s",
                          }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                            border: `2px solid ${active ? D.cyanBg : D.border}`,
                            background: active ? D.cyanBg : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                          }}>
                            {active && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 7 — WIDGET ════════════════ */}
          {step === 7 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: D.cyan, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Step 7</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Design your widget.</h1>
              <p style={{ fontSize: 15, color: D.text2, marginBottom: 28, lineHeight: 1.6 }}>
                Customize how the button looks on your site.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: D.text2, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>Position</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {POSITIONS.map(p => {
                      const sel = form.widget_position === p.id;
                      return (
                        <button key={p.id} onClick={() => upd("widget_position", p.id)}
                          style={{
                            ...card, padding: "10px 0", cursor: "pointer", fontSize: 13, fontWeight: 500,
                            color: sel ? D.text : D.text2, fontFamily: "inherit", outline: "none",
                            borderColor: sel ? D.cyanBg : D.border, background: sel ? `${D.cyanBg}06` : D.card,
                            transition: "all 0.15s",
                          }}>{p.label}</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: D.text2, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Button Label</label>
                  <input type="text" value={form.widget_label} onChange={e => upd("widget_label", e.target.value)}
                    style={inp} placeholder="Talk to us"/>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: D.text2, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Accent Color</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {WIDGET_COLORS.map(c => (
                      <button key={c} onClick={() => upd("widget_color", c)}
                        style={{
                          width: 32, height: 32, borderRadius: "50%", cursor: "pointer", background: c, border: "none",
                          outline: form.widget_color === c ? `3px solid ${c}` : "none", outlineOffset: 3,
                          transform: form.widget_color === c ? "scale(1.15)" : "scale(1)", transition: "all 0.15s",
                        }}/>
                    ))}
                  </div>
                </div>

                {/* Live preview */}
                <div style={{ ...card, padding: "18px 20px" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: D.text2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Live Preview</p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 10, padding: "11px 20px",
                      borderRadius: 99, fontWeight: 600, fontSize: 14, cursor: "default",
                      background: form.widget_color, color: "#fff",
                      boxShadow: `0 4px 16px ${form.widget_color}50`,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="5.5" y="1" width="5" height="9" rx="2.5" fill="rgba(255,255,255,0.85)"/>
                        <path d="M2.5 8a5.5 5.5 0 0011 0" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="8" y1="13.5" x2="8" y2="15.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {form.widget_label || "Talk to us"}
                    </div>
                  </div>
                </div>

                <button onClick={() => upd("push_to_talk", !form.push_to_talk)}
                  style={{
                    ...card, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px", cursor: "pointer", textAlign: "left", outline: "none",
                    borderColor: form.push_to_talk ? D.amberBg : D.border,
                    background: form.push_to_talk ? `${D.amberBg}06` : D.card,
                  }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: D.text, marginBottom: 3 }}>Push-to-Talk mode</p>
                    <p style={{ fontSize: 12, color: D.text2 }}>Visitor holds button to speak — off means always-listening.</p>
                  </div>
                  <div style={{
                    width: 42, height: 23, borderRadius: 99, position: "relative", flexShrink: 0, marginLeft: 16,
                    background: form.push_to_talk ? D.amberBg : D.border, transition: "background 0.2s",
                  }}>
                    <div style={{
                      position: "absolute", top: 2.5, left: form.push_to_talk ? 21 : 2.5,
                      width: 18, height: 18, borderRadius: "50%", background: D.white,
                      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    }}/>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 8 — LAUNCH ════════════════ */}
          {step === 8 && (
            <div>
              {!saving && !createdId && (
                <>
                  <p style={{ fontSize: 11, fontWeight: 700, color: D.cyan, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Step 8</p>
                  <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Ready to launch.</h1>
                  <p style={{ fontSize: 15, color: D.text2, marginBottom: 28, lineHeight: 1.6 }}>Review your setup, then build your agent.</p>
                  <div style={{ ...card, overflow: "hidden", marginBottom: 24 }}>
                    {[
                      { label: "Site",     val: form.site_url || "Not set" },
                      { label: "Mode",     val: form.mode === "video" ? "Voice + Video" : "Voice Only" },
                      { label: "Language", val: `${LANGUAGES.find(l => l.code === form.language)?.label}${form.auto_language ? " + auto-detect" : ""}` },
                      { label: "Voice",    val: `${form.voice_name} · ${form.voice_provider === "kokoro" ? "Self-hosted (Free)" : "Cloud"}` },
                      { label: "Brain",    val: CLOUD_MODELS.find(m => m.id === form.llm_model)?.name || LOCAL_MODELS.find(m => m.id === form.llm_model)?.name || form.llm_model },
                      { label: "Agent",    val: form.agent_name || "My Agent" },
                      { label: "Widget",   val: `${form.widget_position.replace("-", " ")} · ${form.push_to_talk ? "Push-to-Talk" : "Auto-listen"}` },
                    ].map((r, i, arr) => (
                      <div key={r.label} style={{
                        display: "flex", alignItems: "flex-start", gap: 20, padding: "13px 20px",
                        borderBottom: i < arr.length - 1 ? `1px solid ${D.border}` : "none",
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: D.text3, textTransform: "uppercase", letterSpacing: "0.08em", width: 68, flexShrink: 0, paddingTop: 1 }}>{r.label}</span>
                        <span style={{ fontSize: 14, color: D.text }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                  {error && (
                    <div style={{ padding: "12px 16px", borderRadius: 10, background: `${D.red}08`, border: `1px solid ${D.red}20`, fontSize: 14, color: D.red, marginBottom: 16 }}>{error}</div>
                  )}
                </>
              )}

              {saving && !createdId && (
                <div style={{ padding: "10px 0" }}>
                  <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em" }}>Building your agent…</h1>
                  <p style={{ fontSize: 15, color: D.text2, marginBottom: 44 }}>Setting up your voice agent. This takes a few seconds.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {["Configuring voice engine", "Setting up knowledge base", "Going live"].map((label, i) => {
                      const done   = buildStep > i + 1;
                      const active = buildStep === i + 1;
                      return (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: done ? D.cyanBg : active ? `${D.cyanBg}15` : D.subtle,
                            border: `2px solid ${done ? D.cyanBg : active ? D.cyanBg : D.border}`,
                            transition: "all 0.3s",
                          }}>
                            {done ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              : active ? <div style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${D.cyanBg}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }}/>
                              : <span style={{ fontSize: 12, fontWeight: 600, color: D.text3 }}>{i + 1}</span>
                            }
                          </div>
                          <span style={{ fontSize: 15, color: done || active ? D.text : D.text3, fontWeight: done || active ? 500 : 400, transition: "all 0.3s" }}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {createdId && embedSnippet && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                      background: `${D.cyanBg}15`, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10l5 5 9-9" stroke={D.cyanBg} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <h2 style={{ fontSize: 24, fontWeight: 800, color: D.text, margin: "0 0 3px" }}>Agent is live!</h2>
                      <p style={{ fontSize: 14, color: D.text2, margin: 0 }}>Paste before <code style={{ color: D.cyan, fontFamily: "monospace" }}>&lt;/body&gt;</code></p>
                    </div>
                  </div>
                  <div style={{ ...card, padding: "14px 16px", marginBottom: 14, overflowX: "auto" }}>
                    <code style={{ fontFamily: "monospace", fontSize: 12, color: D.cyan, wordBreak: "break-all" }}>{embedSnippet}</code>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={copySnippet}
                      style={{
                        flex: 1, padding: "12px 0", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                        border: `1.5px solid ${copied ? D.cyanBg : D.border}`,
                        background: copied ? `${D.cyanBg}08` : "transparent",
                        color: copied ? D.cyan : D.text2, transition: "all 0.15s",
                      }}>{copied ? "✓ Copied!" : "Copy Snippet"}</button>
                    <button onClick={() => router.push(`/app/agents/${createdId}`)}
                      style={{
                        flex: 1, padding: "12px 0", borderRadius: 10, border: "none",
                        background: D.cyanBg, color: D.text, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      }}>Configure Agent →</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════ NAVIGATION ════════════════ */}
          {!saving && !createdId && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36 }}>
              <button onClick={() => setStep(s => Math.max(1, s - 1))}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "11px 20px",
                  borderRadius: 10, border: `1.5px solid ${D.border}`, background: D.white,
                  color: D.text2, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                  visibility: step === 1 ? "hidden" : "visible", transition: "all 0.15s",
                }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7l5 5" stroke={D.text2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>

              {step < TOTAL_STEPS ? (
                <button onClick={() => canAdvance() && setStep(s => s + 1)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "11px 26px",
                    borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                    background: canAdvance() ? D.text : D.subtle,
                    color: canAdvance() ? D.white : D.text3,
                    cursor: canAdvance() ? "pointer" : "not-allowed", transition: "all 0.15s",
                  }}>
                  Continue
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2l5 5-5 5" stroke={canAdvance() ? D.white : D.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ) : (
                <button onClick={handleSubmit}
                  style={{
                    padding: "11px 28px", borderRadius: 10, border: "none",
                    background: D.cyanBg, color: D.text, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  }}>Build Agent →</button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
