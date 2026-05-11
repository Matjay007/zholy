import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const tenant = await getOrCreateTenant(session.sub, session.email, session.name);
    const docs = await query(
      `SELECT id, title, created_at, chunk_count FROM zv_knowledge WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenant.id]
    );
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { title, content } = await req.json();
    if (!title || !content) return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    const tenant = await getOrCreateTenant(session.sub, session.email, session.name);

    // Check if zv_knowledge table exists, create if not
    await query(`CREATE TABLE IF NOT EXISTS zv_knowledge (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES zv_tenants(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      chunk_count INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT now()
    )`, []);

    const rows = await query(
      `INSERT INTO zv_knowledge (tenant_id, title, content, chunk_count) VALUES ($1, $2, $3, $4) RETURNING id, title, created_at, chunk_count`,
      [tenant.id, title, content, Math.ceil(content.length / 500)]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: unknown) {
    console.error("[knowledge POST]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
