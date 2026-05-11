"use client";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "connecting" | "indexing" | "listening" | "thinking" | "speaking" | "error";

const GATEWAY =
  process.env.NEXT_PUBLIC_ZRO_GATEWAY_URL ??
  process.env.NEXT_PUBLIC_GATEWAY ??
  "http://127.0.0.1:8790";

export default function InteractiveOrb({ size = 320 }: { size?: number }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const acRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const procRef = useRef<ScriptProcessorNode | AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sendingRef = useRef(false);
  const pcmBufferRef = useRef<Float32Array[]>([]);
  const lastSendRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const STATUS_MAP: Record<Phase, string> = {
    idle: "TAP TO TALK",
    connecting: "CONNECTING",
    indexing: "READING PAGE",
    listening: "LISTENING",
    thinking: "THINKING",
    speaking: "SPEAKING",
    error: "ERROR",
  };

  function tearDown() {
    sendingRef.current = false;
    try { procRef.current?.disconnect(); } catch {}
    try { sourceRef.current?.disconnect(); } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try { wsRef.current?.close(); } catch {}
    try { acRef.current?.close(); } catch {}
    procRef.current = null; sourceRef.current = null;
    streamRef.current = null; wsRef.current = null;
    acRef.current = null; pcmBufferRef.current = [];
  }

  async function endCall() { tearDown(); setPhase("idle"); setErrMsg(null); }

  function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeStr = (off: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
    writeStr(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); writeStr(8, "WAVE");
    writeStr(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeStr(36, "data"); view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) { const s = Math.max(-1, Math.min(1, samples[i])); view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return buffer;
  }

  function downsample(input: Float32Array, fromRate: number, toRate = 16000): Float32Array {
    if (fromRate === toRate) return input;
    const ratio = fromRate / toRate; const newLen = Math.round(input.length / ratio);
    const out = new Float32Array(newLen); let pos = 0, i = 0;
    while (pos < newLen) { const next = Math.round((pos + 1) * ratio); let acc = 0, cnt = 0; for (; i < next && i < input.length; i++) { acc += input[i]; cnt++; } out[pos++] = cnt ? acc / cnt : 0; }
    return out;
  }

  async function flushClip() {
    if (sendingRef.current) return;
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    if (pcmBufferRef.current.length === 0) return;
    const ac = acRef.current; if (!ac) return;
    const total = pcmBufferRef.current.reduce((n, c) => n + c.length, 0);
    if (total < ac.sampleRate * 0.4) return;
    const merged = new Float32Array(total); let off = 0;
    for (const chunk of pcmBufferRef.current) { merged.set(chunk, off); off += chunk.length; }
    pcmBufferRef.current = [];
    const downsampled = downsample(merged, ac.sampleRate, 16000);
    let sumSq = 0; for (let i = 0; i < downsampled.length; i++) sumSq += downsampled[i] * downsampled[i];
    if (Math.sqrt(sumSq / downsampled.length) < 0.008) return;
    const wav = encodeWav(downsampled, 16000);
    const b64 = btoa(String.fromCharCode(...new Uint8Array(wav)));
    sendingRef.current = true; setPhase("thinking");
    wsRef.current.send(JSON.stringify({ type: "audio.wav", wavBase64: b64 }));
  }

  async function playB64Wav(b64: string) {
    const ac = acRef.current; if (!ac) return;
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const buffer = await ac.decodeAudioData(bytes.buffer.slice(0));
    return new Promise<void>((resolve) => { const src = ac.createBufferSource(); src.buffer = buffer; src.connect(ac.destination); src.onended = () => resolve(); src.start(); });
  }

  async function startCall() {
    if (phaseRef.current !== "idle") return;
    setErrMsg(null); setPhase("connecting");
    try {
      const AudioCtx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      const ac = new AudioCtx(); acRef.current = ac; await ac.resume();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 } });
      streamRef.current = stream;
      const source = ac.createMediaStreamSource(stream); sourceRef.current = source;
      const wsUrl = `${GATEWAY.replace(/^http/, "ws")}/ws`;
      const ws = new WebSocket(wsUrl); wsRef.current = ws;
      ws.addEventListener("open", () => {
        setPhase("indexing");
        const nodes: Array<{ id: string; text: string }> = [];
        document.querySelectorAll<HTMLElement>("h1, h2, h3, p, li").forEach((el, idx) => {
          const text = (el.innerText || "").trim();
          if (text.length < 8 || text.length > 1200) return;
          if (!el.id) el.id = `znode-${idx}`;
          nodes.push({ id: el.id, text });
        });
        ws.send(JSON.stringify({ type: "semantic.bootstrap", hostname: window.location.hostname || "localhost", nodes }));
      });
      ws.addEventListener("message", async (evt) => {
        try {
          const msg = JSON.parse(typeof evt.data === "string" ? evt.data : "");
          if (!msg || typeof msg !== "object") return;
          if (msg.type === "semantic.ok") {
            setPhase("listening");
            const proc = ac.createScriptProcessor(4096, 1, 1); procRef.current = proc;
            source.connect(proc); proc.connect(ac.destination);
            proc.onaudioprocess = (e) => {
              if (muted || sendingRef.current) return;
              const ch = e.inputBuffer.getChannelData(0);
              pcmBufferRef.current.push(new Float32Array(ch));
              const now = performance.now();
              if (now - lastSendRef.current > 1200) { lastSendRef.current = now; void flushClip(); }
            };
            return;
          }
          if (msg.type === "agent.silence") { sendingRef.current = false; setPhase("listening"); return; }
          if (msg.type === "agent.reply") {
            setPhase("speaking");
            if (msg.scrollTo) document.getElementById(String(msg.scrollTo))?.scrollIntoView({ behavior: "smooth", block: "center" });
            if (typeof msg.audioWavBase64 === "string" && msg.audioWavBase64.trim()) await playB64Wav(msg.audioWavBase64.trim());
            sendingRef.current = false; setPhase("listening"); return;
          }
          if (msg.type === "error") { setErrMsg(String(msg.message || "gateway_error")); sendingRef.current = false; setPhase("listening"); }
        } catch {}
      });
      ws.addEventListener("close", () => { if (phaseRef.current !== "idle") { setPhase("error"); setErrMsg("Connection closed"); } });
      ws.addEventListener("error", () => { setPhase("error"); setErrMsg("Gateway not reachable"); });
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      setErrMsg(/permission|allow|denied|notallowed/i.test(m) ? "Mic permission denied — allow it in your browser." : m);
      setPhase("error"); tearDown();
    }
  }

  const isLive = phase !== "idle" && phase !== "error";
  const isPulsing = phase === "listening" || phase === "thinking";
  const isSpeaking = phase === "speaking";

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={isLive ? endCall : startCall}
        aria-label={isLive ? "End call" : "Start call"}
        className="relative outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded-full"
        style={{ width: size, height: size }}
      >
        {/* Pulse rings when live */}
        {(isPulsing || isSpeaking) && (
          <>
            <span aria-hidden className="absolute inset-0 rounded-full border border-cyan/50" style={{ animation: "pulse-ring 2.4s ease-out infinite" }} />
            <span aria-hidden className="absolute inset-0 rounded-full border border-cyan/30" style={{ animation: "pulse-ring 2.4s ease-out infinite", animationDelay: "1.2s" }} />
            <span aria-hidden className="absolute inset-0 rounded-full border border-cyan/20" style={{ animation: "pulse-ring 2.4s ease-out infinite", animationDelay: "0.6s" }} />
          </>
        )}

        {/* Logo image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/voice/zholy-logo.png"
          alt="ZHOLY"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
            userSelect: "none",
            pointerEvents: "none",
            transform: isSpeaking ? "scale(1.04)" : "scale(1)",
            transition: "transform 240ms ease, filter 400ms ease",
            filter: isLive
              ? "drop-shadow(0 0 32px rgba(76,233,233,0.45)) brightness(1.08)"
              : "drop-shadow(0 0 20px rgba(76,233,233,0.15))",
          }}
          draggable={false}
        />

        {/* Mute button when live */}
        {isLive && (
          <span
            role="button"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
            style={{
              position: "absolute",
              width: size * 0.18, height: size * 0.18,
              right: size * 0.04, bottom: size * 0.06,
              borderRadius: "50%",
              display: "grid", placeItems: "center",
              cursor: "pointer",
              background: muted ? "#e5484d" : "rgba(0,0,0,0.7)",
              border: muted ? "none" : "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
            }}
          >
            <svg width={size * 0.08} height={size * 0.08} viewBox="0 0 24 24" fill="none">
              {muted && <line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="2" />}
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="white" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </span>
        )}
      </button>

      <div className="text-center" style={{ minHeight: 44 }}>
        <p className="font-mono text-[11px] tracking-widest text-cream/80">{STATUS_MAP[phase]}</p>
        {errMsg ? (
          <p className="text-red text-xs mt-1">{errMsg}</p>
        ) : !isLive ? (
          <p className="text-cream/50 text-xs mt-1">Allow mic when prompted</p>
        ) : (
          <button onClick={endCall} className="text-cream/60 text-xs mt-1 underline hover:text-cream">End call</button>
        )}
      </div>
    </div>
  );
}
