// Menu, basket and order helpers. Pure functions, no React.
export const CATEGORIES = [
  { id: "baeckerei", de: "Bäckerei", en: "Bakery" },
  { id: "traiteur", de: "Traiteur", en: "Savoury" },
  { id: "patisserie", de: "Pâtisserie", en: "Pâtisserie" },
  { id: "torten", de: "Torten & Kuchen", en: "Cakes to share" },
  { id: "schokolade", de: "Schokolade", en: "Chocolate" },
  { id: "konfekt", de: "Konfekt", en: "Confections" },
];

export function categoryOf(product) {
  const type = product.productType;
  if (type === "patisserie und torten") return /Portionen|Dekor Schild/i.test(product.name) ? "torten" : "patisserie";
  return type;
}

export function buildMenu(catalog) {
  const products = catalog.products.map((p) => ({
    id: String(p.id),
    name: p.name.replace(/\s+-versandbereit\s*/i, " · versandbereit · ").replace(/\s{2,}/g, " ").trim(),
    priceChf: p.priceChf,
    category: categoryOf(p),
    image: p.images?.[0]?.localPath || null,
  }));
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c.id, products.filter((p) => p.category === c.id)]));
  return { products, byId, byCategory };
}

export function chf(value, lang = "de") {
  return new Intl.NumberFormat(lang === "de" ? "de-CH" : "en-CH", { style: "currency", currency: "CHF", minimumFractionDigits: 2 }).format(value);
}

/** Apply basket changes. items: [{ id, quantity, mode: "add" | "set" }]. Returns { basket, unknown }. */
export function applyBasket(basket, items, byId) {
  const next = { ...basket };
  const unknown = [];
  for (const item of items || []) {
    const id = String(item.id);
    if (!byId[id]) { unknown.push(id); continue; }
    const qty = Math.max(0, Math.round(Number(item.quantity) || 0));
    const value = item.mode === "set" ? qty : (next[id] || 0) + qty;
    if (value > 0) next[id] = Math.min(value, 99); else delete next[id];
  }
  return { basket: next, unknown };
}

/** Lines in the order products were first added (order = list of ids; object keys alone sort numerically). */
export function basketLines(basket, byId, order = []) {
  const rank = (id) => { const i = order.indexOf(id); return i === -1 ? Infinity : i; };
  return Object.entries(basket).filter(([id, q]) => byId[id] && q > 0)
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([id, quantity]) => ({ ...byId[id], quantity, lineChf: round2(byId[id].priceChf * quantity) }));
}

export function nextOrder(order, basket) {
  const kept = (order || []).filter((id) => basket[id]);
  return [...kept, ...Object.keys(basket).filter((id) => !kept.includes(id))];
}

export function basketTotals(basket, byId, order = []) {
  const lines = basketLines(basket, byId, order);
  return { lines, count: lines.reduce((s, l) => s + l.quantity, 0), totalChf: round2(lines.reduce((s, l) => s + l.lineChf, 0)) };
}

export function round2(v) { return Math.round(v * 100) / 100; }

export function pickupNumber(placedAtMs) { return String(101 + (Math.floor(placedAtMs / 1000) % 899)); }

/** Demo time-lapse: confirmed → preparing → ready. */
export const STATUS_STEPS = ["confirmed", "preparing", "ready"];
export function statusAt(order, nowMs) {
  if (!order) return null;
  const elapsed = nowMs - order.placedAtMs + (order.skipMs || 0);
  return elapsed >= 18000 ? "ready" : elapsed >= 4000 ? "preparing" : "confirmed";
}

/** Compact menu for the voice model: one line per product. */
export function menuForVoice(menu) {
  return CATEGORIES.map((c) => `${c.de}:\n${menu.byCategory[c.id].map((p) => `${p.id}|${p.name}|${p.priceChf.toFixed(2)}`).join("\n")}`).join("\n");
}

/** Plain local search used by touch and as a fallback. */
export function searchMenu(menu, query, limit = 8) {
  const words = String(query || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return menu.products
    .map((p) => ({ p, score: words.reduce((s, w) => s + (norm(p.name).includes(w) ? 2 : 0) + (norm(p.category).includes(w) ? 1 : 0), 0) }))
    .filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.p);
}
