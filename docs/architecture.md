# Architecture

**Last updated:** 2026-05-12

---

## Current Architecture (as deployed)

```
Internet
   │
   ▼
Cloudflare (WAF + DDoS + CDN + SSL termination)
   │  zholy.ai → Exoscale server via direct DNS (not tunnel)
   ▼
Exoscale Instance: standard.extra-large (4 vCPU · 16 GB RAM · 193 GB disk)
ch-gva-2, Ubuntu 24.04
   │
   ├── nginx (system, port 443 SSL via Let's Encrypt cert)
   │     ├── /ws        → 127.0.0.1:8790 (gateway WebSocket)
   │     ├── /embed/    → 127.0.0.1:8790 (embed script)
   │     └── /          → 127.0.0.1:3009 (Next.js app)
   │
   ├── zholy.service (systemd) — Next.js 15 standalone, port 3009
   │
   ├── Docker containers (shared on same host):
   │     ├── zholy-zholy-gateway-blue-1  (voice gateway, port 8790)
   │     ├── zholy-postgres-1            (PostgreSQL 16, port 5432)
   │     ├── zholy-ollama-1              (Ollama LLM, port 11434)
   │     └── zholy-ssl-nginx             (SSL nginx — REDUNDANT, see below)
   │
   └── sensevoice.service (systemd) — SenseVoice STT Python, port 8100
```

**Note:** `zholy-ssl-nginx` Docker container is a leftover from previous setup. System nginx handles SSL. Docker nginx container is redundant and should be removed.

---

## Single Points of Failure

| Component | SPOF? | Impact if fails | Mitigation |
|-----------|-------|-----------------|-----------|
| Exoscale instance | **YES** | Total outage | None. RTO ~30–60 min if instance can be recovered or rebuilt |
| PostgreSQL (Docker) | **YES** | Total outage — no auth, no data | Daily pg_dump to local disk (NOT configured yet) |
| Next.js process | No | zholy.service auto-restarts (Restart=always) | Fast restart |
| Voice gateway | No | Voice disabled, dashboard works | Text fallback (not yet implemented) |
| nginx | No | systemd restarts on crash | Fast restart |
| OpenAI API | **YES for AI features** | All AI calls fail | Ollama local fallback (NOT implemented) |
| Cloudflare | No | Cloudflare is HA | N/A |

---

## What Is NOT Deployed (Missing Pieces)

| Component | Status | Impact |
|-----------|--------|--------|
| Redis / cache | **MISSING** | No session caching, no rate limit persistence across restarts |
| Queue system | **MISSING** | AI jobs run synchronously in HTTP requests |
| Staging environment | **MISSING** | Deploys go straight to production |
| Object storage | **MISSING** | No backup storage, no asset CDN |
| Read replica | **MISSING** | All reads and writes hit same DB |
| Log management | **MISSING** | Logs only in journald, no search, no retention policy |
| APM / tracing | **MISSING** | No distributed tracing |
| Error tracking | **MISSING** | No Sentry or equivalent |
| Uptime monitoring | **MISSING** | No external monitor configured |
| Second app instance | **MISSING** | No horizontal scaling |

---

## Required Launch Architecture (Minimum Viable)

```
Internet
   │
   ▼
Cloudflare (WAF + DDoS + CDN — EXISTING)
   │
   ▼
Single Exoscale instance (EXISTING)
   ├── nginx (EXISTING — fix: increase worker_connections to 4096)
   ├── Next.js app — zholy.service (EXISTING — fix: add log rotation)
   ├── Voice gateway (EXISTING — migrate to systemd like app)
   ├── PostgreSQL (EXISTING — add: connection pooling via pgBouncer, daily backup)
   ├── Redis (MISSING — add: for rate limiting persistence, session cache)
   ├── Log rotation (MISSING — add: logrotate for nginx + journald size limit)
   └── Uptime monitor (MISSING — add: UptimeRobot free)

External:
   ├── Object storage for DB backups (MISSING — Exoscale SOS or similar)
   └── Error tracking (MISSING — Sentry free tier)
```

---

## Scaling Triggers

See `scale-out-plan.md` for full details. Short version:
- At 50 concurrent users: increase nginx worker_connections (now)
- At 100 concurrent users: add Redis, add pgBouncer
- At 200 concurrent users: add second app instance, add read replica
- At 500 concurrent users: split inference to dedicated node
