import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json([]);
  try {
    const tenant = await getOrCreateTenant(session.sub, session.email, session.name);
    const rows = await query<{ period: string; minutes_used: number; calls_count: number }>(
      `SELECT period, minutes_used, calls_count FROM zv_usage WHERE tenant_id = $1 ORDER BY period DESC LIMIT 6`,
      [tenant.id]
    ).catch(() => []);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
