# Database Readiness

**Last updated:** 2026-05-12  
**Status:** Basic setup working. Critical gaps in backup, connection pooling, and migrations.

---

## Current State

| Item | Status | Notes |
|------|--------|-------|
| PostgreSQL version | 16 (Docker) | Running as `zholy-postgres-1` |
| DB name | `zholy` | |
| DB user | `zholy_admin` | Password in .env.local |
| Port | 5432 bound to 127.0.0.1 | Not publicly exposed ✓ |
| Schema migrations | **NOT VERSIONED** | No migrations directory. Schema applied manually or via Prisma `db push`. |
| Connection pooling | **MISSING** | Direct Prisma + raw pg connections. No pgBouncer. |
| Slow query logging | **MISSING** | Not configured |
| Max connections | Default (100) | No tuning |
| Active connections (at audit) | 2–6 | Low now, will grow |
| DB size at audit | < 10 MB | 0 real users |
| Backup | **NOT CONFIGURED** | **LAUNCH BLOCKER** |
| Restore tested | **NEVER** | **LAUNCH BLOCKER** |
| Read replica | None | |
| Least-privilege users | Partial — zholy_admin has broad access | |

---

## Schema Overview

### Prisma-managed tables (Better Auth)
- `users` — user accounts
- `accounts` — OAuth provider links
- `sessions` — active sessions (token, ip, userAgent)
- `verifications` — email verification codes
- `two_factors` — TOTP secrets
- `organizations` — team/workspace
- `org_members` — membership
- `invites` — pending invitations

### Raw-SQL managed tables (ZHOLY-specific)
These are created ad-hoc in API routes with `CREATE TABLE IF NOT EXISTS`:
- `zv_tenants` — ZHOLY tenants (one per user)
- `zv_agents` — voice agents per tenant
- `zv_conversations` — conversation history
- `zv_leads` — captured leads
- `zv_knowledge` — knowledge base entries
- `zv_usage` — usage metrics (minutes, calls)

**⚠ Problem:** These tables are NOT in Prisma schema. No migration history. If the Docker volume is lost, the schema must be manually re-created.

---

## Missing Indexes (Known)

Based on access patterns in API routes:

```sql
-- Missing: tenant_id lookups (most queries filter by this)
CREATE INDEX IF NOT EXISTS idx_zv_agents_tenant ON zv_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_zv_conversations_tenant ON zv_conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_zv_leads_tenant ON zv_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_zv_knowledge_tenant ON zv_knowledge(tenant_id);
CREATE INDEX IF NOT EXISTS idx_zv_usage_tenant_period ON zv_usage(tenant_id, period);

-- Missing: session expiry cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expiresAt);
```

**These indexes are NOT applied yet.**

---

## Connection Pooling Gap

Current: Prisma creates up to 10 connections per Next.js process. Raw `pg.Pool` adds more. Under load:
- 50 concurrent requests × (Prisma pool + pg pool) = potentially 100–200 connections
- PostgreSQL max_connections default = 100 → **pool exhaustion and errors at moderate load**

**Fix:** Deploy pgBouncer in front of PostgreSQL (transaction pooling mode, max 20 connections to Postgres, 1000 client connections).

---

## Backup Procedure (Required — Not Yet Configured)

```bash
# Install on server
sudo apt install -y postgresql-client

# Daily pg_dump cron (add to ubuntu crontab)
0 2 * * * pg_dump -h 127.0.0.1 -U zholy_admin -Fc zholy > /home/ubuntu/backups/zholy-$(date +\%Y\%m\%d).dump 2>&1
find /home/ubuntu/backups -name "*.dump" -mtime +7 -delete

# Test restore:
pg_restore -h 127.0.0.1 -U zholy_admin -d zholy_test --no-owner /home/ubuntu/backups/zholy-20260512.dump
```

**RPO target:** 24 hours (daily backup)  
**RTO target:** 30 minutes  
**Restore tested:** NO ← **LAUNCH BLOCKER**

---

## Retention Policy

| Data | Current | Required |
|------|---------|---------|
| Conversations | Forever (no TTL) | Define 12-month TTL |
| Sessions | Indefinite | Prune expired sessions weekly |
| Leads | Forever | Define per-tenant retention |
| Usage logs | Forever | Aggregate and prune after 90 days |
| Verification tokens | Cleaned by Better Auth | OK |

---

## Action Items Before Launch

- [ ] Apply missing indexes
- [ ] Configure daily pg_dump + cron
- [ ] Test restore end-to-end (row count verification)
- [ ] Deploy pgBouncer or increase PostgreSQL max_connections to 200
- [ ] Move zv_* tables to Prisma schema with proper migration history
- [ ] Add slow query logging: `ALTER SYSTEM SET log_min_duration_statement = 1000;`
- [ ] Define data retention policy and scheduled prune jobs
