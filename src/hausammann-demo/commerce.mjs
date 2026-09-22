// Synthetic commerce data for this interaction demo. Nothing here is a Hausammann price or stock feed.
const CATEGORY_BASE_RAPPEN = { Brote: 620, Patisserie: 780, Traiteur: 1150, Confiserie: 920, Glacerie: 650 };
export const DEMO_DISCOUNT_CAP_RAPPEN = 1200;
export const ORDER_STORAGE_VERSION = 2;

const hash = (value) => [...String(value)].reduce((total, character) => (total * 31 + character.charCodeAt(0)) % 1000003, 0);
export const formatDemoChf = (rappen) => `CHF ${(Math.max(0, rappen) / 100).toFixed(2)}`;

export function demoUnitPriceRappen(product) {
  const base = CATEGORY_BASE_RAPPEN[product?.productType] || 800;
  return base + (hash(product?.id || "") % 7) * 50;
}

export function demoOptionsFor(product) {
  if (!product) return [];
  if (product.productType === "Brote") return [
    { id: "whole", label: "Whole", priceDeltaRappen: 0 },
    { id: "sliced", label: "Sliced", priceDeltaRappen: 50 },
  ];
  if (product.productType === "Patisserie") return [
    { id: "standard", label: "Standard", priceDeltaRappen: 0 },
    { id: "gift-box", label: "Gift box", priceDeltaRappen: 200 },
  ];
  return [{ id: "standard", label: "Standard", priceDeltaRappen: 0 }];
}

export const defaultOptionIdFor = (product) => demoOptionsFor(product)[0]?.id || "standard";

export const lineKeyFor = (productId, optionId = "standard") => optionId === "standard" ? productId : `${productId}::${optionId}`;
export function parseLineKey(lineKey) {
  const [productId, optionId = "standard"] = String(lineKey).split("::");
  return { productId, optionId };
}

export function sampleStockFor(productId, branchId) {
  const score = hash(`${branchId}:${productId}:stock`);
  if (score % 9 === 0) return { available: false, remaining: 0, label: "Unavailable at this branch" };
  const remaining = 2 + score % 6;
  return { available: true, remaining, label: remaining <= 2 ? `Only ${remaining} left` : "Available" };
}

export function alternateSampleBranch(productId, branchId, branches) {
  return branches.find((branch) => branch.id !== branchId && sampleStockFor(productId, branch.id).available) || null;
}

export function quoteProduct(product, profileId, optionId = "standard") {
  const option = demoOptionsFor(product).find((item) => item.id === optionId) || demoOptionsFor(product)[0];
  const listRappen = demoUnitPriceRappen(product) + (option?.priceDeltaRappen || 0);
  const eligible = (profileId === "bread" && product.productType === "Brote") || (profileId === "lunch" && product.productType === "Traiteur") || (profileId === "afternoon" && product.productType === "Patisserie");
  const percent = profileId === "bread" ? 10 : profileId === "lunch" ? 15 : profileId === "afternoon" ? 12 : 0;
  const indicativeDiscountRappen = eligible ? Math.round(listRappen * percent / 100) : 0;
  return { listRappen, eligible, percent, indicativeDiscountRappen, indicativeEffectiveRappen: listRappen - indicativeDiscountRappen, option };
}

export function quoteBasket(basket, productsById, profileId) {
  const lines = Object.entries(basket).flatMap(([lineKey, quantity]) => {
    const { productId, optionId } = parseLineKey(lineKey);
    const product = productsById.get(productId);
    if (!product || quantity <= 0) return [];
    const quote = quoteProduct(product, profileId, optionId);
    return [{ lineKey, productId, optionId, name: product.name, quantity, optionLabel: quote.option?.label || "Standard", unitRappen: quote.listRappen, lineRappen: quote.listRappen * quantity, eligible: quote.eligible }];
  });
  const subtotalRappen = lines.reduce((sum, line) => sum + line.lineRappen, 0);
  const eligibleRappen = lines.filter((line) => line.eligible).reduce((sum, line) => sum + line.lineRappen, 0);
  const percent = profileId === "bread" ? 10 : profileId === "lunch" ? 15 : profileId === "afternoon" ? 12 : 0;
  const uncappedDiscountRappen = Math.round(eligibleRappen * percent / 100);
  const discountRappen = Math.min(DEMO_DISCOUNT_CAP_RAPPEN, uncappedDiscountRappen);
  return { lines, itemCount: lines.reduce((sum, line) => sum + line.quantity, 0), subtotalRappen, eligibleRappen, percent, discountRappen, discountCapped: uncappedDiscountRappen > discountRappen, totalRappen: subtotalRappen - discountRappen };
}

export function reviewFingerprint({ basket, profileId, branchId, slotId, quote }) {
  return `review-${hash(JSON.stringify({ basket, profileId, branchId, slotId, totalRappen: quote.totalRappen }))}`;
}

export function demoProfileStory(profileId, products) {
  const handles = profileId === "bread" ? ["chnebelbrot", "sesamleinsamenbrot"] : profileId === "lunch" ? ["sandwiches", "gemischter-salat"] : profileId === "afternoon" ? ["tiramisu", "franzosisch-patisserie-zitrone"] : [];
  const matches = handles.map((handle) => products.find((product) => product.handle === handle)).filter(Boolean);
  return {
    fictional: true,
    label: profileId === "guest" ? "New visitor" : profileId === "bread" ? "Bread regular" : profileId === "lunch" ? "Lunch regular" : "Afternoon favourite",
    history: matches.map((product, index) => ({ productId: product.id, name: product.name, when: index ? "Two weeks ago" : "Last visit" })),
    usual: matches[0] || null,
    recommendations: matches.length ? products.filter((product) => product.productType === matches[0].productType && !handles.includes(product.handle)).slice(0, 3) : products.slice(0, 3),
  };
}

export function serializeOrders(profileOrders) {
  return JSON.stringify({ version: ORDER_STORAGE_VERSION, profiles: profileOrders });
}

export function parseOrders(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (![1, ORDER_STORAGE_VERSION].includes(parsed?.version) || !parsed.profiles || typeof parsed.profiles !== "object") return {};
    return Object.fromEntries(Object.entries(parsed.profiles).map(([profileId, orders]) => [profileId, Array.isArray(orders) ? orders.map((order) => order.quote ? ({
      ...order, quote: {
        ...order.quote,
        lines: (order.quote.lines || []).map((line) => ({
          ...line,
          optionLabel: String(line.optionLabel || "Standard").replace(/\s*·\s*demo option$/i, ""),
        })),
      },
    }) : order) : []]));
  } catch { return {}; }
}
