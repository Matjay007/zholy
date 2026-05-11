import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);
  const url = new URL(req.url);
  const agentId = url.searchParams.get("agent_id");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

  let sql = `SELECT c.*, COALESCE(a.name, 'Unknown') as agent_name
             FROM zv_conversations c
             LEFT JOIN zv_agents a ON a.id = c.agent_id
             WHERE c.tenant_id = $1`;
  const params: unknown[] = [tenant.id];

  if (agentId) {
    sql += ` AND c.agent_id = $2`;
    params.push(agentId);
  }

  sql += ` ORDER BY c.started_at DESC LIMIT ${limit}`;

  const rows = await query(sql, params);
  return NextResponse.json(rows);
}
