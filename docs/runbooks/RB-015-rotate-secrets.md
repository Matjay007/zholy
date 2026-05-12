# RB-015 — Rotate Secrets / API Keys

**When:** Credential suspected compromised, scheduled rotation, or key expiry.

---

## Secrets inventory

| Secret | Location | Expiry | Notes |
|--------|----------|--------|-------|
| BETTER_AUTH_SECRET | `/opt/zholy/.env.local` | Never (but rotate if leaked) | Rotation logs out ALL users |
| DATABASE_URL password | `.env.local` + Docker | Never (rotate on breach) | Must update in two places |
| OPENAI_API_KEY | `.env.local` | Never (revoke if leaked) | — |
| GOOGLE_CLIENT_SECRET | `.env.local` | Never (rotate if leaked) | Update Google Cloud Console |
| APPLE_CLIENT_SECRET | `.env.local` | **2026-07-06** | 6-month JWT — must regenerate |
| ZHOLY_ADMIN_BRIDGE_KEY | `.env.local` | Never | — |
| GitHub PAT | Git remote URL | — | CRITICAL: currently embedded in git remote |

---

## Rotate BETTER_AUTH_SECRET

**Warning:** All existing sessions are immediately invalidated. All users are logged out.

```bash
# Generate new secret (32+ chars)
openssl rand -base64 32

# Update .env.local
nano /opt/zholy/.env.local
# Replace BETTER_AUTH_SECRET=xxx with new value

sudo systemctl restart zholy
```

## Rotate OpenAI API key

1. Go to platform.openai.com → API Keys → Create new key
2. Update `.env.local`: `OPENAI_API_KEY=sk-...`
3. Revoke the old key in OpenAI dashboard
4. `sudo systemctl restart zholy`

## Renew Apple OAuth client secret (expires 2026-07-06)

1. Sign in to developer.apple.com
2. Go to Certificates, Identifiers & Profiles → Keys
3. Find the key used for Sign in with Apple
4. Generate a new client secret JWT (valid for 6 months)
5. Update `.env.local`: `APPLE_CLIENT_SECRET=eyJ...`
6. `sudo systemctl restart zholy`

**Do this before 2026-07-05** — Apple OAuth breaks the day the secret expires.

## Rotate GitHub PAT (CRITICAL)

The GitHub PAT is currently embedded in the git remote URL. This is a security risk.

```bash
# Current state (on server)
git -C /opt/zholy remote -v
# Shows: https://TOKEN@github.com/Matjay007/zholy.git

# Steps:
# 1. Go to GitHub → Settings → Developer settings → Personal access tokens
# 2. Delete the old token
# 3. Create a new token with repo scope only
# 4. Update the remote URL
git -C /opt/zholy remote set-url origin https://NEW_TOKEN@github.com/Matjay007/zholy.git
```

**Better approach:** Use SSH keys instead of PAT in URL:
```bash
# Generate deploy key
ssh-keygen -t ed25519 -C "zholy-deploy" -f ~/.ssh/zholy_deploy -N ""
# Add public key to GitHub repo → Settings → Deploy keys
# Update remote:
git -C /opt/zholy remote set-url origin git@github-zholy:Matjay007/zholy.git
```

## Rotate DB password

1. Change password in PostgreSQL:
   ```bash
   docker exec zholy-postgres-1 psql -U zholy_admin -d postgres \
     -c "ALTER USER zholy_admin PASSWORD 'new_password';"
   ```
2. Update `DATABASE_URL` in `.env.local` and in gateway env
3. `sudo systemctl restart zholy && docker restart zholy-gateway-1`

## After any rotation

1. Verify app still starts: `systemctl is-active zholy`
2. Test sign-in
3. Check logs for auth errors: `journalctl -u zholy -n 30 --no-pager`
4. Update secrets backup (see `docs/backup-restore.md`)
