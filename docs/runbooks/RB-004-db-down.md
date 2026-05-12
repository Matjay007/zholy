# RB-004 — Database Down

**Symptom:** App returns 500 errors. Logs show "Can't reach database server" or "ECONNREFUSED 5432".

---

## Diagnose

```bash
ssh ubuntu@<SERVER_IP>

# Is the container running?
docker ps | grep postgres

# Is PostgreSQL accepting connections?
docker exec zholy-postgres-1 pg_isready -U zholy_admin -d zholy

# What's in the postgres logs?
docker logs zholy-postgres-1 --tail 50
```

## Fix: Container stopped

```bash
sudo docker start zholy-postgres-1
sleep 3
docker exec zholy-postgres-1 pg_isready -U zholy_admin
# Once ready, app should recover automatically
```

## Fix: Container crashed and won't start

```bash
# Check exit code
docker inspect zholy-postgres-1 --format '{{.State.ExitCode}}'

# Check logs for corruption
docker logs zholy-postgres-1 --tail 100

# If logs show "invalid page", the data may be corrupt
# Options (in order of preference):
# 1. Restore from backup (see docs/backup-restore.md)
# 2. docker compose restart (may auto-recover)
# 3. pg_resetwal (last resort — data loss)
```

## Fix: Disk full causes PostgreSQL crash

PostgreSQL cannot write WAL → crashes. Fix disk first (RB-011), then restart.

## Fix: Too many connections / pool exhaustion

```bash
# Check connection count
docker exec zholy-postgres-1 psql -U zholy_admin -d zholy \
  -c "SELECT count(*) FROM pg_stat_activity;"

# Kill idle connections
docker exec zholy-postgres-1 psql -U zholy_admin -d zholy -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'zholy' AND state = 'idle' AND query_start < NOW() - INTERVAL '5 min';"

# Then restart app to reset connection pool
sudo systemctl restart zholy
```

## Restore from backup

If data is corrupt and DB won't start cleanly, see `docs/backup-restore.md` for full restore procedure.

**Estimated RTO from backup:** 20–30 minutes.
