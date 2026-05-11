import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const tenant = await getOrCreateTenant(session.sub, session.email, session.name);
    const period = new Date().toISOString().slice(0, 7);
    const rows = await query<{ minutes_used: number; calls_count: number }>(
      `SELECT minutes_used, calls_count FROM zv_usage WHERE tenant_id = $1 AND period = $2`,
      [tenant.id, period]
    ).catch(() => []);
    const u = rows[0] ?? { minutes_used: 0, calls_count: 0 };
    return NextResponse.json({
      plan: tenant.plan,
      plan_minutes: tenant.plan_minutes,
      minutes_used: u.minutes_used,
      calls_count: u.calls_count,
      period,
    });
  } catch (err) {
    console.error("[usage GET]", err);
    return NextResponse.json({ plan: "free", plan_minutes: 100, minutes_used: 0, calls_count: 0 });
  }
}
