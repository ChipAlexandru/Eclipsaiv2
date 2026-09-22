export const DEMO_TIME_ZONE = "Europe/Zurich";
export const DEMO_BRANCHES = [
  { id: "erlenbach", name: "Erlenbach", address: "Seestrasse 69, 8703 Erlenbach", open: 8, close: 19 },
  { id: "kuesnacht", name: "Küsnacht", address: "Obere Heslibachstrasse 9, 8700 Küsnacht", open: 8, close: 19 },
];
export const DEMO_PROFILES = [
  { id: "guest", name: "Guest", description: "No offer selected" },
  { id: "regular", name: "Bakery regular", description: "10% off bakery and pâtisserie, up to CHF 5.00" },
  { id: "chocolate", name: "Chocolate lover", description: "15% off chocolate, up to CHF 8.00" },
];
export const DEMO_LEAD_MINUTES = 30;

const zurichFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: DEMO_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
const labelFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: DEMO_TIME_ZONE, weekday: "short", day: "numeric", month: "short",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: DEMO_TIME_ZONE, weekday: "short", day: "numeric", month: "short",
});

export function zurichParts(epochMs) {
  const values = Object.fromEntries(zurichFormatter.formatToParts(new Date(epochMs))
    .filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return { ...values, hour: Number(values.hour), minute: Number(values.minute) };
}

export function slotLabel(slotId) {
  return `${labelFormatter.format(new Date(Number(slotId)))} · Zurich time`;
}

export function slotDateId(slotId) {
  const local = zurichParts(Number(slotId));
  return `${local.year}-${local.month}-${local.day}`;
}

export function slotDayLabel(slotId) {
  return dayFormatter.format(new Date(Number(slotId))).replace(",", "");
}

function stableNumber(value) {
  let hash = 2166136261;
  for (const character of String(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

export function sampleStock(productId, branchId) {
  if (!DEMO_BRANCHES.some((branch) => branch.id === branchId)) return 0;
  return stableNumber(`${branchId}:${productId}`) % 6;
}

export function sampleSlotCapacity(branchId, slotId) {
  if (!DEMO_BRANCHES.some((branch) => branch.id === branchId)) return 0;
  return 2 + (stableNumber(`${branchId}:${slotId}`) % 4);
}

export function futureSlots(nowMs, branchId, limit = 140) {
  const branch = DEMO_BRANCHES.find((item) => item.id === branchId);
  if (!branch || !Number.isFinite(nowMs)) return [];
  const start = Math.ceil((nowMs + DEMO_LEAD_MINUTES * 60_000) / 900_000) * 900_000;
  const end = nowMs + 5 * 86_400_000;
  const slots = [];
  for (let timestamp = start; timestamp < end && slots.length < limit; timestamp += 900_000) {
    const local = zurichParts(timestamp);
    if (local.hour < branch.open || local.hour >= branch.close) continue;
    slots.push({ id: String(timestamp), label: slotLabel(timestamp), capacity: sampleSlotCapacity(branchId, timestamp) });
  }
  return slots;
}

export function offerQuote(profileId, basketSummary, productsById) {
  const profile = DEMO_PROFILES.find((item) => item.id === profileId) || DEMO_PROFILES[0];
  const rule = profile.id === "regular"
    ? { rate: 0.1, capCents: 500, types: ["baeckerei", "patisserie und torten"] }
    : profile.id === "chocolate"
      ? { rate: 0.15, capCents: 800, types: ["schokolade"] }
      : null;
  const eligibleCents = rule ? basketSummary.items.reduce((sum, item) => {
    const type = productsById.get(item.productId)?.productType;
    return sum + (rule.types.includes(type) ? Math.round(item.lineTotalChf * 100) : 0);
  }, 0) : 0;
  const savingsCents = rule ? Math.min(rule.capCents, Math.round(eligibleCents * rule.rate)) : 0;
  const subtotalCents = Math.round(basketSummary.totalChf * 100);
  return {
    profileId: profile.id, profileName: profile.name, description: profile.description,
    eligibleSubtotalChf: eligibleCents / 100, savingsChf: savingsCents / 100,
    subtotalChf: subtotalCents / 100, exampleTotalChf: Math.max(0, subtotalCents - savingsCents) / 100,
  };
}

export function pickupCheck({ basket, branchId, slotId, nowMs }) {
  const branch = DEMO_BRANCHES.find((item) => item.id === branchId);
  if (!branch) return { ok: false, reason: "Choose a pickup branch.", stockIssues: [], slots: [] };
  const slots = futureSlots(nowMs, branchId);
  const selectedSlot = slots.find((slot) => slot.id === slotId);
  const totals = Object.entries(basket).reduce((result, [key, quantity]) => {
    const { productId } = parseBasketKey(key); result[productId] = (result[productId] || 0) + quantity; return result;
  }, {});
  const stockIssues = Object.entries(totals).filter(([productId, quantity]) => quantity > sampleStock(productId, branchId))
    .map(([productId, quantity]) => ({ productId, requested: quantity, sampleAvailable: sampleStock(productId, branchId) }));
  const itemCount = Object.values(basket).reduce((sum, quantity) => sum + quantity, 0);
  let reason = null;
  if (!itemCount) reason = "Add a product to the basket.";
  else if (stockIssues.length) reason = "Some quantities exceed the available stock.";
  else if (!selectedSlot) reason = "Choose a valid future pickup slot.";
  else if (itemCount > selectedSlot.capacity) reason = "This pickup time cannot fit your basket.";
  return { ok: !reason, reason, stockIssues, itemCount, selectedSlot,
    alternatives: slots.filter((slot) => itemCount <= slot.capacity).slice(0, 4), slots };
}

export function makePreview({ basket, branchId, slotId, profileId, quote, nowMs }) {
  const check = pickupCheck({ basket, branchId, slotId, nowMs });
  if (!check.ok) throw new Error(check.reason);
  const seed = `${branchId}:${slotId}:${profileId}:${Object.entries(basket).sort().map(([id, qty]) => `${id}x${qty}`).join(",")}`;
  return { branchId, slotId, profileId, quote, basket: { ...basket }, createdAt: nowMs, stage: 0,
    pickupCode: `H-${String(stableNumber(seed) % 10000).padStart(4, "0")}`, simulated: true };
}

export function previewStatus(preview) {
  if (!preview) return null;
  return ["Received", "Preparing", "Ready"][Math.max(0, Math.min(2, preview.stage || 0))];
}

export function advancePreview(preview) {
  return preview ? { ...preview, stage: Math.min(2, (preview.stage || 0) + 1) } : null;
}
import { parseBasketKey } from "./experience.mjs";
