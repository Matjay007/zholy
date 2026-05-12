# Security Review

**Last updated:** 2026-05-12  
**Status:** Several fixes applied this session. Remaining gaps documented.

---

## Changes Applied This Session

| Fix | File | Severity |
|----|------|----------|
| Port 3009 now bound to 127.0.0.1 | systemd service | Critical |
| Port 8100 (SenseVoice) now bound to 127.0.0.1 | sensevoice_service.py | Critical |
| Admin-bridge no longer open when keys missing | app/api/admin-bridge/stats/route.ts | Critical |
| /api/tts-preview now requires auth | app/api/tts-preview/route.ts | High |
| /api/ollama/pull now requires auth (GET + POST) | app/api/ollama/pull/route.ts | High |
| Security headers added (CSP, HSTS, X-Frame, etc.) | next.config.ts | High |
| Rate limiting on auth, signup, TTS, API routes | middleware.ts | High |
| Kill switches + maintenance mode | middleware.ts, lib/kill-switches.ts | High |

---

## Security Checklist

| Item | Status | Notes |
|------|--------|-------|
| No secrets in repo | ✅ | .env.local not committed, .gitignore covers it |
| No secrets in logs | ✅ | API keys not logged in any route |
| Least-privilege prod access | ⚠️ Partial | ubuntu user has broad sudo; deploy-specific sudoers added |
| SSH key-only | ✅ | PasswordAuthentication no in sshd_config |
| Root login disabled | ✅ | PermitRootLogin no |
| Production DB private | ✅ | PostgreSQL on 127.0.0.1:5432 only |
| TLS enabled | ✅ | Let's Encrypt cert, TLSv1.2/1.3 only |
| WAF enabled | ✅ | Cloudflare WAF |
| DDoS protection | ✅ | Cloudflare DDoS protection |
| Rate limits on auth | ✅ | 10 req/60s per IP |
| Rate limits on AI routes | ✅ | 10 TTS req/60s, 3 Ollama pull/300s |
| Rate limits on voice bootstrap | ⚠️ | Gateway rate limiting: NOT implemented |
| Admin routes protected | ✅ | HMAC or ADMIN_SECRET required |
| Audit logs for admin actions | ❌ | Not implemented |
| Dependency scanning | ❌ | No `npm audit` in CI |
| Container scanning | ❌ | No container image scanning |
| Security headers | ✅ | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| CORS locked down | ⚠️ | No explicit CORS headers. Next.js defaults apply. |
| Upload validation | N/A | No file upload endpoints |
| Webhook signature validation | N/A | Webhooks not yet implemented |
| Brute-force protection | ✅ | fail2ban + rate limiter |
| Bot protection | ⚠️ | Cloudflare bot score available but not configured |

---

## Remaining Vulnerabilities

### Medium: SQL LIMIT String Interpolation
**Files:** `app/api/leads/route.ts`, `app/api/conversations/route.ts`  
**Pattern:** `LIMIT ${limit}` where limit is parsed via `parseInt(..., 10)` guarded with `Math.min`.  
**Risk:** Injection is prevented by guards, but best practice is parameterized.  
**Fix:** Convert to parameterized query.

### Medium: dangerouslySetInnerHTML in Layout
**File:** `app/layout.tsx`  
**Pattern:** Hardcoded scripts injected via `dangerouslySetInnerHTML`.  
**Risk:** XSS if any variable content is ever added to these strings.  
**Fix:** Move to proper Next.js `<Script>` component or static files.

### Low: CORS Not Explicitly Configured
No explicit CORS headers mean API routes accept requests from any origin browser-side.  
For the embed widget use case this may be intentional, but should be documented and locked down.

### Low: BETTER_AUTH_URL Defaults to zholy.app
If `BETTER_AUTH_URL` is not set, auth tokens are issued for `zholy.app` domain instead of `zholy.ai`.  
Currently set correctly in production env. Fails silently if env var is missing.

---

## Secrets Inventory

| Secret | Where stored | Last rotated |
|--------|-------------|-------------|
| BETTER_AUTH_SECRET | /opt/zholy/.env.local | 2026-05 (set at deploy) |
| DATABASE_URL password | /opt/zholy/.env.local | 2026-05 |
| GOOGLE_CLIENT_SECRET | /opt/zholy/.env.local | Unknown |
| APPLE_CLIENT_SECRET | /opt/zholy/.env.local | Expires 2026-07-06 ⚠️ |
| OPENAI API keys | /opt/zholy/.env.local | Unknown |
| Let's Encrypt cert | /etc/letsencrypt/live/ | Auto-renews |

**⚠ Apple Client Secret expires 2026-07-06.** Apple OAuth will break after this date.

---

## Action Items

- [ ] Add nginx rate limiting for /ws WebSocket upgrade (voice bootstrap)
- [ ] Configure Cloudflare bot score rules
- [ ] Rotate OPENAI keys (last rotation date unknown)
- [ ] Renew Apple Client Secret before 2026-07-06
- [ ] Add `npm audit` to deployment script
- [ ] Add explicit CORS headers to API routes that need cross-origin access
- [ ] Parameterize SQL LIMIT clauses
