/**
 * In-process rate limiter using a sliding window + Map.
 * Works on a single-instance deployment. If multi-instance is added later,
 * replace with @upstash/ratelimit backed by Redis.
 *
 * Usage:
 *   const ok = await rateLimit("auth", ip, 10, 60_000); // 10 req / 60s
 *   if (!ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Prune stale entries every 5 minutes to avoid memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, w] of store) {
    if (w.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000).unref();

/**
 * Returns true if the request is within the rate limit, false if it should be blocked.
 * @param bucket  Bucket name (e.g. "auth", "ai", "voice")
 * @param id      User IP or user ID
 * @param limit   Max requests per window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  bucket: string,
  id: string,
  limit: number,
  windowMs: number,
): boolean {
  const key = `${bucket}:${id}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count += 1;
  return entry.count <= limit;
}

/** Extract the real IP from an incoming request, respecting TRUST_PROXY. */
export function getIp(req: Request): string {
  if (process.env.TRUST_PROXY === "1") {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    const real = req.headers.get("x-real-ip");
    if (real) return real.trim();
  }
  return "unknown";
}
