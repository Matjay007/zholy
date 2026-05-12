# Cost Controls

**Last updated:** 2026-05-12  
**Status:** Kill switches implemented. Per-user limits NOT implemented. OpenAI spend cap: not set.

---

## Cost Drivers

| Service | Cost model | Current cap | Risk |
|---------|-----------|-------------|------|
| OpenAI GPT-4o | Per token (in + out) | None | HIGH — no per-user limit |
| OpenAI TTS | Per character | None | HIGH — no auth on tts-preview was a bug (now fixed) |
| OpenAI Whisper | Per minute | None | LOW — local SenseVoice used instead |
| Ollama (local) | Server compute only | None (CPU-bound) | MEDIUM — starves other services |
| Exoscale compute | Monthly fixed | Fixed instance cost | LOW |
| Exoscale bandwidth | Per GB egress | None | LOW currently |

---

## Implemented Controls

### Kill switches (via env vars in `/opt/zholy/.env.local`)

```bash
KILL_AI=true                     # Disable all AI (costs $0 while set)
KILL_PREMIUM_MODEL=true          # Force gpt-4o-mini for all users
AI_MAX_CONCURRENT_GLOBAL=10      # Limit concurrent AI jobs
AI_MAX_TOKENS_PER_REQUEST=2048   # Cap tokens per request
AI_MAX_TOOL_CALL_DEPTH=5         # Prevent runaway agent loops
AI_MAX_DURATION_SECONDS=120      # Kill long-running AI requests
```

These are enforced in `lib/kill-switches.ts` and must be checked in each AI route handler.

### Rate limiting (middleware.ts)

- `/api/tts-preview`: 10 req/60s per IP
- `/api/ollama/pull`: 3 req/300s per IP
- General `/api/*`: 120 req/60s per IP

### Auth on AI endpoints (after this session's fixes)

- `/api/tts-preview`: requires valid session (was unauthenticated before fix)
- `/api/ollama/pull`: requires valid session (was unauthenticated before fix)

---

## Not Implemented (Required Before Monetisation)

### Per-user daily AI budget

Free tier users need a daily token/request cap to prevent abuse and control costs.

```typescript
// Pseudocode — needs implementation in each AI route:
const MAX_DAILY_TOKENS_FREE = 50_000;
const MAX_DAILY_TOKENS_PAID = 500_000;

async function checkBudget(userId: string, tier: "free" | "paid"): Promise<boolean> {
  const todayUsage = await db.zv_usage.aggregate({
    where: { 
      user_id: userId, 
      created_at: { gte: startOfToday() },
      type: "ai_tokens"
    },
    _sum: { value: true }
  });
  
  const limit = tier === "paid" ? MAX_DAILY_TOKENS_PAID : MAX_DAILY_TOKENS_FREE;
  return (todayUsage._sum.value ?? 0) < limit;
}
```

### Per-user voice minute cap

Voice calls run TTS via OpenAI at ~$0.015/1000 chars. Long calls are expensive.

**Proposed limits:**
- Free tier: 20 min/day
- Cloud tier ($79/mo): 800 min/month
- SOVEREIGN: unlimited (they host their own TTS)

Not yet enforced in code.

### OpenAI spend alert

**Do this now:** Set monthly soft + hard limits in the OpenAI billing dashboard.

1. platform.openai.com → Settings → Billing → Usage limits
2. Soft limit (email alert): $50/month
3. Hard limit (auto-stop): $200/month

This is the single most important cost control that isn't code.

---

## Cost Modelling (Estimates)

### Per active user per month (CLOUD tier, $79/mo)

| Activity | Volume estimate | Cost estimate |
|---------|----------------|--------------|
| 800 voice minutes | ~200,000 TTS chars | $3.00 |
| 50 AI conversations × 20 turns | ~500,000 tokens | $2.50–5.00 |
| Storage (leads, transcripts) | Negligible | <$0.01 |
| **Total per CLOUD user** | | **~$5.50–8.00** |

**Margin at $79/mo:** ~$71 before server costs.  
**Server costs (Exoscale standard.extra-large):** ~€130/mo ÷ N users.  
**Break-even:** 3 paying CLOUD users cover the server. Every additional user is profit at this scale.

### Risk scenario: 1 free user with no limits

A free user running 10,000 AI requests/day with 4096 tokens each:
- 40M tokens/day × $5/1M tokens = **$200/day**

This is why per-user limits are a launch blocker for any publicly accessible free tier.

---

## Monitoring (Not Yet Configured)

Required alerts:
- OpenAI spend > $10 in any 1-hour window → Telegram alert
- OpenAI spend > $50 in any 24-hour window → email + Telegram
- Any single user > 1000 AI requests in 24 hours → flag for review

---

## Cost Control Checklist

| Control | Status |
|---------|--------|
| OpenAI hard spend limit set | ❌ Not done — DO THIS NOW |
| Kill AI kill switch works | ✅ Implemented |
| TTS requires auth | ✅ Fixed this session |
| Per-user daily token cap | ❌ Not implemented |
| Per-user voice minute cap | ❌ Not implemented |
| AI cost alert (Telegram) | ❌ Not implemented |
| Ollama memory cap | ❌ Not set in Docker |
| Usage tracking in DB | ✅ zv_usage table exists |
