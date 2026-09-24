const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/honold-demo/catalog.json"), "utf8"));
const report = JSON.parse(fs.readFileSync(path.join(root, "src/honold-demo/catalog-report.json"), "utf8"));

test("Honold production voice requires its dedicated key", async () => {
  const { honoldVoiceEnabled } = await import(pathToFileURL(path.join(root, "src/honold-demo/runtime.mjs")));
  assert.equal(honoldVoiceEnabled({}), false);
  assert.equal(honoldVoiceEnabled({ OPENAI_API_KEY: "shared-only" }), false);
  assert.equal(honoldVoiceEnabled({ VERCEL_ENV: "production", HONOLD_OPENAI_API_KEY: "dedicated" }), true);
});

test("all seven public shop pages have sourced, locally available products", () => {
  assert.equal(report.pagesFetched, 7);
  assert.equal(catalog.products.length, report.listedProductCount);
  assert.equal(report.downloadedImageCount, catalog.products.length);
  assert.deepEqual(report.failures, []);
  assert.match(catalog.source.note, /No live stock/i);
  const ids = new Set();
  for (const product of catalog.products) {
    assert.ok(product.id && product.name && product.handle);
    assert.ok(product.sourceUrl.startsWith("https://shop.honold.ch/product/"));
    assert.equal(product.priceCurrency, "CHF");
    assert.ok(Number.isFinite(product.priceChf) && product.priceChf > 0);
    assert.ok(!ids.has(product.id));
    ids.add(product.id);
    const image = product.images[0];
    assert.ok(image.sourceUrl.startsWith("https://shop.honold.ch/wp-content/uploads/"));
    assert.ok(fs.statSync(path.join(root, "public", image.localPath)).size > 256);
  }
});

test("search, basket and simulated pickup remain bounded to catalogue IDs", async () => {
  const shopping = await import(pathToFileURL(path.join(root, "src/honold-demo/shopping.mjs")));
  const products = catalog.products;
  assert.ok(shopping.searchCatalog(products, "chocolate", 12).some((item) => /pralin|truff|schokolade|chocolat|chakra/i.test(item.name)));
  assert.ok(shopping.searchCatalog(products, "bread", 12).some((item) => /brot|parisette|weggli|gipfel/i.test(item.name)));
  const product = products[0];
  const valid = new Set(products.map((item) => item.id));
  const basket = shopping.changeBasket({}, product.id, 2, "add", valid);
  assert.equal(basket[product.id], 2);
  assert.equal(shopping.basketSummary(basket, new Map(products.map((item) => [item.id, item]))).totalChf, product.priceChf * 2);
  assert.throws(() => shopping.changeBasket(basket, "fake", 1, "add", valid), /Unknown product/);
});

test("voice safeguards keep external actions bounded", () => {
  const source = fs.readFileSync(path.join(root, "src/honold-demo/HonoldVoiceShop.jsx"), "utf8");
  const i18nSource = fs.readFileSync(path.join(root, "src/honold-demo/i18n.mjs"), "utf8");
  const route = fs.readFileSync(path.join(root, "app/api/honold-demo/realtime-token/route.js"), "utf8");
  assert.match(i18nSource, /Never claim an order, reservation, payment, pickup, delivery or store message is real/);
  const journeySource = fs.readFileSync(path.join(root, "src/honold-demo/pickupJourney.mjs"), "utf8");
  assert.match(journeySource, /Seestrasse 69/);
  assert.match(source, /honold-logo.svg/);
  assert.match(source, /awaitingExplicitApproval: true/);
  assert.match(source, /approve_simulated_order/);
  assert.doesNotMatch(source, /process\.env\.OPENAI_API_KEY/);
  assert.match(route, /process\.env\.HONOLD_OPENAI_API_KEY/);
  assert.doesNotMatch(route, /process\.env\.OPENAI_API_KEY/);
});

test("English and German copy preserve product IDs and localize voice instructions", async () => {
  const i18n = await import(pathToFileURL(path.join(root, "src/honold-demo/i18n.mjs")));
  assert.equal(i18n.copyFor("de").confirmOrder, "Bestellung bestätigen");
  assert.equal(i18n.copyFor("en").confirmOrder, "Confirm order");
  const product = { id: "same-id", name: "Buttergipfel 2 Portionen" };
  assert.equal(product.id, "same-id");
  assert.match(i18n.productName(product, "en"), /Butter croissant/);
  assert.equal(i18n.productName(product, "de"), product.name);
  assert.match(i18n.voiceInstructions("de", { basket: {} }), /Swiss Standard German/);
  assert.match(i18n.voiceInstructions("en", { basket: {} }), /Always speak English/);
});

test("item offers remain indicative while basket caps and variant prices stay exact", async () => {
  const experience = await import(pathToFileURL(path.join(root, "src/honold-demo/experience.mjs")));
  const shopping = await import(pathToFileURL(path.join(root, "src/honold-demo/shopping.mjs")));
  const chocolate = catalog.products.find((item) => item.productType === "schokolade");
  const offer = experience.itemOffer("chocolate", chocolate);
  assert.equal(offer.eligible, true);
  assert.equal(offer.indicativeSavingsChf, Math.round(chocolate.priceChf * 15) / 100);
  assert.equal(offer.indicativeEffectiveChf, Number((chocolate.priceChf - offer.indicativeSavingsChf).toFixed(2)));
  const expensive = { priceChf: 90.2, productType: "patisserie und torten" };
  assert.equal(experience.itemOffer("regular", expensive).indicativeSavingsChf, 5);
  assert.equal(experience.itemOffer("regular", expensive).indicativeEffectiveChf, 85.2);
  const key = experience.basketKey(chocolate.id, { wrap: "Ribbon", message: "Thank you" });
  assert.deepEqual(experience.parseBasketKey(key).options, { message: "Thank you", wrap: "Ribbon" });
  const summary = shopping.basketSummary({ [key]: 2 }, new Map(catalog.products.map((item) => [item.id, item])));
  assert.equal(summary.items[0].unitPriceChf, chocolate.priceChf + 2.5);
  assert.equal(summary.totalChf, (chocolate.priceChf + 2.5) * 2);
});

test("exact review approval expires, binds to fingerprint, deduplicates, and persists by profile", async () => {
  const experience = await import(pathToFileURL(path.join(root, "src/honold-demo/experience.mjs")));
  const now = Date.parse("2026-09-21T10:00:00Z");
  const fingerprint = experience.reviewFingerprint({ basket: { "255": 1 }, branchId: "erlenbach", slotId: "slot", profileId: "chocolate", exampleTotalChf: 2.46 });
  const reviewId = experience.makeReviewId(fingerprint, now);
  assert.notEqual(reviewId, experience.makeReviewId(fingerprint, now, 1));
  assert.notEqual(experience.pickupCodeForReview(reviewId), experience.pickupCodeForReview(experience.makeReviewId(fingerprint, now, 1)));
  assert.throws(() => experience.approveReview({ fingerprint, reviewId, createdAt: now }, "maybe", now), /Clear approval/);
  assert.throws(() => experience.approveReview({ fingerprint, reviewId, createdAt: now - 301000 }, "approve", now), /expired/);
  const approved = experience.approveReview({ fingerprint, reviewId, createdAt: now }, "approve", now);
  assert.equal(experience.approveReview({ fingerprint, reviewId, createdAt: now }, "confirm", now + 1).approvalId, approved.approvalId);
  const preview = { reviewFingerprint: fingerprint, pickupCode: "H-1234", basket: { "255": 1 }, stage: 0 };
  const once = experience.saveSampleOrder([], approved, preview);
  assert.equal(experience.saveSampleOrder(once, approved, preview).length, 1);
  assert.throws(() => experience.saveSampleOrder([], approved, { ...preview, reviewFingerprint: "changed" }), /no longer matches/);
  const raw = experience.serializeOrdersByProfile({ chocolate: once, regular: [] });
  assert.equal(experience.parseOrdersByProfile(raw).chocolate[0].pickupCode, "H-1234");
  assert.equal(experience.parseOrdersByProfile(raw).chocolate[0].orderId, approved.approvalId);
  assert.deepEqual(experience.parseOrdersByProfile("broken"), {});
});

test("Zurich pickup slots are future quarter hours with same-day and next-day choices", async () => {
  const journey = await import(pathToFileURL(path.join(root, "src/honold-demo/pickupJourney.mjs")));
  const saturdayMorning = Date.parse("2026-09-19T07:02:00Z"); // Saturday 09:02 in Zurich.
  const slots = journey.futureSlots(saturdayMorning, "erlenbach");
  assert.ok(slots.length > 0);
  assert.ok(slots.every((slot) => Number(slot.id) >= saturdayMorning + 30 * 60_000));
  assert.ok(slots.every((slot) => Number(slot.id) % 900_000 === 0));
  assert.ok(slots.every((slot) => {
    const local = journey.zurichParts(Number(slot.id));
    return local.hour >= 8 && local.hour < 19;
  }));
  assert.equal(journey.slotDateId(slots[0].id), "2026-09-19");
  assert.ok(new Set(slots.map((slot) => journey.slotDateId(slot.id))).has("2026-09-20"));
  assert.ok(slots.some((slot) => journey.zurichParts(Number(slot.id)).minute === 15));
  const afterDst = journey.futureSlots(Date.parse("2026-03-29T00:00:00Z"), "erlenbach");
  assert.equal(journey.zurichParts(Number(afterDst[0].id)).hour, 8);
});

test("branch stock and slot capacity block impossible sample pickups", async () => {
  const journey = await import(pathToFileURL(path.join(root, "src/honold-demo/pickupJourney.mjs")));
  const nowMs = Date.parse("2026-09-21T07:00:00Z");
  const slot = journey.futureSlots(nowMs, "erlenbach")[0];
  const differing = catalog.products.find((product) => journey.sampleStock(product.id, "erlenbach") !== journey.sampleStock(product.id, "kuesnacht"));
  assert.ok(differing);
  const low = journey.sampleStock(differing.id, "erlenbach") < journey.sampleStock(differing.id, "kuesnacht") ? "erlenbach" : "kuesnacht";
  const high = low === "erlenbach" ? "kuesnacht" : "erlenbach";
  const requested = journey.sampleStock(differing.id, low) + 1;
  const lowSlot = journey.futureSlots(nowMs, low).find((item) => item.capacity >= requested);
  const highSlot = journey.futureSlots(nowMs, high).find((item) => item.capacity >= requested);
  const basket = { [differing.id]: requested };
  assert.equal(journey.pickupCheck({ basket, branchId: low, slotId: lowSlot?.id, nowMs }).ok, false);
  if (highSlot) assert.equal(journey.pickupCheck({ basket, branchId: high, slotId: highSlot.id, nowMs }).ok, true);
  assert.equal(journey.pickupCheck({ basket: { [differing.id]: 1 }, branchId: "erlenbach", slotId: String(nowMs), nowMs }).ok, false);
  const originallyValid = journey.futureSlots(nowMs, "erlenbach").find((item) => item.capacity >= 1);
  const staleNow = Number(originallyValid.id) - 29 * 60_000;
  assert.equal(journey.pickupCheck({ basket: { [differing.id]: 1 }, branchId: "erlenbach", slotId: originallyValid.id, nowMs: staleNow }).ok, false);
  assert.ok(slot.capacity >= 2);
  const unavailable = catalog.products.find((product) => journey.sampleStock(product.id, "erlenbach") === 0);
  assert.ok(unavailable, "sample model exposes at least one branch-unavailable product");
  assert.equal(journey.pickupCheck({ basket: { [unavailable.id]: 1 }, branchId: "erlenbach", slotId: slot.id, nowMs }).ok, false);
});

test("customer-specific savings preserve public prices and tracker changes only after confirmation", async () => {
  const journey = await import(pathToFileURL(path.join(root, "src/honold-demo/pickupJourney.mjs")));
  const bakery = catalog.products.find((item) => item.productType === "baeckerei");
  const chocolate = catalog.products.find((item) => item.productType === "schokolade");
  const products = new Map(catalog.products.map((item) => [item.id, item]));
  const basket = { [bakery.id]: 1, [chocolate.id]: 1 };
  const summary = (await import(pathToFileURL(path.join(root, "src/honold-demo/shopping.mjs")))).basketSummary(basket, products);
  const guest = journey.offerQuote("guest", summary, products);
  const regular = journey.offerQuote("regular", summary, products);
  const chocolateOffer = journey.offerQuote("chocolate", summary, products);
  assert.equal(guest.savingsChf, 0);
  assert.equal(regular.savingsChf, Math.min(5, Math.round(bakery.priceChf * 10) / 100));
  assert.equal(chocolateOffer.savingsChf, Math.min(8, Math.round(chocolate.priceChf * 15) / 100));
  assert.equal(regular.subtotalChf, summary.totalChf);
  assert.equal(regular.exampleTotalChf, Number((summary.totalChf - regular.savingsChf).toFixed(2)));
  const largeBakeryBasket = { [bakery.id]: 24 };
  const largeBakerySummary = (await import(pathToFileURL(path.join(root, "src/honold-demo/shopping.mjs")))).basketSummary(largeBakeryBasket, products);
  assert.equal(journey.offerQuote("regular", largeBakerySummary, products).savingsChf, 5);
  const largeChocolateBasket = { [chocolate.id]: 24 };
  const largeChocolateSummary = (await import(pathToFileURL(path.join(root, "src/honold-demo/shopping.mjs")))).basketSummary(largeChocolateBasket, products);
  assert.equal(journey.offerQuote("chocolate", largeChocolateSummary, products).savingsChf, 8);
  const nowMs = Date.parse("2026-09-21T07:00:00Z");
  const slot = journey.futureSlots(nowMs, "erlenbach").find((item) => item.capacity >= 2);
  const preview = journey.makePreview({ basket, branchId: "erlenbach", slotId: slot.id, profileId: "regular", quote: regular, nowMs });
  assert.equal(journey.previewStatus(preview), "Confirmed");
  assert.equal(journey.previewStatus(journey.advancePreview(preview)), "Preparing");
  assert.equal(journey.previewStatus(journey.advancePreview(journey.advancePreview(preview))), "Ready");
  assert.equal(journey.previewStatus(journey.advancePreview(journey.advancePreview(journey.advancePreview(preview)))), "Ready");
  assert.match(preview.pickupCode, /^H-\d{4}$/);
  assert.equal(preview.simulated, true);
});

test("delivery validation and order QR identities stay bound to the confirmed order", async () => {
  const journey = await import(pathToFileURL(path.join(root, "src/honold-demo/pickupJourney.mjs")));
  const qr = await import(pathToFileURL(path.join(root, "src/honold-demo/orderQr.mjs")));
  const nowMs = Date.parse("2026-09-21T07:00:00Z");
  const product = catalog.products.find((item) => journey.sampleStock(item.id, "erlenbach") > 0);
  const basket = { [product.id]: 1 };
  const window = journey.futureDeliveryWindows(nowMs)[0];
  assert.equal(journey.fulfillmentCheck({ basket, mode: "delivery", branchId: "erlenbach", address: "", deliveryWindowId: window.id, nowMs }).ok, false);
  assert.equal(journey.fulfillmentCheck({ basket, mode: "delivery", branchId: "erlenbach", address: journey.DEMO_DELIVERY_ADDRESS, deliveryWindowId: window.id, nowMs }).ok, true);
  const preview = journey.makePreview({ basket, mode: "delivery", branchId: "erlenbach", address: journey.DEMO_DELIVERY_ADDRESS, deliveryWindowId: window.id, profileId: "guest", quote: { exampleTotalChf: product.priceChf }, nowMs });
  assert.equal(journey.previewStatus(preview), "Confirmed");
  assert.equal(journey.previewStatus(journey.advancePreview(preview)), "Packing");
  assert.equal(journey.previewStatus(journey.advancePreview(journey.advancePreview(preview))), "On the way");
  const identity = qr.orderIdentity({ ...preview, orderId: "order-123" });
  const matrix = qr.qrMatrix(identity);
  assert.match(identity, /^HONOLD\|order-123\|H-\d{4}\|erlenbach\|null$/);
  assert.equal(matrix.length, 33);
  assert.ok(matrix.every((row) => row.length === 33));
  assert.notDeepEqual(matrix, qr.qrMatrix(identity.replace("order-123", "order-124")));
});
