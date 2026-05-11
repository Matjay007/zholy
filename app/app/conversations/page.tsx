import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

interface Conversation {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number;
  lead_captured: boolean;
  visitor_country: string | null;
  visitor_page: string | null;
  agent_name: string;
}

const C = { page:"#F7F8FA", white:"#FFFFFF", border:"#E4E7EC", divider:"#F2F4F7", t1:"#101828", t2:"#344054", t3:"#667085", t4:"#98A2B3", adk:"#0E7490", abg:"rgba(76,233,233,0.08)" };

export default async function ConversationsPage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);

  const conversations = await query<Conversation>(
    `SELECT c.id, c.started_at, c.ended_at, c.duration_sec, c.lead_captured,
            c.visitor_country, c.visitor_page,
            COALESCE(a.name, 'Unknown Agent') as agent_name
     FROM zv_conversations c
     LEFT JOIN zv_agents a ON a.id = c.agent_id
     WHERE c.tenant_id = $1
     ORDER BY c.started_at DESC
     LIMIT 100`,
    [tenant.id]
  );

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function dur(sec: number) {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  }

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--sans)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Conversations</p>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: C.t1, margin: 0, letterSpacing: "-0.02em" }}>Conversation History</h1>
        <p style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>{conversations.length} conversation{conversations.length !== 1 ? "s" : ""} recorded</p>
      </div>

      {/* Table */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {conversations.length === 0 ? (
          <div style={{ padding: "80px 20px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.page, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.t4} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.t1, marginBottom: 6 }}>No conversations yet</p>
            <p style={{ fontSize: 13, color: C.t3, maxWidth: 340, margin: "0 auto" }}>Deploy an agent on your site and conversations will appear here in real time.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.divider}`, background: C.page }}>
                {["Started", "Agent", "Page", "Duration", "Country", "Lead"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontSize: 11, fontWeight: 600, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conversations.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < conversations.length - 1 ? `1px solid ${C.divider}` : undefined }}>
                  <td style={{ padding: "12px 18px", fontSize: 13, color: C.t2, whiteSpace: "nowrap" }}>{fmtTime(c.started_at)}</td>
                  <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 500, color: C.t1 }}>{c.agent_name}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: C.t3, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.visitor_page ? (
                      <span title={c.visitor_page}>{c.visitor_page.replace(/^https?:\/\/[^/]+/, "")|| "/"}</span>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "12px 18px", fontSize: 13, color: C.t2, fontVariantNumeric: "tabular-nums" }}>{dur(c.duration_sec)}</td>
                  <td style={{ padding: "12px 18px", fontSize: 13, color: C.t3 }}>{c.visitor_country || "—"}</td>
                  <td style={{ padding: "12px 18px" }}>
                    {c.lead_captured ? (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#ECFDF5", color: "#059669", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Yes
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: C.t4 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
