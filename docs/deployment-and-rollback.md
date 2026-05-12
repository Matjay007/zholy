# Deployment and Rollback

**Last updated:** 2026-05-12  
**Status:** Basic git pull + restart deploy works. No staging. No tested rollback.

---

## Current Deployment Process

```bash
# On server (via SSH):
cd /opt/zholy
git pull origin main
npm install --omit=dev
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
sudo systemctl restart zholy
```

Or using the deploy script: `/opt/zholy/deploy.sh`

**This is "git pull and restart." This is a launch blocker per the checklist.**

---

## What's Missing

| Requirement | Status |
|-------------|--------|
| Staging environment | ❌ None |
| Reproducible builds (same output for same input) | ⚠️ Partial — no lockfile pinning |
| Immutable artifacts (deploy by SHA) | ❌ Not implemented |
| Pre-deploy checks | ❌ None |
| Post-deploy smoke tests | ❌ None |
| Database migration checks | ❌ No migrations exist |
| Feature flags | ❌ Not implemented |
| Canary / staged rollout | ❌ Not implemented |
| Rollback without rebuilding | ❌ No previous build retained |
| Rollback tested | ❌ Never tested |

---

## Minimum Viable Deployment Improvement

Until a proper CI/CD pipeline is built, this is the safest manual process:

```bash
# /opt/zholy/deploy.sh (improved version)
#!/bin/bash
set -euo pipefail

cd /opt/zholy

# 1. Save current commit for rollback
PREV_SHA=$(git rev-parse HEAD)
echo "[deploy] Previous SHA: $PREV_SHA"

# 2. Pull + build
git pull origin main
NEW_SHA=$(git rev-parse HEAD)
echo "[deploy] New SHA: $NEW_SHA"

npm install --omit=dev
npm run build || { echo "[deploy] BUILD FAILED — aborting, no restart"; exit 1; }

# 3. Keep previous build for rollback
cp -r .next/standalone .next/standalone.prev 2>/dev/null || true

# 4. Copy static assets
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# 5. Restart
sudo systemctl restart zholy

# 6. Health check (wait up to 30s)
for i in $(seq 1 6); do
  sleep 5
  if curl -sf http://localhost:3009/api/health > /dev/null; then
    echo "[deploy] Health check passed — $NEW_SHA is live"
    exit 0
  fi
done

echo "[deploy] Health check FAILED — rolling back to $PREV_SHA"
/opt/zholy/rollback.sh "$PREV_SHA"
exit 1
```

---

## Rollback Procedure

**Not tested. Must be tested before launch.**

### Rollback Option 1: Previous `.next` build (if saved by deploy script)
```bash
sudo systemctl stop zholy
mv .next/standalone .next/standalone.failed
mv .next/standalone.prev .next/standalone
sudo systemctl start zholy
```

### Rollback Option 2: Git reset to previous commit
```bash
git reset --hard $PREV_SHA
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
sudo systemctl restart zholy
```

**RTO for rollback:** Currently 5–10 minutes (requires rebuild). Target: < 2 minutes (pre-built artifact).

---

## Staging Environment

**None exists.** Every untested deploy goes directly to production users.

**Minimum viable staging:**
1. Create a second Exoscale instance (smallest size, ~€10/month)
2. Clone repo, same .env.local with staging values
3. Use `zholy-staging.ai` subdomain (Cloudflare, not proxied)
4. Test every deploy there before touching production

**This should be built before launch.** It is listed as a launch blocker.

---

## Pre-Deploy Checklist (Manual Until Automated)

Before every deploy:
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors
- [ ] `BETTER_AUTH_URL` is set correctly
- [ ] `NEXT_PUBLIC_ZRO_GATEWAY_URL` is set correctly
- [ ] DB migrations (if any) are reversible
- [ ] Kill switch can be engaged if deploy goes wrong
