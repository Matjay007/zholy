import Link from "next/link";

/* Swiss company trust strip — ZHOLY is incorporated in Switzerland
 * (Polare Group Sàrl · CHE-221.062.769), not merely hosted there. */
export default function TrustStrip() {
  return (
    <section
      aria-label="Swiss company infrastructure"
      className="relative border-y border-line bg-elevated/30"
    >
      <div className="wrap py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {/* Swiss flag + company line — inline, compact */}
        <div className="flex items-center gap-3">
          <SwissFlag size={28} />
          <span className="font-mono text-[11px] tracking-widest text-cream/60 uppercase">
            Built &amp; incorporated in Switzerland
          </span>
          <span className="font-mono text-[10px] tracking-widest text-cream/30 uppercase hidden sm:inline">
            · Polare Group Sàrl · CHE-221.062.769
          </span>
        </div>

        {/* Divider */}
        <span className="hidden lg:block w-px h-4 bg-line" aria-hidden />

        {/* Compliance badges */}
        <div className="flex items-center gap-6 text-[11px] font-mono tracking-widest text-cream/50 uppercase">
          <span className="flex items-center gap-1.5"><BadgeDot /> Swiss nFADP</span>
          <span className="flex items-center gap-1.5"><BadgeDot /> GDPR Art. 9</span>
          <span className="flex items-center gap-1.5"><BadgeDot /> EU Residency</span>
        </div>

        {/* Divider */}
        <span className="hidden lg:block w-px h-4 bg-line" aria-hidden />

        <Link
          href="#why"
          className="font-mono text-[11px] tracking-widest text-cyan/70 uppercase hover:text-cyan transition-colors"
        >
          Why it matters →
        </Link>
      </div>
    </section>
  );
}

/** Inline SVG Swiss flag — official red #DA291C with white cross. */
function SwissFlag({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Swiss flag"
      role="img"
      style={{ borderRadius: 4, flexShrink: 0 }}
    >
      <rect width="32" height="32" fill="#DA291C" />
      <rect x="6" y="13" width="20" height="6" fill="#FFFFFF" />
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
