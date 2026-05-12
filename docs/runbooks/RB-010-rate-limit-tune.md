# RB-010 — Adjust Rate Limits

**When:** Rate limits are too aggressive (legitimate users blocked) or too permissive (abuse happening).

---

## Current limits (middleware.ts)

| Route | Limit | Window | Key |
|-------|-------|--------|-----|
| `/api/auth/*` | 10 req | 60s | per IP |
| `/signup` page | 5 req | 60s | per IP |
| `/api/tts-preview` | 10 req | 60s | per IP |
| `/api/ollama/pull` | 3 req | 300s | per IP |
| `/api/*` (general) | 120 req | 60s | per IP |

---

## Symptom: Legitimate user getting 429s

Check which route is returning 429:

```bash
# On server — look for 429s in logs
journalctl -u zholy --since "1 hour ago" --no-pager | grep '"status":429'
```

Identify the route. Then edit `middleware.ts`:

```typescript
// Example: increase auth limit from 10 to 20/60s
const authLimited = await rateLimit("auth", ip, 20, 60_000);
```

Build and deploy:
```bash
cd /Users/polare/Desktop/zrovoice/zrovoice-ui
npm run build
# scp and deploy
```

## Symptom: Abuse happening despite rate limits

Rate limits are in-process (not shared, not persistent). A motivated attacker with multiple IPs bypasses them. The real protection is Cloudflare.

**To block at Cloudflare level:**
1. Cloudflare dashboard → Security → WAF → Rate Limiting
2. Add rules:

| Rule | Path | Threshold | Period | Action |
|------|------|-----------|--------|--------|
| Auth flood | `/api/auth/*` | 20 req | 60s per IP | Block 10min |
| Signup flood | `/api/auth/sign-up/*` | 5 req | 300s per IP | Block 1hr |
| AI abuse | `/api/tts*` | 30 req | 60s per IP | Block 5min |
| General scraping | `/*` | 500 req | 60s per IP | Challenge |

## Symptom: Rate limiter not working after server restart

Expected. The in-process Map is reset on restart. This is a known limitation.

```bash
# Rate limit state is in memory only — it resets on restart
# This is acceptable for a single-instance deployment
# Fix for multi-instance: Redis-backed rate limiter (future work)
```

## Emergency: disable all rate limiting (if causing widespread issues)

Not recommended. Only if rate limiting is proven to be causing outages.

```bash
# Comment out rate limiting middleware block in middleware.ts
# Then rebuild and deploy
```
