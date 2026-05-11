"use client";

declare global {
  interface Window {
    ZRO_VOICE_EMBED_API?: {
      toggle: () => void;
      start: () => void;
      stop: () => void;
    };
  }
}

export default function Orb({
  size = 240,
  muted = false,
  interactive = true,
}: {
  size?: number;
  muted?: boolean;
  interactive?: boolean;
}) {
  const onActivate = () => {
    window.ZRO_VOICE_EMBED_API?.toggle();
  };

  const inner = (
    <>
      {/* Idle pulse rings */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -Math.round(size * 0.08),
          borderRadius: "50%",
          border: "1.5px solid rgba(76,233,233,0.35)",
          animation: "orb-pulse 2.4s ease-out infinite",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -Math.round(size * 0.18),
          borderRadius: "50%",
          border: "1px solid rgba(76,233,233,0.18)",
          animation: "orb-pulse 2.4s ease-out infinite",
          animationDelay: "0.8s",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -Math.round(size * 0.28),
          borderRadius: "50%",
          border: "1px solid rgba(76,233,233,0.08)",
          animation: "orb-pulse 2.4s ease-out infinite",
          animationDelay: "1.6s",
        }}
      />

      {/* Icon — centred, 62% of orb diameter */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/zholy-orb.png"
        alt="ZHOLY"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: Math.round(size * 0.62),
          height: Math.round(size * 0.62),
          objectFit: "contain",
          userSelect: "none",
          pointerEvents: "none",
          filter: "drop-shadow(0 0 24px rgba(76,233,233,0.35))",
        }}
        draggable={false}
      />

      {/* Muted badge */}
      {muted && (
        <div
          style={{
            position: "absolute",
            width: size * 0.22,
            height: size * 0.22,
            right: size * 0.05,
            bottom: size * 0.06,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "#e5484d",
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          <svg width={size * 0.1} height={size * 0.1} viewBox="0 0 24 24" fill="none">
            <line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="2" />
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="white" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>
      )}

      <style>{`
        @keyframes orb-pulse {
          0%   { transform: scale(1);    opacity: 1; }
          100% { transform: scale(1.45); opacity: 0; }
        }
      `}</style>
    </>
  );

  if (!interactive) {
    return (
      <div style={{ position: "relative", width: size, height: size }}>
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      style={{
        position: "relative",
        display: "block",
        border: 0,
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        borderRadius: "50%",
        width: size,
        height: size,
        transition: "transform 120ms ease",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      onClick={onActivate}
      aria-label="Talk to ZHOLY — start or stop voice session"
      title="Talk to ZHOLY"
    >
      {inner}
    </button>
  );
}
