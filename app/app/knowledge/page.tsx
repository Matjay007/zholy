import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

const C = { page:"#F7F8FA", white:"#FFFFFF", border:"#E4E7EC", divider:"#F2F4F7", t1:"#101828", t2:"#344054", t3:"#667085", t4:"#98A2B3", accent:"#4CE9E9", adk:"#0E7490", abg:"rgba(76,233,233,0.08)" };

export default async function KnowledgePage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);

  let docs: Array<{ id: string; title: string; created_at: string; chunk_count: number }> = [];
  try {
    docs = await query(
      `SELECT id, title, created_at, chunk_count FROM zv_knowledge WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenant.id]
    );
  } catch { /* table may not exist yet */ }

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--sans)", minHeight: "100vh", maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Knowledge</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.t1, margin: 0, letterSpacing: "-0.02em" }}>Knowledge Base</h1>
          <p style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>Documents your agents can reference during conversations</p>
        </div>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10, background: C.t1, color: "#FFF", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 1v12M1 7h12"/></svg>
          Add Document
        </button>
      </div>

      {/* Content */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {docs.length === 0 ? (
          <div style={{ padding: "80px 20px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.page, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.t4} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.t1, marginBottom: 6 }}>No documents yet</p>
            <p style={{ fontSize: 13, color: C.t3, maxWidth: 360, margin: "0 auto 20px" }}>
              Upload FAQs, product docs, or any text your agent should know. Documents are automatically chunked and embedded for retrieval.
            </p>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, background: C.t1, color: "#FFF", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}>
              Upload your first document
            </button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.divider}`, background: C.page }}>
                {["Document", "Chunks", "Added"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontSize: 11, fontWeight: 600, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <tr key={doc.id} style={{ borderBottom: i < docs.length - 1 ? `1px solid ${C.divider}` : undefined }}>
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: C.abg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.adk} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>{doc.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: C.t3 }}>{doc.chunk_count || "—"}</td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: C.t3 }}>{fmtTime(doc.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
