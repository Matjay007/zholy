# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: runtime (standalone output — no node_modules copy needed) ────────
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
# PORT env var controls the listen port (default 3000 in standalone)
EXPOSE 3000

# Standalone server.js + its bundled deps
COPY --from=builder /app/.next/standalone ./
# Static assets (CSS, JS chunks — not bundled into standalone)
COPY --from=builder /app/.next/static ./.next/static
# Public assets
COPY --from=builder /app/public ./public

CMD ["node", "server.js"]
