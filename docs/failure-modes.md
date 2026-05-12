# Failure Modes

**Last updated:** 2026-05-12  
**Status:** Documented. Mitigations mixed — some implemented, many pending.

---

## How to read this document

For each failure: **what breaks**, **who is affected**, **is it detected**, **how to recover**, **how to prevent**.

Severity: **P0** = site down or data loss · **P1** = degraded for all users · **P2** = degraded for subset · **P3** = non-critical.

---

## 1. Database Failures

### 1.1 — PostgreSQL container crashes
**Severity:** P0  
**What breaks:** All DB-backed operations — auth, agents, conversations, leads, knowledge. 500s across the app.  
**Detection:** `/api/health` returns 500 if health query fails. No alert configured yet.  
**Recovery:**
```bash
sudo docker restart zholy-postgres-1
# If corrupt:
sudo docker compose -f /opt/zholy-gateway/docker-compose.yml up -d postgres
```
**RTO:** < 2 minutes.  
**Data loss risk:** Up to 24 hours if failure happens before daily 02:00 backup. ← LAUNCH BLOCKER.  
**Prevention:** Managed PostgreSQL with PITR (not yet migrated). Increase backup frequency.

### 1.2 — DB connection pool exhaustion
**Severity:** P1  
**What breaks:** New requests fail with "too many connections". Existing sessions may complete.  
**Detection:** App logs `PrismaClientKnownRequestError: Can't reach database server`. No alert.  
**Trigger:** > 10–15 concurrent DB requests (Prisma default pool = 10).  
**Recovery:** `sudo systemctl restart zholy` — flushes connections. If persistent, add `connection_limit=N` to DATABASE_URL.  
**Prevention:** Set `DATABASE_URL=...?connection_limit=10&pool_timeout=20`. Long-term: PgBouncer.

### 1.3 — Disk full (PostgreSQL data dir)
**Severity:** P0  
**What breaks:** PostgreSQL crashes. Writes fail before that (ENOSPC).  
**Detection:** `df -h` shows > 95%. No alert configured.  
**Current disk:** 73% used (at time of audit). AI model logs + PostgreSQL WAL are the primary growers.  
**Recovery:**
```bash
# Find large files
du -sh /var/lib/docker/volumes/* | sort -rh | head -20
# Prune Docker images/containers
sudo docker system prune -a
# Archive old conversation logs
psql -c "DELETE FROM zv_conversations WHERE created_at < NOW() - INTERVAL '90 days';"
```
**Prevention:** Configure disk alert at 85%. Rotate logs. Archive old data.

### 1.4 — Schema migration failure (future)
**Severity:** P1  
**What breaks:** New deploy with schema changes fails mid-migration. App may be partially broken.  
**Current state:** No Prisma migrations exist — schema applied via `prisma db push`. No rollback path.  
**Recovery:** Manual schema diff + `prisma db push` to restore. ← Requires DBA knowledge.  
**Prevention:** Create migration history (`prisma migrate dev`). Test migrations on a copy before prod.

---

## 2. Application Failures

### 2.1 — zholy.service crashes (Node.js OOM or unhandled rejection)
**Severity:** P0  
**What breaks:** Entire marketing site + dashboard + API down.  
**Detection:** `systemctl is-active zholy` → `failed`. No alert.  
**Recovery:** systemd `Restart=always` re-launches within 5 seconds automatically.  
**Verification:** `curl http://localhost:3009/api/health`  
**Prevention:** Set `NODE_OPTIONS=--max-old-space-size=1024` if OOM. Add unhandledRejection logging.

### 2.2 — Build fails on deploy
**Severity:** P1 (deploy blocked, previous version still running)  
**What breaks:** Deploy aborted. Site continues running previous version.  
**Detection:** `npm run build` exits non-zero. CI logs show error.  
**Recovery:** Fix the TypeScript/build error. Re-run deploy.  
**Current state:** No pre-deploy build check in CI. ← Manual only.

### 2.3 — Next.js renders 500 on specific route
**Severity:** P2  
**What breaks:** One page or API route crashes. Rest of app unaffected.  
**Detection:** User reports. No Sentry configured. ← LAUNCH BLOCKER.  
**Recovery:** Check `journalctl -u zholy -f` for the stack trace. Fix the bug. Redeploy.  
**Prevention:** Add Sentry DSN to `.env.local`. Run `SENTRY_DSN=xxx npm run build`.

### 2.4 — Auth session invalidated (secret rotation or Better Auth bug)
**Severity:** P1  
**What breaks:** All logged-in users get logged out simultaneously.  
**Detection:** Spike in 401s in logs. User reports.  
**Recovery:** Users re-login. If BETTER_AUTH_SECRET changed accidentally, restore previous value.  
**Prevention:** Never rotate BETTER_AUTH_SECRET without a session migration plan.

---

## 3. Voice Gateway Failures

### 3.1 — zholy-gateway container crashes
**Severity:** P1  
**What breaks:** All voice calls. Text-only chat may still work if the app has a separate path.  
**Detection:** WebSocket connections to `/ws` fail with connection refused.  
**Recovery:** `sudo docker restart zholy-gateway-1`  
**Monitoring:** None configured. Kill switch: `KILL_VOICE=true` disables voice and shows a UI message.

### 3.2 — SenseVoice STT service crashes
**Severity:** P2  
**What breaks:** Voice transcription. Calls connect but no transcript produced.  
**Detection:** Gateway logs `STT request failed`. No alert.  
**Recovery:** `sudo systemctl restart sensevoice`  
**Verification:** `curl http://127.0.0.1:8100/health`

### 3.3 — OpenAI TTS unreachable
**Severity:** P2  
**What breaks:** Agent voice responses. Agent text responses still work.  
**Detection:** Gateway logs OpenAI API error. HTTP 503 from TTS endpoint.  
**Recovery:** Automatic retry (if implemented in gateway). Otherwise: `KILL_VOICE=true`.  
**Known limitation:** No TTS fallback to local Kokoro TTS currently wired in app code.

### 3.4 — Ollama LLM OOM / crash
**Severity:** P2  
**What breaks:** Agent AI responses. Voice calls get no reply.  
**Detection:** Gateway logs Ollama 500 errors. `docker stats` shows Ollama exited.  
**Recovery:** `sudo docker restart ollama`  
**Prevention:** Set Ollama memory limit in Docker Compose (not currently set). ← LAUNCH BLOCKER.

### 3.5 — WebSocket connection limit hit (nginx)
**Severity:** P1  
**What breaks:** New voice calls get connection refused. Existing calls unaffected until nginx cycle.  
**Trigger:** nginx worker_connections = 768. Each WebSocket = 2 connections (client + upstream).  
**Detection:** nginx error log: `worker_connections are not enough`. p99 latency spike.  
**Recovery:** `sudo nginx -s reload` (uses new config if updated). Increase to 4096.  
**Prevention:** Increase nginx worker_connections to 4096 before launch. ← LAUNCH BLOCKER.

---

## 4. External Dependency Failures

### 4.1 — OpenAI API down / rate-limited
**Severity:** P2  
**What breaks:** All LLM completions using gpt-4o. TTS audio generation.  
**Detection:** Gateway logs 429 / 503 from OpenAI. No alert.  
**Recovery:** Engage Busy mode — set `KILL_PREMIUM_MODEL=true`. Force Ollama fallback.  
**Current state:** No automatic fallback. Manual kill switch only.

### 4.2 — Google OAuth down
**Severity:** P2  
**What breaks:** Google sign-in. Email/password auth unaffected.  
**Detection:** User reports "Sign in with Google" fails.  
**Recovery:** Nothing to do — wait for Google recovery. Email/password still works.  
**Duration:** Google outages historically < 30 min.

### 4.3 — Apple OAuth client secret expiry
**Severity:** P2  
**What breaks:** Apple sign-in. Other auth methods unaffected.  
**Detection:** Apple OAuth returns 400 "invalid_client".  
**Known deadline:** Client secret expires **2026-07-06**. Must be rotated before that.  
**Recovery:** Generate new client secret (requires Apple developer account + private key). Update APPLE_CLIENT_SECRET in `.env.local`. Restart service.

### 4.4 — Cloudflare tunnel drops
**Severity:** P0  
**What breaks:** All public traffic. Site unreachable.  
**Detection:** UptimeRobot alert (if configured). `systemctl status cloudflared`.  
**Recovery:** `sudo systemctl restart cloudflared`  
**Prevention:** `systemctl enable cloudflared` ensures restart on boot (already configured).  
**Note:** Do NOT stop cloudflared manually — site goes dark immediately.

### 4.5 — SMTP provider down (future — not yet configured)
**Severity:** P2  
**What breaks:** Signup email verification. Password reset emails. Not launched yet.  
**Detection:** Auth sign-up returns "email not sent" error.  
**Recovery:** Switch SMTP provider (update SMTP_* env vars, restart).  
**Current state:** SMTP not configured. Signup verification is broken. ← LAUNCH BLOCKER.

---

## 5. Infrastructure Failures

### 5.1 — Disk full (app server)
**Severity:** P0  
**What breaks:** Node.js crashes on log writes. PostgreSQL crashes on WAL writes. Disk writes fail.  
**Trigger:** Nginx access logs + journald + Docker images/logs growing without rotation.  
**Detection:** `df -h` shows > 95%. No alert configured.  
**Recovery:**
```bash
# Clear Docker build cache and unused images
sudo docker system prune -a --volumes
# Rotate nginx logs manually
sudo logrotate -f /etc/logrotate.d/nginx
# Clear journald
sudo journalctl --vacuum-size=200M
```
**Prevention:** Configure logrotate + journald size limits. ← LAUNCH BLOCKER.

### 5.2 — RAM exhaustion (OOM killer)
**Severity:** P0  
**What breaks:** OOM killer terminates processes (usually Node.js or Ollama first).  
**Trigger:** Concurrent AI inference + voice calls + traffic spike. Current RAM: 16 GB.  
**Detection:** `dmesg | grep OOM`. Process disappears from `ps`.  
**Recovery:** OOM-killed service restarts via systemd/Docker restart policy.  
**Prevention:** Set Docker memory limits on Ollama (10 GB max). Monitor with `free -h`.

### 5.3 — Server reboot (unplanned)
**Severity:** P1  
**What breaks:** All services offline until all systemd + Docker services restart.  
**Detection:** UptimeRobot downtime alert.  
**Recovery:** Automatic — systemd `Restart=always` + Docker `restart: unless-stopped`.  
**Expected RTO:** 2–4 minutes (Ollama model load is the slow step).  
**Risk:** If PostgreSQL crashes dirty, recovery requires `pg_resetwal` or restore from backup.

### 5.4 — Exoscale instance failure / deletion
**Severity:** P0  
**What breaks:** Everything.  
**RTO:** 30–60 minutes (provision new instance + restore from backup).  
**Data loss:** Up to 24 hours (daily pg_dump; no continuous WAL archiving).  
**Prevention:** Migrate to Exoscale Managed PostgreSQL with PITR. Keep server rebuild script.

---

## 6. Security Failures

### 6.1 — GitHub PAT leaked / compromised
**Severity:** P1  
**What breaks:** Attacker can push malicious code to repo, which gets auto-deployed.  
**Detection:** GitHub security alert email. Unexpected commits to main.  
**Recovery:** Revoke PAT immediately in GitHub settings. Push a revert commit. Audit last N deploys.  
**Current state:** PAT embedded in git remote URL — visible in `git remote -v`. ← CRITICAL.

### 6.2 — Database credentials compromised
**Severity:** P0  
**What breaks:** Attacker has full DB read/write access. GDPR breach.  
**Detection:** Unusual DB queries in logs. No monitoring configured.  
**Recovery:** Rotate DB password, restart app. Notify affected users if data accessed.  
**Current state:** Password `zrovoice2026` stored in plaintext `.env.local`. No rotation policy.

### 6.3 — BETTER_AUTH_SECRET compromised
**Severity:** P0  
**What breaks:** Attacker can forge valid session tokens for any user.  
**Detection:** Impossible to detect (valid-looking tokens with arbitrary user IDs).  
**Recovery:** Rotate secret → all existing sessions invalidated → all users forced to re-login.  
**Prevention:** Rotate regularly. Store in secrets manager, not plain `.env.local`.

---

## Summary: Top 10 Failure Risks (by impact × probability)

| # | Failure | Impact | Probability | Mitigation Status |
|---|---------|--------|-------------|-------------------|
| 1 | Disk full (logs / Docker images) | P0 | High (no rotation) | ❌ Not configured |
| 2 | DB backup lost (only 1 daily backup) | P0 | Medium | ⚠️ Partial |
| 3 | Apple OAuth expires 2026-07-06 | P2 | Certain (known date) | ❌ Not done |
| 4 | Ollama OOM kills service | P2 | High (no memory limit) | ❌ Not configured |
| 5 | SMTP not configured (signup broken) | P2 | Certain (not configured) | ❌ Not done |
| 6 | GitHub PAT in git remote URL | P1 | Medium | ❌ Not rotated |
| 7 | nginx worker_connections = 768 | P1 | High under viral traffic | ❌ Not increased |
| 8 | No error monitoring (Sentry) | P2 | Certain (bugs invisible) | ❌ Not configured |
| 9 | No staged deploy / rollback tested | P1 | High (first bad deploy) | ❌ Not implemented |
| 10 | PostgreSQL on local disk (no PITR) | P0 | Low (but catastrophic) | ❌ Not migrated |
