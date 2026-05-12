# RB-009 — SSL Certificate Issues

**Symptom:** Browser shows "connection not secure", cert expired warning, or HTTPS fails.

---

## Architecture note

ZHOLY uses **Cloudflare tunnel** for public traffic. Cloudflare handles SSL termination on the public edge. The origin (nginx) uses a Cloudflare **Origin Certificate** which is only valid between Cloudflare and the origin — browsers never see it directly.

This means:
- Cloudflare edge cert: auto-renewed by Cloudflare. You never touch it.
- Cloudflare → Origin cert: 15-year validity. You installed it on nginx. You'll never need to renew it.
- If users see a cert error: likely a Cloudflare misconfiguration, not an expired cert.

---

## Diagnose

```bash
# From your local machine — check what cert users see
openssl s_client -connect zholy.ai:443 -servername zholy.ai 2>/dev/null | \
  openssl x509 -noout -dates

# On server — check origin cert (not user-facing)
openssl x509 -in /etc/ssl/cloudflare-origin.pem -noout -dates 2>/dev/null \
  || echo "Origin cert not found or not configured"

# Check nginx config
sudo nginx -t
```

## Fix: Cloudflare SSL mode not set to "Full (strict)"

Most cert errors for Cloudflare-proxied sites are caused by wrong SSL mode.

1. Cloudflare dashboard → zholy.ai → SSL/TLS → Overview
2. Set mode to **Full (strict)**
3. If you don't have an origin cert installed on nginx: set to **Full** (not strict)

## Fix: Origin certificate missing from nginx

```bash
# Check nginx SSL config
grep -r "ssl_certificate" /etc/nginx/

# If not configured, the Cloudflare Origin Certificate needs to be installed
# Generate one: Cloudflare dashboard → SSL/TLS → Origin Server → Create Certificate
# Then:
# - Save cert as /etc/ssl/cloudflare-origin.pem
# - Save key as /etc/ssl/cloudflare-origin.key
# - chmod 600 /etc/ssl/cloudflare-origin.key

# Add to nginx server block:
# ssl_certificate     /etc/ssl/cloudflare-origin.pem;
# ssl_certificate_key /etc/ssl/cloudflare-origin.key;

sudo nginx -t && sudo nginx -s reload
```

## Fix: nginx HTTP-only (no SSL configured at all)

If the server only listens on port 80 and relies entirely on Cloudflare for SSL (with SSL mode "Flexible"), this is acceptable but suboptimal (traffic between Cloudflare and origin is unencrypted).

To upgrade to "Full" mode:
1. Add the origin cert to nginx (see above)
2. Change Cloudflare SSL to "Full (strict)"

## Fix: Cloudflare is bypassed (direct IP access)

If someone accesses the server IP directly (not through Cloudflare), they'll see the raw nginx cert which may not be trusted by browsers. This is expected and acceptable — direct IP access should be blocked by the server firewall.

---

## No renewal required

Cloudflare Origin Certificates are valid for 15 years. Set a calendar reminder for 2040 to renew.
