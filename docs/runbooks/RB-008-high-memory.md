# RB-008 — High Memory / OOM

**Symptom:** Services dying unexpectedly, `dmesg` shows OOM kills, `free -h` shows < 500 MB available.

---

## Diagnose

```bash
ssh ubuntu@<SERVER_IP>

# Current memory state
free -h

# Who was killed?
dmesg | grep -i "oom\|killed" | tail -20

# Container memory usage
docker stats --no-stream

# App memory
ps -o pid,rss,comm ax | sort -k2 -rn | head -10
```

## Memory budget (16 GB server)

| Service | Expected | Max |
|---------|---------|-----|
| OS + kernel | ~500 MB | — |
| PostgreSQL | ~200–500 MB | ~1 GB |
| Next.js (zholy) | ~200–400 MB | ~1 GB |
| Gateway | ~50–100 MB | ~500 MB |
| SenseVoice | ~500 MB–1.5 GB | ~2 GB |
| Kokoro TTS | ~200–500 MB | ~1 GB |
| Ollama (model loaded) | ~4–8 GB | **No limit set — RISK** |

**Ollama has no Docker memory limit configured. This is the primary OOM risk.**

## Fix: Ollama consumed all memory

```bash
# Check Ollama memory
docker stats ollama --no-stream

# Restart Ollama (frees loaded model — will reload on next request, ~30s delay)
docker restart ollama

# If this keeps happening, add memory limit to Ollama in docker-compose:
# deploy:
#   resources:
#     limits:
#       memory: 10g
```

## Fix: Node.js memory leak (app growing over time)

```bash
# Check current RSS
ps -o pid,rss,comm -p $(pgrep -f "node.*server.js")

# If > 800 MB, restart is safe (stateless app)
sudo systemctl restart zholy
```

## Fix: OOM killed PostgreSQL

```bash
# Check if postgres is down
docker ps | grep postgres

# Restart
docker start zholy-postgres-1

# Check for corruption (look for "invalid page" in logs)
docker logs zholy-postgres-1 --tail 30
```

## Prevent: engage Viral mode (< 2 GB free)

```bash
echo 'KILL_VOICE=true' >> /opt/zholy/.env.local
echo 'KILL_BACKGROUND_AGENTS=true' >> /opt/zholy/.env.local
sudo systemctl restart zholy
```

Voice calls are the biggest per-request memory spike (STT model load + TTS generation).

## Long-term fix

Add resource limits to all Docker containers. Edit the Docker Compose file for the gateway/infra stack and add `deploy.resources.limits.memory` to each service. This prevents any single service from OOM-killing the entire host.
