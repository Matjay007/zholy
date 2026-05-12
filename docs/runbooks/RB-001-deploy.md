# RB-001 — Deploy to Production

**When:** Pushing new code to production.

---

## Pre-deploy checklist

- [ ] `npm run build` passes locally (or in CI)
- [ ] No TypeScript errors
- [ ] Kill switches ready if deploy breaks something

## Deploy steps

```bash
ssh ubuntu@<SERVER_IP>
cd /opt/zholy
bash deploy.sh
```

## deploy.sh does:
1. `git pull origin main`
2. `npm install --omit=dev`
3. `npm run build` (aborts if fails)
4. Copies static assets
5. `sudo systemctl restart zholy`
6. Health check: polls `/api/health` for 30s

## Verify

```bash
curl -sf https://zholy.ai/api/health && echo "DEPLOYED OK"
journalctl -u zholy -n 20 --no-pager
```

## If deploy fails

```bash
# Check what happened
journalctl -u zholy -n 50 --no-pager

# Rollback to previous build (if .next/standalone.prev exists)
sudo systemctl stop zholy
mv .next/standalone .next/standalone.failed
mv .next/standalone.prev .next/standalone
sudo systemctl start zholy
```
