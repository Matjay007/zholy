/* Swiss alpine silhouette — minimal accent between major sections.
 * Single line, cyan stroke, fades from edges. Visual DNA only — not a logo. */
export default function AlpineAccent() {
  return (
    <div
      aria-hidden
      className="relative w-full h-12 overflow-hidden pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(76,233,233,0.02) 100%)",
      }}
    >
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        <defs>
          <linearGradient id="alpine-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#4CE9E9" stopOpacity="0" />
            <stop offset="20%" stopColor="#4CE9E9" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#4CE9E9" stopOpacity="0.55" />
            <stop offset="80%" stopColor="#4CE9E9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4CE9E9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 40 L120 22 L180 32 L260 8 L320 24 L420 14 L500 30 L580 18 L660 6 L740 26 L820 16 L900 28 L980 12 L1080 24 L1180 20 L1260 32 L1340 18 L1440 28 L1440 48 L0 48 Z"
          fill="url(#alpine-fade)"
          fillOpacity="0.08"
        />
        <path
          d="M0 40 L120 22 L180 32 L260 8 L320 24 L420 14 L500 30 L580 18 L660 6 L740 26 L820 16 L900 28 L980 12 L1080 24 L1180 20 L1260 32 L1340 18 L1440 28"
          stroke="url(#alpine-fade)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
