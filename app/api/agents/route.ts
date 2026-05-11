import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

interface Agent {
  id: string; name: string; site_url: string; status: string;
  embed_key: string; config: Record<string, unknown>; knowledge_chunks: number; created_at: string;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const tenant = await getOrCreateTenant(session.sub, session.email, session.name);
    const agents = await query<Agent>(
      `SELECT id, name, site_url, status, embed_key, config, knowledge_chunks, created_at
       FROM zv_agents WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenant.id]
    );
    return NextResponse.json(agents);
  } catch (err) {
    console.error("[agents GET]:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { name?: string; site_url?: string; config?: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const { name = "My Agent", site_url = "", config = {} } = body;
  try {
    const tenant = await getOrCreateTenant(session.sub, session.email, session.name);
    const rows = await query<Agent>(
      `INSERT INTO zv_agents (tenant_id, name, site_url, config, status)
       VALUES ($1, $2, $3, $4, 'ready') RETURNING *`,
      [tenant.id, name, site_url, JSON.stringify(config)]
    );
    const agent = rows[0];
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL?.trim() || "https://zholy.com";
    const embedSnippet = `<script type="module" src="${gatewayUrl}/embed/zholy-embed.js?key=${agent.embed_key}&gateway=${gatewayUrl}" async></script>`;
    return NextResponse.json({ ...agent, embed_snippet: embedSnippet }, { status: 201 });
  } catch (err) {
    console.error("[agents POST]:", err);
    const msg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
