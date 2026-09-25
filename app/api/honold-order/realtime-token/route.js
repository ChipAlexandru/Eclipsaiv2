import { NextResponse } from "next/server";

// Short-lived voice token for /honold-order. The OpenAI key stays on the server.
// Env (Vercel → Project → Settings → Environment Variables):
//   HONOLD_ORDER_OPENAI_API_KEY   dedicated key for this demo; Honold2 is the production alias
//   HONOLD_ORDER_REALTIME_MODEL   optional — default gpt-realtime-2.1
//   HONOLD_ORDER_REASONING        optional — minimal (default: fastest, no filler sentences) | low | medium
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLIENT_SECRETS_URL = "https://api.openai.com/v1/realtime/client_secrets";
const REASONING = new Set(["minimal", "low", "medium", "high"]);

function noStore(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function POST() {
  const apiKey = process.env.HONOLD_ORDER_OPENAI_API_KEY || process.env.Honold2;
  const model = process.env.HONOLD_ORDER_REALTIME_MODEL || "gpt-realtime-2.1";
  const reasoning = REASONING.has(process.env.HONOLD_ORDER_REASONING) ? process.env.HONOLD_ORDER_REASONING : "minimal";
  if (!apiKey) return noStore({ error: "Voice is not configured for this deployment." }, { status: 503 });

  try {
    const upstream = await fetch(CLIENT_SECRETS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        session: { type: "realtime", model, audio: { output: { voice: "marin" } } },
      }),
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => null);
    const value = payload?.value || payload?.client_secret?.value;
    if (!upstream.ok || !value) {
      console.error("honold-order: client secret failed", { status: upstream.status, requestId: upstream.headers.get("x-request-id"), error: payload?.error?.message });
      return noStore({ error: "Voice is temporarily unavailable." }, { status: upstream.status === 429 ? 429 : 502 });
    }
    return noStore({ value, model: payload?.session?.model || model, reasoning, expiresAt: payload?.expires_at || null });
  } catch (error) {
    console.error("honold-order: client secret request error", { message: error instanceof Error ? error.message : "unknown" });
    return noStore({ error: "Voice is temporarily unavailable." }, { status: 502 });
  }
}
