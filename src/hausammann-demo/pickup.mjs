// Entirely illustrative checkout scenario. No Hausammann inventory, offers, hours or orders are read.
export const DEMO_BRANCHES = [
  { id: "uni88", name: "Uni 88 · Zürich", address: "Universitätsstrasse 88, 8006 Zürich" },
  { id: "raegimaert", name: "Rägimärt · Regensdorf", address: "Feldstrasse 2, 8105 Regensdorf" },
];

export const DEMO_PROFILES = [
  { id: "guest", name: "Demo guest" },
  { id: "bread", name: "Demo bread lover" },
  { id: "lunch", name: "Demo lunch visitor" },
  { id: "afternoon", name: "Demo afternoon visit" },
];

export const SHOPPING_SCENARIOS = [
  { id: "guest", label: "New customer", detail: "Browse without an offer" },
  { id: "bread", label: "Returning regular", detail: "Usual bread order · 10% offer" },
  { id: "lunch", label: "Lunch visit", detail: "Lunch favourites · 15% offer" },
  { id: "afternoon", label: "Afternoon offer", detail: "Patisserie pick · 12% offer" },
];

export const TRACKER_STAGES = ["Received", "Preparing", "Ready"];

const localParts = (date) => Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
}).formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));

const hash = (value) => [...String(value)].reduce((total, character) => (total * 31 + character.charCodeAt(0)) % 1000003, 0);
const slotCache = new Map();

export function listPickupSlots(now, branchId) {
  if (!DEMO_BRANCHES.some((branch) => branch.id === branchId)) return [];
  const start = Math.ceil((new Date(now).getTime() + 45 * 60_000) / (15 * 60_000)) * (15 * 60_000);
  const cacheKey = `${branchId}:${start}`;
  if (slotCache.has(cacheKey)) return slotCache.get(cacheKey);
  const slots = [];
  const seen = new Set();
  const daysSeen = new Set();
  for (let timestamp = start; timestamp < start + 96 * 60 * 60_000; timestamp += 15 * 60_000) {
    const parts = localParts(new Date(timestamp));
    const hour = Number(parts.hour);
    if (hour < 8 || hour > 16) continue;
    const day = `${parts.year}-${parts.month}-${parts.day}`;
    const time = `${parts.hour}:${parts.minute}`;
    if (!daysSeen.has(day)) {
      if (daysSeen.size >= 3) break;
      daysSeen.add(day);
    }
    const id = `${day}T${time}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const remaining = hash(`${branchId}:${id}`) % 7 === 0 ? 0 : 6;
    const dayLabel = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", weekday: "short", day: "numeric", month: "short" }).format(new Date(timestamp));
    slots.push({ id, label: `${dayLabel}, ${time}`, remaining, available: remaining > 0 });
  }
  if (slotCache.size > 48) slotCache.clear();
  slotCache.set(cacheKey, slots);
  return slots;
}

export function sampleProductLimit(productId, branchId) {
  return 2 + hash(`${branchId}:${productId}`) % 5;
}

export function offerFor(profileId, basket, productsById) {
  const profile = DEMO_PROFILES.find((item) => item.id === profileId) || DEMO_PROFILES[0];
  const offer = profile.id === "bread"
    ? { percent: 10, category: "Brote", title: "10% off bread items" }
    : profile.id === "lunch"
      ? { percent: 15, category: "Traiteur", title: "15% off lunch items" }
      : profile.id === "afternoon"
        ? { percent: 12, category: "Patisserie", title: "12% off patisserie" }
      : { percent: 0, category: null, title: "No offer" };
  const eligibleItems = Object.entries(basket).filter(([lineKey, quantity]) => quantity > 0 && productsById.get(parseLineKey(lineKey).productId)?.productType === offer.category);
  const eligibleQuantity = eligibleItems.reduce((sum, [, quantity]) => sum + quantity, 0);
  const applied = offer.percent > 0 && eligibleQuantity > 0;
  return {
    ...offer, profile: profile.name, eligibleQuantity,
    savingsRate: applied ? offer.percent / 100 : 0,
    eligiblePriceMultiplier: applied ? 1 - offer.percent / 100 : 1,
    applied,
    explanation: offer.percent === 0
      ? "This customer profile has no offer."
      : eligibleQuantity
        ? `${offer.percent}% off ${eligibleQuantity} eligible ${offer.category} item${eligibleQuantity === 1 ? "" : "s"}.`
        : `Add a ${offer.category} item to use this offer.`,
  };
}

export function checkPickup({ basket, branchId, slotId, now, productsById }) {
  const slots = listPickupSlots(now, branchId);
  const slot = slots.find((item) => item.id === slotId);
  const issues = [];
  const totalQuantity = Object.values(basket).reduce((sum, quantity) => sum + quantity, 0);
  if (totalQuantity === 0) issues.push("Add a product to the basket.");
  if (!slot) issues.push("Choose a future pickup time.");
  else if (!slot.available) issues.push("That pickup time is full; choose another.");
  else if (totalQuantity > slot.remaining) issues.push(`This time supports up to ${slot.remaining} items; choose fewer items or another time.`);
  const productQuantities = new Map();
  for (const [lineKey, quantity] of Object.entries(basket)) {
    const { productId } = parseLineKey(lineKey);
    productQuantities.set(productId, (productQuantities.get(productId) || 0) + quantity);
  }
  for (const [id, quantity] of productQuantities) {
    const product = productsById.get(id);
    if (!product) { issues.push("An unknown product is in the basket."); continue; }
    const stock = sampleStockFor(id, branchId);
    const limit = Math.min(sampleProductLimit(id, branchId), stock.remaining);
    if (!stock.available) issues.push(`${product.name}: unavailable at this branch.`);
    if (quantity > limit) issues.push(`${product.name}: ${DEMO_BRANCHES.find((branch) => branch.id === branchId)?.name || "branch"} limit is ${limit}.`);
  }
  return { valid: issues.length === 0, issues, slot, totalQuantity };
}

export function pickupAlternatives({ basket, now, productsById }, limit = 3) {
  const alternatives = [];
  for (const branch of DEMO_BRANCHES) {
    for (const slot of listPickupSlots(now, branch.id)) {
      if (checkPickup({ basket, branchId: branch.id, slotId: slot.id, now, productsById }).valid) {
        alternatives.push({ branchId: branch.id, branchName: branch.name, slotId: slot.id, slotLabel: slot.label });
        if (alternatives.length >= limit) return alternatives;
      }
    }
  }
  return alternatives;
}

export function pickupCode({ basket, branchId, slotId, approvalToken = "legacy", salt = 0 }) {
  return `H-${String(hash(JSON.stringify({ basket, branchId, slotId, approvalToken, salt })) % 1000000).padStart(6, "0")}`;
}

export function nextTrackerStage(stage) {
  return Math.min(TRACKER_STAGES.length - 1, Math.max(0, stage) + 1);
}
import { parseLineKey, sampleStockFor } from "./commerce.mjs";
