# RB-003 — App Down (zholy.service Crashed)

**Symptom:** `https://zholy.ai` returns 502/504 or connection refused.

---

## Diagnose

```bash
ssh ubuntu@<SERVER_IP>

# Is the service running?
systemctl is-active zholy

# What was the last error?
journalctl -u zholy -n 50 --no-pager

# Is it listening on port 3009?
ss -tlnp | grep 3009
```

## Fix: crash with no error (OOM)

```bash
free -h
dmesg | grep -i "oom\|killed" | tail -5

# Restart
sudo systemctl restart zholy

# Verify
curl -sf http://localhost:3009/api/health && echo OK
```

## Fix: "Cannot find module" on start

```bash
cd /opt/zholy
npm install --omit=dev
sudo systemctl restart zholy
```

## Fix: "EADDRINUSE port 3009"

```bash
# Something else is on port 3009
ss -tlnp | grep 3009
# Kill the conflicting process
sudo kill <PID>
sudo systemctl start zholy
```

## Fix: TypeScript / build error in logs

A bad deploy is running. Do RB-002 rollback.

## Fix: DB connection failed on startup

```bash
# Check DB
docker exec zholy-postgres-1 pg_isready -U zholy_admin

# If DB is down, start it first
sudo docker start zholy-postgres-1
sleep 5
sudo systemctl start zholy
```

## Escalate if

- Service restarts repeatedly (> 5 times in 10 min) — dig deeper into root cause
- Disk full — see RB-011
- Unknown panic — capture full `journalctl -u zholy --since "5 min ago"` and investigate
