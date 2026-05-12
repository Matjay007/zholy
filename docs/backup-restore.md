# Backup and Restore

**Last updated:** 2026-05-12  
**Status:** Daily pg_dump configured and tested. PITR not yet available. Restore tested once.

---

## What Needs Backing Up

| Asset | Backup method | Frequency | Location | Tested? |
|-------|--------------|-----------|----------|---------|
| PostgreSQL `zholy` database | pg_dump via cron | Daily 02:00 | `/home/ubuntu/backups/` | ✅ 2026-05-12 |
| `.env.local` (secrets) | Manual | On change | Not backed up | ❌ |
| nginx config | Manual | On change | Not backed up | ❌ |
| Ollama model files | Not backed up — re-pull from Ollama hub | — | — | N/A |
| Next.js app code | GitHub (`Matjay007/zholy`) | On push | GitHub | ✅ |
| Gateway code | GitHub (`Matjay007/zholy-gateway`) | On push | GitHub | ✅ |
| DB schema | Prisma schema in git | On push | GitHub | ✅ |

**Not backed up and critical:** `.env.local` contains BETTER_AUTH_SECRET, DB password, API keys, OAuth secrets. If the server is lost, these cannot be recovered. ← LAUNCH BLOCKER.

---

## Backup Script

**Location on server:** `/home/ubuntu/backup-db.sh`

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="zholy-${TIMESTAMP}.dump"
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "[backup] Starting pg_dump at $(date)"

PGPASSWORD=zrovoice_exo_2026 docker exec zholy-postgres-1 \
  pg_dump -U zholy_admin -Fc zholy > "$BACKUP_DIR/$FILENAME"

SIZE=$(du -sh "$BACKUP_DIR/$FILENAME" | cut -f1)
echo "[backup] Saved $FILENAME ($SIZE)"

# Prune old backups
find "$BACKUP_DIR" -name "*.dump" -mtime +${KEEP_DAYS} -delete
echo "[backup] Pruned backups older than ${KEEP_DAYS} days"

REMAINING=$(ls -1 "$BACKUP_DIR"/*.dump 2>/dev/null | wc -l)
echo "[backup] Remaining backups: $REMAINING"
```

**Cron entry** (`crontab -l -u ubuntu`):
```
0 2 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backup.log 2>&1
```

---

## Backup Verification (Run After Every Backup)

```bash
# Check last backup was created
ls -lh /home/ubuntu/backups/ | tail -5

# Check backup is valid (read header)
PGPASSWORD=zrovoice_exo_2026 docker exec zholy-postgres-1 \
  pg_restore --list /home/ubuntu/backups/LATEST_FILE.dump | head -20
```

---

## Restore Procedure (Tested 2026-05-12)

### Step 1 — Identify the backup to restore
```bash
ls -lh /home/ubuntu/backups/
# Pick the file to restore, e.g. zholy-20260512_020001.dump
```

### Step 2 — Create a target database (for testing, use a separate DB name)
```bash
# For production restore into original DB:
sudo docker exec zholy-postgres-1 psql -U zholy_admin -d postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='zholy' AND pid <> pg_backend_pid();"

sudo docker exec zholy-postgres-1 psql -U zholy_admin -d postgres \
  -c "DROP DATABASE IF EXISTS zholy_old; ALTER DATABASE zholy RENAME TO zholy_old;"

sudo docker exec zholy-postgres-1 psql -U zholy_admin -d postgres \
  -c "CREATE DATABASE zholy;"

# For test restore (preferred — don't touch production):
sudo docker exec zholy-postgres-1 psql -U zholy_admin -d postgres \
  -c "CREATE DATABASE zholy_restore_test;"
```

### Step 3 — Copy backup into container and restore
```bash
# Copy dump file into the container
BACKUP_FILE="/home/ubuntu/backups/zholy-20260512_020001.dump"
sudo docker cp "$BACKUP_FILE" zholy-postgres-1:/tmp/restore.dump

# Restore (adjust DB name as needed)
sudo docker exec zholy-postgres-1 \
  pg_restore -U zholy_admin -d zholy_restore_test \
  --no-owner --no-acl /tmp/restore.dump
```

### Step 4 — Verify row counts match
```bash
sudo docker exec zholy-postgres-1 psql -U zholy_admin -d zholy_restore_test -c "
SELECT
  schemaname,
  relname AS table_name,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;"
```

**Expected tables (from tested restore on 2026-05-12):**
```
accounts               | 14
sessions               | 12
users                  | 4
verifications          | 3
zv_tenants             | 3
zv_agents              | 4
zv_conversations       | 7
zv_turns               | 23
zv_leads               | 2
zv_usage               | 15
zv_knowledge_files     | 1
zv_knowledge_chunks    | 42
user_preferences       | 3
verification           | 3
```
Total: 14 tables verified.

### Step 5 — Production cutover (if restoring to production)
```bash
# Stop app to prevent writes during restore
sudo systemctl stop zholy
sudo docker stop zholy-gateway-1

# Swap DB
sudo docker exec zholy-postgres-1 psql -U zholy_admin -d postgres \
  -c "ALTER DATABASE zholy RENAME TO zholy_failed; ALTER DATABASE zholy_restore_test RENAME TO zholy;"

# Restart
sudo systemctl start zholy
sudo docker start zholy-gateway-1

# Verify
curl -s http://localhost:3009/api/health
```

**Expected RTO for restore:** 20–30 minutes total.

---

## Secrets Backup (NOT Yet Implemented)

The server's `.env.local` contains secrets that cannot be recreated from code. These MUST be backed up off-server.

**Manual backup command (run from local machine):**
```bash
# Pull .env.local from server
scp ubuntu@<SERVER_IP>:/opt/zholy/.env.local ~/Desktop/zholy-env-backup-$(date +%Y%m%d).local

# Store in password manager or encrypted storage (NOT in git, NOT in Dropbox/iCloud unencrypted)
```

**What to back up:**
- `/opt/zholy/.env.local`
- `/etc/nginx/sites-enabled/zholy.conf` (nginx SSL config)
- Cloudflare API token (if in use)
- Apple private key (for OAuth client secret regeneration)

---

## Backup Gaps and Risks

| Gap | Risk | Priority |
|-----|------|----------|
| Secrets not backed up off-server | Server loss = unrecoverable secrets | **CRITICAL** |
| 24-hour RPO (only daily backup) | Up to 24h data loss if server dies | High |
| No offsite backup | Local disk failure loses backup too | High |
| No backup alert on failure | Backup silently failing goes unnoticed | Medium |
| No automated restore drill | Restore may fail when needed most | Medium |

**Target backup architecture (not yet implemented):**
1. Daily pg_dump → encrypted → Exoscale Object Storage (offsite)
2. Continuous WAL archiving → Exoscale Managed PostgreSQL PITR (14-day window)
3. Secrets → encrypted (age) → Object Storage weekly

---

## Quick Reference

| Action | Command |
|--------|---------|
| Trigger backup now | `bash /home/ubuntu/backup-db.sh` |
| List backups | `ls -lh /home/ubuntu/backups/` |
| Check backup log | `tail -20 /home/ubuntu/backup.log` |
| Check cron | `crontab -l -u ubuntu` |
| Restore to test DB | See Step 2–4 above |
| Verify restore | Check row counts vs. table above |
