import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  captured_at: string;
  notes: string | null;
  agent_name: string;
}

const C = { page:"#F7F8FA", white:"#FFFFFF", border:"#E4E7EC", divider:"#F2F4F7", t1:"#101828", t2:"#344054", t3:"#667085", t4:"#98A2B3", accent:"#4CE9E9", adk:"#0E7490", abg:"rgba(76,233,233,0.08)" };

export default async function LeadsPage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);

  const leads = await query<Lead>(
    `SELECT l.id, l.name, l.email, l.phone, l.company, l.captured_at, l.notes,
            COALESCE(a.name, 'Unknown Agent') as agent_name
     FROM zv_leads l
     LEFT JOIN zv_agents a ON a.id = l.agent_id
     WHERE l.tenant_id = $1
     ORDER BY l.captured_at DESC`,
    [tenant.id]
  );

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const csvRows = [
    ["Name", "Email", "Phone", "Company", "Agent", "Captured At", "Notes"],
    ...leads.map((l) => [l.name||"", l.email||"", l.phone||"", l.company||"", l.agent_name, l.captured_at, l.notes||""]),
  ].map((r) => r.map((v) => `"${v.replace(/"/g,'""')}"`).join(",")).join("\n");

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--sans)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Leads</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.t1, margin: 0, letterSpacing: "-0.02em" }}>Lead Inbox</h1>
          <p style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>{leads.length} lead{leads.length !== 1 ? "s" : ""} captured</p>
        </div>
        {leads.length > 0 && (
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvRows)}`}
            download="zholy-leads.csv"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10, background: C.white, color: C.t2, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 500, textDecoration: "none" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M7 1v8M4 6l3 3 3-3M1 10v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2"/>
            </svg>
            Export CSV
          </a>
        )}
      </div>

      {/* Table */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {leads.length === 0 ? (
          <div style={{ padding: "80px 20px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.page, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.t4} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.t1, marginBottom: 6 }}>No leads yet</p>
            <p style={{ fontSize: 13, color: C.t3, maxWidth: 320, margin: "0 auto" }}>When your voice agent captures contact information from visitors, leads will appear here.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.divider}`, background: C.page }}>
                {["Name", "Email", "Phone", "Company", "Agent", "Captured"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontSize: 11, fontWeight: 600, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={lead.id} style={{ borderBottom: i < leads.length - 1 ? `1px solid ${C.divider}` : undefined }}>
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.abg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: C.adk, flexShrink: 0 }}>
                        {(lead.name || lead.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>{lead.name || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: C.t2 }}>{lead.email || "—"}</td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: C.t2 }}>{lead.phone || "—"}</td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: C.t2 }}>{lead.company || "—"}</td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: C.t2 }}>{lead.agent_name}</td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: C.t3, whiteSpace: "nowrap" }}>{fmtTime(lead.captured_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
