# RB-002 — Rollback

**When:** Deploy broke something, need to revert to previous version.

---

## Option A — Previous build artifact (fastest, ~30s)

Only works if deploy.sh saved `.next/standalone.prev` (not guaranteed).

```bash
ssh ubuntu@<SERVER_IP>
cd /opt/zholy

# Check if previous build exists
ls -la .next/standalone.prev

# Rollback
sudo systemctl stop zholy
mv .next/standalone .next/standalone.bad
mv .next/standalone.prev .next/standalone
sudo systemctl start zholy

# Verify
curl -sf https://zholy.ai/api/health && echo "ROLLBACK OK"
```

## Option B — Git reset + rebuild (~8-12 min)

```bash
# Find previous commit
git log --oneline -5

# Reset to it
git reset --hard <PREVIOUS_SHA>

# Rebuild
npm install --omit=dev
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

sudo systemctl restart zholy
curl -sf https://zholy.ai/api/health && echo "ROLLBACK OK"
```

## Option C — Kill switch (fastest damage control, <30s)

If rollback isn't needed but the broken feature needs disabling:

```bash
echo 'KILL_VOICE=true' >> /opt/zholy/.env.local
sudo systemctl restart zholy
```

## After rollback

1. Document what broke and why in `docs/incidents/`
2. Fix the bug on a branch
3. Test locally
4. Re-deploy when confident
