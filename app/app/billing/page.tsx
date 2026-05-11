"use client";

import { useState, useEffect } from "react";

const C = { page:"#F7F8FA", white:"#FFFFFF", border:"#E4E7EC", divider:"#F2F4F7", t1:"#101828", t2:"#344054", t3:"#667085", t4:"#98A2B3", accent:"#4CE9E9", adk:"#0E7490", abg:"rgba(76,233,233,0.08)" };

const PLANS = [
  { id: "free",  name: "Free",  price: "$0",   minutes: 100,   features: ["100 min/month", "1 agent", "Lead capture", "Basic analytics"] },
  { id: "pro",   name: "Pro",   price: "$49",  minutes: 2000,  features: ["2,000 min/month", "10 agents", "Lead capture", "Advanced analytics", "Custom voices", "Priority support"] },
  { id: "scale", name: "Scale", price: "$149", minutes: 10000, features: ["10,000 min/month", "Unlimited agents", "All Pro features", "API access", "Dedicated support", "SLA guarantee"] },
];

interface UsageData {
  plan: string;
  plan_minutes: number;
  minutes_used: number;
  calls_count: number;
  period: string;
}

interface Invoice {
  period: string;
  minutes_used: number;
  calls_count: number;
}

export default function BillingPage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [upgradeModal, setUpgradeModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/usage").then(r => r.json()).catch(() => null),
      fetch("/api/usage/history").then(r => r.json()).catch(() => []),
    ]).then(([u, inv]) => {
      if (u) setData(u);
      if (Array.isArray(inv)) setInvoices(inv);
    }).finally(() => setLoading(false));
  }, []);

  const plan = data?.plan || "free";
  const planMinutes = data?.plan_minutes || 100;
  const minutesUsed = Number(data?.minutes_used || 0);
  const pct = Math.min(100, Math.round((minutesUsed / planMinutes) * 100));

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--sans)", minHeight: "100vh" }}>

      {/* Upgrade Modal */}
      {upgradeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => e.target === e.currentTarget && setUpgradeModal(null)}>
          <div style={{ background: C.white, borderRadius: 16, padding: "32px", width: "100%", maxWidth: 440, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.t1, marginBottom: 8 }}>Upgrade to {upgradeModal}</h2>
            <p style={{ fontSize: 14, color: C.t3, marginBottom: 24, lineHeight: 1.6 }}>
              To upgrade your plan, contact us and we&apos;ll get you set up within 24 hours.
            </p>
            <a href="mailto:upgrade@zholy.com?subject=Upgrade to " style={{
              display: "block", padding: "12px 0", borderRadius: 10,
              background: C.t1, color: "#FFF", fontSize: 14, fontWeight: 600,
              textDecoration: "none", marginBottom: 10,
            }}>Email us to upgrade</a>
            <button onClick={() => setUpgradeModal(null)}
              style={{ background: "none", border: "none", color: C.t3, fontSize: 14, cursor: "pointer" }}>
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Billing</p>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: C.t1, margin: 0, letterSpacing: "-0.02em" }}>Billing &amp; Plans</h1>
      </div>

      {/* Current plan */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "22px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Current Plan</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: C.t1, margin: 0 }}>{loading ? "—" : plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, padding: "5px 14px", borderRadius: 99, background: C.abg, color: C.adk }}>Active</span>
        </div>
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: C.t3 }}>Usage this month</span>
          <span style={{ fontSize: 13, color: C.t2, fontWeight: 500 }}>{minutesUsed.toFixed(0)} / {planMinutes} min · {pct}%</span>
        </div>
        <div style={{ height: 8, background: C.page, borderRadius: 99 }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: pct > 85 ? "#EF4444" : pct > 60 ? "#F59E0B" : C.accent, transition: "width 0.5s" }} />
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {PLANS.map((p) => {
          const isCurrent = p.id === plan;
          return (
            <div key={p.id} style={{ background: isCurrent ? C.abg : C.white, border: `2px solid ${isCurrent ? C.accent : C.border}`, borderRadius: 12, padding: "22px 20px", position: "relative" }}>
              {isCurrent && (
                <div style={{ position: "absolute", top: 14, right: 14, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: C.accent, color: "#0E7490" }}>Current</div>
              )}
              <p style={{ fontSize: 11, fontWeight: 600, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{p.name}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: C.t1, marginBottom: 2 }}>
                {p.price}<span style={{ fontSize: 13, fontWeight: 400, color: C.t3 }}>/mo</span>
              </p>
              <p style={{ fontSize: 12, color: C.t3, marginBottom: 18 }}>{p.minutes.toLocaleString()} min/month</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.t2, marginBottom: 8 }}>
                    <span style={{ color: "#059669", fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <button onClick={() => setUpgradeModal(p.name)}
                  style={{ width: "100%", padding: "9px 0", background: C.t1, color: "#FFF", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  Upgrade to {p.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage history */}
      {invoices.length > 0 && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.divider}` }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, margin: 0 }}>Usage History</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.divider}`, background: C.page }}>
                {["Period", "Calls", "Minutes Used"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 18px", fontSize: 11, fontWeight: 600, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={inv.period} style={{ borderBottom: i < invoices.length - 1 ? `1px solid ${C.divider}` : undefined }}>
                  <td style={{ padding: "11px 18px", fontSize: 13, fontWeight: 500, color: C.t1 }}>{inv.period}</td>
                  <td style={{ padding: "11px 18px", fontSize: 13, color: C.t2 }}>{inv.calls_count}</td>
                  <td style={{ padding: "11px 18px", fontSize: 13, color: C.t2 }}>{Number(inv.minutes_used).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
