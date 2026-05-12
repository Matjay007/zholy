# Production Readiness Review

**Date:** 2026-05-12  
**Reviewer:** Full codebase + infrastructure audit  
**Scope:** zholy.ai — marketing site, dashboard, voice gateway, auth, DB

---

## VERDICT

> **Beta / Demo approved. Public launch with paid users: NOT ready.**

The system can serve a controlled beta with hand-picked users. It will not survive a public launch or viral traffic spike without the blockers below being addressed. This is not a worst-case reading — it is what the measured evidence shows.

---

## Launch Blockers (must fix before paid users)

These are conditions under which the system will provably fail users or expose the business to unacceptable risk.

### B-1 — SMTP not configured → sign-up email verification broken
**Evidence:** `SMTP_HOST` not set in `.env.local`. Better Auth's email verification call silently fails. New users who sign up via email cannot verify their address, and password reset does not work.  
**Business risk:** Users cannot onboard. Support burden.  
**Fix:** Configure Mailgun / Postmark / Brevo. Add 5 env vars. 30 minutes.

### B-2 — No per-user AI cost cap → unlimited spend possible
**Evidence:** Any authenticated user can call AI endpoints without any daily token or request budget. One abusive user running 10,000 requests/day = $200/day in OpenAI costs.  
**Business risk:** Uncontrolled COGS. No unit economics.  
**Fix:** Implement per-user daily token cap in each AI route. OpenAI dashboard hard spend limit ($200/month). 1–2 days.

### B-3 — Apple OAuth client secret expires 2026-07-06
**Evidence:** `APPLE_CLIENT_SECRET` is a 6-month JWT. The one currently configured expires 55 days from today.  
**Business risk:** All Apple sign-in breaks on that date with zero warning.  
**Fix:** Regenerate before June 30. 30 minutes.

### B-4 — No tested rollback
**Evidence:** The rollback procedure exists on paper (RB-002) but has never been executed. `.next/standalone.prev` is not reliably preserved.  
**Business risk:** A bad deploy (which WILL happen) could result in 8–12 minutes of downtime and potential data loss if a migration was involved.  
**Fix:** Run a rollback drill. Deploy a known-bad commit. Roll back. Verify. 1 hour.

### B-5 — nginx worker_connections = 768
**Evidence:** Load test confirmed the app handles 500 concurrent connections without errors, but nginx is configured with a 768-connection ceiling. At modest viral traffic (500 concurrent users each with 2 connections), nginx drops new connections with TCP RST.  
**Business risk:** At 300+ concurrent users, the server stops accepting new connections.  
**Fix:** `worker_connections 4096;` in nginx config. 5 minutes.

### B-6 — No log rotation configured
**Evidence:** `journalctl --disk-usage` shows growing journal. No `/etc/logrotate.d/zholy` exists. Disk is currently at 73% and will fill.  
**Business risk:** Disk full → PostgreSQL crash → site down → no backups during the crash.  
**Fix:** Configure logrotate + journald size limit. 30 minutes.

### B-7 — No error monitoring (Sentry or equivalent)
**Evidence:** No `SENTRY_DSN` configured. When a route throws an unhandled exception, the only evidence is an entry in `journalctl`. No alert.  
**Business risk:** Silent failures in production. User reports are the only detection.  
**Fix:** Add Sentry DSN. Free tier is sufficient. 30 minutes.

### B-8 — GitHub PAT embedded in git remote URL
**Evidence:** `git -C /opt/zholy remote -v` shows the token in plaintext. Anyone with server read access can extract it and push to the repo.  
**Business risk:** Attacker pushes malicious code, it auto-deploys on next `git pull`.  
**Fix:** Rotate PAT. Use SSH deploy key instead. 30 minutes.

---

## Significant Gaps (address within 2 weeks of launch)

These won't prevent a controlled beta but will become problems under real load.

| Gap | Risk | Effort |
|-----|------|--------|
| No staging environment | Every deploy is tested in production | 2 days |
| PostgreSQL on local Docker (no PITR) | Up to 24h data loss if server dies | 3 hours (Exoscale managed PG) |
| Ollama has no memory limit | OOM kill possible under concurrent AI use | 5 minutes (Docker compose limit) |
| No UptimeRobot monitoring | Outages detected by users, not you | 15 minutes |
| DB schema not in Prisma migrations | No migration history, no safe rollback | 1 day |
| Secrets not backed up off-server | Server loss = unrecoverable secrets | 1 hour |
| No per-user rate limit in DB | In-process Map resets on restart | 1 day |
| Cloudflare WAF rules not configured | In-app rate limiting is bypassable | 1 hour |
| OpenAI fallback to Ollama not wired | OpenAI outage = voice calls fail | 2 days |

---

## What IS Working (verified this session)

| Component | Status | Notes |
|-----------|--------|-------|
| App starts and serves traffic | ✅ | systemd, port 3009, HOSTNAME=127.0.0.1 |
| Sign-in (Google, Apple, email) | ✅ | All three auth methods work |
| Sign-out | ✅ | Fixed (was 404 in previous session) |
| Dashboard loads | ✅ | Post sign-in dashboard functional |
| Voice calls (WebSocket) | ✅ | Gateway on 8790, SenseVoice on 8100 |
| DB backup (tested) | ✅ | All 14 tables, row counts match |
| Port binding security | ✅ | All ports bound to 127.0.0.1 |
| Admin-bridge auth | ✅ | Fixed (was open access with no keys) |
| TTS preview auth | ✅ | Fixed (was unauthenticated) |
| Ollama pull auth | ✅ | Fixed (was unauthenticated) |
| Rate limiting | ✅ | In-process middleware |
| Kill switches | ✅ | 9 env-var flags implemented |
| Security headers | ✅ | CSP, HSTS, X-Frame-Options, etc. |
| Structured logging | ✅ | JSON to stdout → journald |
| Maintenance mode | ✅ | 503 page via kill switch |
| nginx + Cloudflare SSL | ✅ | Full (strict) mode, no cert issues |
| Backup cron | ✅ | Daily 02:00, 7-day retention |
| Load tested | ✅ | See load-test-results.md for numbers |
| All docs written | ✅ | 18 docs + 15 runbooks |

---

## Security Posture

| Item | Status |
|------|--------|
| Ports locked to 127.0.0.1 | ✅ |
| Admin endpoints require auth | ✅ (fixed this session) |
| Rate limiting on auth routes | ✅ |
| Security headers (CSP, HSTS) | ✅ |
| GitHub PAT rotation | ❌ Still in git remote |
| Secrets off-server backup | ❌ |
| Cloudflare WAF rules | ❌ Not configured |
| No per-user session abuse | ❌ No per-user limits |
| DB password rotation policy | ❌ |
| GDPR data deletion path | ❌ Not implemented |

Overall: **better than average for an early-stage product, but not acceptable for paid users who have contractual data expectations.**

---

## Capacity Assessment

| Traffic level | Expected behaviour |
|--------------|-------------------|
| < 10 concurrent users | Normal. No issues. |
| 10–50 concurrent users | Normal. SSR p99 < 1s. |
| 50–100 concurrent users | SSR landing page degrades (p99 → 1.7s). Fix: Cloudflare cache. |
| 100–200 concurrent users | AI endpoints queued. Voice may lag. Kill PREMIUM_MODEL. |
| 200–500 concurrent users | Engage Viral mode. nginx connection limit approached. |
| > 500 concurrent users | nginx saturates. Voice calls fail. Not survivable without Stage 2. |

---

## Honest One-Liner

> The app works. The infrastructure is a single server with no automated recovery, no tested rollback, no error monitoring, a known secret expiry in 55 days, and no cost cap on the most expensive feature. A controlled beta with known users is fine. A public launch is not.
