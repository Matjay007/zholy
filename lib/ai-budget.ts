import { query } from "@/lib/db";

// Daily AI request budgets by plan
const PLAN_DAILY_REQUESTS: Record<string, number> = {
  free:      50,    // 50 AI requests/day
  local:     50,
  cloud:     500,
  sovereign: 0,     // unlimited
};

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await query(`
    CREATE TABLE IF NOT EXISTS zv_ai_budget (
      tenant_id  TEXT    NOT NULL,
      date       DATE    NOT NULL DEFAULT CURRENT_DATE,
      requests   INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (tenant_id, date)
    )
  `);
  tableReady = true;
}

export async function checkAIBudget(
  tenantId: string,
  plan: string,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = PLAN_DAILY_REQUESTS[plan] ?? PLAN_DAILY_REQUESTS.free;
  if (limit === 0) return { allowed: true, used: 0, limit: 0 };

  await ensureTable();

  const rows = await query<{ requests: number }>(
    `SELECT requests FROM zv_ai_budget WHERE tenant_id = $1 AND date = CURRENT_DATE`,
    [tenantId],
  ).catch(() => []);

  const used = rows[0]?.requests ?? 0;
  return { allowed: used < limit, used, limit };
}

export async function recordAIRequest(tenantId: string): Promise<void> {
  await ensureTable();
  await query(
    `INSERT INTO zv_ai_budget (tenant_id, date, requests)
     VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (tenant_id, date)
     DO UPDATE SET requests = zv_ai_budget.requests + 1`,
    [tenantId],
  ).catch((e) => console.error("[ai-budget] record failed:", e));
}
