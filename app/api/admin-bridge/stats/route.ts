/**
 * GET /api/admin-bridge/stats
 *
 * Standardised stats endpoint consumed by ZHOLY hub admin dashboard.
 * Authenticated via HMAC signature (x-zholy-sig header) or ZHOLY_ADMIN_BRIDGE_KEY.
 *
 * Returns: { product, users, revenue, health }
 */

import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/hmac";
import { query } from "@/lib/db";
import { getOrCreateTenant } from "@/lib/tenants";

export const dynamic = "force-dynamic";

function verifyBridgeAuth(req: Request, body: string): boolean {
  const key = process.env.ZHOLY_ADMIN_BRIDGE_KEY;
  if (!key) {
    // If key is not set, fall back to admin secret for local dev
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) return true;
    return req.headers.get("x-admin-secret") === adminSecret;
  }
  return verifyRequest(req, body);
}

export async function GET(req: Request) {
  if (!verifyBridgeAuth(req, "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const period = new Date().toISOString().slice(0, 7);

    const [tenantCount, planBreakdown, usageSummary] = await Promise.allSettled([
      query<{ count: string }>("SELECT COUNT(*) as count FROM zv_tenants"),
      query<{ plan: string; count: string }>(
        "SELECT plan, COUNT(*) as count FROM zv_tenants GROUP BY plan"
      ),
      query<{ total_minutes: number; total_calls: number }>(
        "SELECT SUM(minutes_used) as total_minutes, SUM(calls_count) as total_calls FROM zv_usage WHERE period = $1",
        [period]
      ),
    ]);

    const totalUsers = tenantCount.status === "fulfilled" ? Number(tenantCount.value[0]?.count ?? 0) : null;

    const plans: Record<string, number> = {};
    if (planBreakdown.status === "fulfilled") {
      for (const row of planBreakdown.value) {
        plans[row.plan] = Number(row.count);
      }
    }

    const usage = usageSummary.status === "fulfilled" ? usageSummary.value[0] : null;

    return NextResponse.json({
      product: "zholy",
      users: {
        total: totalUsers,
        planBreakdown: plans,
      },
      usage: {
        minutesThisMonth: usage ? Number(usage.total_minutes) : null,
        callsThisMonth: usage ? Number(usage.total_calls) : null,
        period,
      },
      health: { ok: true, checkedAt: new Date().toISOString() },
    });
  } catch (e) {
    return NextResponse.json({
      product: "zholy",
      users: { total: null, planBreakdown: null },
      usage: null,
      health: { ok: false, error: String(e), checkedAt: new Date().toISOString() },
    });
  }
}
