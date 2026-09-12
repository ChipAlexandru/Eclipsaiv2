export const ZURICH_TIME_ZONE = "Europe/Zurich";
export const JOURNEY_STAGES = ["unknown", "on_the_way", "at_airport", "past_security", "at_gate"];

const zurichFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZURICH_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function partsFor(date) {
  return Object.fromEntries(zurichFormatter.formatToParts(new Date(date))
    .filter(({ type }) => type !== "literal")
    .map(({ type, value }) => [type, Number(value)]));
}

export function zonedDateTimeToUtc(parts) {
  let guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour || 0, parts.minute || 0, parts.second || 0);
  for (let iteration = 0; iteration < 4; iteration += 1) {
    const actual = partsFor(new Date(guess));
    const represented = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    const wanted = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour || 0, parts.minute || 0, parts.second || 0);
    guess += wanted - represented;
  }
  return new Date(guess);
}

export function zurichServiceDate(date = new Date()) {
  const { year, month, day } = partsFor(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function nextZurichMidnight(date = new Date()) {
  const { year, month, day } = partsFor(date);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return zonedDateTimeToUtc({ year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() });
}

function fixtureDateParts(serviceDate) {
  const [year, month, day] = String(serviceDate).split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) throw new Error("Invalid fixture service date.");
  return { year, month, day };
}

function overrideParts(value) {
  const match = String(value || "").match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const [, hour, minute, second = "0"] = match;
  if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) return null;
  return { hour: Number(hour), minute: Number(minute), second: Number(second) };
}

export function mapZurichTimeOfDayToFixture(realNow, serviceDate, explicitTime = null) {
  const base = partsFor(new Date(realNow));
  const override = overrideParts(explicitTime);
  return zonedDateTimeToUtc({ ...fixtureDateParts(serviceDate), hour: override?.hour ?? base.hour, minute: override?.minute ?? base.minute, second: override?.second ?? base.second });
}

export function createReplayAnchor({ fixtureVersion, serviceDate, realNow = new Date(), storedAnchor = null, explicitTime = null }) {
  const currentRealMs = new Date(realNow).getTime();
  if (!explicitTime && storedAnchor?.fixtureVersion === fixtureVersion
    && Number.isFinite(storedAnchor.realStartedAtMs) && Number.isFinite(storedAnchor.fixtureStartedAtMs)
    && currentRealMs >= storedAnchor.realStartedAtMs) return storedAnchor;
  return {
    fixtureVersion,
    serviceDate,
    realStartedAtMs: currentRealMs,
    fixtureStartedAtMs: mapZurichTimeOfDayToFixture(realNow, serviceDate, explicitTime).getTime(),
    explicitTime: explicitTime || null,
  };
}

export function replayNow(anchor, realNow = new Date()) {
  const elapsed = Math.max(0, new Date(realNow).getTime() - anchor.realStartedAtMs);
  return new Date(anchor.fixtureStartedAtMs + elapsed);
}

export function replayClockState(anchor, realNow = new Date()) {
  const now = replayNow(anchor, realNow);
  const replayDate = zurichServiceDate(now);
  return { now: now.toISOString(), replayDate, scheduleEnded: replayDate !== anchor.serviceDate };
}

export function shouldRebasePassiveReplay(anchor, realNow = new Date(), persistedState = {}) {
  if (!anchor || persistedState?.travel?.selectedFlight || persistedState?.order) return false;
  return replayClockState(anchor, realNow).scheduleEnded;
}

function parseCodeshares(value) {
  if (Array.isArray(value)) return value.flatMap(parseCodeshares);
  return String(value || "").split(/[,;/|]+/).map((item) => item.trim()).filter(Boolean);
}

function isoOrNull(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function normalizeFixtureFlights(fixture) {
  return (fixture?.flights || []).map(({ id, captured, simulationEvents = [] }) => ({
    id: String(id),
    originCode: "ZRH",
    origin: "Zürich",
    flightNumber: `${captured.FLC || ""}${captured.FLN || ""}`.trim() || null,
    codeshares: parseCodeshares(captured.codeShare),
    destinationCode: captured.PDS || null,
    destination: captured.cityEn || captured.airportName || null,
    airline: captured.airline || null,
    scheduledDeparture: isoOrNull(captured.STD),
    estimatedDeparture: isoOrNull(captured.ETD),
    actualDeparture: isoOrNull(captured.ATD),
    boardingTime: isoOrNull(captured.EBT),
    gate: captured.GAT || null,
    isSchengen: typeof captured.isSchengen === "boolean" ? captured.isSchengen : null,
    serviceDate: fixture.provenance.serviceDate,
    sourceBasis: "captured Zürich Airport departure row",
    capturedObservation: {
      observedAt: fixture.provenance.capturedAt,
      statusCode: captured.statusCode ?? null,
      statusText: captured.statusTextEn || null,
      actualDeparture: isoOrNull(captured.ATD),
    },
    simulationEvents,
  }));
}

function normalizeFlightNumber(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function matchFlights(flights, rawQuery) {
  const query = String(rawQuery || "").trim();
  if (!query) return { query, matches: [], ambiguous: false };
  const flightQuery = normalizeFlightNumber(query);
  const looksLikeFlight = /^[A-Z]{2,3}\s*\d{1,4}[A-Z]?$/.test(query.toUpperCase());
  const textQuery = query.toLocaleLowerCase("en");
  const matches = flights.filter((flight) => {
    const numbers = [flight.flightNumber, ...(flight.codeshares || [])].map(normalizeFlightNumber);
    if (looksLikeFlight) return numbers.includes(flightQuery);
    return String(flight.destinationCode || "").toLowerCase() === textQuery
      || String(flight.destination || "").toLocaleLowerCase("en").includes(textQuery);
  }).slice(0, 12);
  return { query, matches, ambiguous: matches.length > 1 };
}

export function illustrativeFlights(flights, demoNow, limit = 4) {
  const nowMs = new Date(demoNow).getTime();
  const complete = flights.filter((flight) => {
    if (!flight.scheduledDeparture || !flight.destination || !flight.flightNumber || !/^[A-Z]{3}$/.test(flight.destinationCode || "")) return false;
    const departureMs = new Date(flight.scheduledDeparture).getTime();
    const boardingMs = flight.boardingTime ? new Date(flight.boardingTime).getTime() : null;
    return boardingMs == null || boardingMs <= departureMs;
  });
  const future = complete.filter((flight) => new Date(flight.scheduledDeparture).getTime() >= nowMs + 20 * 60_000);
  const source = future.length >= limit ? future : complete;
  if (!source.length) return [];
  const step = Math.max(1, Math.floor(source.length / limit));
  return Array.from({ length: Math.min(limit, source.length) }, (_, index) => source[Math.min(source.length - 1, index * step)]);
}

function activeSimulationEvent(flight, demoNow) {
  const nowMs = new Date(demoNow).getTime();
  return [...(flight?.simulationEvents || [])]
    .filter((event) => event?.at && new Date(event.at).getTime() <= nowMs)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0] || null;
}

export function replayFlightStatus(flight, demoNow) {
  if (!flight) return { label: "Awaiting confirmation", basis: "demo replay" };
  const event = activeSimulationEvent(flight, demoNow);
  if (event?.type === "cancelled") return { label: "Cancelled", basis: "simulated scenario", isCancelled: true };
  const nowMs = new Date(demoNow).getTime();
  const boardingMs = flight.boardingTime ? new Date(flight.boardingTime).getTime() : null;
  const departureMs = flight.scheduledDeparture ? new Date(flight.scheduledDeparture).getTime() : null;
  if (boardingMs && nowMs >= boardingMs && (!departureMs || nowMs < departureMs)) return { label: "Boarding time reached", basis: "demo clock" };
  if (departureMs && nowMs >= departureMs) return { label: "Scheduled time passed", basis: "demo clock" };
  if (boardingMs && boardingMs - nowMs <= 25 * 60_000) return { label: "Boarding window approaching", basis: "demo clock" };
  return { label: "Scheduled", basis: "captured schedule" };
}

export function boardingCountdown(flight, demoNow) {
  if (!flight?.boardingTime) return { known: false, label: "Boarding time unavailable", seconds: null };
  const seconds = Math.max(0, Math.floor((new Date(flight.boardingTime).getTime() - new Date(demoNow).getTime()) / 1000));
  return { known: true, label: seconds === 0 ? "Boarding time reached" : `Boarding in ${formatRemaining(seconds)}`, seconds };
}

export function normalizeJourneyStage(stage) {
  const aliases = { before_security: "at_airport", airside: "past_security", near_gate: "at_gate" };
  const normalized = aliases[stage] || stage;
  return JOURNEY_STAGES.includes(normalized) ? normalized : "unknown";
}

export function journeyStageLabel(stage) {
  return {
    unknown: "Location unknown",
    on_the_way: "On the way",
    at_airport: "At airport",
    past_security: "Past security",
    at_gate: "At gate",
  }[normalizeJourneyStage(stage)];
}

export function assessReplayJourney({ stage, flight, arrivalEstimate, minutesAvailable }, demoNow) {
  const normalizedStage = normalizeJourneyStage(stage);
  const countdown = boardingCountdown(flight, demoNow);
  const explicitMinutes = minutesAvailable === "" || minutesAvailable == null ? null : Number(minutesAvailable);
  const missing = [];
  if (!flight) missing.push("confirmed flight");
  if (normalizedStage === "unknown") missing.push("traveler location");
  if (!countdown.known) missing.push("boarding time");
  if (normalizedStage === "on_the_way" && !arrivalEstimate) missing.push("traveler-provided airport arrival estimate");
  let availableMinutes = countdown.known ? Math.floor(countdown.seconds / 60) : null;
  const buffers = { unknown: 35, on_the_way: 55, at_airport: 40, past_security: 20, at_gate: 8 };
  if (availableMinutes != null) availableMinutes -= buffers[normalizedStage];
  if (Number.isFinite(explicitMinutes) && explicitMinutes >= 0) availableMinutes = availableMinutes == null ? explicitMinutes : Math.min(availableMinutes, explicitMinutes);
  const status = replayFlightStatus(flight, demoNow);
  const outcome = status.isCancelled || availableMinutes == null || availableMinutes < 12 ? "prioritize_gate" : availableMinutes < 35 ? "quick_pickup" : "explore";
  return {
    outcome,
    availableShoppingMinutes: availableMinutes == null ? null : Math.max(0, availableMinutes),
    recommendation: outcome === "explore" ? "There is room for a focused browse before boarding." : outcome === "quick_pickup" ? "Keep the choice focused and use the recommended fulfillment option." : "Prioritize the flight path; do not promise the order will fit.",
    known: { stage: normalizedStage, flightNumber: flight?.flightNumber || null, gate: flight?.gate || null, arrivalEstimate: arrivalEstimate || null, arrivalEstimateBasis: arrivalEstimate ? "traveler-provided" : null },
    missing,
    clockBasis: "single session replay clock",
    estimateBasis: "simulated conservative journey buffers; no live queue or traffic data",
  };
}

export function recommendFulfillment({ stage, flight, demoNow }) {
  const location = normalizeJourneyStage(stage);
  const boarding = boardingCountdown(flight, demoNow);
  const minutes = boarding.known ? boarding.seconds / 60 : null;
  if (location === "at_gate" && flight?.gate && minutes != null && minutes >= 12) {
    return { method: "gate_delivery", destination: `Gate ${flight.gate}`, etaMinutes: 8, basis: "simulated demo scenario", reason: "You are already at your confirmed gate and there is enough time for delivery." };
  }
  if (minutes != null && minutes < 10) {
    return { method: "none", destination: null, etaMinutes: null, basis: "simulated demo scenario", reason: "The boarding window is too tight to recommend fulfillment confidently." };
  }
  return { method: "collection", destination: "Zürich Duty Free · departure shop", etaMinutes: 4, basis: "simulated demo scenario", reason: location === "on_the_way" || location === "at_airport" ? "Collection fits naturally on the way through the airport." : "Collection is the most reliable option for this journey." };
}

export function orderProgress(order, demoNow) {
  if (!order) return null;
  const elapsedSeconds = Math.max(0, Math.floor((new Date(demoNow).getTime() - new Date(order.confirmedAtDemo).getTime()) / 1000));
  const elapsedMinutes = elapsedSeconds / 60;
  if (order.fulfillment.method === "gate_delivery") {
    const steps = [
      ["Preparing", 0], ["Ready", 2], ["On the way", 4], ["Arriving", 6], ["Delivered", 8],
    ];
    const current = [...steps].reverse().find(([, at]) => elapsedMinutes >= at) || steps[0];
    const targetSeconds = Math.max(0, Math.ceil((8 - elapsedMinutes) * 60));
    return { path: steps.map(([label]) => label), state: current[0], stateIndex: steps.indexOf(current), targetLabel: targetSeconds === 0 ? "Delivered" : `Arrives in ${formatRemaining(targetSeconds)}`, targetSeconds, terminal: current[0] === "Delivered" };
  }
  const collected = order.collectedAtDemo && new Date(order.collectedAtDemo).getTime() <= new Date(demoNow).getTime();
  const ready = elapsedMinutes >= 4;
  const state = collected ? "Collected" : ready ? "Ready for pickup" : "Preparing";
  const targetSeconds = ready ? 0 : Math.max(0, Math.ceil((4 - elapsedMinutes) * 60));
  return { path: ["Preparing", "Ready for pickup", "Collected"], state, stateIndex: collected ? 2 : ready ? 1 : 0, targetLabel: collected ? "Collected" : ready ? "Ready for pickup" : `Ready in ${formatRemaining(targetSeconds)}`, targetSeconds, terminal: collected };
}

export function formatRemaining(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  if (seconds < 60) return "<1 min";
  const totalMinutes = Math.ceil(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function pairedCountdowns(flight, order, demoNow) {
  return { boarding: boardingCountdown(flight, demoNow), order: orderProgress(order, demoNow) };
}

export function nextMeaningfulOrderAnnouncement(previousState, currentState, announced = []) {
  if (!currentState || currentState === previousState || announced.includes(currentState)) return null;
  return ["Ready", "Ready for pickup", "Arriving", "Delivered"].includes(currentState) ? currentState : null;
}
