import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { query } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);

  const rows = await query(
    `SELECT * FROM zv_agents WHERE id = $1 AND tenant_id = $2`,
    [id, tenant.id]
  );

  if (rows.length === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const allowed: Record<string, string> = {
    name: "name",
    site_url: "site_url",
    status: "status",
    config: "config",
  };

  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  for (const [k, col] of Object.entries(allowed)) {
    if (k in body) {
      sets.push(
        k === "config"
          ? `${col} = $${idx}::jsonb`
          : `${col} = $${idx}`
      );
      vals.push(k === "config" ? JSON.stringify(body[k]) : body[k]);
      idx++;
    }
  }

  if (sets.length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  sets.push(`updated_at = now()`);

  vals.push(id);
  vals.push(tenant.id);

  const rows = await query(
    `UPDATE zv_agents SET ${sets.join(", ")}
     WHERE id = $${idx} AND tenant_id = $${idx + 1}
     RETURNING *`,
    vals
  );

  if (rows.length === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);

  await query(
    `DELETE FROM zv_agents WHERE id = $1 AND tenant_id = $2`,
    [id, tenant.id]
  );

  return NextResponse.json({ ok: true });
}
