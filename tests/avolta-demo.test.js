const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const feature = path.join(root, "src", "avolta-demo");
const catalog = JSON.parse(fs.readFileSync(path.join(feature, "catalog.json"), "utf8"));
const report = JSON.parse(fs.readFileSync(path.join(feature, "catalog-report.json"), "utf8"));

test("curated Zürich Duty Free catalog is source-backed and image-complete", () => {
  assert.equal(catalog.source.currency, "CHF");
  assert.match(catalog.source.storefront, /^https:\/\/zurich\.shopdutyfree\.com\/de\/48/);
  assert.match(catalog.source.note, /not live physical-store stock/i);
  assert.equal(catalog.products.length, 45);
  assert.deepEqual(report.failures, []);
  assert.ok(Object.values(report.checks).every(Boolean));
  assert.deepEqual(report.extraction.categories, {
    "Fragrance": 10, "Beauty & makeup": 10, "Spirits": 10, "Swiss chocolate": 10, "Swiss gifts": 5,
  });

  const ids = new Set();
  for (const product of catalog.products) {
    assert.ok(product.id && product.name && product.vendor && product.variant && product.sourceUrl);
    assert.equal(product.priceCurrency, "CHF");
    assert.ok(Number.isFinite(product.priceChf));
    assert.match(product.sourceUrl, /^https:\/\/zurich\.shopdutyfree\.com\/de\/48\//);
    assert.match(product.capturedAt, /2026-09-11/);
    assert.match(product.availabilityBasis, /not live physical-store inventory/i);
    assert.ok(!ids.has(product.id)); ids.add(product.id);
    assert.ok(product.images[0].sourceUrl.startsWith("https://images.shopdutyfree.com/"));
    assert.ok(fs.statSync(path.join(root, "public", product.images[0].localPath)).size > 256);
    assert.doesNotMatch(`${product.name} ${product.productType} ${product.tags.join(" ")}`, /tobacco|cigar|cigarette/i);
  }
});

test("shopping helpers support exploration, context depth, basket totals and reservation invalidation", async () => {
  const shopping = await import(pathToFileURL(path.join(feature, "shopping.mjs")));
  assert.ok(shopping.searchCatalog(catalog.products, "fragrance", 20).length >= 10);
  const affordableChocolate = shopping.searchCatalog(catalog.products, "chocolate under 50", 20);
  assert.ok(affordableChocolate.some((p) => p.productType === "Swiss chocolate"));
  assert.ok(affordableChocolate.every((p) => p.priceChf <= 50));
  const affordableFragrance = shopping.searchCatalog(catalog.products, "Fragrances under CHF 100", 20);
  assert.ok(affordableFragrance.length > 0);
  assert.ok(affordableFragrance.every((p) => p.productType === "Fragrance" && p.priceChf <= 100));
  assert.ok(shopping.searchCatalog(catalog.products, "Swiss gift", 20).length >= 5);
  assert.equal(shopping.resultsLimitForTravel({ minutesAvailable: "20" }), 4);
  assert.equal(shopping.resultsLimitForTravel({ minutesAvailable: "60" }), 12);

  const validIds = new Set(catalog.products.map((p) => p.id));
  const product = catalog.products[0];
  const two = shopping.changeQuantity({}, product.id, 2, "set", validIds);
  const three = shopping.changeQuantity(two, product.id, 1, "add", validIds);
  const summary = shopping.basketSummary(three, new Map(catalog.products.map((p) => [p.id, p])));
  assert.equal(summary.itemCount, 3);
  assert.equal(summary.total, Number((product.priceChf * 3).toFixed(2)));
  assert.throws(() => shopping.changeQuantity({}, "invented", 1, "add", validIds), /Unknown product/);

  const future = new Date(Date.now() + 48 * 36e5).toISOString();
  const sameDay = new Date(Date.now() + 1 * 36e5).toISOString();
  const past = new Date(Date.now() - 1 * 36e5).toISOString();
  assert.equal(shopping.departureEligibility(future).eligible, true);
  assert.equal(shopping.departureEligibility(sameDay).eligible, true);
  assert.equal(shopping.departureEligibility(past).eligible, false);
  const a = shopping.reservationFingerprint(two, { departureDateTime: future, gate: "A", destination: "Paris" });
  const b = shopping.reservationFingerprint(three, { departureDateTime: future, gate: "A", destination: "Paris" });
  assert.notEqual(a, b);
});

test("Avolta feature is isolated, protected and keeps reservation confirmation explicit", () => {
  const client = fs.readFileSync(path.join(feature, "AvoltaVoiceShop.jsx"), "utf8");
  const page = fs.readFileSync(path.join(root, "app", "avolta-demo", "page.jsx"), "utf8");
  const token = fs.readFileSync(path.join(root, "app", "api", "avolta-demo", "realtime-token", "route.js"), "utf8");
  const access = fs.readFileSync(path.join(root, "app", "api", "avolta-demo", "access", "route.js"), "utf8");
  const robots = fs.readFileSync(path.join(root, "app", "robots.js"), "utf8");

  for (const source of [client, page, token, access]) assert.doesNotMatch(source, /src\/juliette-demo|app\/juliette-demo/);
  assert.doesNotMatch(client, /process\.env\.OPENAI_API_KEY/);
  assert.match(client, /needsApproval:\s*true/);
  assert.match(client, /review_departure_reservation/);
  assert.match(client, /confirm_departure_reservation/);
  assert.match(client, /VOICE_DEMO_DURATION_MS = 5 \* 60 \* 1000/);
  assert.match(client, /submittedExternally:\s*false/);
  assert.match(token, /hasAccess\(cookieStore\)/);
  assert.match(token, /MAX_STARTS = 5/);
  assert.match(token, /process\.env\.AVOLTA_OPENAI_API_KEY/);
  assert.doesNotMatch(token, /process\.env\.OPENAI_API_KEY/);
  assert.match(token, /process\.env\.AVOLTA_OPENAI_REALTIME_MODEL/);
  assert.doesNotMatch(token, /console\.log\([^)]*AVOLTA_OPENAI_API_KEY/);
  assert.match(access, /httpOnly:\s*true/);
  assert.match(page, /robots:\s*\{ index: false, follow: false/);
  assert.match(robots, /\/avolta-demo/);
});

test("Avolta Realtime model configuration reuses the proven mini model and fails closed", async () => {
  const config = await import(pathToFileURL(path.join(feature, "realtimeConfig.mjs")));
  assert.equal(config.resolveAvoltaRealtimeModel(), "gpt-realtime-2.1-mini");
  assert.equal(config.resolveAvoltaRealtimeModel("gpt-realtime-2.1-mini"), "gpt-realtime-2.1-mini");
  assert.equal(config.resolveAvoltaRealtimeModel("gpt-realtime-2.1"), "gpt-realtime-2.1");
  assert.throws(() => config.resolveAvoltaRealtimeModel("gpt-realtime"), /Unsupported/);
  assert.equal(config.isAllowedAvoltaRealtimeModel("gpt-realtime-2.1"), true);
  assert.equal(config.isAllowedAvoltaRealtimeModel("gpt-realtime"), false);
});

test("Avolta paths contain no Juliette or bakery-specific copy", () => {
  const files = [
    ...fs.readdirSync(feature).filter((name) => /\.(jsx|mjs|json|md|css)$/.test(name) && name !== "IMPORT_MANIFEST.md").map((name) => path.join(feature, name)),
    path.join(root, "app", "avolta-demo", "page.jsx"),
    path.join(root, "app", "api", "avolta-demo", "access", "route.js"),
    path.join(root, "app", "api", "avolta-demo", "realtime-token", "route.js"),
  ];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(source, /Juliette|Erlenbach|croissant|bakery/i, file);
  }
});
