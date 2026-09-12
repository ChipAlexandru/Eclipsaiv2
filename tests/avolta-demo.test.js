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
  assert.equal(catalog.products.length, 205);
  assert.deepEqual(report.failures, []);
  assert.ok(Object.values(report.checks).every(Boolean));
  assert.deepEqual(report.extraction.categories, {
    "Fragrance": 50, "Beauty & skincare": 50, "Spirits": 50, "Swiss chocolate": 50, "Swiss gifts": 5,
  });
  assert.equal(report.coverage.before.productCount, 45);
  assert.equal(report.coverage.after.productCount, 205);
  assert.ok(report.coverage.after.brandCount >= 50);

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

  const transcript = shopping.transcriptFromHistory([
    { type: "message", role: "user", itemId: "hidden", content: [{ text: "[[opening-instruction]] internal" }] },
    { type: "message", role: "assistant", itemId: "welcome", content: [{ transcript: "Where are you flying today?" }] },
  ]);
  assert.deepEqual(transcript, [{ id: "welcome", role: "assistant", text: "Where are you flying today?" }]);
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
  assert.doesNotMatch(client, /Fragrances under CHF 100/);
  assert.doesNotMatch(client, /promptRow/);
  assert.match(client, /find_today_flight/);
  assert.match(client, /assess_journey/);
  assert.match(token, /hasAccess\(cookieStore\)/);
  assert.match(token, /MAX_STARTS = 12/);
  assert.match(token, /process\.env\.AVOLTA_OPENAI_API_KEY/);
  assert.doesNotMatch(token, /process\.env\.OPENAI_API_KEY/);
  assert.match(token, /process\.env\.AVOLTA_OPENAI_REALTIME_MODEL/);
  assert.doesNotMatch(token, /console\.log\([^)]*AVOLTA_OPENAI_API_KEY/);
  assert.match(access, /httpOnly:\s*true/);
  assert.match(page, /robots:\s*\{ index: false, follow: false/);
  assert.match(robots, /\/avolta-demo/);
});

test("Avolta shopper UX is simple, product-led, complete and keeps operational context off-screen", () => {
  const client = fs.readFileSync(path.join(feature, "AvoltaVoiceShop.jsx"), "utf8");
  assert.match(client, /useState\(\(\) => products\.map\(\(product\) => product\.id\)\)/);
  assert.match(client, /See all \{products\.length\}/);
  assert.match(client, /showFullCollection/);
  assert.match(client, /products\.filter\(\(product\) => product\.productType === category\)/);
  assert.match(client, /currentViewportIds/);
  assert.match(client, /const viewportIds = ids\.slice\(0, 4\)/);
  assert.match(client, /IMAGE_WAIT_MS = 1800/);
  assert.doesNotMatch(client, /className=\{styles\.(?:transcript|travelBar|journeyPanel|sidePanel|sourceLink)\}/);
  assert.doesNotMatch(client, /session\.on\("history_updated"/);
  assert.doesNotMatch(client, /Today at Zürich Airport|Journey not assessed|Security \{/);
  assert.doesNotMatch(client, /Terminal 1/);
  assert.doesNotMatch(client, /className=\{styles\.(?:headerActions|cardActions|modalBackdrop)\}/);
  assert.match(client, /const selectProduct = useCallback\(\(productId\) => \{[^}]*setSelectedId\(productId\)/);
  assert.doesNotMatch(client, /const selectProduct = useCallback\(\(productId\) => \{[^}]*setActivePanel/);
  assert.match(client, /setActivePanel\("detail"\)/);
  assert.match(client, /setActivePanel\("basket"\)/);
});

test("Avolta voice output uses an attached audio element and records playback evidence", () => {
  const client = fs.readFileSync(path.join(feature, "AvoltaVoiceShop.jsx"), "utf8");
  assert.match(client, /<audio ref=\{audioOutputRef\}/);
  assert.match(client, /new OpenAIRealtimeWebRTC\(\{ audioElement/);
  assert.match(client, /peerConnection\.addEventListener\("track"/);
  assert.match(client, /await audio\.play\(\)/);
  assert.match(client, /entry\.type === "inbound-rtp" && entry\.kind === "audio"/);
  assert.match(client, /data-audio-track=/);
  assert.match(client, /data-audio-bytes=/);
  assert.match(client, /data-audio-energy=/);
  assert.match(client, /data-audio-playback=/);
});

test("today flight matching handles codeshares, ambiguity and missing gate without invention", async () => {
  const live = await import(pathToFileURL(path.join(feature, "liveContext.mjs")));
  const fetchedAt = new Date("2026-09-11T10:00:00Z");
  const flights = live.normalizeFlights([
    { id: 1, flightType: "D", SDT: "2026-09-11", STD: "2026-09-11T12:00:00Z", FLC: "LX", FLN: "64", codeShare: "UA 9720", PDS: "MIA", cityEn: "Miami", EBT: "2026-09-11T11:20:00Z", GAT: "E52", isSchengen: false, statusCode: 0 },
    { id: 2, flightType: "D", SDT: "2026-09-11", STD: "2026-09-11T13:00:00Z", FLC: "LX", FLN: "66", PDS: "MIA", cityEn: "Miami", statusCode: 0 },
    { id: 3, flightType: "D", SDT: "2026-09-12", STD: "2026-09-12T12:00:00Z", FLC: "LX", FLN: "67", cityEn: "Miami" },
  ], { fetchedAt, serviceDate: "2026-09-11" });
  assert.equal(flights.length, 2);
  assert.equal(live.matchFlights(flights, "UA 9720").matches[0].flightNumber, "LX64");
  assert.equal(live.matchFlights(flights, "Miami").ambiguous, true);
  assert.equal(live.matchFlights(flights, "LX66").matches[0].gate, null);
});

test("journey context expires at Zurich midnight across DST and distinguishes stale data", async () => {
  const live = await import(pathToFileURL(path.join(feature, "liveContext.mjs")));
  assert.equal(live.nextZurichMidnight(new Date("2026-03-28T12:00:00Z")).toISOString(), "2026-03-28T23:00:00.000Z");
  assert.equal(live.nextZurichMidnight(new Date("2026-03-29T12:00:00Z")).toISOString(), "2026-03-29T22:00:00.000Z");
  assert.equal(live.nextZurichMidnight(new Date("2026-10-25T12:00:00Z")).toISOString(), "2026-10-25T23:00:00.000Z");
  assert.equal(live.freshnessStatus("2026-09-11T10:00:00Z", new Date("2026-09-11T10:05:00Z")), "live");
  assert.equal(live.freshnessStatus("2026-09-11T10:00:00Z", new Date("2026-09-11T10:07:00Z")), "stale");
  assert.equal(live.freshnessStatus("2026-09-10T21:59:00Z", new Date("2026-09-11T10:00:00Z")), "unavailable");
});

test("deterministic journey assessment covers explore, quick pickup and gate priority without adding delay", async () => {
  const live = await import(pathToFileURL(path.join(feature, "liveContext.mjs")));
  const now = new Date("2026-09-11T10:00:00Z");
  const queues = live.normalizeQueues({ security: { maxWaitingTime: "4" }, checkin: { checkin: [{ economy: "1-3" }] }, passport: { passportControl: [{ waitingTime: "1-3" }] } }, { fetchedAt: now });
  const baseFlight = { flightNumber: "LX64", scheduledDeparture: "2026-09-11T13:00:00Z", estimatedDeparture: "2026-09-11T15:00:00Z", boardingTime: "2026-09-11T12:20:00Z", gate: "E52", isSchengen: false };
  assert.equal(live.assessJourney({ stage: "airside", flight: baseFlight, queues }, now).outcome, "explore");
  assert.equal(live.assessJourney({ stage: "on_the_way", flight: baseFlight, arrivalEstimate: "2026-09-11T11:00:00Z", needsCheckin: true, queues }, now).outcome, "quick_pickup");
  assert.equal(live.assessJourney({ stage: "near_gate", flight: { ...baseFlight, boardingTime: "2026-09-11T10:12:00Z" }, queues }, now).outcome, "prioritize_gate");
  const delayed = live.assessJourney({ stage: "airside", flight: { ...baseFlight, boardingTime: null }, minutesAvailable: 10, queues }, now);
  assert.equal(delayed.outcome, "prioritize_gate");
  assert.match(delayed.method, /later estimated departure never adds shopping time/i);
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
