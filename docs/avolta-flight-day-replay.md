# Avolta Zürich flight-day replay

The deployed demo uses one immutable public Zürich Airport departure capture. It does not download flights, queues or traffic at runtime.

## Fixture

- Version: `zrh-departures-2026-09-12-v1`
- Service day: 12 September 2026
- Time zone: `Europe/Zurich`
- Source: `https://flightdata.flughafen-zuerich.ch/flights`
- Captured: 12 September 2026 at 17:37:13 UTC
- Raw rows received: 4,198
- Zürich departure rows retained: 393
- Coverage: 393 scheduled departures, 206 estimated departures, 342 actual departures, 328 boarding times, 328 gates and 225 codeshare records

The versioned fixture is `src/avolta-demo/flight-day.fixture.json`. `scripts/build-avolta-flight-fixture.mjs` records the one-time transformation used to select that service day. Captured fields remain under each row's `captured` object, separate from any deterministic `simulationEvents` used by the demo.

## Replay policy

A new browser tab maps the current Zürich time of day onto the captured service date. A single stored anchor then advances with real elapsed time and survives same-tab refreshes and voice reconnections. The same derived timestamp drives the screen, voice tools, journey assessment and simulated order progress. Crossing midnight does not rewind the replay or an order; the screen says that the captured departure schedule has ended.

Captured end-of-day status and actual-departure values are provenance only. They are not treated as earlier historical events. Missing gates and boarding times stay unknown; scheduled departure is never substituted for boarding time. Security, check-in, passport and road observations are absent by design. Journey buffers and all collection/delivery states are labeled simulation.

Production reads only the saved fixture through `liveContextServer.mjs`. The journey-context route has no outbound airport fetch, scheduled refresh, database or shared shopper state.
