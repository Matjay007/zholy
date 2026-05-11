FROM node:22-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3009
CMD ["node_modules/.bin/next", "start", "-p", "3009", "-H", "0.0.0.0"]
