import { createRequire } from "node:module";
import { illustrativeFlights, normalizeFixtureFlights, selectAssumedItinerary, upcomingFlights, zurichServiceDate } from "./flightReplay.mjs";

const require = createRequire(import.meta.url);
const fixture = require("./flight-day.fixture.json");
const flights = normalizeFixtureFlights(fixture);

export function getReplayJourneyContext(demoNow = new Date()) {
  return {
    fixtureVersion: fixture.fixtureVersion,
    serviceDate: fixture.provenance.serviceDate,
    capturedAt: fixture.provenance.capturedAt,
    timeZone: fixture.provenance.timeZone,
    sourceStatus: "captured_replay",
    scheduleEnded: zurichServiceDate(demoNow) !== fixture.provenance.serviceDate,
    departureCount: upcomingFlights(flights, demoNow).length,
    illustrativeFlights: illustrativeFlights(flights, demoNow, 4),
    assumedFlight: selectAssumedItinerary(flights, demoNow),
    flights,
    replayScenario: fixture.replayScenario,
    provenance: fixture.provenance,
    sources: {
      flights: fixture.provenance.sourceUrl,
      runtimeNetwork: false,
      explanation: "One immutable Zürich Airport service-day capture replayed with a per-tab demo clock. No live airport, queue or traffic feed is used.",
    },
  };
}
