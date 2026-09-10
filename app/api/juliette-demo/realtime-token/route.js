import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_CLIENT_SECRETS_URL = "https://api.openai.com/v1/realtime/client_secrets";

function noStoreJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";

  if (!apiKey) {
    return noStoreJson(
      { error: "Voice service is not configured for this deployment." },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(OPENAI_CLIENT_SECRETS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model,
          audio: { output: { voice: "marin" } },
        },
      }),
      cache: "no-store",
    });

    const payload = await upstream.json().catch(() => null);
    const value = payload?.value || payload?.client_secret?.value;
    if (!upstream.ok || !value) {
      console.error("Realtime client secret request failed", {
        status: upstream.status,
        requestId: upstream.headers.get("x-request-id"),
      });
      return noStoreJson(
        { error: "Voice service is temporarily unavailable." },
        { status: upstream.status === 429 ? 429 : 502 },
      );
    }

    return noStoreJson({
      value,
      model: payload?.session?.model || model,
      expiresAt: payload?.expires_at || payload?.expiresAt || null,
    });
  } catch (error) {
    console.error("Realtime client secret request could not be completed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return noStoreJson(
      { error: "Voice service is temporarily unavailable." },
      { status: 502 },
    );
  }
}
