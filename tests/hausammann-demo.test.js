const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/hausammann-demo/catalog.json"), "utf8"));
const report = JSON.parse(fs.readFileSync(path.join(root, "src/hausammann-demo/catalog-report.json"), "utf8"));

test("Hausammann public catalogue has local photographs and traceable source pages", () => {
  assert.equal(catalog.source, "https://www.zopfbeck.ch/");
  assert.equal(catalog.products.length, 41);
  assert.equal(report.photographedProducts, 41);
  assert.deepEqual(report.counts, { Brote: 7, Patisserie: 16, Traiteur: 9, Confiserie: 6, Glacerie: 3 });
  const ids = new Set();
  for (const product of catalog.products) {
    assert.ok(product.name && product.id && product.productType);
    assert.equal(product.priceChf, null);
    assert.ok(!ids.has(product.id));
    ids.add(product.id);
    assert.match(product.sourceUrl, /^https:\/\/www\.zopfbeck\.ch\/pro\./);
    assert.match(product.images[0].sourceUrl, /^https:\/\/www\.zopfbeck\.ch\/assets\/images\//);
    assert.ok(fs.statSync(path.join(root, "public", product.images[0].localPath)).size > 500);
  }
  assert.ok(fs.statSync(path.join(root, "public/hausammann-demo/brand/zopfbeck-logo-white.png")).size > 500);
});

test("basket and voice shopping preserve a synthetic-only transaction boundary", async () => {
  const shopping = await import(pathToFileURL(path.join(root, "src/hausammann-demo/shopping.mjs")));
  assert.ok(shopping.searchCatalog(catalog.products, "bread", 6).some((product) => /brot/i.test(product.name)));
  assert.ok(shopping.searchCatalog(catalog.products, "salat", 6).length >= 4);
  const product = catalog.products[0];
  const ids = new Set(catalog.products.map((item) => item.id));
  const basket = shopping.changeBasket({}, product.id, 2, "add", ids);
  const summary = shopping.basketSummary(basket, new Map(catalog.products.map((item) => [item.id, item])));
  assert.equal(summary.itemCount, 2);
  assert.deepEqual(summary.items, [{ productId: product.id, name: product.name, quantity: 2 }]);
  assert.equal("totalChf" in summary, false);
  assert.throws(() => shopping.changeBasket({}, "fabricated", 1, "add", ids), /Unknown product/);
  const client = fs.readFileSync(path.join(root, "src/hausammann-demo/HausammannVoiceShop.jsx"), "utf8");
  const route = fs.readFileSync(path.join(root, "app/api/hausammann-demo/realtime-token/route.js"), "utf8");
  assert.match(client, /aria-label="Shopping home"/);
  assert.match(client, />Pickup code</);
  assert.match(client, /awaitingExplicitApproval: true/);
  assert.match(client, /approve_simulated_order/);
  assert.match(client, /with your offer/);
  assert.match(client, /aria-label="Presentation scenario"/);
  assert.match(client, />Shopping as</);
  assert.doesNotMatch(client, />Synthetic demo price</);
  assert.doesNotMatch(client, />FICTIONAL PROFILE</);
  assert.match(client, /pendingReviewRef\.current/);
  assert.match(client, /ordersByProfileRef\.current/);
  assert.match(client, /expiresAt: new Date\(Date\.now\(\) \+ 2 \* 60_000\)/);
  assert.match(client, /crypto\.randomUUID/);
  assert.match(client, /order\.approvalToken === review\.approvalToken/);
  assert.match(client, /\/api\/hausammann-demo\/realtime-token/);
  assert.doesNotMatch(client, /process\.env\.OPENAI_API_KEY/);
  assert.match(route, /process\.env\.OPENAI_API_KEY/);
});

test("synthetic prices, eligible offers, rounding and caps produce an exact basket quote", async () => {
  const commerce = await import(pathToFileURL(path.join(root, "src/hausammann-demo/commerce.mjs")));
  const byId = new Map(catalog.products.map((item) => [item.id, item]));
  const bread = catalog.products.find((item) => item.productType === "Brote");
  const lunch = catalog.products.find((item) => item.productType === "Traiteur");
  const slicedKey = commerce.lineKeyFor(bread.id, "sliced");
  const quote = commerce.quoteBasket({ [slicedKey]: 2, [lunch.id]: 1 }, byId, "bread");
  assert.equal(quote.lines[0].optionId, "sliced");
  assert.equal(quote.lines[0].optionLabel, "Sliced");
  assert.equal(quote.percent, 10);
  assert.equal(quote.discountRappen, Math.round(quote.eligibleRappen * 0.1));
  assert.equal(quote.totalRappen, quote.subtotalRappen - quote.discountRappen);
  const capped = commerce.quoteBasket({ [bread.id]: 24 }, byId, "bread");
  assert.equal(capped.discountRappen, commerce.DEMO_DISCOUNT_CAP_RAPPEN);
  assert.equal(capped.discountCapped, true);
  assert.match(commerce.formatDemoChf(625), /^CHF 6\.25$/);
});

test("sample stock differs by branch, variants stay distinct, and reviews bind exact state", async () => {
  const commerce = await import(pathToFileURL(path.join(root, "src/hausammann-demo/commerce.mjs")));
  const shopping = await import(pathToFileURL(path.join(root, "src/hausammann-demo/shopping.mjs")));
  const pickup = await import(pathToFileURL(path.join(root, "src/hausammann-demo/pickup.mjs")));
  const byId = new Map(catalog.products.map((item) => [item.id, item]));
  const ids = new Set(byId.keys());
  const product = catalog.products.find((item) => commerce.demoOptionsFor(item).length > 1);
  assert.equal(commerce.defaultOptionIdFor(product), "whole");
  assert.notEqual(commerce.lineKeyFor(product.id, commerce.defaultOptionIdFor(product)), commerce.lineKeyFor(product.id, "sliced"));
  let basket = shopping.changeBasket({}, product.id, 1, "add", ids, "whole");
  basket = shopping.changeBasket(basket, product.id, 1, "add", ids, "sliced");
  assert.equal(Object.keys(basket).length, 2);
  const quote = commerce.quoteBasket(basket, byId, "bread");
  const reviewA = commerce.reviewFingerprint({ basket, profileId: "bread", branchId: "uni88", slotId: "x", quote });
  const changed = shopping.changeBasket(basket, product.id, 1, "add", ids, "whole");
  const changedQuote = commerce.quoteBasket(changed, byId, "bread");
  const reviewB = commerce.reviewFingerprint({ basket: changed, profileId: "bread", branchId: "uni88", slotId: "x", quote: changedQuote });
  assert.notEqual(reviewA, reviewB);
  assert.ok(catalog.products.some((item) => commerce.sampleStockFor(item.id, "uni88").available !== commerce.sampleStockFor(item.id, "raegimaert").available));
  const stock = commerce.sampleStockFor(product.id, "uni88");
  const now = new Date("2026-09-19T10:00:00Z");
  const slot = pickup.listPickupSlots(now, "uni88").find((item) => item.available && item.remaining >= stock.remaining + 1);
  if (slot) {
    const overVariants = { [commerce.lineKeyFor(product.id, "whole")]: stock.remaining, [commerce.lineKeyFor(product.id, "sliced")]: 1 };
    assert.equal(pickup.checkPickup({ basket: overVariants, branchId: "uni88", slotId: slot.id, now, productsById: byId }).valid, false);
  }
});

test("sample order persistence is versioned and isolated by fictional profile", async () => {
  const commerce = await import(pathToFileURL(path.join(root, "src/hausammann-demo/commerce.mjs")));
  const profiles = { bread: [{ id: "one", code: "H-0001" }], lunch: [{ id: "two", code: "H-0002" }] };
  assert.deepEqual(commerce.parseOrders(commerce.serializeOrders(profiles)), profiles);
  const legacy = JSON.stringify({ version: 1, profiles: { bread: [{ id: "old", quote: { lines: [{ optionLabel: "Sliced · demo option" }] } }] } });
  assert.equal(commerce.parseOrders(legacy).bread[0].quote.lines[0].optionLabel, "Sliced");
  assert.deepEqual(commerce.parseOrders('{"version":999,"profiles":{"bread":[]}}'), {});
  assert.deepEqual(commerce.parseOrders("broken"), {});
});

test("illustrative pickup slots are future Zurich times and reject full or impossible choices", async () => {
  const pickup = await import(pathToFileURL(path.join(root, "src/hausammann-demo/pickup.mjs")));
  const now = new Date("2026-09-19T10:00:00Z");
  const slots = pickup.listPickupSlots(now, "uni88");
  assert.equal(slots[0].id, "2026-09-19T12:45");
  assert.ok(slots.every((slot) => /^2026-09-\d\dT(?:08|09|10|11|12|13|14|15|16):(?:00|15|30|45)$/.test(slot.id)));
  assert.ok(slots.some((slot) => slot.id === "2026-09-20T12:15"));
  assert.ok(slots.some((slot) => slot.id === "2026-09-20T11:45"));
  assert.equal(new Set(slots.map((slot) => slot.id.slice(0, 10))).size, 3);
  assert.ok(slots.some((slot) => !slot.available));
  const byId = new Map(catalog.products.map((item) => [item.id, item]));
  const product = catalog.products[0];
  const good = pickup.checkPickup({ basket: { [product.id]: 1 }, branchId: "uni88", slotId: slots[0].id, now, productsById: byId });
  assert.equal(good.valid, true);
  const full = pickup.checkPickup({ basket: { [product.id]: 1 }, branchId: "uni88", slotId: slots.find((slot) => !slot.available).id, now, productsById: byId });
  assert.equal(full.valid, false);
  const overstock = pickup.checkPickup({ basket: { [product.id]: pickup.sampleProductLimit(product.id, "uni88") + 1 }, branchId: "uni88", slotId: slots[0].id, now, productsById: byId });
  assert.equal(overstock.valid, false);
  assert.ok(pickup.pickupAlternatives({ basket: { [product.id]: 1 }, now, productsById: byId }).length > 0);
  const afterMidnight = pickup.listPickupSlots(new Date("2026-09-19T21:30:00Z"), "uni88");
  assert.match(afterMidnight[0].id, /^2026-09-20T08:/);
  const afterDstJump = pickup.listPickupSlots(new Date("2026-03-29T00:30:00Z"), "uni88");
  assert.match(afterDstJump[0].id, /^2026-03-29T08:/);
  const stale = pickup.checkPickup({ basket: { [product.id]: 1 }, branchId: "uni88", slotId: slots[0].id, now: new Date("2026-09-20T10:00:00Z"), productsById: byId });
  assert.equal(stale.valid, false);
});

test("sample offers are transparent and tracker advances only through its three stages", async () => {
  const pickup = await import(pathToFileURL(path.join(root, "src/hausammann-demo/pickup.mjs")));
  const byId = new Map(catalog.products.map((item) => [item.id, item]));
  const bread = catalog.products.find((item) => item.productType === "Brote");
  const lunch = catalog.products.find((item) => item.productType === "Traiteur");
  const basket = { [bread.id]: 2, [lunch.id]: 1 };
  assert.equal(pickup.offerFor("guest", basket, byId).applied, false);
  assert.equal(pickup.offerFor("bread", { [lunch.id]: 1 }, byId).savingsRate, 0);
  const breadOffer = pickup.offerFor("bread", basket, byId);
  assert.equal(breadOffer.percent, 10);
  assert.equal(breadOffer.eligibleQuantity, 2);
  assert.equal(breadOffer.savingsRate, 0.1);
  assert.equal(breadOffer.eligiblePriceMultiplier, 0.9);
  assert.match(breadOffer.explanation, /10% off 2 eligible Brote items/);
  assert.equal(pickup.offerFor("lunch", basket, byId).eligibleQuantity, 1);
  assert.equal(pickup.offerFor("lunch", basket, byId).eligiblePriceMultiplier, 0.85);
  const patisserie = catalog.products.find((item) => item.productType === "Patisserie");
  assert.equal(pickup.offerFor("afternoon", { [patisserie.id]: 1 }, byId).percent, 12);
  assert.deepEqual(pickup.SHOPPING_SCENARIOS.map((scenario) => scenario.id), ["guest", "bread", "lunch", "afternoon"]);
  assert.deepEqual(pickup.TRACKER_STAGES, ["Received", "Preparing", "Ready"]);
  assert.equal(pickup.nextTrackerStage(0), 1);
  assert.equal(pickup.nextTrackerStage(1), 2);
  assert.equal(pickup.nextTrackerStage(2), 2);
  assert.match(pickup.pickupCode({ basket, branchId: "uni88", slotId: "2026-09-19T14:00" }), /^H-\d{6}$/);
  const firstApprovalCode = pickup.pickupCode({ basket, branchId: "uni88", slotId: "2026-09-19T14:00", approvalToken: "approval-one" });
  const secondApprovalCode = pickup.pickupCode({ basket, branchId: "uni88", slotId: "2026-09-19T14:00", approvalToken: "approval-two" });
  assert.notEqual(firstApprovalCode, secondApprovalCode);
});
