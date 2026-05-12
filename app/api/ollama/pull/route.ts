import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";

const OLLAMA = process.env.OLLAMA_HOST || "http://localhost:11434";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { model } = await req.json().catch(() => ({}));
  if (!model) return NextResponse.json({ error: "Missing model" }, { status: 400 });

  const res = await fetch(`${OLLAMA}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: model, stream: false }),
  }).catch(() => null);

  if (!res) return NextResponse.json({ error: "Ollama unreachable" }, { status: 503 });
  if (!res.ok) return NextResponse.json({ error: "Pull failed" }, { status: res.status });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await fetch(`${OLLAMA}/api/tags`).catch(() => null);
  if (!res?.ok) return NextResponse.json({ models: [] });
  const data = await res.json();
  return NextResponse.json({ models: (data.models || []).map((m: { name: string }) => m.name) });
}
