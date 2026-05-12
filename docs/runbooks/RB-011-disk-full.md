# RB-011 — Disk Full

**Symptom:** Services crash, writes fail, `df -h` shows > 95%.

**Warning:** This is one of the most likely failures. No log rotation is configured.

---

## Diagnose

```bash
ssh ubuntu@<SERVER_IP>

# How full?
df -h /

# What's using space?
du -sh /var/lib/docker/* 2>/dev/null | sort -rh | head -10
du -sh /opt/* 2>/dev/null | sort -rh | head -10
du -sh /var/log/* 2>/dev/null | sort -rh | head -10
du -sh /home/ubuntu/backups/ 2>/dev/null
journalctl --disk-usage
```

## Quick wins (free space fast)

### 1. Docker cleanup (usually the biggest win)

```bash
# Remove unused images, containers, build cache
sudo docker system prune -a

# How much does Docker use?
sudo du -sh /var/lib/docker/
```

### 2. Journal logs

```bash
sudo journalctl --vacuum-size=200M
sudo journalctl --vacuum-time=7d
```

### 3. Nginx access logs

```bash
# Check size
du -sh /var/log/nginx/

# Rotate manually
sudo logrotate -f /etc/logrotate.d/nginx

# Or truncate (only if rotation isn't set up)
sudo truncate -s 0 /var/log/nginx/access.log
sudo nginx -s reopen
```

### 4. Old backups

```bash
# List backup sizes
ls -lh /home/ubuntu/backups/

# Remove backups older than 3 days (emergency only — normally keep 7)
find /home/ubuntu/backups/ -name "*.dump" -mtime +3 -delete
```

### 5. Next.js build artifacts

```bash
# Old build caches
du -sh /opt/zholy/.next/
# If multiple builds saved:
ls -la /opt/zholy/.next/ | grep standalone
sudo rm -rf /opt/zholy/.next/standalone.bad /opt/zholy/.next/standalone.prev
```

---

## Prevention (configure now, before launch)

### Log rotation

```bash
# /etc/logrotate.d/nginx (should exist — verify it rotates daily)
cat /etc/logrotate.d/nginx

# /etc/logrotate.d/zholy (create if missing)
cat > /etc/logrotate.d/zholy << 'EOF'
/var/log/zholy/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    sharedscripts
}
EOF
```

### journald size limit

```bash
# /etc/systemd/journald.conf
# Add:
# SystemMaxUse=500M
# MaxRetentionSec=7day

sudo systemctl restart systemd-journald
```

### Disk alert (when > 85%)

Add to crontab:
```bash
# Check every hour
0 * * * * df / | awk 'NR==2 {gsub(/%/,"",$5); if ($5 > 85) system("curl -s -X POST https://api.telegram.org/botTOKEN/sendMessage -d chat_id=ID -d text=\"Disk at \"$5\"%\"")}' 
```
