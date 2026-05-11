import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/signin", "/signup", "/forgot-password", "/reset-password",
                      "/verify-email", "/accept-invite", "/demo", "/changelog",
                      "/api/auth", "/_next", "/favicon", "/icons", "/images"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check session for protected /app routes
  if (pathname.startsWith("/app")) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
