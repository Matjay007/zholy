# RB-005 — Voice Calls Not Working

**Symptom:** Users report voice calls fail to start or disconnect immediately. WebSocket connection fails.

---

## Quick disable (if voice is broken and you need to stabilise)

```bash
echo 'KILL_VOICE=true' >> /opt/zholy/.env.local
sudo systemctl restart zholy
# Users see a "Voice temporarily unavailable" message
```

---

## Diagnose

```bash
ssh ubuntu@<SERVER_IP>

# Is the gateway running?
docker ps | grep gateway

# Gateway health
curl -sf http://127.0.0.1:8790/health && echo "Gateway OK" || echo "Gateway DOWN"

# Is SenseVoice STT up?
curl -sf http://127.0.0.1:8100/health && echo "SenseVoice OK" || echo "SenseVoice DOWN"

# Gateway logs
docker logs zholy-gateway-1 --tail 50

# SenseVoice logs
journalctl -u sensevoice -n 50 --no-pager
```

## Fix: Gateway container down

```bash
sudo docker restart zholy-gateway-1
sleep 5
curl -sf http://127.0.0.1:8790/health
```

## Fix: SenseVoice STT down

```bash
sudo systemctl restart sensevoice
sleep 5
curl -sf http://127.0.0.1:8100/health
```

## Fix: WebSocket not reaching gateway through nginx

```bash
# Check nginx config has WebSocket upgrade headers
grep -A5 "location /ws" /etc/nginx/sites-enabled/zholy.conf

# Should show:
# proxy_http_version 1.1;
# proxy_set_header Upgrade $http_upgrade;
# proxy_set_header Connection "upgrade";

# Test nginx config
sudo nginx -t

# Reload
sudo nginx -s reload
```

## Fix: OpenAI TTS errors

```bash
# Check gateway logs for OpenAI errors
docker logs zholy-gateway-1 --tail 100 | grep -i "openai\|tts\|error"

# If OpenAI is down, check status.openai.com
# Temporary fix: kill voice until OpenAI recovers
echo 'KILL_VOICE=true' >> /opt/zholy/.env.local
sudo systemctl restart zholy
```

## Fix: Ollama LLM OOM / down

```bash
docker stats ollama --no-stream
docker restart ollama
```

## Re-enable voice after fixing

```bash
# Remove the kill switch
sed -i '/KILL_VOICE=true/d' /opt/zholy/.env.local
sudo systemctl restart zholy

# Test
curl -sf https://zholy.ai/api/health
```
