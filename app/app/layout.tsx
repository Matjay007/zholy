import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";
import SidebarClient from "@/components/SidebarClient";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);
  const period = new Date().toISOString().slice(0, 7);
  const usageRows = await query<{ minutes_used: number; calls_count: number }>(
    `SELECT minutes_used, calls_count FROM zv_usage WHERE tenant_id = $1 AND period = $2`,
    [tenant.id, period]
  );
  const usage = usageRows[0] ?? { minutes_used: 0, calls_count: 0 };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F8FA" }}>
      <SidebarClient
        tenantId={tenant.id}
        plan={tenant.plan}
        planMinutes={tenant.plan_minutes}
        minutesUsed={Number(usage.minutes_used)}
        email={session.email}
        name={session.name}
      />
      <main style={{ flex: 1, marginLeft: 240, minHeight: "100vh", background: "#F7F8FA", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
