import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";

const C = { page:"#F7F8FA", white:"#FFFFFF", border:"#E4E7EC", divider:"#F2F4F7", t1:"#101828", t2:"#344054", t3:"#667085", t4:"#98A2B3", accent:"#4CE9E9", adk:"#0E7490", abg:"rgba(76,233,233,0.08)", danger:"#FEF2F2", dangerT:"#DC2626" };

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.divider}` }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: C.t1, margin: 0 }}>{title}</p>
        {desc && <p style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>{desc}</p>}
      </div>
      <div style={{ padding: "24px" }}>{children}</div>
    </div>
  );
}

function Field({ label, value, type = "text", name, readOnly }: { label: string; value?: string; type?: string; name?: string; readOnly?: boolean }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.t2, marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={value}
        readOnly={readOnly}
        style={{
          display: "block", width: "100%", padding: "9px 13px", borderRadius: 8,
          border: `1px solid ${C.border}`, background: readOnly ? C.page : C.white,
          fontSize: 14, color: readOnly ? C.t3 : C.t1, outline: "none", boxSizing: "border-box",
          fontFamily: "var(--sans)",
        }}
      />
    </div>
  );
}

export default async function SettingsPage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--sans)", minHeight: "100vh", maxWidth: 720 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Settings</p>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: C.t1, margin: 0, letterSpacing: "-0.02em" }}>Account Settings</h1>
      </div>

      {/* Profile */}
      <SectionCard title="Profile" desc="Your account details.">
        <Field label="Name"   value={session.name || ""} name="name" />
        <Field label="Email"  value={session.email}      readOnly />
        <button style={{ padding: "9px 20px", background: C.t1, color: "#FFF", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Save Changes
        </button>
      </SectionCard>

      {/* Workspace */}
      <SectionCard title="Workspace" desc="Your organization settings.">
        <Field label="Workspace ID" value={tenant.id} readOnly />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: C.page, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Plan</p>
            <p style={{ fontSize: 20, fontWeight: 600, color: C.t1 }}>{tenant.plan}</p>
          </div>
          <div style={{ background: C.page, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.t4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Monthly Minutes</p>
            <p style={{ fontSize: 20, fontWeight: 600, color: C.t1 }}>{tenant.plan_minutes.toLocaleString()}</p>
          </div>
        </div>
      </SectionCard>

      {/* Danger zone */}
      <div style={{ background: C.danger, border: `1px solid #FECACA`, borderRadius: 12, padding: "20px 24px" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: C.dangerT, marginBottom: 6 }}>Danger Zone</p>
        <p style={{ fontSize: 13, color: "#7F1D1D", marginBottom: 16 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button style={{ padding: "9px 20px", background: C.dangerT, color: "#FFF", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Delete Account
        </button>
      </div>

    </div>
  );
}
