# Load Test Results

**Tested:** 2026-05-12  
**Server:** Exoscale standard.extra-large (4 vCPU / 16 GB RAM), single instance  
**Tool:** autocannon  
**Target:** https://zholy.ai (through Cloudflare → nginx → Next.js)  
**Note:** Tests run from local machine. Cloudflare CDN between test client and origin may influence results.

---

## Results Summary

### /api/health (lightweight JSON response)

| Concurrency | RPS | p50 | p97.5 | p99 | Max | Errors |
|-------------|-----|-----|-------|-----|-----|--------|
| 10c, 15s | 399 | 14ms | 118ms | 190ms | 578ms | 0 |
| 50c, 15s | 539 | 60ms | 324ms | 543ms | 990ms | 0 |
| 100c, 15s | 777 | 120ms | 260ms | 353ms | 430ms | 0 |
| 200c, 15s | 791 | 242ms | n/a | 486ms | 616ms | 0 |
| 500c, 10s | 821 | 589ms | n/a | 849ms | 1215ms | 0 |

**Observation:** Server handles 500 concurrent connections without errors. RPS plateaus at ~800 at 200+ connections — that is the current throughput ceiling for lightweight requests. Max latency stays under 1.3s even at 500 connections.

### / (Landing page HTML, SSR)

| Concurrency | RPS | p50 | p99 | Max | Errors |
|-------------|-----|-----|-----|-----|--------|
| 10c, 15s | 189 | 32ms | 326ms | 786ms | 0 |
| 50c, 15s | 211 | 132ms | 1158ms | 2298ms | 0 |
| 100c, 15s | 176 | 432ms | 1669ms | 5957ms | 0 |

**Observation:** The landing page is server-rendered (SSR). Under 100 concurrent connections, p99 hits 1.7s and max hits 5.9s. This is the bottleneck for user-facing performance. The page should be statically cached by Cloudflare to avoid this under real traffic.

### Auth endpoint (/api/auth/sign-in/email)

| Concurrency | RPS | 2xx | non2xx | Notes |
|-------------|-----|-----|--------|-------|
| 5c, 10s | 179 | 0 | 1793 | Rate limit engaged: 10 req/60s per IP. All 1793 = 429 responses (after first 10 got 401). **Rate limiting working correctly.** |

---

## Key Numbers

| Metric | Value | Acceptable? |
|--------|-------|-------------|
| Max safe RPS (health) | ~800 | Good for current scale |
| Max safe concurrent users (SSR) | ~50 (p99 < 1s) | **Needs caching for viral traffic** |
| Auth rate limiting | Working | ✅ |
| Server crashes under 500c | No | ✅ |
| nginx connection ceiling hit | No (768 limit, tested to 500) | ⚠ headroom is narrow |
| DB bottleneck seen | Not tested under DB load | ❌ Not measured |
| AI request load | Not tested | ❌ Not tested |
| Voice/WebSocket concurrency | Not tested | ❌ Not tested |

---

## First Bottleneck Under Real Traffic

**The SSR landing page** is the first bottleneck at 50+ concurrent users. p99 = 1.1s at 50c.

**Fix:** Cache the landing page at Cloudflare edge. Add this to nginx config:
```nginx
location = / {
    proxy_pass http://127.0.0.1:3009;
    proxy_cache_valid 200 60s;
    add_header X-Cache-Status $upstream_cache_status;
}
```

Or configure Cloudflare Cache Rules to cache `/` for 60 seconds.

---

## Not Yet Tested

| Scenario | Why Not | Risk |
|----------|---------|------|
| DB-heavy endpoints (agents, conversations) | Requires auth session | Unknown |
| AI request load (TTS, LLM) | Requires auth + AI | High risk — unbounded duration |
| WebSocket concurrency | Requires custom tool | High risk |
| Soak test (hours) | Not run | Memory leaks unknown |
| 50x / 100x viral spike | Would need > 500 clients | Unknown — likely collapses |
| DB connection saturation | Not isolated | Unknown |

---

## Verdict

The server handles **up to 50 concurrent users** without significant degradation on SSR pages, and **up to 500 concurrent connections** on API/health endpoints. This is **sufficient for a soft launch (< 100 DAU)** but will degrade under viral traffic (> 500 concurrent users).

**Not tested and likely to fail:** AI concurrency, WebSocket concurrency, DB saturation.
