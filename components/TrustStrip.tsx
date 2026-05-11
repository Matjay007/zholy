import Link from "next/link";

/* Swiss-sovereign trust strip — sits below the hero so it's the first thing
 * a visitor sees scrolling. The flag is rendered as inline SVG (no asset),
 * matching the official 5:5 proportions and the cyan accent colour. */
export default function TrustStrip() {
  return (
    <section
      aria-label="Swiss-sovereign infrastructure"
      className="relative border-y border-line bg-elevated/40 backdrop-blur-md"
    >
      <div className="wrap py-8 flex flex-wrap items-center justify-between gap-8">
        {/* Swiss flag + tagline */}
        <div className="flex items-center gap-4">
          <SwissFlag size={40} />
          <div>
            <p className="font-mono text-[11px] tracking-widest text-cyan/80 uppercase">
              Swiss-sovereign
            </p>
            <p className="font-serif text-xl text-cream leading-tight mt-0.5">
              Hosted in Switzerland.
            </p>
          </div>
        </div>

        {/* Compliance badges */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-mono tracking-widest text-cream/70 uppercase">
          <span className="flex items-center gap-2">
            <BadgeDot /> Swiss nFADP
          </span>
          <span className="flex items-center gap-2">
            <BadgeDot /> GDPR Art. 9
          </span>
          <span className="flex items-center gap-2">
            <BadgeDot /> EU Residency Available
          </span>
          <span className="flex items-center gap-2">
            <BadgeDot /> Open Source
          </span>
          <span className="flex items-center gap-2">
            <BadgeDot /> Self-Hostable
          </span>
        </div>

        <Link
          href="#edge"
          className="hidden lg:inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-cyan uppercase hover:text-cream transition-colors"
        >
          Why it matters <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

/** Inline SVG Swiss flag — official red #DA291C with white cross. */
function SwissFlag({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Swiss flag"
      role="img"
      style={{
        borderRadius: 6,
        boxShadow: "0 4px 16px rgba(218,41,28,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <rect width="32" height="32" fill="#DA291C" />
      {/* Horizontal arm of cross */}
      <rect x="6" y="13" width="20" height="6" fill="#FFFFFF" />
      {/* Vertical arm of cross */}
      <rect x="13" y="6" width="6" height="20" fill="#FFFFFF" />
    </svg>
  );
}

function BadgeDot() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#4CE9E9",
        boxShadow: "0 0 8px rgba(76,233,233,0.6)",
      }}
    />
  );
}
