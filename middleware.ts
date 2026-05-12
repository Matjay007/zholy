import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "@/lib/auth";

/* ── Kill switches (read from env at request time) ── */
const MAINTENANCE   = process.env.KILL_MAINTENANCE === "true";
const WAITLIST_ONLY = process.env.KILL_SIGNUPS === "true";
const AI_DISABLED   = process.env.KILL_AI === "true";
const VOICE_DISABLED = process.env.KILL_VOICE === "true";

/* ── Rate limit config ── */
interface Window { count: number; resetAt: number }
const _store = new Map<string, Window>();

function rateLimit(bucket: string, id: string, limit: number, windowMs: number): boolean {
  const key = `${bucket}:${id}`;
  const now = Date.now();
  const entry = _store.get(key);
  if (!entry || entry.resetAt <= now) {
    _store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

function getIp(req: NextRequest): string {
  if (process.env.TRUST_PROXY === "1") {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    const real = req.headers.get("x-real-ip");
    if (real) return real.trim();
  }
  return "127.0.0.1";
}

function tooManyRequests(reason: string): NextResponse {
  return NextResponse.json(
    { error: "Too many requests", reason },
    { status: 429, headers: { "Retry-After": "60" } },
  );
}

const PUBLIC_PATHS = [
  "/", "/signin", "/signup", "/forgot-password", "/reset-password",
  "/verify-email", "/accept-invite", "/demo", "/changelog",
  "/api/auth", "/_next", "/favicon", "/icons", "/images", "/api/health",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIp(req);
  const requestId = Math.random().toString(36).slice(2, 10);

  /* ── Maintenance mode ── */
  if (MAINTENANCE && !pathname.startsWith("/api/health")) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503, headers: { "Retry-After": "300" } },
      );
    }
    return new NextResponse(
      `<!doctype html><html><body style="font-family:monospace;padding:2rem">
        <h1>Maintenance</h1><p>ZHOLY is undergoing maintenance. Back shortly.</p>
       </body></html>`,
      { status: 503, headers: { "Content-Type": "text/html", "Retry-After": "300" } },
    );
  }

  /* ── Rate limiting ── */

  // Auth routes: 10 req / 60s per IP
  if (pathname.startsWith("/api/auth/") && pathname !== "/api/auth/get-session") {
    if (!rateLimit("auth", ip, 10, 60_000)) return tooManyRequests("auth");
  }

  // Signup page: 5 req / 60s per IP
  if (pathname === "/signup") {
    if (!rateLimit("signup", ip, 5, 60_000)) return tooManyRequests("signup");
  }

  // TTS preview: 10 req / 60s per IP (calls OpenAI)
  if (pathname.startsWith("/api/tts-preview")) {
    if (!rateLimit("tts", ip, 10, 60_000)) return tooManyRequests("tts");
  }

  // Ollama pull: 3 req / 300s per IP (expensive)
  if (pathname.startsWith("/api/ollama/pull")) {
    if (!rateLimit("ollama", ip, 3, 300_000)) return tooManyRequests("ollama");
  }

  // Knowledge / agents / general API: 120 req / 60s per IP
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    if (!rateLimit("api", ip, 120, 60_000)) return tooManyRequests("api");
  }

  /* ── Kill switches for API routes ── */
  if (AI_DISABLED && (pathname.startsWith("/api/tts") || pathname.startsWith("/api/ollama"))) {
    return NextResponse.json({ error: "AI services temporarily disabled" }, { status: 503 });
  }
  if (VOICE_DISABLED && pathname.startsWith("/api/voice")) {
    return NextResponse.json({ error: "Voice services temporarily disabled" }, { status: 503 });
  }

  /* ── Waitlist mode — block new signup submissions ── */
  if (WAITLIST_ONLY && pathname === "/api/auth/sign-up/email") {
    return NextResponse.json(
      { error: "Signups are paused. Join the waitlist at zholy.ai." },
      { status: 503 },
    );
  }

  /* ── Session check for /app routes ── */
  if (!PUBLIC_PATHS.some(p => pathname.startsWith(p)) && pathname.startsWith("/app")) {
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: req.nextUrl.origin,
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });

    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
