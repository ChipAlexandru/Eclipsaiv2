import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { hasAccess } from "../../../../src/avolta-demo/auth.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_CLIENT_SECRETS_URL = "https://api.openai.com/v1/realtime/client_secrets";
const WINDOW_MS = 15 * 60 * 1000;
const MAX_STARTS = 5;
const attempts = new Map();

function noStoreJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function allowStart(key) {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_STARTS) return false;
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 500) {
    for (const [candidate, values] of attempts) {
      if (!values.some((time) => now - time < WINDOW_MS)) attempts.delete(candidate);
    }
  }
  return true;
}

export async function POST() {
  const cookieStore = await cookies();
  if (!hasAccess(cookieStore)) return noStoreJson({ error: "Passcode access is required." }, { status: 401 });

  const requestHeaders = await headers();
  const clientKey = `${cookieStore.get("avolta_demo_access")?.value}:${requestHeaders.get("x-forwarded-for") || "local"}`;
  if (!allowStart(clientKey)) return noStoreJson({ error: "Voice session limit reached. Try again later." }, { status: 429 });

  const apiKey = process.env.AVOLTA_OPENAI_API_KEY;
  const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";
  if (!apiKey) return noStoreJson({ error: "Voice service is not configured for this deployment." }, { status: 503 });

  try {
    const upstream = await fetch(OPENAI_CLIENT_SECRETS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ session: { type: "realtime", model, audio: { output: { voice: "marin" } } } }),
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => null);
    const value = payload?.value || payload?.client_secret?.value;
    if (!upstream.ok || !value) {
      console.error("Avolta realtime client secret request failed", { status: upstream.status, requestId: upstream.headers.get("x-request-id") });
      return noStoreJson({ error: "Voice service is temporarily unavailable." }, { status: upstream.status === 429 ? 429 : 502 });
    }
    return noStoreJson({ value, model: payload?.session?.model || model, expiresAt: payload?.expires_at || payload?.expiresAt || null });
  } catch (error) {
    console.error("Avolta realtime client secret request could not be completed", { message: error instanceof Error ? error.message : "Unknown error" });
    return noStoreJson({ error: "Voice service is temporarily unavailable." }, { status: 502 });
  }
}
