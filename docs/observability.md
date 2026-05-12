# Observability

**Last updated:** 2026-05-12  
**Status:** Minimal. Structured logging implemented. No metrics, tracing, or error tracking.

---

## What Exists

| Component | Status | Notes |
|-----------|--------|-------|
| Structured logging | **Implemented** | `lib/logger.ts` — JSON output to stdout → journald |
| Request IDs | **Implemented** | `x-request-id` header set in middleware |
| nginx access log | Available | `/var/log/nginx/access.log` — default format |
| systemd journal | Available | `journalctl -u zholy -f` |
| Docker logs | Available | `docker logs zholy-zholy-gateway-blue-1 -f` |
| Uptime monitoring | **MISSING** | No external monitor |
| Error tracking | **MISSING** | No Sentry / equivalent |
| APM / distributed tracing | **MISSING** | No OpenTelemetry |
| Metrics (Prometheus/Grafana) | **MISSING** | No metrics endpoint |
| Business dashboard | **MISSING** | No conversion tracking |

---

## Structured Log Format

`lib/logger.ts` emits JSON to stdout:

```json
{ "ts": "2026-05-12T19:00:00.000Z", "level": "info", "event": "request_complete",
  "service": "zholy-app", "method": "POST", "path": "/api/agents",
  "status": 201, "durationMs": 45, "requestId": "abc123", "userId": "usr_xyz" }
```

Query logs with:
```bash
journalctl -u zholy --no-pager | grep '"event"' | python3 -m json.tool
```

---

## How to View Logs Now

```bash
# App errors
journalctl -u zholy -f --no-pager

# Gateway logs
docker logs zholy-zholy-gateway-blue-1 -f

# nginx access log
tail -f /var/log/nginx/access.log

# nginx errors
tail -f /var/log/nginx/error.log

# SenseVoice
journalctl -u sensevoice -f
```

---

## Golden Signals — Current Status

| Signal | Measured | How |
|--------|----------|-----|
| **Latency** p50/p95/p99 | ❌ Not measured | Would need APM or log parsing |
| **Traffic** (req/s) | ❌ Not measured | Can be derived from nginx log |
| **Errors** (error rate) | ❌ Not alerted | Logs exist but no alerting |
| **Saturation** (CPU, RAM, DB) | ❌ Not measured | Would need metrics collector |

---

## Required Additions (Priority Order)

### 1. Uptime Monitor (10 minutes to set up)
Sign up at UptimeRobot (free):
- Monitor: `https://zholy.ai/api/health` — HTTP, 5-min interval
- Alert: Email + Telegram bot
- Alert threshold: 2 consecutive failures

### 2. Error Tracking (1 hour to set up)
Add Sentry (free tier, 5000 errors/month):
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 3. Log Retention + Search (2 hours to set up)
Configure journald size limit to prevent disk fill:
```bash
# /etc/systemd/journald.conf
[Journal]
SystemMaxUse=2G
SystemMaxFileSize=100M
MaxRetentionSec=2592000  # 30 days
```

### 4. nginx Metrics (30 minutes)
Enable nginx stub_status:
```nginx
location /nginx_status {
    stub_status;
    allow 127.0.0.1;
    deny all;
}
```

### 5. Synthetic Monitoring (2 hours)
Write a simple script that hits `/api/health`, `/signin`, and the gateway WebSocket every 5 minutes. Alert on failure.

---

## Key Events to Track (Once Implemented)

```
signup_started, signup_success, signup_failed
login_success, login_failed
voice_session_start, voice_session_end, voice_session_error
ai_request_start, ai_request_success, ai_request_timeout, ai_request_error
lead_captured
payment_success, payment_failed
webhook_dispatched, webhook_failed
```
