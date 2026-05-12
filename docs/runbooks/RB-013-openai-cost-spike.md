# RB-013 — OpenAI Cost Spike

**Symptom:** OpenAI bill spiking unexpectedly. Usage dashboard showing unusually high token counts.

---

## Immediate response: disable AI

```bash
ssh ubuntu@<SERVER_IP>

# Option A: Kill all AI (most aggressive)
echo 'KILL_AI=true' >> /opt/zholy/.env.local
sudo systemctl restart zholy

# Option B: Kill premium model only (free users get gpt-4o-mini)
echo 'KILL_PREMIUM_MODEL=true' >> /opt/zholy/.env.local
sudo systemctl restart zholy

# Option C: Reduce token limits
echo 'AI_MAX_TOKENS_PER_REQUEST=512' >> /opt/zholy/.env.local
sudo systemctl restart zholy
```

---

## Diagnose the cause

### Check OpenAI dashboard
1. Go to platform.openai.com → Usage
2. Look at usage by model, by day
3. Compare to expected usage (DAU × turns × avg tokens)

### Check app logs for patterns
```bash
# High-token requests
journalctl -u zholy --since "24 hours ago" --no-pager | grep '"tokens"' | sort -t: -k2 -rn | head -20

# Check for single source IP hammering AI endpoints
journalctl -u zholy --since "24 hours ago" --no-pager | grep '"event":"ai_request"' | \
  grep -o '"ip":"[^"]*"' | sort | uniq -c | sort -rn | head -10
```

### Check for abuse patterns
- Single user making thousands of requests?
- Automated bot hitting AI endpoints?
- A rate limit bypass?

---

## Root causes and fixes

### Cause 1: No per-user limit

**Current state:** No per-user daily token cap. One user can run unlimited AI requests.

**Fix:** Add per-user limit to AI route handlers:
```typescript
// Check user's daily usage in DB
const usage = await getTodayUsage(userId);
if (usage.tokens > AI_BUDGET_DAILY_PER_USER) {
  return new Response("Daily AI limit reached", { status: 429 });
}
```

### Cause 2: Large context window per request

System prompts + conversation history can balloon to thousands of tokens per request.

**Fix:** Already limited by `AI_MAX_TOKENS_PER_REQUEST` env var. Verify it's set:
```bash
grep AI_MAX_TOKENS /opt/zholy/.env.local
```

### Cause 3: Runaway agent loop

An agent calling itself repeatedly without termination.

**Fix:** Check `AI_MAX_TOOL_CALL_DEPTH` and `AI_MAX_DURATION_SECONDS` in `.env.local`.

---

## Recovery: re-enable AI after investigation

```bash
sed -i '/KILL_AI=true/d' /opt/zholy/.env.local
sudo systemctl restart zholy

# Verify
curl -sf https://zholy.ai/api/health
```

---

## Set OpenAI spend limit

Most important prevention: set a hard spend limit in the OpenAI dashboard.

1. platform.openai.com → Settings → Billing
2. Set monthly soft limit (alert) and hard limit (auto-stop)
3. Recommended for early stage: hard limit at $100/month until usage is understood
