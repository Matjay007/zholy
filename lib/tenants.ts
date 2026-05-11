import { query } from "./db";

export interface Tenant {
  id: string;
  sso_sub: string;
  email: string;
  name: string;
  plan: string;
  plan_minutes: number;
  created_at: string;
}

export async function getOrCreateTenant(
  ssoSub: string,
  email: string,
  name: string
): Promise<Tenant> {
  const rows = await query<Tenant>(
    `INSERT INTO zv_tenants (sso_sub, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (sso_sub) DO UPDATE
       SET email = EXCLUDED.email,
           name  = EXCLUDED.name
     RETURNING *`,
    [ssoSub, email, name]
  );
  return rows[0];
}

export async function getTenantBySub(ssoSub: string): Promise<Tenant | null> {
  const rows = await query<Tenant>(
    `SELECT * FROM zv_tenants WHERE sso_sub = $1`,
    [ssoSub]
  );
  return rows[0] ?? null;
}
