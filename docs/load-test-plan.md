# Load Test Plan

**Last updated:** 2026-05-12  
**Tests run:** See load-test-results.md for actual results.

---

## Test Environment

- **Tool:** `wrk` or `autocannon` (Node.js)
- **Target:** Production server at `https://zholy.ai` (no staging exists)
- **⚠ Warning:** Running load tests against production while there are no synthetic users. Must coordinate.

Install autocannon:
```bash
npm install -g autocannon
```

---

## Test Scenarios

### Scenario 1: Baseline (static landing page)
```bash
autocannon -c 10 -d 30 https://zholy.ai/
```
Success criteria: p95 < 200ms, 0 errors, > 100 req/s

### Scenario 2: Health endpoint
```bash
autocannon -c 50 -d 30 https://zholy.ai/api/health
```
Success criteria: p95 < 100ms, 0 errors, > 500 req/s

### Scenario 3: Auth route (rate limit check)
```bash
autocannon -c 5 -d 60 -m POST \
  -H "Content-Type: application/json" \
  -b '{"email":"test@test.com","password":"badpassword"}' \
  https://zholy.ai/api/auth/sign-in/email
```
Success criteria: First 10 requests succeed/fail with auth error; subsequent requests receive 429

### Scenario 4: Dashboard API (authenticated)
Requires session cookie — use browser session manually.
Target: p95 < 500ms for `/api/agents`, `/api/conversations`, `/api/leads`

### Scenario 5: 5x spike simulation
```bash
autocannon -c 50 -d 60 https://zholy.ai/
```
Success criteria: p95 < 1s, error rate < 1%

### Scenario 6: 10x spike simulation
```bash
autocannon -c 100 -d 60 https://zholy.ai/
```
Success criteria: p99 < 2s, error rate < 5%

### Scenario 7: Stress test (find breaking point)
```bash
autocannon -c 200 -d 60 https://zholy.ai/api/health
```
Expected: nginx connection limit (768) hit. Server should not crash.

### Scenario 8: WebSocket concurrency
```bash
# Custom script needed — autocannon doesn't support WebSocket
# Use k6 or artillery for this:
# Target: 50 concurrent WebSocket connections to wss://zholy.ai/ws
```

---

## What to Measure

For each test record:
- Requests/second (average + peak)
- Latency: p50, p95, p99, max
- Error count and error types
- CPU usage on server during test
- RAM usage on server during test
- PostgreSQL connection count during test
- nginx active connections

```bash
# Monitor server during test (second terminal)
ssh zholy-prod "watch -n 1 'free -h && echo --- && cat /proc/loadavg && echo --- && ss -s | grep estab'"
```

---

## Expected Bottlenecks

Based on architecture audit:

1. **nginx worker_connections: 768** — Hard limit. At 768 concurrent connections, new requests get TCP RST.
2. **PostgreSQL max_connections: 100** — At ~80 concurrent DB requests, pool exhaustion.
3. **Single Node.js process** — Event loop blocks under CPU-heavy tasks.
4. **Ollama 8GB RAM limit** — LLM inference competes with everything else.

---

## Pre-Test Fixes Needed

Before running tests that matter:
1. Increase nginx worker_connections to 4096
2. Configure log rotation (logs will fill disk under test)
3. Ensure test data doesn't corrupt production data
4. Set up monitoring before running tests
