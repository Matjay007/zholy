import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

const C = { page:"#F7F8FA", white:"#FFFFFF", border:"#E4E7EC", divider:"#F2F4F7", t1:"#101828", t2:"#344054", t3:"#667085", t4:"#98A2B3", accent:"#4CE9E9", adk:"#0E7490", abg:"rgba(76,233,233,0.08)" };

export default async function AnalyticsPage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);
  const period = new Date().toISOString().slice(0, 7);

  const [usage, agentStats, dailyStats] = await Promise.all([
    query<{ minutes_used: number; calls_count: number }>(
      `SELECT minutes_used, calls_count FROM zv_usage WHERE tenant_id = $1 AND period = $2`,
      [tenant.id, period]
    ),
    query<{ agent_name: string; conv_count: string; lead_count: string; avg_dur: string }>(
      `SELECT COALESCE(a.name, 'Unknown') as agent_name,
              COUNT(c.id)::text as conv_count,
              COUNT(c.id) FILTER (WHERE c.lead_captured)::text as lead_count,
              ROUND(AVG(c.duration_sec))::text as avg_dur
       FROM zv_conversations c
       LEFT JOIN zv_agents a ON a.id = c.agent_id
       WHERE c.tenant_id = $1
       GROUP BY a.name ORDER BY conv_count DESC LIMIT 10`,
      [tenant.id]
    ),
    query<{ day: string; convs: string; leads: string }>(
      `SELECT DATE(started_at)::text as day,
              COUNT(*)::text as convs,
              COUNT(*) FILTER (WHERE lead_captured)::text as leads
       FROM zv_conversations
       WHERE tenant_id = $1 AND started_at > NOW() - INTERVAL '30 days'
       GROUP BY day ORDER BY day DESC LIMIT 30`,
      [tenant.id]
    ),
  ]);

  const u = usage[0] ?? { minutes_used: 0, calls_count: 0 };
  const totalConvs = agentStats.reduce((s, a) => s + parseInt(a.conv_count, 10), 0);
  const totalLeads = agentStats.reduce((s, a) => s + parseInt(a.lead_count, 10), 0);
  const convRate = totalConvs > 0 ? ((totalLeads / totalConvs) * 100).toFixed(1) : "0";

  function dur(sec: string) {
    const n = parseInt(sec || "0", 10);
    return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  }

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--sans)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Analytics</p>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: C.t1, margin: 0, letterSpacing: "-0.02em" }}>Performance</h1>
        <p style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>30-day overview · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Conversations",  value: totalConvs.toLocaleString(),              sub: "all time" },
          { label: "Leads Captured",        value: totalLeads.toLocaleString(),              sub: "all time" },
          { label: "Conversion Rate",       value: `${convRate}%`,                           sub: "conversations → leads" },
          { label: "Minutes Used",          value: Number(u.minutes_used).toFixed(0),        sub: `of ${tenant.plan_minutes} this month` },
        ].map((s) => (
          <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px" }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 600, color: C.t1, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{s.value}</p>
            <p style={{ fontSize: 12, color: C.t3 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Agent performance */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.divider}` }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, margin: 0 }}>Agent Performance</p>
          </div>
          {agentStats.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: C.t3 }}>No data yet. Conversations will appear here once recorded.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.divider}`, background: C.page }}>
                  {["Agent", "Convs", "Leads", "Avg Dur"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 18px", fontSize: 11, fontWeight: 600, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agentStats.map((a, i) => (
                  <tr key={i} style={{ borderBottom: i < agentStats.length - 1 ? `1px solid ${C.divider}` : undefined }}>
                    <td style={{ padding: "11px 18px", fontSize: 13, fontWeight: 500, color: C.t1 }}>{a.agent_name}</td>
                    <td style={{ padding: "11px 18px", fontSize: 13, color: C.t2, fontVariantNumeric: "tabular-nums" }}>{a.conv_count}</td>
                    <td style={{ padding: "11px 18px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#ECFDF5", color: "#059669" }}>{a.lead_count}</span>
                    </td>
                    <td style={{ padding: "11px 18px", fontSize: 13, color: C.t3, fontVariantNumeric: "tabular-nums" }}>{dur(a.avg_dur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent activity */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.divider}` }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, margin: 0 }}>Daily Activity (last 30 days)</p>
          </div>
          {dailyStats.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: C.t3 }}>No data yet.</p>
            </div>
          ) : (
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.divider}`, background: C.page, position: "sticky", top: 0 }}>
                    {["Date", "Conversations", "Leads"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 18px", fontSize: 11, fontWeight: 600, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.map((d, i) => (
                    <tr key={i} style={{ borderBottom: i < dailyStats.length - 1 ? `1px solid ${C.divider}` : undefined }}>
                      <td style={{ padding: "10px 18px", fontSize: 13, color: C.t2, fontVariantNumeric: "tabular-nums" }}>
                        {new Date(d.day).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td style={{ padding: "10px 18px", fontSize: 13, color: C.t2 }}>{d.convs}</td>
                      <td style={{ padding: "10px 18px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: parseInt(d.leads) > 0 ? "#ECFDF5" : C.page, color: parseInt(d.leads) > 0 ? "#059669" : C.t4 }}>
                          {d.leads}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
