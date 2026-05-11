"use client";
/**
 * /voice/demo — Demo Hub
 * Premium landing for ZHOLY live demos.
 */

import Link from "next/link";
import { useState } from "react";

export default function DemoHubPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#fff",
      fontFamily: "\'Inter\', \'Segoe UI\', system-ui, sans-serif",
      overflowX: "hidden",
    }}>
      {/* Back nav */}
      <div style={{ position: "fixed", top: 24, left: 28, zIndex: 20 }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 8,
          color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: 13,
          transition: "color .15s",
        }}>← ZHOLY</Link>
      </div>

      {/* Hero text */}
      <div style={{ textAlign: "center", padding: "110px 32px 52px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(76,233,233,0.08)", border: "1px solid rgba(76,233,233,0.2)",
          borderRadius: 20, padding: "5px 14px", fontSize: 11, color: "#4CE9E9",
          fontWeight: 700, letterSpacing: "0.08em", marginBottom: 22,
        }}>🎙 LIVE DEMOS — Powered by ZHOLY</div>
        <h1 style={{ fontSize: "clamp(38px, 7vw, 72px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 14 }}>
          See ZHOLY<br/>
          <span style={{ background: "linear-gradient(135deg, #4CE9E9 0%, #60A5FA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            in action.
          </span>
        </h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", maxWidth: 520, margin: "0 auto" }}>
          Fully live — not mockups. Click the mic and start talking.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 100px" }}>

        {/* ── SoleMate hero card ────────────────────────────── */}
        <Link href="/demo/shoes" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
          <div
            onMouseEnter={() => setHovered("shoes")}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: "relative", borderRadius: 28, overflow: "hidden",
              height: "clamp(360px, 50vw, 520px)", cursor: "pointer",
              transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s",
              transform: hovered === "shoes" ? "translateY(-4px)" : "translateY(0)",
              boxShadow: hovered === "shoes" ? "0 40px 100px rgba(76,233,233,0.15)" : "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* bg photo */}
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&w=1600&q=90"
              alt="SoleMate Sneaker Store"
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center 40%",
                transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
                transform: hovered === "shoes" ? "scale(1.06)" : "scale(1)",
              }}
            />
            {/* gradient overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.05) 100%)",
            }} />
            {/* content */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "44px 48px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "#FF3D3D", borderRadius: 20, padding: "5px 14px",
                fontSize: 10, color: "#fff", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 18,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block" }} className="live-dot" />
                LIVE NOW
              </div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10, color: "#fff" }}>
                SoleMate Sneaker Store
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 24, maxWidth: 480 }}>
                Browse products, add to cart, fill your entire checkout form, and complete a real Stripe payment — all entirely by voice.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
                {["Voice browse", "Smart cart", "Auto form fill", "Stripe checkout"].map(f => (
                  <span key={f} style={{
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                    borderRadius: 20, padding: "5px 13px", fontSize: 12, color: "#fff", fontWeight: 500,
                  }}>{f}</span>
                ))}
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "linear-gradient(135deg, #4CE9E9 0%, #2563EB 100%)",
                borderRadius: 14, padding: "13px 26px", fontSize: 14, fontWeight: 800, color: "#fff",
                transition: "opacity 0.2s, transform 0.2s",
                opacity: hovered === "shoes" ? 1 : 0.88,
                transform: hovered === "shoes" ? "translateX(4px)" : "translateX(0)",
              }}>
                🎙 Talk to the store — try it live →
              </div>
            </div>
          </div>
        </Link>

        {/* ── Coming soon grid ─────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 60 }}>

          {/* Medical */}
          <div style={{
            position: "relative", borderRadius: 20, overflow: "hidden", height: 300,
            opacity: 0.65, cursor: "default",
          }}>
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&w=800&q=80"
              alt="Medical Booking"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, padding: "28px 28px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 20, padding: "4px 12px", fontSize: 10, color: "rgba(255,255,255,0.6)",
                fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10,
              }}>COMING SOON</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6, color: "#fff" }}>Medical Booking</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Book appointments, answer health FAQs, capture patient intake — all by voice.</p>
            </div>
          </div>

          {/* Real Estate */}
          <div style={{
            position: "relative", borderRadius: 20, overflow: "hidden", height: 300,
            opacity: 0.65, cursor: "default",
          }}>
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&w=800&q=80"
              alt="Real Estate Agency"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, padding: "28px 28px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 20, padding: "4px 12px", fontSize: 10, color: "rgba(255,255,255,0.6)",
                fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10,
              }}>COMING SOON</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6, color: "#fff" }}>Real Estate Agency</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Search listings by voice, book viewings, capture buyer preferences automatically.</p>
            </div>
          </div>

        </div>

        {/* CTA strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #4CE9E9 0%, #2563EB 100%)",
            color: "#fff", textDecoration: "none", borderRadius: 12,
            padding: "14px 28px", fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em",
          }}>Add ZHOLY to your site →</Link>
          <Link href="/#pricing" style={{
            display: "inline-flex", alignItems: "center",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)", textDecoration: "none", borderRadius: 12,
            padding: "14px 24px", fontSize: 14, fontWeight: 600,
          }}>See pricing</Link>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 14 }}>
          Free plan · No credit card · Launch in 2 minutes
        </p>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .live-dot { animation: pulseDot 1.4s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
