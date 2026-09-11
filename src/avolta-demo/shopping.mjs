export const INITIAL_CATEGORY_ORDER = ["Fragrance", "Beauty & makeup", "Spirits", "Swiss chocolate", "Swiss gifts"];

export function normalizeSearchText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function aliasesFor(product) {
  const type = product.productType;
  if (type === "Fragrance") return "perfume scent eau de parfum eau de toilette fragrance beauty";
  if (type === "Beauty & makeup") return "beauty makeup cosmetics lip palette skincare travel set";
  if (type === "Spirits") return "spirits alcohol liquor gin vodka rum kirsch swiss drinks";
  if (type === "Swiss chocolate") return "swiss chocolate confectionery sweet snack local gift";
  if (type === "Swiss gifts") return "swiss local souvenir gift matterhorn cow";
  return "";
}

export function searchCatalog(products, query, limit = 12) {
  const normalizedQuery = normalizeSearchText(query);
  const budgetMatch = normalizedQuery.match(/(?:under|below|less than|up to|max(?:imum)?)\s+(?:chf\s*)?(\d+(?:\.\d+)?)/);
  const priceCeiling = budgetMatch ? Number(budgetMatch[1]) : null;
  const ignoredTerms = new Set(["under", "below", "less", "than", "up", "to", "max", "maximum", "chf"]);
  const terms = normalizedQuery.split(" ").filter((term) => term && !ignoredTerms.has(term) && !/^\d+(?:\.\d+)?$/.test(term))
    .map((term) => ({ fragrances: "fragrance", gifts: "gift", chocolates: "chocolate" }[term] || term));
  const boundedLimit = Math.max(1, Math.min(Number(limit) || 12, 20));
  const eligibleProducts = Number.isFinite(priceCeiling)
    ? products.filter((product) => product.priceCurrency === "CHF" && product.priceChf <= priceCeiling)
    : products;
  if (!terms.length) return eligibleProducts.slice(0, boundedLimit);
  return eligibleProducts.map((product, sourceIndex) => {
    const name = normalizeSearchText(product.name);
    const brand = normalizeSearchText(product.vendor);
    const type = normalizeSearchText(product.productType);
    const tags = normalizeSearchText(product.tags?.join(" "));
    const description = normalizeSearchText(product.description);
    const aliases = normalizeSearchText(aliasesFor(product));
    let score = 0;
    for (const term of terms) {
      if (name === term || brand === term || type === term) score += 20;
      if (name.includes(term)) score += 10;
      if (brand.includes(term)) score += 8;
      if (type.includes(term)) score += 6;
      if (tags.includes(term)) score += 5;
      if (aliases.includes(term)) score += 4;
      if (description.includes(term)) score += 1;
    }
    return { product, score, sourceIndex };
  }).filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.sourceIndex - b.sourceIndex)
    .slice(0, boundedLimit).map(({ product }) => product);
}

export function initialDemoProducts(products) {
  const picks = [];
  for (const category of INITIAL_CATEGORY_ORDER) {
    picks.push(...products.filter((product) => product.productType === category).slice(0, 2));
  }
  return picks;
}

export function changeQuantity(state, productId, quantity, mode, validProductIds) {
  if (!validProductIds.has(productId)) throw new Error("Unknown product ID.");
  const amount = Math.max(0, Math.min(12, Math.trunc(Number(quantity) || 0)));
  const current = state[productId] || 0;
  let nextQuantity;
  if (mode === "add") nextQuantity = Math.min(12, current + Math.max(1, amount));
  else if (mode === "remove") nextQuantity = Math.max(0, current - Math.max(1, amount));
  else if (mode === "set") nextQuantity = amount;
  else throw new Error("Mode must be add, remove, or set.");
  const next = { ...state };
  if (!nextQuantity) delete next[productId];
  else next[productId] = nextQuantity;
  return next;
}

export function basketSummary(basket, productsById) {
  const items = Object.entries(basket).map(([productId, quantity]) => {
    const product = productsById.get(productId);
    if (!product) return null;
    return { productId, name: product.name, brand: product.vendor, variant: product.variant, quantity,
      unitPrice: product.priceChf, currency: product.priceCurrency,
      lineTotal: Number((product.priceChf * quantity).toFixed(2)) };
  }).filter(Boolean);
  return { items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)), currency: items[0]?.currency || "CHF" };
}

export function compactProduct(product) {
  if (!product) return null;
  return { id: product.id, brand: product.vendor, name: product.name, variant: product.variant,
    category: product.productType, price: product.priceChf, currency: product.priceCurrency,
    promotionEvidence: product.promotionEvidence, travelExclusive: product.travelExclusive, capturedAt: product.capturedAt };
}

export function shoppingStateSnapshot({ visibleIds, selectedId, shortlist, basket, travel }, productsById) {
  return {
    visibleProducts: visibleIds.map((id) => productsById.get(id)).filter(Boolean).map(compactProduct),
    selectedProduct: selectedId ? compactProduct(productsById.get(selectedId)) : null,
    shortlist: Object.keys(shortlist).map((id) => compactProduct(productsById.get(id))).filter(Boolean),
    basket: basketSummary(basket, productsById), travel,
    catalogBasis: "Curated public Zürich Duty Free selection captured 2026-09-11; not live physical-store stock.",
  };
}

export function resultsLimitForTravel(travel) {
  const minutes = Number(travel?.minutesAvailable);
  if (Number.isFinite(minutes) && minutes > 0 && minutes <= 20) return 4;
  if (Number.isFinite(minutes) && minutes <= 45) return 8;
  return 12;
}

export function departureEligibility(departureDateTime, now = new Date()) {
  if (!departureDateTime) return { eligible: false, reason: "Add a departure date and time." };
  const departure = new Date(departureDateTime);
  if (Number.isNaN(departure.getTime())) return { eligible: false, reason: "Use a valid departure date and time." };
  const hours = (departure.getTime() - now.getTime()) / 36e5;
  if (hours <= 0) return { eligible: false, reason: "Choose an upcoming departure." };
  return { eligible: true, hoursUntilDeparture: Math.round(hours) };
}

export function reservationFingerprint(basket, travel) {
  return JSON.stringify({ basket: Object.entries(basket).sort(([a], [b]) => a.localeCompare(b)),
    departureDateTime: travel.departureDateTime || "", gate: travel.gate || "", destination: travel.destination || "",
    pickupLocation: "Zürich Duty Free departure shop" });
}

export function transcriptFromHistory(history) {
  return history.filter((item) => item.type === "message" && ["user", "assistant"].includes(item.role))
    .flatMap((item) => item.content.map((content) => { const text = content.text || content.transcript;
      return text ? { id: item.itemId, role: item.role, text } : null; })).filter(Boolean).slice(-6);
}
