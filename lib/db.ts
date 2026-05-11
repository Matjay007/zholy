import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres@localhost:5432/zholy",
});

export const db = pool;

export async function query<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const { rows } = await pool.query(sql, params);
  return rows as T[];
}
