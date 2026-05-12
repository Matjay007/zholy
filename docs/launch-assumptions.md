# Launch Traffic Assumptions

**Last updated:** 2026-05-12  
**Status:** Estimates only. No load test has been run yet. See load-test-results.md.

---

## Scenario Definitions

| Phase | DAU | Registered Users | Concurrent Users | Concurrent AI Sessions | Concurrent Voice Sessions | RPS |
|-------|-----|-----------------|-----------------|----------------------|--------------------------|-----|
| **Day 1** (soft launch) | 50 | 200 | 5 | 2 | 1 | < 1 |
| **Launch week** | 500 | 2,000 | 30 | 10 | 5 | 3–5 |
| **30 days** | 2,000 | 10,000 | 80 | 20 | 10 | 10–20 |
| **90 days** | 8,000 | 40,000 | 200 | 50 | 25 | 30–60 |
| **12 months** | 30,000 | 150,000 | 600 | 150 | 75 | 100–200 |

---

## AI Token Consumption Estimates

| Phase | Avg tokens/user/day | Total tokens/day | OpenAI cost/day (gpt-4o-mini @ $0.15/1M) |
|-------|--------------------|-----------------|-----------------------------------------|
| Day 1 | 2,000 | 100K | $0.015 |
| Launch week | 3,000 | 1.5M | $0.22 |
| 30 days | 5,000 | 10M | $1.50 |
| 90 days | 6,000 | 48M | $7.20 |
| 12 months | 8,000 | 240M | $36/day |

**⚠ Max tokens per user per day:** Currently uncapped. A single power user could generate $50+ in a day without limits.

---

## Viral Spike Scenarios

| Spike | DAU multiplier | Concurrent users | First bottleneck |
|-------|---------------|-----------------|-----------------|
| 10x from Day 30 | 20,000 DAU | 800 | Nginx connections (768 configured) |
| 50x from Day 30 | 100,000 DAU | 4,000 | Single server CPU/RAM, DB connections |
| 100x from Day 30 | 200,000 DAU | 8,000 | **Total collapse. Server not capable.** |

---

## What Breaks First (Honest Assessment)

**First bottleneck at current infrastructure:**

1. **nginx `worker_connections 768`** — configured in `/etc/nginx/nginx.conf`. At 768 concurrent connections (including keep-alive), nginx starts refusing connections. This is the hard ceiling before anything else.

2. **PostgreSQL max_connections** (default 100) — Prisma + direct pg connections. At ~80 concurrent database-touching requests, connection pool exhausts.

3. **Single Next.js process** — One Node.js process (PID 148924). Node.js is single-threaded for sync work. Under heavy load, event loop lag causes all requests to slow. No horizontal scaling.

4. **Ollama (8 GB RAM cap)** — LLM inference shares memory with everything else. Under load, inference blocks and timeouts cascade to voice sessions.

5. **No Redis / no queue** — All AI requests are synchronous in the HTTP request cycle. A slow OpenAI response (or timeout) ties up a Next.js request slot.

---

## Storage Growth

| Component | Growth/1000 users | At 10K users | At 100K users |
|-----------|------------------|-------------|--------------|
| PostgreSQL (auth + sessions) | ~50 MB | 500 MB | 5 GB |
| PostgreSQL (conversations) | ~200 MB | 2 GB | 20 GB |
| PostgreSQL (leads + usage) | ~20 MB | 200 MB | 2 GB |
| nginx access logs | ~1 GB/month | ~10 GB/month | ~100 GB/month |
| Application logs (journald) | ~500 MB/month | ~5 GB/month | ~50 GB/month |

**Current disk:** 193 GB total, 32 GB used (17%). Log rotation is NOT configured. At launch-week scale, logs will fill disk within weeks.

---

## Provider API Quotas

| Provider | Default quota | At what load is it hit? |
|----------|--------------|------------------------|
| OpenAI (gpt-4o-mini) | Rate limit: 500K TPM | ~500 concurrent 1K-token requests |
| OpenAI TTS | Rate limit: varies | Unknown — not measured |
| Google OAuth | No hard cap | N/A |
| Apple OAuth | No hard cap | N/A |
| Stripe | No per-request limit | N/A |

**⚠ No quota monitoring exists. No alerting on 429 responses from OpenAI.**
