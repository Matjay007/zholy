"use client";
import { Logo } from "./Nav";

export default function CallBar({ status = "READY", showChat = false }: { status?: string; showChat?: boolean }) {
  const visualizerStatus = status.toUpperCase();
  return (
    <div className="inline-flex flex-col items-center gap-3">
      {showChat && (
        <div className="bg-cream rounded-2xl shadow-2xl px-3 py-3 w-[320px]">
          <div className="flex items-center gap-2">
            <input
              placeholder="Type a message..."
              className="flex-1 h-10 px-4 rounded-full bg-cream-2 border border-line-cream text-ink placeholder:text-ink/40 outline-none text-sm"
            />
            <button className="h-10 w-10 rounded-full bg-ink grid place-items-center" aria-label="Send">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
        </div>
      )}
      <button className="text-xs text-cream/70 px-3 py-1.5 rounded-full border border-line bg-ink-2/60 backdrop-blur">
        {showChat ? "Hide chat" : "Show chat"}
      </button>
      <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-ink-2 border border-line shadow-2xl">
        <div className="h-10 w-10 rounded-full bg-cream grid place-items-center">
          <Logo size={18} />
        </div>
        <div className="flex flex-col leading-tight pr-2">
          <span className="text-cream text-sm font-medium">Agent</span>
          <span className="text-amber text-[10px] font-mono tracking-widest">{visualizerStatus}</span>
        </div>
        <div className="flex items-center gap-1 mx-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="h-2 w-1 rounded-full bg-cream/30" />
          ))}
        </div>
        <button className="h-9 w-9 rounded-full border border-line bg-ink grid place-items-center" aria-label="Mute">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="white" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" fill="none" />
            <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" />
          </svg>
        </button>
        <button className="h-9 w-9 rounded-full bg-red grid place-items-center" aria-label="End">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
