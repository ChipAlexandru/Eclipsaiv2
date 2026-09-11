import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasAccess } from "../../../../src/avolta-demo/auth.mjs";
import { matchFlights } from "../../../../src/avolta-demo/liveContext.mjs";
import { getTodayJourneyContext } from "../../../../src/avolta-demo/liveContextServer.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function POST(request) {
  if (!hasAccess(await cookies())) return json({ error: "Passcode access is required." }, { status: 401 });
  try {
    const { query = "" } = await request.json().catch(() => ({}));
    const context = await getTodayJourneyContext();
    const flightSearch = query ? matchFlights(context.flights, String(query).slice(0, 80)) : null;
    return json({
      serviceDate: context.serviceDate,
      fetchedAt: context.fetchedAt,
      expiresAt: context.expiresAt,
      sourceStatus: context.sourceStatus,
      queues: context.queues,
      failures: context.failures,
      sources: context.sources,
      departureCount: context.flights.length,
      flightSearch,
    });
  } catch (error) {
    console.error("Avolta journey context retrieval failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return json({ error: "Live airport context is temporarily unavailable; shopping remains available." }, { status: 502 });
  }
}
