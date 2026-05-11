import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";
import AgentConfigTabs from "@/components/AgentConfigTabs";

interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  site_url: string;
  status: string;
  embed_key: string;
  config: Record<string, unknown>;
  knowledge_chunks: number;
  created_at: string;
  updated_at: string;
}

interface Props { params: Promise<{ id: string }> }

const C = { page:"#F7F8FA", white:"#FFFFFF", border:"#E4E7EC", divider:"#F2F4F7", t1:"#101828", t2:"#344054", t3:"#667085", t4:"#98A2B3", accent:"#4CE9E9", adk:"#0E7490", abg:"rgba(76,233,233,0.08)" };

const statusStyle: Record<string, { bg: string; text: string }> = {
  ready:    { bg: "#ECFDF5", text: "#059669" },
  building: { bg: "#FFFBEB", text: "#D97706" },
  draft:    { bg: "#F0F9FF", text: "#0369A1" },
  disabled: { bg: "#FEF2F2", text: "#DC2626" },
};

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  if (!session) redirect("/signin");

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);

  const agents = await query<Agent>(
    `SELECT * FROM zv_agents WHERE id = $1 AND tenant_id = $2`,
    [id, tenant.id]
  );
  if (agents.length === 0) notFound();
  const agent = agents[0];

  const [convStats, leadStats] = await Promise.all([
    query<{ count: string; avg_sec: string }>(
      `SELECT COUNT(*)::text, COALESCE(AVG(duration_sec),0)::text as avg_sec FROM zv_conversations WHERE agent_id = $1`,
      [agent.id]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text FROM zv_leads WHERE agent_id = $1`,
      [agent.id]
    ),
  ]);

  const stats = convStats[0] ?? { count: "0", avg_sec: "0" };
  const leadCount = leadStats[0]?.count ?? "0";

  function fmtDur(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL?.trim() || "https://zholy.com";
  const embedSnippet = `<script type="module" src="${gatewayUrl}/embed/zholy-embed.js?key=${agent.embed_key}&gateway=${gatewayUrl}" async></script>`;
  const st = statusStyle[agent.status] ?? { bg: C.page, text: C.t3 };

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--sans)", minHeight: "100vh" }}>

      {/* Breadcrumb + Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Link href="/app/agents" style={{ fontSize: 13, color: C.t3, textDecoration: "none" }}>Agents</Link>
          <span style={{ fontSize: 13, color: C.t4 }}>/</span>
          <span style={{ fontSize: 13, color: C.t1 }}>{agent.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: C.t1, margin: 0, letterSpacing: "-0.02em" }}>{agent.name}</h1>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: st.bg, color: st.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {agent.status}
              </span>
            </div>
            {agent.site_url && (
              <a href={agent.site_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.t3, textDecoration: "none" }}>
                {agent.site_url} ↗
              </a>
            )}
          </div>
          <a
            href={`${agent.site_url || "https://example.com"}?zrotest=1`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: C.white, border: `1px solid ${C.border}`, fontSize: 13, color: C.t2, textDecoration: "none", fontWeight: 500 }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 2.5H2a1 1 0 0 0-1 1v8.5a1 1 0 0 0 1 1h8.5a1 1 0 0 0 1-1V8.5M8 1.5h4.5V6M12.5 1.5L6.5 7.5"/>
            </svg>
            Test Agent
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Conversations",  value: stats.count },
          { label: "Leads Captured", value: leadCount },
          { label: "Avg Duration",   value: fmtDur(parseFloat(stats.avg_sec)) },
        ].map((s) => (
          <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 22px" }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 30, fontWeight: 600, color: C.t1, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Embed snippet */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.divider}` }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, margin: 0 }}>Embed Snippet</p>
          <p style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>
            Paste before &lt;/body&gt; on your site, or add via SDK in your app
          </p>
        </div>
        <div style={{ padding: "16px 20px", background: C.page, overflowX: "auto" }}>
          <code style={{ fontFamily: "var(--mono)", fontSize: 12, color: C.adk, lineHeight: 1.6, wordBreak: "break-all" }}>
            {embedSnippet}
          </code>
        </div>
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.divider}` }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: C.t3 }}>
            Embed key: <span style={{ color: C.t1 }}>{agent.embed_key}</span>
          </span>
        </div>
      </div>

      {/* Config tabs */}
      <AgentConfigTabs agent={agent} embedSnippet={embedSnippet} />
    </div>
  );
}
