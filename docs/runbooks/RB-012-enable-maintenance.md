# RB-012 — Enable / Disable Maintenance Mode

**When:** Planned deploy, DB migration, or emergency situation.

---

## Enable Maintenance Mode

```bash
ssh ubuntu@<SERVER_IP>

echo 'KILL_MAINTENANCE=true' >> /opt/zholy/.env.local
sudo systemctl restart zholy
```

**Effect:**
- All non-API traffic gets a 503 maintenance page
- `/api/health` still returns 200 (monitoring stays green)
- WebSocket connections are not closed (existing voice calls may continue if gateway is separate)

**Verify:**
```bash
curl -sv https://zholy.ai/ 2>&1 | grep "< HTTP"
# Should show: 503
curl -sf https://zholy.ai/api/health
# Should still return 200
```

---

## Disable Maintenance Mode

```bash
sed -i '/KILL_MAINTENANCE=true/d' /opt/zholy/.env.local
sudo systemctl restart zholy
```

**Verify:**
```bash
curl -sf https://zholy.ai/api/health && echo "Back online"
```

---

## Pre-planned maintenance (e.g., DB migration)

1. Announce in advance (Slack / status page) with estimated duration
2. Enable maintenance mode
3. Do the work
4. Verify: `curl /api/health` returns 200
5. Disable maintenance mode
6. Verify: sign in works, dashboard loads

---

## Emergency maintenance (unknown issue, breach)

1. Enable maintenance mode immediately (takes < 30s)
2. Investigate with maintenance mode active — users see a clean page, not broken errors
3. Fix the issue
4. Disable when confident

---

## Customising the maintenance page

The maintenance response is defined in `middleware.ts`. Current response:

```typescript
// 503 HTML response with inline message
return new Response(maintenanceHtml, {
  status: 503,
  headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "300" }
});
```

To change the message, edit `middleware.ts` → `maintenanceHtml` variable → rebuild → deploy.
