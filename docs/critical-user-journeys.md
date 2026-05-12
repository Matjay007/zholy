# Critical User Journeys

**Last audited:** 2026-05-12  
**Status:** Defined. Not all journeys have automated tests. See gaps section.

---

## Journey Map

| # | Journey | p95 Target | Max Error Rate | Fallback | Owner | Metric Key |
|---|---------|-----------|----------------|----------|-------|------------|
| 1 | Landing page load | < 800ms | < 0.1% | Static HTML (Cloudflare cache) | Frontend | `page_ttfb` |
| 2 | Signup (email) | < 2s | < 1% | Error message, retry | Backend | `signup_success_rate` |
| 3 | Login (email + OAuth) | < 1.5s | < 1% | Retry, forgot password link | Backend | `login_success_rate` |
| 4 | Email verification | < 5s (email) | < 2% | Resend button | Backend | `verification_success_rate` |
| 5 | Dashboard load | < 1.2s | < 0.5% | Show cached data, retry | Frontend | `dashboard_p95_ms` |
| 6 | Agent creation | < 2s | < 1% | Error + retry | Backend | `agent_create_success` |
| 7 | Voice session bootstrap | < 3s | < 5% | Error message, text fallback | Gateway | `voice_bootstrap_p95_ms` |
| 8 | AI response (first token) | < 2s | < 5% | Retry, queue | AI Worker | `ai_first_token_p95_ms` |
| 9 | Lead capture | < 1s | < 1% | Silent queue, retry | Backend | `lead_capture_success` |
| 10 | Password reset | < 5s (email) | < 2% | Manual support | Backend | `reset_email_sent` |
| 11 | Admin stats read | < 500ms | < 1% | Cached last result | Backend | `admin_stats_p95_ms` |
| 12 | Conversation list load | < 1s | < 0.5% | Empty state, retry | Backend | `conv_list_p95_ms` |
| 13 | Billing page load | < 1.5s | < 1% | Error message | Frontend | `billing_load_p95_ms` |
| 14 | Waitlist capture | < 500ms | < 0.5% | Silent queue | Backend | `waitlist_capture_success` |

---

## Journey Details

### 1. Landing Page Load
- **Success:** HTTP 200, FCP < 1.5s, LCP < 2.5s, no console errors
- **Fallback:** Cloudflare caches HTML. If origin is down, Cloudflare serves stale for up to 60s.
- **Monitoring:** nginx access log, uptime monitor on `/`
- **Current gap:** No synthetic monitoring. No RUM configured.

### 2. Signup
- **Success:** User record created, verification email sent, redirect to verify page
- **Failure modes:** DB down (503), SMTP down (user sees error, must retry later), duplicate email (400)
- **Current gap:** No email sending configured in production (SMTP env vars empty). **LAUNCH BLOCKER.**

### 3. Login
- **Success:** Session cookie set, redirect to `/app`
- **Failure modes:** Wrong password (401), unverified email (redirect to verify), DB down (500)
- **Rate limit:** 10 attempts / 60s per IP (implemented in middleware)

### 4. Voice Session Bootstrap
- **Success:** WebSocket opens to `wss://zholy.ai/ws`, STT/LLM/TTS ready, agent responds < 3s
- **Failure modes:** Gateway down (error UI), STT unavailable (fallback to text), LLM timeout (retry once, then error)
- **Current gap:** No voice session health check on landing. No graceful text fallback UI.

### 5. AI Response Generation
- **Success:** LLM returns response, TTS generates audio, agent speaks within 3s of user utterance
- **Failure modes:** OpenAI rate limit (429 → queue, retry), OpenAI down (fall back to Ollama local), Ollama too slow (async, notify user)
- **Current gap:** No fallback-to-Ollama logic exists in gateway. **HIGH RISK.**

### 6. Password Reset
- **Success:** Email sent within 30s, link valid for 1 hour
- **Current gap:** SMTP not configured. **LAUNCH BLOCKER.**

---

## Gaps and Launch Blockers

| Gap | Severity | Status |
|-----|----------|--------|
| SMTP not configured — signup verification + password reset broken | **LAUNCH BLOCKER** | Not fixed |
| No synthetic monitoring on critical paths | High | Not implemented |
| No text fallback when voice gateway is down | High | Not implemented |
| No Ollama fallback when OpenAI is unavailable | High | Not implemented |
| No automated journey tests | Medium | Not implemented |
