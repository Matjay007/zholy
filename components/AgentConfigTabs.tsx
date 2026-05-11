"use client";
import { useRouter } from "next/navigation";

import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  site_url: string;
  status: string;
  embed_key: string;
  config: Record<string, unknown>;
  knowledge_chunks: number;
}

interface Props {
  agent: Agent;
  embedSnippet: string;
}

const TABS = ["Voice", "Model", "Behavior", "Widget", "Danger"];

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
  { code: "sk", label: "Slovak" }, { code: "hu", label: "Hungarian" },
  { code: "ro", label: "Romanian" }, { code: "bg", label: "Bulgarian" },
  { code: "hr", label: "Croatian" }, { code: "uk", label: "Ukrainian" },
  { code: "he", label: "Hebrew" }, { code: "el", label: "Greek" },
  { code: "id", label: "Indonesian" }, { code: "ms", label: "Malay" },
  { code: "th", label: "Thai" }, { code: "vi", label: "Vietnamese" },
  { code: "ca", label: "Catalan" }, { code: "lt", label: "Lithuanian" },
  { code: "lv", label: "Latvian" }, { code: "et", label: "Estonian" },
  { code: "sl", label: "Slovenian" }, { code: "sr", label: "Serbian" },
  { code: "mk", label: "Macedonian" }, { code: "sq", label: "Albanian" },
];

const VOICES = [
  { provider: "openai", id: "alloy", name: "Alloy", desc: "Balanced, clear, professional" },
  { provider: "openai", id: "nova", name: "Nova", desc: "Warm, friendly, energetic" },
  { provider: "openai", id: "shimmer", name: "Shimmer", desc: "Calm, reassuring, clear" },
  { provider: "openai", id: "echo", name: "Echo", desc: "Deep, authoritative, confident" },
  { provider: "openai", id: "fable", name: "Fable", desc: "Expressive, narrative, engaging" },
  { provider: "openai", id: "onyx", name: "Onyx", desc: "Rich, powerful, compelling" },
  { provider: "deepgram", id: "aura-asteria-en", name: "Asteria (Deepgram)", desc: "Conversational, natural flow" },
  { provider: "deepgram", id: "aura-zeus-en", name: "Zeus (Deepgram)", desc: "Strong, decisive, clear" },
  { provider: "deepgram", id: "aura-luna-en", name: "Luna (Deepgram)", desc: "Soft, empathetic, warm" },
  { provider: "elevenlabs", id: "rachel", name: "Rachel (ElevenLabs)", desc: "Studio-quality, emotional range" },
  { provider: "elevenlabs", id: "adam", name: "Adam (ElevenLabs)", desc: "Deep broadcast quality" },
  { provider: "cartesia", id: "sonic-english", name: "Sonic (Cartesia)", desc: "Ultra low latency, natural" },
  { provider: "kokoro", id: "af_bella", name: "Bella (Kokoro)", desc: "Self-hosted, open source" },
  { provider: "kokoro", id: "am_michael", name: "Michael (Kokoro)", desc: "Self-hosted, open source" },
];

const MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "Fast & affordable, great for most agents" },
  { id: "gpt-4o", name: "GPT-4o", desc: "Most capable, best for complex conversations" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", desc: "Powerful, lower cost than GPT-4o" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", desc: "Anthropic — nuanced, thoughtful responses" },
  { id: "llama3:8b", name: "Llama 3 8B (self-hosted)", desc: "Private, runs on your VPS" },
  { id: "mistral", name: "Mistral 7B (self-hosted)", desc: "Fast self-hosted option" },
];

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: "6px",
  padding: "8px 12px",
  color: "#E8E4DF",
  fontSize: "13px",
  fontFamily: "inherit",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: "30px",
};

export default function AgentConfigTabs({ agent, embedSnippet }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState("Voice");
  const [copied, setCopied] = useState(false);
  const cfg = agent.config as Record<string, string | boolean | string[]>;

  const [language, setLanguage] = useState(String(cfg.language || "en"));
  const [autoLanguage, setAutoLanguage] = useState(Boolean(cfg.auto_language));
  const [voiceId, setVoiceId] = useState(String(cfg.voice_id || "nova"));
  const [llmModel, setLlmModel] = useState(String(cfg.llm_model || "gpt-4o-mini"));
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const selectedVoice = VOICES.find(v => v.id === voiceId);

  async function saveVoice() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            ...cfg,
            language,
            auto_language: autoLanguage,
            voice_id: voiceId,
            voice_provider: selectedVoice?.provider || "openai",
            voice_name: selectedVoice?.name || voiceId,
          },
        }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  async function saveModel() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: { ...cfg, llm_model: llmModel } }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  function copyCfg() {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden" style={{ background: "#FFFFFF" }}>
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 px-4 pt-3 gap-0.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px"
            style={{
              borderColor: tab === t ? "#4CE9E9" : "transparent",
              color: tab === t ? "#4CE9E9" : "#8B847B",
            }}
          >
            {t === "Danger" ? <span style={{ color: "#E5484D" }}>Danger</span> : t}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "Voice" && (
          <div className="space-y-5">
            {/* Language */}
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-muted mb-2 block">
                Language
              </label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={selectStyle}>
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Auto-detect */}
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <div>
                <span className="text-slate-900 text-sm">Auto-detect Language</span>
                <p className="text-muted text-xs mt-0.5">Detect language from each message and reply in it</p>
              </div>
              <button
                onClick={() => setAutoLanguage(v => !v)}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{ background: autoLanguage ? "#4CE9E9" : "#262626" }}
              >
                <span
                  className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                  style={{ transform: autoLanguage ? "translateX(18px)" : "translateX(2px)" }}
                />
              </button>
            </div>

            {/* Voice */}
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-muted mb-2 block">
                Voice
              </label>
              <select value={voiceId} onChange={e => setVoiceId(e.target.value)} style={selectStyle}>
                {VOICES.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {selectedVoice && (
                <p className="text-muted text-xs mt-1.5">{selectedVoice.desc}</p>
              )}
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={saveVoice}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: saveStatus === "saved" ? "rgba(76,233,233,0.15)" : "rgba(76,233,233,0.1)",
                  color: saveStatus === "error" ? "#E5484D" : "#4CE9E9",
                  border: `1px solid ${saveStatus === "error" ? "rgba(229,72,77,0.3)" : "rgba(76,233,233,0.2)"}`,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Error — retry" : "Save changes"}
              </button>
            </div>
          </div>
        )}

        {tab === "Model" && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-muted mb-2 block">
                LLM Model
              </label>
              <select value={llmModel} onChange={e => setLlmModel(e.target.value)} style={selectStyle}>
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {MODELS.find(m => m.id === llmModel) && (
                <p className="text-muted text-xs mt-1.5">{MODELS.find(m => m.id === llmModel)?.desc}</p>
              )}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={saveModel}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: saveStatus === "saved" ? "rgba(76,233,233,0.15)" : "rgba(76,233,233,0.1)",
                  color: saveStatus === "error" ? "#E5484D" : "#4CE9E9",
                  border: `1px solid ${saveStatus === "error" ? "rgba(229,72,77,0.3)" : "rgba(76,233,233,0.2)"}`,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Error — retry" : "Save changes"}
              </button>
            </div>
          </div>
        )}

        {tab === "Behavior" && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Persona / System Prompt
              </p>
              <div
                className="rounded-lg p-3 text-slate-900/80 text-sm leading-relaxed"
                style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
              >
                {String(cfg.persona || "Default assistant")}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Goals
              </p>
              <div className="flex flex-wrap gap-2">
                {((cfg.goals as string[]) || []).map((g: string) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded text-xs font-mono"
                    style={{ background: "rgba(76,233,233,0.1)", color: "#4CE9E9" }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Widget" && (
          <div className="space-y-4">
            <Row label="Position" value={String(cfg.widget_position || "bottom-right")} />
            <Row label="Button Label" value={String(cfg.widget_label || "Talk to us")} />
            <div className="flex items-center gap-3 py-2 border-b border-slate-200">
              <span className="text-muted text-xs font-mono uppercase tracking-widest w-32">
                Button Color
              </span>
              <div
                className="w-6 h-6 rounded-full border border-slate-200"
                style={{ background: String(cfg.widget_color || "#4CE9E9") }}
              />
              <span className="text-slate-900 text-sm">{String(cfg.widget_color || "#4CE9E9")}</span>
            </div>
            <Row label="Video Mode" value={cfg.video_mode ? "Enabled" : "Disabled"} />
            <Row label="Input Mode" value={cfg.push_to_talk ? "Push-to-Talk" : "Voice Activity Detection"} />
            <div className="pt-2">
              <button
                onClick={copyCfg}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-muted hover:text-slate-900 transition-colors"
              >
                {copied ? "Copied!" : "Copy embed snippet"}
              </button>
            </div>
          </div>
        )}

        {tab === "Danger" && (
          <div className="space-y-4">
            <div className="rounded-xl p-4 border" style={{ borderColor: "rgba(229,72,77,0.3)", background: "rgba(229,72,77,0.05)" }}>
              <p className="text-sm font-medium mb-1" style={{ color: "#E5484D" }}>
                Pause Agent
              </p>
              <p className="text-muted text-xs mb-3">
                Disables the voice widget on your site. Conversations will stop. Data is preserved.
              </p>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-red/10"
                style={{ borderColor: "rgba(229,72,77,0.4)", color: "#E5484D" }}
                onClick={async () => {
                  await fetch(`/api/agents/${agent.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "paused" }),
                  });
                  window.location.reload();
                }}
              >
                Pause Agent
              </button>
            </div>

            <div className="rounded-xl p-4 border" style={{ borderColor: "rgba(229,72,77,0.4)", background: "rgba(229,72,77,0.07)" }}>
              <p className="text-sm font-medium mb-1" style={{ color: "#E5484D" }}>
                Delete Agent
              </p>
              <p className="text-muted text-xs mb-3">
                Permanently deletes this agent, all its conversations, and leads. This cannot be undone.
              </p>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: "#E5484D" }}
                onClick={async () => {
                  if (!confirm("Delete this agent? This cannot be undone.")) return;
                  await fetch(`/api/agents/${agent.id}`, { method: "DELETE" });
                  router.push("/app/agents");
                }}
              >
                Delete Agent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | boolean }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-200">
      <span className="text-muted text-xs font-mono uppercase tracking-widest w-36 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-slate-900 text-sm">{String(value)}</span>
    </div>
  );
}
