export const ZURICH_TIME_ZONE = "Europe/Zurich";
export const LIVE_REFRESH_SECONDS = 180;
export const FLIGHTS_SOURCE_URL = "https://flightdata.flughafen-zuerich.ch/flights";
export const SECURITY_SOURCE_URL = "https://waitingtimes.flughafen-zuerich.ch/WaitingTimes/Security";
export const CHECKIN_SOURCE_URL = "https://waitingtimes.flughafen-zuerich.ch/WaitingTimes/Checkin";
export const PASSPORT_SOURCE_URL = "https://waitingtimes.flughafen-zuerich.ch/WaitingTimes/pkh";

const zurichFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZURICH_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

function dateParts(date) {
  return Object.fromEntries(zurichFormatter.formatToParts(date)
    .filter(({ type }) => type !== "literal").map(({ type, value }) => [type, Number(value)]));
}

function zonedDateTimeToUtc(parts) {
  let guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour || 0, parts.minute || 0, parts.second || 0);
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const actual = dateParts(new Date(guess));
    const represented = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    const wanted = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour || 0, parts.minute || 0, parts.second || 0);
    guess += wanted - represented;
  }
  return new Date(guess);
}

export function zurichServiceDate(date = new Date()) {
  const { year, month, day } = dateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function nextZurichMidnight(date = new Date()) {
  const { year, month, day } = dateParts(date);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return zonedDateTimeToUtc({ year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() });
}

function normalizeFlightNumber(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
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

export function normalizeFlights(rows, { fetchedAt = new Date(), serviceDate = zurichServiceDate(fetchedAt) } = {}) {
  if (!Array.isArray(rows)) return [];
  return rows.filter((row) => {
    const rowDate = String(row.SDT || row.STD || "").slice(0, 10);
    return row.flightType === "D" && rowDate === serviceDate;
  }).map((row) => {
    const operating = `${row.FLC || ""}${row.FLN || ""}`.trim();
    return {
      id: String(row.id || `${operating}-${row.STD || row.SDT || ""}`),
      flightNumber: operating || null,
      codeshares: parseCodeshares(row.codeShare),
      destinationCode: row.PDS || null,
      destination: row.cityEn || row.cityDe || row.airportName || null,
      airline: row.airline || null,
      scheduledDeparture: isoOrNull(row.STD),
      estimatedDeparture: isoOrNull(row.ETD),
      actualDeparture: isoOrNull(row.ATD),
      boardingTime: isoOrNull(row.EBT),
      gate: row.GAT || null,
      statusCode: row.statusCode ?? null,
      statusText: row.statusTextEn || null,
      isCancelled: Number(row.statusCode) === 29 || /cancel/i.test(row.statusTextEn || ""),
      isSchengen: typeof row.isSchengen === "boolean" ? row.isSchengen : null,
      serviceDate,
    };
  });
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

function observation(value, sourceUrl, fetchedAt, expiresAt, status = "live") {
  return { value: value ?? null, sourceUrl, observedAt: null, fetchedAt, expiresAt, status };
}

export function normalizeQueues({ security, checkin, passport }, { fetchedAt = new Date(), expiresAt = nextZurichMidnight(fetchedAt) } = {}) {
  const fetched = new Date(fetchedAt).toISOString();
  const expiry = new Date(expiresAt).toISOString();
  return {
    security: observation(security?.maxWaitingTime ?? null, SECURITY_SOURCE_URL, fetched, expiry, security?.maxWaitingTime != null ? "live" : "unavailable"),
    checkin: observation(Array.isArray(checkin?.checkin) ? checkin.checkin : null, CHECKIN_SOURCE_URL, fetched, expiry, Array.isArray(checkin?.checkin) ? "live" : "unavailable"),
    passport: observation(Array.isArray(passport?.passportControl) ? passport.passportControl : null, PASSPORT_SOURCE_URL, fetched, expiry, Array.isArray(passport?.passportControl) ? "live" : "unavailable"),
  };
}

export function freshnessStatus(fetchedAt, now = new Date(), maxAgeSeconds = LIVE_REFRESH_SECONDS * 2) {
  if (!fetchedAt) return "unavailable";
  if (zurichServiceDate(new Date(fetchedAt)) !== zurichServiceDate(now)) return "unavailable";
  const age = new Date(now).getTime() - new Date(fetchedAt).getTime();
  return age <= maxAgeSeconds * 1000 ? "live" : "stale";
}

function maxMinutes(value) {
  if (value == null || value === "") return null;
  const numbers = String(value).match(/\d+/g)?.map(Number) || [];
  return numbers.length ? Math.max(...numbers) : null;
}

function queueForStage(stage, queues, needsCheckin, flight) {
  const observations = [];
  if ((stage === "on_the_way" || stage === "before_security") && needsCheckin) observations.push(["check-in", queues?.checkin]);
  if (stage === "on_the_way" || stage === "before_security") observations.push(["security", queues?.security]);
  if (flight?.isSchengen === false && stage !== "near_gate") observations.push(["passport control", queues?.passport]);
  let minutes = 0;
  const missing = [];
  for (const [label, item] of observations) {
    if (!item || item.status !== "live") { missing.push(label); continue; }
    if (Array.isArray(item.value)) {
      const values = item.value.flatMap((entry) => Object.values(entry)).map(maxMinutes).filter(Number.isFinite);
      if (values.length) minutes += Math.max(...values); else missing.push(label);
    } else {
      const parsed = maxMinutes(item.value);
      if (parsed == null) missing.push(label); else minutes += parsed;
    }
  }
  return { minutes, missing };
}

export function assessJourney(input, now = new Date()) {
  const stage = input?.stage || "on_the_way";
  const flight = input?.flight || null;
  const arrivalEstimate = isoOrNull(input?.arrivalEstimate);
  const explicitMinutes = input?.minutesAvailable === "" || input?.minutesAvailable == null ? Number.NaN : Number(input.minutesAvailable);
  const start = stage === "on_the_way" ? arrivalEstimate : now.toISOString();
  const target = flight?.boardingTime || flight?.scheduledDeparture || null;
  const missing = [];
  if (!flight) missing.push("today's flight");
  if (stage === "on_the_way" && !arrivalEstimate) missing.push("airport arrival estimate");
  if (!target) missing.push("boarding or scheduled departure time");
  if (flight && !flight.boardingTime) missing.push("boarding time");
  if (flight && !flight.gate) missing.push("gate");

  const queue = queueForStage(stage, input?.queues, Boolean(input?.needsCheckin), flight);
  missing.push(...queue.missing.map((label) => `${label} wait`));
  const fixedBuffers = { on_the_way: 55, before_security: 50, airside: 25, near_gate: 10 };
  let availableMinutes = null;
  if (start && target) {
    const raw = Math.floor((new Date(target).getTime() - new Date(start).getTime()) / 60000);
    availableMinutes = raw - fixedBuffers[stage] - queue.minutes;
  }
  if (Number.isFinite(explicitMinutes) && explicitMinutes >= 0) {
    availableMinutes = availableMinutes == null ? explicitMinutes : Math.min(availableMinutes, explicitMinutes);
  }

  let outcome;
  if (flight?.isCancelled) outcome = "prioritize_gate";
  else if (availableMinutes == null) outcome = stage === "near_gate" ? "prioritize_gate" : "quick_pickup";
  else if (availableMinutes >= 45) outcome = "explore";
  else if (availableMinutes >= 15) outcome = "quick_pickup";
  else outcome = "prioritize_gate";

  const messages = {
    explore: "There appears to be room to explore, using the conservative journey buffer shown here.",
    quick_pickup: "Keep discovery focused and choose for quick pickup during this journey.",
    prioritize_gate: "Prioritize the flight path and keep interesting products on the shortlist.",
  };
  return {
    outcome,
    availableShoppingMinutes: availableMinutes == null ? null : Math.max(0, availableMinutes),
    recommendation: messages[outcome],
    known: { stage, flightNumber: flight?.flightNumber || null, gate: flight?.gate || null, arrivalEstimate, arrivalEstimateBasis: arrivalEstimate ? "traveler-provided" : null, queueMinutesIncluded: queue.minutes },
    missing: [...new Set(missing)],
    method: "Uses the earlier of supplied boarding time or scheduled departure; later estimated departure never adds shopping time. Conservative demo buffers are not airport walking-time claims.",
  };
}
