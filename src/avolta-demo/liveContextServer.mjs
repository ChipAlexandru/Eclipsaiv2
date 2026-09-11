import { unstable_cache } from "next/cache";
import {
  CHECKIN_SOURCE_URL, FLIGHTS_SOURCE_URL, LIVE_REFRESH_SECONDS, PASSPORT_SOURCE_URL,
  SECURITY_SOURCE_URL, freshnessStatus, nextZurichMidnight, normalizeFlights, normalizeQueues, zurichServiceDate,
} from "./liveContext.mjs";

async function getJson(url) {
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000), headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

const readTodaySnapshot = unstable_cache(async (serviceDate) => {
  const fetchedAt = new Date();
  const expiresAt = nextZurichMidnight(fetchedAt);
  const [flightsResult, securityResult, checkinResult, passportResult] = await Promise.allSettled([
    getJson(FLIGHTS_SOURCE_URL), getJson(SECURITY_SOURCE_URL), getJson(CHECKIN_SOURCE_URL), getJson(PASSPORT_SOURCE_URL),
  ]);
  const flights = flightsResult.status === "fulfilled" ? normalizeFlights(flightsResult.value, { fetchedAt, serviceDate }).map((flight) => ({
    ...flight, sourceUrl: FLIGHTS_SOURCE_URL, observedAt: null, fetchedAt: fetchedAt.toISOString(), expiresAt: expiresAt.toISOString(), status: "live",
  })) : [];
  const queues = normalizeQueues({
    security: securityResult.status === "fulfilled" ? securityResult.value : null,
    checkin: checkinResult.status === "fulfilled" ? checkinResult.value : null,
    passport: passportResult.status === "fulfilled" ? passportResult.value : null,
  }, { fetchedAt, expiresAt });
  return {
    serviceDate,
    fetchedAt: fetchedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    flights,
    queues,
    failures: [
      flightsResult.status === "rejected" ? "flights" : null,
      securityResult.status === "rejected" ? "security" : null,
      checkinResult.status === "rejected" ? "check-in" : null,
      passportResult.status === "rejected" ? "passport" : null,
    ].filter(Boolean),
  };
}, ["avolta-zrh-today-context-v1"], { revalidate: LIVE_REFRESH_SECONDS });

export async function getTodayJourneyContext(now = new Date()) {
  const snapshot = await readTodaySnapshot(zurichServiceDate(now));
  const sourceStatus = freshnessStatus(snapshot.fetchedAt, now);
  return {
    ...snapshot,
    sourceStatus,
    flights: snapshot.flights.map((flight) => ({ ...flight, status: sourceStatus })),
    queues: Object.fromEntries(Object.entries(snapshot.queues).map(([key, item]) => [key, { ...item, status: item.status === "unavailable" ? "unavailable" : sourceStatus }])),
    sources: {
      flights: FLIGHTS_SOURCE_URL,
      security: SECURITY_SOURCE_URL,
      checkin: CHECKIN_SOURCE_URL,
      passport: PASSPORT_SOURCE_URL,
      access: "Public airport JSON; no account, key or paid plan required when verified on 2026-09-11.",
      refreshSeconds: LIVE_REFRESH_SECONDS,
    },
  };
}
