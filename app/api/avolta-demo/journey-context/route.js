import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import flightDay from "../../../../src/avolta-demo/flight-day.fixture.json";
import { hasAccess } from "../../../../src/avolta-demo/auth.mjs";
import { illustrativeFlights, matchFlights, normalizeFixtureFlights, zurichServiceDate } from "../../../../src/avolta-demo/flightReplay.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const capturedFlights = normalizeFixtureFlights(flightDay);

function json(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function POST(request) {
  if (!hasAccess(await cookies())) return json({ error: "Passcode access is required." }, { status: 401 });
  try {
    const { query = "", demoNow = "" } = await request.json().catch(() => ({}));
    const parsedDemoNow = demoNow && !Number.isNaN(new Date(demoNow).getTime()) ? new Date(demoNow) : new Date("2026-09-12T12:00:00Z");
    const context = {
      fixtureVersion: flightDay.fixtureVersion,
      serviceDate: flightDay.provenance.serviceDate,
      capturedAt: flightDay.provenance.capturedAt,
      timeZone: flightDay.provenance.timeZone,
      sourceStatus: "captured_replay",
      scheduleEnded: zurichServiceDate(parsedDemoNow) !== flightDay.provenance.serviceDate,
      sources: {
        flights: flightDay.provenance.sourceUrl,
        runtimeNetwork: false,
        explanation: "One immutable Zürich Airport service-day capture replayed with a per-tab demo clock. No live airport, queue or traffic feed is used.",
      },
      departureCount: capturedFlights.length,
      illustrativeFlights: illustrativeFlights(capturedFlights, parsedDemoNow, 4),
      replayScenario: flightDay.replayScenario,
      flights: capturedFlights,
    };
    const flightSearch = query ? matchFlights(context.flights, String(query).slice(0, 80)) : null;
    return json({
      fixtureVersion: context.fixtureVersion,
      serviceDate: context.serviceDate,
      capturedAt: context.capturedAt,
      timeZone: context.timeZone,
      sourceStatus: context.sourceStatus,
      scheduleEnded: context.scheduleEnded,
      sources: context.sources,
      departureCount: context.departureCount,
      illustrativeFlights: context.illustrativeFlights,
      replayScenario: context.replayScenario,
      flightSearch,
    });
  } catch (error) {
    console.error("Avolta journey context retrieval failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return json({ error: "Flight information is temporarily unavailable; shopping remains available." }, { status: 502 });
  }
}
