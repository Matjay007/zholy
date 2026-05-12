# Incident Response

**Last updated:** 2026-05-12  
**Status:** Defined. No alerting configured yet. Manual detection only.

---

## Incident Severity Levels

| Severity | Definition | Response time | Examples |
|----------|-----------|---------------|---------|
| **SEV-1** | Site completely down for all users | Immediate | Cloudflare tunnel down, server OOM, DB crash |
| **SEV-2** | Core feature broken for all users | < 30 min | Auth broken, voice down, dashboard 500s |
| **SEV-3** | Feature degraded for subset of users | < 4 hours | One route failing, rate limits too aggressive |
| **SEV-4** | Minor issue, no user impact | < 24 hours | Log format broken, non-critical UI glitch |

---

## Detection (Current State — ALL MANUAL)

No automated alerting exists. Detection methods available right now:

```bash
# Is the app up?
curl -sf https://zholy.ai/api/health && echo OK || echo DOWN

# Is the app running?
ssh ubuntu@<SERVER> "systemctl is-active zholy"

# Recent errors?
ssh ubuntu@<SERVER> "journalctl -u zholy -n 50 --no-pager"

# Is the gateway running?
ssh ubuntu@<SERVER> "docker ps | grep gateway"

# DB alive?
ssh ubuntu@<SERVER> "docker exec zholy-postgres-1 pg_isready -U zholy_admin"

# Disk space?
ssh ubuntu@<SERVER> "df -h /"

# RAM?
ssh ubuntu@<SERVER> "free -h"

# Recent OOM kills?
ssh ubuntu@<SERVER> "dmesg | grep -i 'oom\|killed' | tail -10"
```

**Fix this first:** Configure UptimeRobot to monitor `https://zholy.ai/api/health` and send Telegram + email alerts. ← LAUNCH BLOCKER.

---

## Response Protocol

### SEV-1: Site Down

1. **Confirm the outage** — check from a different network, check UptimeRobot (when configured)
2. **Identify the layer**:
   - DNS resolves? → `dig zholy.ai` should return Cloudflare IP
   - Cloudflare reachable? → Check Cloudflare dashboard
   - Tunnel connected? → `systemctl status cloudflared`
   - App responding? → `curl http://localhost:3009/api/health`
   - App running? → `systemctl status zholy`
3. **Quick fixes by layer**:

| Layer | Fix |
|-------|-----|
| Cloudflare tunnel down | `sudo systemctl restart cloudflared` |
| App crashed | `sudo systemctl restart zholy` |
| App not starting | Check `journalctl -u zholy -n 50` |
| DB crashed | `sudo docker restart zholy-postgres-1` |
| Disk full | See runbook RB-011 |
| OOM | Restart killed service, check `free -h` |

4. **If app won't restart** → engage maintenance mode:
   ```bash
   echo 'KILL_MAINTENANCE=true' >> /opt/zholy/.env.local
   sudo systemctl restart zholy
   ```
5. **Communicate** — post status to Slack/Discord if any users are watching.
6. **Document** — write incident post-mortem (see template below).

### SEV-2: Core Feature Broken

1. **Identify which feature** from user reports or error logs
2. **Check feature-specific health**:
   - Auth broken → check Better Auth logs, Google/Apple OAuth status
   - Voice broken → check gateway container, SenseVoice, OpenAI TTS status
   - AI broken → check Ollama, OpenAI API status
3. **Apply kill switch** for the broken feature to prevent cascading errors:
   ```bash
   # Voice down:
   echo 'KILL_VOICE=true' >> /opt/zholy/.env.local && sudo systemctl restart zholy
   # AI down:
   echo 'KILL_AI=true' >> /opt/zholy/.env.local && sudo systemctl restart zholy
   ```
4. **Root cause** → fix → remove kill switch → restart → verify.

### SEV-3: Degraded for Subset

1. Identify affected user group or route from logs
2. Reproduce the issue locally or on the server
3. Deploy fix via standard deploy process
4. Monitor logs for 15 min after deploy

---

## Kill Switch Reference (for incident use)

```bash
# Edit
nano /opt/zholy/.env.local

# Add/remove these lines:
KILL_MAINTENANCE=true          # Full maintenance mode (503 for all users)
KILL_SIGNUPS=true              # Block new signups
KILL_AI=true                   # Disable all AI
KILL_VOICE=true                # Disable voice
KILL_WRITES=true               # Read-only mode
KILL_BACKGROUND_AGENTS=true    # Stop background jobs
KILL_PREMIUM_MODEL=true        # Free users get mini model only

# Apply
sudo systemctl restart zholy
```

---

## Incident Post-Mortem Template

When SEV-1 or SEV-2 is resolved, document within 24 hours:

```markdown
## Incident — [DATE] [HH:MM]–[HH:MM] UTC

**Severity:** SEV-X  
**Duration:** X minutes  
**User impact:** [What users saw]

### Timeline
- HH:MM — Incident began (detected by: ...)
- HH:MM — Identified root cause
- HH:MM — Applied fix
- HH:MM — Confirmed resolution

### Root Cause
[What failed and why]

### Impact
[Estimated users affected, revenue impact if measurable]

### Fix Applied
[What was done]

### Prevention
- [ ] Action 1
- [ ] Action 2
```

Store post-mortems in `docs/incidents/YYYY-MM-DD-short-title.md`.

---

## Communication Templates

### Status page (manual — no status page configured yet)

If users ask during an outage:
> "We're aware of an issue affecting [feature]. Our team is investigating. We'll update as soon as we have more information."

### Resolution notice:
> "The issue affecting [feature] has been resolved as of [HH:MM UTC]. [Brief cause]. All systems are normal."

---

## Contacts and Access

| Resource | Location |
|----------|----------|
| Server SSH | `ssh ubuntu@<SERVER_IP>` |
| Cloudflare dashboard | Cloudflare account |
| GitHub repo | `Matjay007/zholy` |
| Exoscale console | Exoscale account |
| OpenAI status | https://status.openai.com |
| Google Cloud status | https://status.cloud.google.com |

---

## First 48 Hours Monitoring After Launch

For the first 48 hours after any major deploy or public launch:
- Check `journalctl -u zholy -f` every 30 min
- Check `docker stats` every 30 min
- Check `df -h` every 2 hours
- Check `free -h` every hour
- Have kill switches ready
- Do NOT deploy any other changes during this window
