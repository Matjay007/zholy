import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

/* ─── DS ─── */
const C = {
  page:    "#F7F8FA",
  white:   "#FFFFFF",
  border:  "#E4E7EC",
  divider: "#F2F4F7",
  t1:      "#101828",
  t2:      "#344054",
  t3:      "#667085",
  t4:      "#98A2B3",
  accent:  "#4CE9E9",
  adk:     "#0E7490",
  abg:     "rgba(76,233,233,0.08)",
};

function StatCard({ label, value, sub, trend }: { label: string; value: string | number; sub: string; trend?: string }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px" }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 600, color: C.t1, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      <p style={{ fontSize: 12, color: C.t3 }}>{sub}</p>
      {trend && <p style={{ fontSize: 11, color: "#10B981", marginTop: 4 }}>{trend}</p>}
    </div>
  );
}

function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: "52px 20px", textAlign: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: C.page, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
        {icon}
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 13, color: C.t3, marginBottom: action ? 16 : 0 }}>{desc}</p>
      {action}
    </div>
  );
}

export default async function OverviewPage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);
  const period = new Date().toISOString().slice(0, 7);

  const [agents, conversations, leads, usageRows, totalLeads, totalConvs] = await Promise.all([
    query<{ id: string; name: string; status: string }>(
      `SELECT id, name, status FROM zv_agents WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenant.id]
    ),
    query<{ id: string; started_at: string; duration_sec: number; lead_captured: boolean; visitor_page: string | null; agent_name: string }>(
      `SELECT c.id, c.started_at, c.duration_sec, c.lead_captured, c.visitor_page,
              COALESCE(a.name, 'Unknown') as agent_name
       FROM zv_conversations c
       LEFT JOIN zv_agents a ON a.id = c.agent_id
       WHERE c.tenant_id = $1 ORDER BY c.started_at DESC LIMIT 5`,
      [tenant.id]
    ),
    query<{ id: string; name: string | null; email: string | null; captured_at: string; agent_name: string }>(
      `SELECT l.id, l.name, l.email, l.captured_at, COALESCE(a.name, 'Unknown') as agent_name
       FROM zv_leads l
       LEFT JOIN zv_agents a ON a.id = l.agent_id
       WHERE l.tenant_id = $1 ORDER BY l.captured_at DESC LIMIT 5`,
      [tenant.id]
    ),
    query<{ minutes_used: number; calls_count: number }>(
      `SELECT minutes_used, calls_count FROM zv_usage WHERE tenant_id = $1 AND period = $2`,
      [tenant.id, period]
    ),
    query<{ count: string }>(`SELECT COUNT(*)::text FROM zv_leads WHERE tenant_id = $1`, [tenant.id]),
    query<{ count: string }>(`SELECT COUNT(*)::text FROM zv_conversations WHERE tenant_id = $1`, [tenant.id]),
  ]);

  const usage = usageRows[0] ?? { minutes_used: 0, calls_count: 0 };
  const activeAgents = agents.filter((a) => a.status === "ready").length;
  const leadCount = parseInt(totalLeads[0]?.count ?? "0", 10);
  const convCount = parseInt(totalConvs[0]?.count ?? "0", 10);
  const pctUsed = Math.min(100, Math.round((Number(usage.minutes_used) / tenant.plan_minutes) * 100));
  const isNew = agents.length === 0;
  const firstName = (session.name || session.email || "there").split(/[\s@]/)[0];

  function fmtTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function dur(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  const statusColor: Record<string, { bg: string; text: string }> = {
    ready:    { bg: "#ECFDF5", text: "#059669" },
    draft:    { bg: "#F0F9FF", text: "#0369A1" },
    disabled: { bg: "#FEF2F2", text: "#DC2626" },
  };

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--sans)", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Dashboard
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.t1, margin: 0, letterSpacing: "-0.02em" }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/app/agents/new"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "9px 18px", borderRadius: 10,
            background: C.t1, color: "#FFF",
            fontSize: 14, fontWeight: 500, textDecoration: "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M7 1v12M1 7h12"/>
          </svg>
          New Agent
        </Link>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Active Agents"   value={activeAgents}                          sub={`${agents.length} total agent${agents.length !== 1 ? "s" : ""}`} />
        <StatCard label="Conversations"   value={convCount.toLocaleString()}            sub={`${usage.calls_count} this month`} />
        <StatCard label="Leads Captured"  value={leadCount.toLocaleString()}            sub="all time" />
        <StatCard label="Minutes Used"    value={Number(usage.minutes_used).toFixed(0)} sub={`of ${tenant.plan_minutes.toLocaleString()} this month`} />
      </div>

      {/* ── Minutes bar ── */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 22px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 12, color: C.t3 }}>Usage this month</span>
            <span style={{ fontSize: 12, color: C.t2, fontWeight: 500 }}>{pctUsed}%</span>
          </div>
          <div style={{ height: 6, background: C.page, borderRadius: 99 }}>
            <div style={{ width: `${pctUsed}%`, height: "100%", borderRadius: 99, background: pctUsed > 85 ? "#EF4444" : pctUsed > 60 ? "#F59E0B" : C.accent }} />
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 99, background: "#F0FDF4", color: "#059669" }}>
            {tenant.plan}
          </span>
        </div>
      </div>

      {/* ── Onboarding (new user) ── */}
      {isNew && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "28px 28px 24px", marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Get started</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: C.t1, marginBottom: 24, letterSpacing: "-0.01em" }}>
            Set up your voice agent in 3 steps
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { done: true,  n: 1, title: "Create your account",      desc: "Done — you're logged in." },
              { done: false, n: 2, title: "Create your first agent",   desc: "Give it a name, voice, and goals.", href: "/app/agents/new" },
              { done: false, n: 3, title: "Embed it on your website",  desc: "One script tag for sites, SDK for apps." },
            ].map((step) => (
              <div key={step.n} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: step.done ? C.accent : C.page,
                  border: `1px solid ${step.done ? C.accent : C.border}`,
                  fontSize: 12, fontWeight: 600,
                  color: step.done ? "#0E7490" : C.t3,
                }}>
                  {step.done ? "✓" : step.n}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: step.done ? C.t3 : C.t1, marginBottom: 2, textDecoration: step.done ? "line-through" : "none" }}>
                    {step.title}
                  </p>
                  <p style={{ fontSize: 13, color: C.t3 }}>{step.desc}</p>
                  {step.href && (
                    <Link href={step.href} style={{ fontSize: 13, color: C.adk, fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                      Get started →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Content grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Recent Conversations */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.divider}` }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, margin: 0 }}>Recent Conversations</p>
            <Link href="/app/conversations" style={{ fontSize: 12, color: C.adk, textDecoration: "none", fontWeight: 500 }}>View all →</Link>
          </div>
          {conversations.length === 0 ? (
            <EmptyState
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.t4} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
              title="No conversations yet"
              desc="Conversations appear here once visitors talk to your agent."
            />
          ) : (
            <div>
              {conversations.map((c, i) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < conversations.length - 1 ? `1px solid ${C.divider}` : undefined }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: C.t1, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.agent_name}
                    </p>
                    <p style={{ fontSize: 12, color: C.t3, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.visitor_page || "—"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 12, color: C.t3, margin: 0 }}>{dur(c.duration_sec)}</p>
                    <p style={{ fontSize: 11, color: C.t4, margin: 0 }}>{fmtTime(c.started_at)}</p>
                  </div>
                  {c.lead_captured && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#ECFDF5", color: "#059669", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
                      Lead
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Leads */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.divider}` }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, margin: 0 }}>Latest Leads</p>
            <Link href="/app/leads" style={{ fontSize: 12, color: C.adk, textDecoration: "none", fontWeight: 500 }}>View all →</Link>
          </div>
          {leads.length === 0 ? (
            <EmptyState
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.t4} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              title="No leads yet"
              desc="When your agent captures contact info, leads appear here."
            />
          ) : (
            <div>
              {leads.map((l, i) => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < leads.length - 1 ? `1px solid ${C.divider}` : undefined }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.abg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: C.adk, flexShrink: 0 }}>
                    {(l.name || l.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: C.t1, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.name || l.email || "Anonymous"}
                    </p>
                    <p style={{ fontSize: 12, color: C.t3, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.email || l.agent_name}
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: C.t4, flexShrink: 0 }}>{fmtTime(l.captured_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agents */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.divider}` }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, margin: 0 }}>Your Agents</p>
            <Link href="/app/agents" style={{ fontSize: 12, color: C.adk, textDecoration: "none", fontWeight: 500 }}>Manage →</Link>
          </div>
          {agents.length === 0 ? (
            <EmptyState
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.t4} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M12 7V3"/><circle cx="8" cy="14" r="1.5"/><circle cx="16" cy="14" r="1.5"/><path d="M9 18h6"/></svg>}
              title="No agents yet"
              desc="Create your first voice agent to get started."
              action={
                <Link href="/app/agents/new" style={{ display: "inline-flex", alignItems: "center", padding: "8px 18px", background: C.t1, color: "#FFF", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                  Create Agent
                </Link>
              }
            />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 1, background: C.divider }}>
              {agents.map((a) => {
                const sc = statusColor[a.status] ?? { bg: C.page, text: C.t3 };
                return (
                  <Link key={a.id} href={`/app/agents/${a.id}`} style={{ background: C.white, padding: "16px 20px", textDecoration: "none", display: "block" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: C.t1, margin: 0 }}>{a.name}</p>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: sc.bg, color: sc.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {a.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: C.t4, margin: 0 }}>Click to configure →</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
