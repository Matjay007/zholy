import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getOrCreateTenant } from "@/lib/tenants";
import { checkAIBudget, recordAIRequest } from "@/lib/ai-budget";

const PREVIEW_TEXT = "Hey, I'm your voice assistant. Ask me anything and I'll help you out.";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getOrCreateTenant(session.sub, session.email, session.name);
  const budget = await checkAIBudget(tenant.id, tenant.plan);
  if (!budget.allowed) {
    return NextResponse.json(
      { error: "Daily AI limit reached", used: budget.used, limit: budget.limit },
      { status: 429 },
    );
  }

  const { voice_id, provider } = await req.json().catch(() => ({}));
  if (!voice_id) return NextResponse.json({ error: "Missing voice_id" }, { status: 400 });

  // ── Kokoro (self-hosted) ──────────────────────────────────────────────────
  if (provider === "kokoro") {
    const kokoro = process.env.KOKORO_URL || "http://localhost:8086";
    const res = await fetch(`${kokoro}/voice/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: PREVIEW_TEXT, voice: voice_id, speed: 1.0 }),
    }).catch(() => null);
    if (res?.ok) {
      const buf = await res.arrayBuffer();
      return new NextResponse(buf, { headers: { "Content-Type": "audio/wav" } });
    }
    return NextResponse.json({ error: "Kokoro TTS unavailable" }, { status: 503 });
  }

  // ── OpenAI TTS (cloud) ────────────────────────────────────────────────────
  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_TTS_API_KEY || process.env.OPENAI_COMPAT_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OpenAI key not configured" }, { status: 503 });
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: "tts-1", voice: voice_id, input: PREVIEW_TEXT }),
    }).catch(() => null);
    if (res?.ok) {
      const buf = await res.arrayBuffer();
      await recordAIRequest(tenant.id);
      return new NextResponse(buf, { headers: { "Content-Type": "audio/mpeg" } });
    }
    return NextResponse.json({ error: "OpenAI TTS unavailable" }, { status: 503 });
  }

  // ── Deepgram (cloud) ──────────────────────────────────────────────────────
  if (provider === "deepgram") {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Deepgram key not configured" }, { status: 503 });
    const res = await fetch(`https://api.deepgram.com/v1/speak?model=${voice_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({ text: PREVIEW_TEXT }),
    }).catch(() => null);
    if (res?.ok) {
      const buf = await res.arrayBuffer();
      return new NextResponse(buf, { headers: { "Content-Type": "audio/mpeg" } });
    }
    return NextResponse.json({ error: "Deepgram TTS unavailable" }, { status: 503 });
  }

  return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
}
