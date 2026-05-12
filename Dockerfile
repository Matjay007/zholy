# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app
# openssl is required by Prisma client generation
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
# Generate Prisma client before building (requires openssl)
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 2: runtime (standalone output — no node_modules copy needed) ────────
FROM node:22-slim AS runner

WORKDIR /app
# openssl required by Prisma at runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Standalone server.js + its bundled deps
COPY --from=builder /app/.next/standalone ./
# Static assets (CSS, JS chunks — not bundled into standalone)
COPY --from=builder /app/.next/static ./.next/static
# Public assets
COPY --from=builder /app/public ./public

CMD ["node", "server.js"]
