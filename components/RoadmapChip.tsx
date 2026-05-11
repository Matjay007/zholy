/* RoadmapChip — small inline pill marking a feature as not-yet-shipped.
 * Tiny mono caps, cyan outline, no fill. Used inline next to feature lines
 * across FAQ, PricingTable, EdgeBento, etc. so visitors see the claim and
 * the honest "not yet" tag together. */
export default function RoadmapChip({
  label = "ROADMAP",
}: {
  label?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        marginLeft: 6,
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "rgba(76,233,233,0.85)",
        background: "transparent",
        border: "1px solid rgba(76,233,233,0.35)",
        borderRadius: 9999,
        verticalAlign: "middle",
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        lineHeight: 1.1,
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "#4CE9E9",
          boxShadow: "0 0 6px rgba(76,233,233,0.6)",
        }}
      />
      {label}
    </span>
  );
}
