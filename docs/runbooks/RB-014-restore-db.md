# RB-014 — Restore Database from Backup

**When:** DB corruption, accidental data deletion, or disaster recovery.

---

See `docs/backup-restore.md` for the full restore procedure with all options.

Quick reference below.

---

## List available backups

```bash
ssh ubuntu@<SERVER_IP>
ls -lh /home/ubuntu/backups/
```

## Test restore (without touching production)

```bash
# Create test DB
sudo docker exec zholy-postgres-1 psql -U zholy_admin -d postgres \
  -c "CREATE DATABASE zholy_restore_test;"

# Copy dump into container
sudo docker cp /home/ubuntu/backups/zholy-YYYYMMDD_HHMMSS.dump \
  zholy-postgres-1:/tmp/restore.dump

# Restore
sudo docker exec zholy-postgres-1 \
  pg_restore -U zholy_admin -d zholy_restore_test \
  --no-owner --no-acl /tmp/restore.dump

# Verify row counts
sudo docker exec zholy-postgres-1 psql -U zholy_admin -d zholy_restore_test \
  -c "SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"

# Clean up
sudo docker exec zholy-postgres-1 psql -U zholy_admin -d postgres \
  -c "DROP DATABASE zholy_restore_test;"
```

## Production restore (data loss situation)

1. Stop the app: `sudo systemctl stop zholy && docker stop zholy-gateway-1`
2. Rename current DB: `ALTER DATABASE zholy RENAME TO zholy_old;`
3. Restore backup to new `zholy` DB
4. Verify row counts
5. Restart: `sudo systemctl start zholy && docker start zholy-gateway-1`
6. Verify `/api/health` and sign-in work

**Full procedure:** see `docs/backup-restore.md` Step 5.

## Trigger a manual backup now

```bash
bash /home/ubuntu/backup-db.sh
```

## RPO reminder

Current backup schedule: daily at 02:00.  
Maximum data loss: up to 24 hours if the server fails between backups.
