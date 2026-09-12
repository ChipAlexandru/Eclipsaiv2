import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const serviceDate = process.argv[4] || "2026-09-12";

if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/build-avolta-flight-fixture.mjs <raw.json> <fixture.json> [service-date]");
}

const rows = JSON.parse(await readFile(path.resolve(inputPath), "utf8"));
const departures = rows
  .filter((row) => row.flightType === "D" && String(row.SDT || row.STD || "").slice(0, 10) === serviceDate)
  .sort((a, b) => String(a.STD || "").localeCompare(String(b.STD || "")))
  .map((row) => ({
    id: String(row.id),
    captured: {
      flightType: row.flightType,
      FLC: row.FLC ?? null,
      FLN: row.FLN ?? null,
      codeShare: row.codeShare ?? null,
      PDS: row.PDS ?? null,
      airportName: row.airportName ?? null,
      cityEn: row.cityEn ?? null,
      cityDe: row.cityDe ?? null,
      airline: row.airline ?? null,
      STD: row.STD ?? null,
      ETD: row.ETD ?? null,
      ATD: row.ATD ?? null,
      EBT: row.EBT ?? null,
      GAT: row.GAT ?? null,
      statusCode: row.statusCode ?? null,
      statusTextEn: row.statusTextEn ?? null,
      isSchengen: typeof row.isSchengen === "boolean" ? row.isSchengen : null,
    },
  }));

const count = (field) => departures.filter((flight) => flight.captured[field] != null).length;
const fixture = {
  fixtureVersion: `zrh-departures-${serviceDate}-v1`,
  provenance: {
    sourceUrl: "https://flightdata.flughafen-zuerich.ch/flights",
    serviceDate,
    capturedAt: new Date().toISOString(),
    timeZone: "Europe/Zurich",
    rawResponseRows: rows.length,
    departureRows: departures.length,
    sourceSchema: {
      FLC: "operating airline code",
      FLN: "operating flight number",
      codeShare: "codeshare flight numbers when supplied",
      PDS: "destination airport code",
      cityEn: "destination city",
      STD: "scheduled departure timestamp",
      ETD: "estimated departure timestamp when supplied",
      ATD: "actual departure timestamp when supplied",
      EBT: "boarding timestamp when supplied",
      GAT: "gate when supplied",
      statusCode: "source status code observed at capture",
      statusTextEn: "source status text observed at capture",
    },
    fieldCoverage: {
      scheduledDeparture: count("STD"),
      estimatedDeparture: count("ETD"),
      actualDeparture: count("ATD"),
      boardingTime: count("EBT"),
      gate: count("GAT"),
      codeshare: count("codeShare"),
    },
    absentContext: [
      "No historical gate-change event stream was supplied.",
      "No historical status-transition event stream was supplied.",
      "Security, check-in, passport and road observations are not replayed.",
    ],
  },
  replayScenario: {
    statusTimelineBasis: "deterministic simulation separate from captured source status",
    fulfillmentBasis: "simulated local demo only; no store or courier integration",
    gateDeliverySupportedWhen: "The confirmed flight has a captured gate and the traveler says they are at that gate.",
    deliveryDurationsMinutes: { ready: 2, onTheWay: 4, arriving: 6, delivered: 8 },
    collectionDurationsMinutes: { readyForPickup: 4 },
  },
  flights: departures,
};

await writeFile(path.resolve(outputPath), `${JSON.stringify(fixture, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, fixtureVersion: fixture.fixtureVersion, departures: departures.length, fieldCoverage: fixture.provenance.fieldCoverage }, null, 2));
