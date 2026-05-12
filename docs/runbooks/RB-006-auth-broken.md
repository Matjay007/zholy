# RB-006 — Auth Broken (Sign-in / Sign-out Failing)

**Symptoms:** 500/400 on sign-in, OAuth loop, all users logged out, sign-out doesn't work.

---

## Diagnose by auth method

```bash
ssh ubuntu@<SERVER_IP>

# Check auth-related errors
journalctl -u zholy -n 100 --no-pager | grep -i "auth\|session\|oauth\|500"

# Check BETTER_AUTH_URL matches production URL
grep BETTER_AUTH_URL /opt/zholy/.env.local
# Should be: BETTER_AUTH_URL=https://zholy.ai

# Check DB connection (Better Auth needs DB for sessions)
docker exec zholy-postgres-1 pg_isready -U zholy_admin -d zholy
```

## Fix: OAuth callback URL mismatch

Symptom: "redirect_uri_mismatch" from Google/Apple.

1. Check current callback URLs in Google Cloud Console → APIs → Credentials
2. Verify `BETTER_AUTH_URL` in `.env.local` matches the URL users are accessing
3. If changed domain/protocol, update OAuth app settings and restart

## Fix: BETTER_AUTH_SECRET changed

Symptom: All users suddenly get 401, existing sessions invalid.

```bash
# Check current secret
grep BETTER_AUTH_SECRET /opt/zholy/.env.local

# If accidentally changed, restore previous value
# Users will need to re-login — this cannot be avoided
sudo systemctl restart zholy
```

## Fix: Session table missing or corrupt

```bash
docker exec zholy-postgres-1 psql -U zholy_admin -d zholy \
  -c "\dt sessions"

# If missing, run Prisma schema push
cd /opt/zholy
npx prisma db push
sudo systemctl restart zholy
```

## Fix: Apple OAuth broken

Check expiry:
```bash
# Apple client secret expires 2026-07-06
grep APPLE_CLIENT_SECRET /opt/zholy/.env.local | head -c 100
```

If expired: regenerate via Apple developer account. See Apple OAuth setup docs.

## Fix: Google OAuth broken

Check Google Cloud Console for API key status. If rate-limited or key revoked:
1. Create new OAuth credential
2. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in `.env.local`
3. `sudo systemctl restart zholy`

## Fix: Email sign-in / reset broken (SMTP not configured)

**Current state:** SMTP is not configured. Email verification and password reset DO NOT WORK.

Users cannot sign up via email (no verification email sent) and cannot reset passwords. This is a known launch blocker.

**To fix:** Configure SMTP env vars:
```bash
SMTP_HOST=smtp.mailgun.org    # or Postmark, Brevo, SES
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@zholy.ai
```
Then restart: `sudo systemctl restart zholy`
