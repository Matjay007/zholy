import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

interface Agent {
  id: string;
  name: string;
  site_url: string;
  status: string;
  created_at: string;
  knowledge_chunks: number;
}

const C = { page:"#F7F8FA", white:"#FFFFFF", border:"#E4E7EC", divider:"#F2F4F7", t1:"#101828", t2:"#344054", t3:"#667085", t4:"#98A2B3", accent:"#4CE9E9", adk:"#0E7490", abg:"rgba(76,233,233,0.08)" };

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  ready:    { bg: "#ECFDF5", text: "#059669", dot: "#059669" },
  building: { bg: "#FFFBEB", text: "#D97706", dot: "#D97706" },
  draft:    { bg: "#F0F9FF", text: "#0369A1", dot: "#0369A1" },
  disabled: { bg: "#FEF2F2", text: "#DC2626", dot: "#DC2626" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AgentsPage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);

  const agents = await query<Agent>(
    `SELECT id, name, site_url, status, created_at, knowledge_chunks
     FROM zv_agents WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenant.id]
  );

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--sans)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Agents</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.t1, margin: 0, letterSpacing: "-0.02em" }}>Your Agents</h1>
          <p style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>{agents.length} agent{agents.length !== 1 ? "s" : ""} configured</p>
        </div>
        <Link
          href="/app/agents/new"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10, background: C.t1, color: "#FFF", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 1v12M1 7h12"/></svg>
          New Agent
        </Link>
      </div>

      {/* Content */}
      {agents.length === 0 ? (
        <div style={{ background: C.white, border: `2px dashed ${C.border}`, borderRadius: 16, padding: "80px 20px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: C.abg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.adk} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="3"/><path d="M12 7V3"/>
              <circle cx="8" cy="14" r="1.5"/><circle cx="16" cy="14" r="1.5"/><path d="M9 18h6"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: C.t1, marginBottom: 8 }}>No agents yet</h2>
          <p style={{ fontSize: 13, color: C.t3, maxWidth: 340, margin: "0 auto 24px" }}>
            Create your first voice AI agent — deploy to any website, app, or custom software.
          </p>
          <Link href="/app/agents/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 10, background: C.t1, color: "#FFF", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
            Create your first agent →
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {agents.map((a) => {
            const st = statusStyle[a.status] ?? { bg: C.page, text: C.t3, dot: C.t4 };
            return (
              <Link
                key={a.id}
                href={`/app/agents/${a.id}`}
                style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 22px", textDecoration: "none", display: "flex", alignItems: "center", gap: 18, transition: "box-shadow 120ms" }}
              >
                {/* Icon */}
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.abg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.adk} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="3"/><path d="M12 7V3"/>
                    <circle cx="8" cy="14" r="1.5"/><circle cx="16" cy="14" r="1.5"/><path d="M9 18h6"/>
                  </svg>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, margin: 0 }}>{a.name}</p>
                  <p style={{ fontSize: 12, color: C.t3, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.site_url || "No site URL set"}
                  </p>
                </div>

                {/* Meta */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
                  {a.knowledge_chunks > 0 && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 11, color: C.t4, margin: 0 }}>Knowledge</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.t2, margin: 0 }}>{a.knowledge_chunks} chunks</p>
                    </div>
                  )}
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: C.t4, margin: 0 }}>Created</p>
                    <p style={{ fontSize: 13, color: C.t2, margin: 0 }}>{fmt(a.created_at)}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: st.bg, color: st.text, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                    {a.status}
                  </span>
                </div>

                {/* Arrow */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.t4} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
