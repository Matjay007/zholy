# Scale-Out Plan

**Last updated:** 2026-05-12  
**Current capacity:** ~50 concurrent users (SSR) / ~500 concurrent connections (API)  
**Architecture:** Single server. PostgreSQL in Docker. No horizontal scaling.

---

## Current Architecture

```
Internet → Cloudflare → nginx → Next.js (systemd, port 3009)
                              → Gateway (Docker, port 8790)
                              → PostgreSQL (Docker, port 5432)
                              → SenseVoice (systemd, port 8100)
                              → Ollama (Docker, port 11434)
```

Everything runs on one Exoscale standard.extra-large (4 vCPU / 16 GB RAM).

---

## Bottleneck Sequence Under Load

Based on load test results (see `docs/load-test-results.md`):

1. **SSR landing page** — first to degrade at 50+ concurrent users (p99 hits 1.1s)
2. **PostgreSQL connection pool** — Prisma defaults to 10 connections; exhausted at ~15 concurrent DB requests
3. **Ollama LLM** — one inference uses 100%+ CPU; kills p99 for all other requests
4. **nginx worker_connections** — hard limit at 768; TCP RST at ~760 concurrent connections
5. **RAM** — Ollama model loaded + SenseVoice + voice calls + Next.js can OOM the server at ~10 concurrent voice calls

---

## Stage 1 → Stage 2 Trigger

Do NOT scale prematurely. Scale when measured, not predicted.

**Move to Stage 2 when any of these are true:**
- RAM available < 2 GB sustained during business hours
- Ollama consuming > 2 vCPUs while web requests are at p99 > 500ms
- Concurrent voice sessions routinely > 5
- pg_stat_activity shows > 8 active queries regularly

---

## Stage 2 — Split Inference Off App Server

**Estimated cost increase:** +€60–80/month (one Exoscale compute.large for AI inference)

### New architecture:

```
App server (standard.extra-large)        AI server (compute.large, 4 vCPU / 8 GB)
├── Next.js (:3009)                      ├── SenseVoice STT (:8100)
├── Gateway (:8790)                      ├── Ollama LLM (:11434)
└── PostgreSQL (:5432)                   └── Kokoro TTS (:8086)
```

**Steps:**
1. Provision a new Exoscale instance in ch-gva-2, attach to private network
2. Install Docker on it
3. Move SenseVoice, Ollama, Kokoro to the new instance
4. Update gateway env vars: `SENSEVOICE_URL=http://10.x.x.x:8100`, `OLLAMA_URL=...`, `TTS_URL=...`
5. Restart gateway
6. Monitor CPU and memory on both machines

**Effort:** 2–4 hours.

---

## Stage 3 — Managed PostgreSQL (Exoscale)

**When:** Risk of data loss from local DB becomes unacceptable, or DB performance is the bottleneck.

**Action:** Migrate to Exoscale Managed PostgreSQL (Business tier, ~€60/month).

**Benefits:**
- Automatic failover (primary + standby replica)
- 14-day PITR (continuous WAL archiving)
- No more manual pg_dump backups needed
- DB never competes with app for RAM

**Migration steps:**
1. Provision Exoscale Managed PostgreSQL in ch-gva-2, private network
2. `pg_dump` from local → restore to managed DB
3. Verify row counts
4. Update `DATABASE_URL` in `.env.local` and gateway env
5. Restart services
6. Stop local PostgreSQL container
7. Free: 1–2 GB RAM on app server

**Effort:** 2–3 hours.

---

## Stage 4 — Cloudflare Cache for Landing Page

This is the easiest scale win. The SSR landing page (`/`) is the first bottleneck.

**Action:** Cache the landing page at Cloudflare edge for 60 seconds.

**Option A — nginx (already on server):**
```nginx
location = / {
    proxy_cache zholy_cache;
    proxy_cache_valid 200 60s;
    proxy_pass http://127.0.0.1:3009;
    add_header X-Cache-Status $upstream_cache_status;
}
```
Add `proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=zholy_cache:10m;` to nginx.conf.

**Option B — Cloudflare Cache Rules:**
1. Cloudflare → Caching → Cache Rules
2. Match: hostname = zholy.ai AND URI = /
3. Cache eligibility: Eligible for cache
4. Edge TTL: 60 seconds

**Impact:** Reduces SSR load from ~176 RPS ceiling to effectively unlimited for the landing page.

---

## Stage 5 — Multiple App Instances (if needed)

**When:** Single Node.js process can't handle concurrent requests (event loop blocking).

**Action:** Run multiple Next.js instances behind nginx with `upstream` load balancing.

```nginx
upstream zholy_app {
    server 127.0.0.1:3009;
    server 127.0.0.1:3010;
    server 127.0.0.1:3011;
    keepalive 32;
}
```

**Limitation:** In-process rate limiter and session state are not shared across instances. Requires Redis for rate limiting + session stickiness for WebSocket connections.

**Effort:** 1 day + Redis setup.

**When to do this:** Only when load tests show the single Node.js process is saturated. At current server specs (4 vCPU), the bottleneck is usually DB or AI inference, not Node.js.

---

## Scale Decision Matrix

| Signal | Action | Effort | Cost |
|--------|--------|--------|------|
| Landing page slow | Cloudflare cache | 30 min | €0 |
| DB pool exhaustion | Increase pool limit | 5 min | €0 |
| Ollama OOM or CPU spike | Stage 2 AI split | 2–4 hrs | +€70/mo |
| DB single point of failure | Stage 3 managed PG | 2–3 hrs | +€60/mo |
| Node.js event loop blocked | Stage 5 multi-instance | 1 day | +Redis ~€20/mo |
| > 1000 concurrent users | Full architecture review | 1 week | TBD |

---

## What NOT to do prematurely

- Do NOT set up Kubernetes or container orchestration for < 1000 DAU
- Do NOT add Redis until the rate limiter or sessions are actually failing
- Do NOT split every service into microservices before measuring the actual bottleneck
- Do NOT run multiple DB replicas until the primary is actually under load

The current architecture serves up to ~500 concurrent connections on health endpoints and ~50 concurrent SSR users. That's sufficient for a soft launch with < 100 DAU.
