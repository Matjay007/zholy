import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface SessionUser {
  sub:   string;
  email: string;
  name:  string;
}

export async function requireSession(): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;
    return {
      sub:   session.user.id,
      email: session.user.email,
      name:  session.user.name ?? session.user.email,
    };
  } catch {
    return null;
  }
}
