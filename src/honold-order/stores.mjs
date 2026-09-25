// Honold shops and opening hours as published on https://www.honold.ch/standorte/
// (checked 25 September 2026). Hours are [open, close] in minutes after midnight,
// indexed by weekday 0 = Sunday … 6 = Saturday. null = closed.
export const TIME_ZONE = "Europe/Zurich";
export const PREP_MINUTES = 10; // demo assumption: shelf items packed within 10 minutes

const h = (hh, mm = 0) => hh * 60 + mm;
const LAKE = [[h(8), h(13)], [h(7), h(18, 30)], [h(7), h(18, 30)], [h(7), h(18, 30)], [h(7), h(18, 30)], [h(7), h(18, 30)], [h(8), h(16)]];

export const STORES = [
  { id: "erlenbach", name: "Erlenbach", address: "Seestrasse 69, 8703 Erlenbach", hours: LAKE },
  { id: "kuesnacht", name: "Küsnacht", address: "Obere Heslibachstrasse 9, 8700 Küsnacht", hours: LAKE },
  { id: "herrliberg", name: "Herrliberg", address: "Dorf 12, 8704 Herrliberg", hours: LAKE },
  { id: "zuerichberg", name: "Zürichberg", address: "Gladbachstrasse 108, 8044 Zürich", hours: LAKE },
  { id: "rennweg", name: "Le Pavillon Rennweg", address: "Rennweg / Bahnhofstrasse, 8001 Zürich", hours: [null, [h(7, 30), h(18, 30)], [h(7, 30), h(18, 30)], [h(7, 30), h(18, 30)], [h(7, 30), h(18, 30)], [h(7, 30), h(18, 30)], [h(8), h(18)]] },
  { id: "witikon", name: "Witikon", address: "Witikonerstrasse 279, 8053 Zürich", hours: [null, [h(8), h(18, 30)], [h(8), h(18, 30)], [h(8), h(18, 30)], [h(8), h(18, 30)], [h(8), h(18, 30)], [h(8), h(18, 30)]] },
];

export const DEFAULT_STORE = "erlenbach";
export function storeById(id) { return STORES.find((s) => s.id === id) || null; }

const partsFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Local Zurich weekday and minute-of-day for an epoch. */
export function localClock(ms) {
  const p = Object.fromEntries(partsFmt.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { weekday: DAYS[p.weekday], minute: Number(p.hour) * 60 + Number(p.minute) };
}

/** Epoch for a local Zurich minute-of-day, dayOffset days from the day of nowMs. */
export function epochAt(nowMs, dayOffset, minute) {
  const { minute: nowMinute } = localClock(nowMs);
  const base = nowMs - (nowMs % 60000);
  return base + ((minute - nowMinute) + dayOffset * 1440) * 60000;
}

function roundUp(minute, step) { return Math.ceil(minute / step) * step; }

export function hoursOn(store, weekday) { return store?.hours?.[((weekday % 7) + 7) % 7] || null; }

/** Earliest ready time: now + prep while open, otherwise next opening + prep. Looks up to 7 days ahead. */
export function earliestReady(storeId, nowMs) {
  const store = storeById(storeId);
  if (!store) return null;
  const { weekday, minute } = localClock(nowMs);
  for (let d = 0; d < 7; d += 1) {
    const hours = hoursOn(store, weekday + d);
    if (!hours) continue;
    const from = d === 0 ? Math.max(minute + PREP_MINUTES, hours[0] + PREP_MINUTES) : hours[0] + PREP_MINUTES;
    const ready = roundUp(from, 5);
    if (ready <= hours[1] - 5) return { ms: epochAt(nowMs, d, ready), dayOffset: d, minute: ready };
  }
  return null;
}

/** 15-minute pickup slots for today (dayOffset 0) or a later day. */
export function slotsFor(storeId, nowMs, dayOffset = 0) {
  const store = storeById(storeId);
  const { weekday, minute } = localClock(nowMs);
  const hours = hoursOn(store, weekday + dayOffset);
  if (!hours) return [];
  const first = roundUp(Math.max(hours[0] + PREP_MINUTES, dayOffset === 0 ? minute + PREP_MINUTES : 0), 15);
  const out = [];
  for (let m = first; m <= hours[1] - 15; m += 15) out.push({ ms: epochAt(nowMs, dayOffset, m), dayOffset, minute: m });
  return out;
}

/** Validate a requested pickup. when = { mode: "asap" } | { mode: "at", dayOffset, minute }. */
export function resolvePickup(storeId, when, nowMs) {
  const store = storeById(storeId);
  if (!store) return { ok: false, reason: "unknown_store" };
  if (!when || when.mode === "asap") {
    const ready = earliestReady(storeId, nowMs);
    return ready ? { ok: true, asap: true, ...ready } : { ok: false, reason: "closed" };
  }
  const { weekday, minute: nowMinute } = localClock(nowMs);
  const hours = hoursOn(store, weekday + when.dayOffset);
  if (!hours) return { ok: false, reason: "closed_that_day", suggestion: earliestReady(storeId, epochAt(nowMs, when.dayOffset + 1, 0)) };
  const minute = roundUp(when.minute, 5);
  if (when.dayOffset === 0 && minute < nowMinute + PREP_MINUTES) return { ok: false, reason: "too_soon", suggestion: earliestReady(storeId, nowMs) };
  if (minute < hours[0] + PREP_MINUTES || minute > hours[1] - 5) return { ok: false, reason: "outside_hours", hours };
  return { ok: true, asap: false, ms: epochAt(nowMs, when.dayOffset, minute), dayOffset: when.dayOffset, minute };
}

export function hhmm(minute) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export function parseClock(text) {
  const m = /^(\d{1,2})[:.h]?(\d{2})?$/.exec(String(text || "").trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2] || 0);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function hoursLabel(hours) { return hours ? `${hhmm(hours[0])}–${hhmm(hours[1])}` : null; }
