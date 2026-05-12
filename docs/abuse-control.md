# Abuse Control

**Last updated:** 2026-05-12  
**Status:** Basic rate limiting implemented in middleware. Advanced controls pending.

---

## Implemented Rate Limits (middleware.ts)

| Route | Limit | Window | Key |
|-------|-------|--------|-----|
| `/api/auth/*` (all auth) | 10 req | 60s | per IP |
| `/signup` (page) | 5 req | 60s | per IP |
| `/api/tts-preview` | 10 req | 60s | per IP |
| `/api/ollama/pull` | 3 req | 300s | per IP |
| `/api/*` (general) | 120 req | 60s | per IP |

**Implementation:** In-process Map. Works on single instance. Does NOT persist across restarts. Does NOT share state across multiple instances.

**Limitation:** Any motivated attacker with multiple IPs bypasses all limits. Cloudflare rate limiting is the real protection.

---

## Required Additions

### Cloudflare Rate Limiting Rules (Not Yet Configured)

Go to Cloudflare → your domain → Security → WAF → Rate Limiting:

| Rule | Path | Threshold | Period | Action |
|------|------|-----------|--------|--------|
| Auth flood | `/api/auth/*` | 20 req | 60s per IP | Block 10min |
| Signup flood | `/api/auth/sign-up/*` | 5 req | 300s per IP | Block 1hr |
| AI abuse | `/api/tts*` | 30 req | 60s per IP | Block 5min |
| Scraping | `/*` | 500 req | 60s per IP | Challenge |
| Voice flood | `/ws` | 10 upgrades | 60s per IP | Block 10min |

### User-Level Limits (Not Implemented)

Once a user is authenticated, there are currently NO per-user limits:
- No max AI requests per user per day
- No max voice minutes per user
- No max leads per agent
- No storage cap per tenant

These must be enforced in application code before paid plans are live.

### Global Emergency Limits

If viral traffic hits, activate via environment variables:
```bash
# In /opt/zholy/.env.local:
KILL_SIGNUPS=true          # Stop new signups
AI_MAX_CONCURRENT_GLOBAL=5 # Throttle AI to 5 concurrent jobs
KILL_VOICE=true            # Disable voice (high resource)
```
Then `sudo systemctl restart zholy`.

---

## Bot Protection

| Control | Status |
|---------|--------|
| Cloudflare Bot Score | Available but no rules configured |
| fail2ban on SSH | ✅ Active |
| Rate limiting on auth | ✅ Active |
| CAPTCHA on signup | ❌ Not implemented |
| Disposable email detection | ❌ Not implemented |
| Suspicious IP blocking | Available via Cloudflare, not configured |

---

## Monitoring for Abuse

Currently zero abuse monitoring. Required:
- Alert when any single IP hits rate limit > 5 times in 1 hour
- Alert when signup rate exceeds 100/hour
- Alert when AI spend rate exceeds $10/hour
- Alert on login failure rate > 20% over 5-minute window
