# Degradation Modes

**Last updated:** 2026-05-12  
**Kill switches:** Implemented in `lib/kill-switches.ts` and `middleware.ts`

---

## Mode Overview

| Mode | Trigger | Actions | Kill switches |
|------|---------|---------|--------------|
| **Normal** | Default | Everything enabled | All off |
| **Busy** | CPU > 70% sustained, queue depth > 50 | Throttle AI, downgrade free tier | `KILL_PREMIUM_MODEL=true` |
| **Viral** | > 200 concurrent users | Protect landing/signup/payment | `KILL_VOICE=true`, `KILL_BACKGROUND_AGENTS=true` |
| **Survival** | Server at risk | Waitlist only, read-only | `KILL_SIGNUPS=true`, `KILL_WRITES=true`, `KILL_VOICE=true`, `KILL_AI=true` |
| **Maintenance** | Planned or emergency | Maintenance page | `KILL_MAINTENANCE=true` |

---

## Normal Mode

Everything works. All users have access to all features.

---

## Busy Mode

**Trigger:** CPU > 70% for 5+ minutes, or memory available < 3 GB, or queue depth > 50 (when queue is implemented)

**Actions:**
```bash
# In /opt/zholy/.env.local:
KILL_PREMIUM_MODEL=true          # Free users get gpt-4o-mini only
AI_MAX_CONCURRENT_GLOBAL=10      # Halve AI concurrency
AI_MAX_TOKENS_PER_REQUEST=2048   # Reduce context window
sudo systemctl restart zholy
```

**User impact:** Free users experience slower AI responses or cheaper model quality. Paid users unaffected.

---

## Viral Mode

**Trigger:** > 200 concurrent users, p99 latency > 3s, memory available < 2 GB

**Actions:**
```bash
# In /opt/zholy/.env.local:
KILL_VOICE=true                  # Disable voice (highest resource drain)
KILL_BACKGROUND_AGENTS=true      # Disable background jobs
KILL_EMBEDDINGS=true             # No knowledge indexing
AI_MAX_CONCURRENT_GLOBAL=5       # Drastically limit AI
sudo systemctl restart zholy
```

**Cloudflare actions:**
- Enable Rate Limiting Rule: all paths, 200 req/min per IP, block 5 min
- Enable Bot Fight Mode
- Enable Under Attack Mode (shows JS challenge to all visitors)

**User impact:** Voice disabled. Background tasks paused. Landing page, signup, and dashboard remain functional. AI chat may be queued.

---

## Survival Mode

**Trigger:** Server at risk of crashing, disk > 90%, memory < 1 GB, or active incident

**Actions:**
```bash
# In /opt/zholy/.env.local:
KILL_SIGNUPS=true       # No new accounts
KILL_AI=true            # All AI disabled
KILL_VOICE=true         # Voice disabled
KILL_WRITES=true        # Read-only (dashboard still loads)
sudo systemctl restart zholy
```

**Result:** Logged-in users can view their dashboard. No new functionality. Landing page stays up. No AI costs accumulate.

---

## Maintenance Mode

**Trigger:** Planned (deploy, DB migration) or emergency (unknown corruption, breach)

**Actions:**
```bash
echo 'KILL_MAINTENANCE=true' >> /opt/zholy/.env.local
sudo systemctl restart zholy
# 503 + maintenance page shown to all non-API traffic
# /api/health still returns 200
```

**To cancel:**
```bash
sed -i '/KILL_MAINTENANCE=true/d' /opt/zholy/.env.local
sudo systemctl restart zholy
```

---

## Automatic Recovery (Not Yet Implemented)

The following automatic responses are NOT implemented and must be done manually:
- Auto-detect CPU > 70% and engage Busy mode
- Auto-detect memory < 2 GB and engage Viral mode
- Auto-alert on mode changes

**Required:** A simple watchdog script that monitors system metrics and sends a Telegram alert when thresholds are breached.
