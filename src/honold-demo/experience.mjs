export const EXPERIENCE_VERSION = 2;
export const DEMO_VARIANTS = {
  message: { label: "Gift message", values: ["None", "Happy Birthday", "Thank you"], priceDeltaChf: 0 },
  wrap: { label: "Gift wrap", values: ["Standard", "Ribbon"], priceDeltaChf: 2.5 },
};

export const SAMPLE_CUSTOMERS = {
  guest: { usual: [], history: [], recommendations: [] },
  regular: { usual: [{ productId: "1366", quantity: 2 }], history: ["Cremeschnitte", "Parisette Honold 18h"], recommendations: ["1366", "1917", "2504"] },
  chocolate: { usual: [{ productId: "255", quantity: 2, options: { wrap: "Ribbon" } }], history: ["Bouchées Himbeer", "Pralinés Maison 9er"], recommendations: ["255", "2518", "265"] },
};

export function basketKey(productId, options = {}) {
  const clean = Object.entries(options).filter(([, value]) => value && value !== "None" && value !== "Standard").sort();
  return clean.length ? `${productId}::${encodeURIComponent(JSON.stringify(Object.fromEntries(clean)))}` : productId;
}
export function parseBasketKey(key) {
  const [productId, raw] = String(key).split("::");
  let options = {};
  try { if (raw) options = JSON.parse(decodeURIComponent(raw)); } catch {}
  return { productId, options };
}
export function optionDelta(options = {}) { return options.wrap === "Ribbon" ? 2.5 : 0; }
export function itemOffer(profileId, product) {
  const eligible = profileId === "regular" ? ["baeckerei", "patisserie und torten"].includes(product?.productType)
    : profileId === "chocolate" ? product?.productType === "schokolade" : false;
  const rate = profileId === "regular" ? .1 : profileId === "chocolate" ? .15 : 0;
  const cap = profileId === "regular" ? 5 : profileId === "chocolate" ? 8 : 0;
  const indicativeSavingsChf = eligible ? Math.min(cap, Math.round(product.priceChf * rate * 100) / 100) : 0;
  return { eligible, rate, indicativeSavingsChf,
    indicativeEffectiveChf: Number(((product?.priceChf || 0) - indicativeSavingsChf).toFixed(2)) };
}
export function reviewFingerprint({ basket, mode = "pickup", branchId, slotId, address, deliveryWindowId, profileId, exampleTotalChf }) {
  return JSON.stringify({ basket: Object.entries(basket).sort(), mode, branchId, slotId: mode === "pickup" ? slotId : null,
    address: mode === "delivery" ? String(address || "").trim() : null,
    deliveryWindowId: mode === "delivery" ? deliveryWindowId : null, profileId, exampleTotalChf });
}
export function approveReview(review, intent, nowMs) {
  if (!review?.fingerprint || !review.reviewId || !/^(approve|confirm)$/i.test(String(intent || ""))) throw new Error("Clear approval of the visible review is required.");
  if (nowMs - review.createdAt > 5 * 60_000) throw new Error("The review expired; create a fresh review.");
  return { ...review, approvedAt: nowMs, payment: "Simulated payment approved", approvalId: review.reviewId };
}
export function makeReviewId(fingerprint, nowMs, nonce = 0) { return `A-${Math.abs(hash(`${fingerprint}:${nowMs}:${nonce}`)) % 10000000}`; }
export function pickupCodeForReview(reviewId) { return `H-${String(Math.abs(hash(reviewId)) % 1000000).padStart(6, "0")}`; }
export function saveSampleOrder(orders, approved, pickupPreview) {
  if (!approved?.approvalId || approved.fingerprint !== pickupPreview?.reviewFingerprint) throw new Error("The approved review no longer matches.");
  if (orders.some((order) => order.approvalId === approved.approvalId)) return orders;
  return [{ version: EXPERIENCE_VERSION, ...pickupPreview, approvalId: approved.approvalId, payment: approved.payment }, ...orders];
}
export function serializeOrdersByProfile(map) { return JSON.stringify({ version: EXPERIENCE_VERSION, profiles: map }); }
export function parseOrdersByProfile(raw) {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== EXPERIENCE_VERSION || !value.profiles) return {};
    return Object.fromEntries(Object.entries(value.profiles).map(([profile, orders]) => [profile,
      Array.isArray(orders) ? orders.map((order) => ({ ...order, orderId: order.orderId || order.approvalId })) : [],
    ]));
  } catch { return {}; }
}
function hash(value) { let h = 0; for (const c of String(value)) h = Math.imul(31, h) + c.charCodeAt(0) | 0; return h; }
