# RB-007 — High CPU / Server Slow

**Symptom:** Pages load slowly, voice calls lag, `top` shows high CPU, p99 latency spike.

---

## Diagnose

```bash
ssh ubuntu@<SERVER_IP>

# What's using CPU?
top -b -n 1 | head -20

# Container breakdown
docker stats --no-stream

# App-level: slow routes?
journalctl -u zholy -n 100 --no-pager | grep '"level":"warn"'

# Load average
cat /proc/loadavg
# Format: 1min 5min 15min
# On 4 vCPU server, concerning if > 4.0
```

## Fix: Ollama consuming CPU (LLM inference)

Ollama runs inference on CPU when no GPU available. One request = 100%+ CPU for the duration.

```bash
# See Ollama load
docker stats ollama --no-stream

# If Ollama is causing degradation, limit concurrent AI jobs
echo 'AI_MAX_CONCURRENT_GLOBAL=2' >> /opt/zholy/.env.local
sudo systemctl restart zholy

# If severe, disable AI entirely
echo 'KILL_AI=true' >> /opt/zholy/.env.local
sudo systemctl restart zholy
```

## Fix: Runaway Node.js process

```bash
# Kill stuck processes (systemd will restart)
sudo systemctl restart zholy

# If Node keeps pegging CPU, check for:
# - infinite loop in route handler
# - JSON parsing of huge body
# - Unbounded regex
journalctl -u zholy -f
```

## Fix: Memory pressure causing swap

```bash
free -h
# If available < 1 GB, system is in trouble

# Kill biggest non-essential container first
docker stats --no-stream | sort -k4 -rh | head -5

# Restart Ollama (releases loaded model from RAM)
docker restart ollama
```

## Engage Busy Mode (sustained high load)

```bash
# Busy mode: halve AI concurrency, free users get cheaper model
echo 'KILL_PREMIUM_MODEL=true' >> /opt/zholy/.env.local
echo 'AI_MAX_CONCURRENT_GLOBAL=10' >> /opt/zholy/.env.local
echo 'AI_MAX_TOKENS_PER_REQUEST=2048' >> /opt/zholy/.env.local
sudo systemctl restart zholy
```

See `docs/degradation-modes.md` for full Busy/Viral/Survival mode procedures.

## Recovery: Remove limits after load drops

```bash
sed -i '/KILL_PREMIUM_MODEL=true/d' /opt/zholy/.env.local
sed -i '/AI_MAX_CONCURRENT_GLOBAL/d' /opt/zholy/.env.local
sed -i '/AI_MAX_TOKENS_PER_REQUEST/d' /opt/zholy/.env.local
sudo systemctl restart zholy
```
