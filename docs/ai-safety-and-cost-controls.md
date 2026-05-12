# AI Safety and Cost Controls

**Last updated:** 2026-05-12  
**Status:** Kill switches implemented in `lib/kill-switches.ts`. Cost tracking NOT implemented.

---

## Implemented Controls

All are environment-variable driven. Set in `/opt/zholy/.env.local` and `sudo systemctl restart zholy`.

### Kill Switches

| Env Var | Effect | Default |
|---------|--------|---------|
| `KILL_AI=true` | Disable all AI (TTS, Ollama) from Next.js | off |
| `KILL_VOICE=true` | Disable voice session routes | off |
| `KILL_PREMIUM_MODEL=true` | Downgrade free users to cheapest model | off |
| `KILL_EMBEDDINGS=true` | Disable embedding generation + knowledge indexing | off |
| `KILL_WEBHOOKS=true` | Disable external webhook dispatch | off |
| `KILL_BACKGROUND_AGENTS=true` | Disable background agent jobs | off |
| `KILL_SIGNUPS=true` | Block new signups (waitlist-only mode) | off |
| `KILL_WRITES=true` | Force read-only mode (no DB writes) | off |
| `KILL_MAINTENANCE=true` | Show maintenance page to all users | off |

### Limits (env-var configurable)

| Env Var | Default | Description |
|---------|---------|-------------|
| `AI_MAX_CONCURRENT_GLOBAL` | 20 | Max parallel AI jobs across all users |
| `AI_MAX_CONCURRENT_PER_USER` | 3 | Max parallel AI jobs per user session |
| `AI_MAX_TOKENS_PER_REQUEST` | 4096 | Max tokens (input + output) per LLM call |
| `AI_MAX_CONTEXT_TOKENS` | 16384 | Max conversation context tokens |
| `AI_MAX_TOOL_DEPTH` | 10 | Max tool call depth per agent run |
| `AI_MAX_JOB_MS` | 30000 | Max duration (ms) for a single AI job |
| `AI_DAILY_SPEND_CAP_CENTS` | 0 (no cap) | Hard daily spend cap in USD cents |

---

## NOT YET IMPLEMENTED (Required Before Launch)

### Per-User Token Budget
- **Status:** NOT IMPLEMENTED
- **Required:** Track cumulative tokens per user per day in DB. Reject requests when budget exceeded.
- **Risk:** A single user can generate thousands of requests and spend hundreds of dollars.

### Daily AI Spend Tracking
- **Status:** NOT IMPLEMENTED
- **Required:** Track OpenAI API costs in real time. Alert at 50% / 75% / 90% of daily cap.
- **Risk:** No visibility into AI spend until end of billing cycle.

### Retry Storm Protection
- **Status:** NOT IMPLEMENTED
- **Required:** Max 3 retries per request, exponential backoff, dead-letter after 3 failures.
- **Risk:** A broken OpenAI integration retries indefinitely, burning tokens and money.

### OpenAI Usage Monitoring
- **Status:** NOT IMPLEMENTED
- **Required:** Poll OpenAI usage API or parse response headers for token counts. Store per-session.

### Async AI Queue
- **Status:** NOT IMPLEMENTED
- **Required:** Expensive AI jobs (long context, embeddings) should go through a queue.
- **Risk:** Long-running LLM calls (30s+) tie up Node.js connections and hit timeout.

### Automatic Model Downgrade Under Load
- **Status:** NOT IMPLEMENTED
- **Required:** When queue depth > threshold, automatically downgrade to cheaper/faster model.

---

## Emergency Procedure

To immediately cut all AI costs in an emergency:

```bash
# On the server
echo "KILL_AI=true" >> /opt/zholy/.env.local
sudo systemctl restart zholy

# To also disable voice at the gateway level, stop the gateway container:
sudo docker stop zholy-zholy-gateway-blue-1
```

To restore:
```bash
sed -i '/KILL_AI=true/d' /opt/zholy/.env.local
sudo systemctl restart zholy
sudo docker start zholy-zholy-gateway-blue-1
```

---

## Gateway AI Controls (Separate)

The voice gateway (`/opt/zholy-gateway`) has its own LLM configuration. Controls needed there:
- Max tokens per voice turn (not yet set)
- Max voice session duration (not yet set)
- Per-session cost cap (not yet set)

**These controls are NOT implemented in the gateway.** A voice session can run indefinitely.
