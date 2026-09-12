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
  assert.match(client, /review_demo_order/);
  assert.match(client, /confirm_demo_order/);
  assert.match(client, /VOICE_DEMO_DURATION_MS = 5 \* 60 \* 1000/);
  assert.match(client, /submittedExternally:\s*false/);
  assert.doesNotMatch(client, /Fragrances under CHF 100/);
  assert.doesNotMatch(client, /promptRow/);
  assert.match(client, /find_replay_flight/);
  assert.match(client, /propose_replay_flight/);
  assert.match(client, /confirm_replay_flight/);
  assert.match(client, /candidate\?\.id === flight_id/);
  assert.match(client, /travel\.selectedFlight \|\| pendingFlight \|\| flightLookupActive/);
  assert.match(client, /assess_journey/);
  assert.match(client, /Welcome the traveler to Avolta now/);
  assert.match(client, /finding something they will love and arranging the easiest supported way to get it/);
  assert.match(client, /Do not mention the demo day, replay, simulation, data, tools or setup/);
  assert.match(client, /without repeating the welcome/);
  assert.match(client, /If the traveler asks for a product before flight or location is known/);
  assert.match(client, /Reuse volunteered context instead of repeating the question/);
  assert.doesNotMatch(client, /In one short sentence, say this is a replayed Zürich Airport demo day with simulated fulfillment/);
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
  const css = fs.readFileSync(path.join(feature, "avoltaVoiceShop.module.css"), "utf8");
  const page = fs.readFileSync(path.join(root, "app", "avolta-demo", "page.jsx"), "utf8");
  const renderedClient = client.slice(client.lastIndexOf("\n  return ("));
  const provenance = fs.readFileSync(path.join(root, "docs", "avolta-design-reference.md"), "utf8");
  assert.match(client, /useState\(\(\) => products\.map\(\(product\) => product\.id\)\)/);
  assert.match(client, />All products</);
  assert.match(client, /"Talk to Order"/);
  assert.match(client, /showFullCollection/);
  assert.match(client, /currentViewportIds/);
  assert.match(client, /const viewportIds = ids\.slice\(0, 4\)/);
  assert.match(client, /IMAGE_WAIT_MS = 1800/);
  assert.match(client, /className=\{styles\.productSurface\}/);
  assert.match(client, /className=\{styles\.controlDock\}/);
  assert.match(client, /hasBasket && <button className=\{styles\.basketTrigger\}/);
  assert.doesNotMatch(client, /className=\{styles\.(?:shopIntro|catalogueTop|categories|bagButton)\}/);
  assert.doesNotMatch(client, />205 products<|Zürich Airport selection|>What would you like to pick up\?</);
  assert.match(css, /grid-template-columns:\s*repeat\(5,/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /@media \(max-width: 340px\)[\s\S]*grid-template-columns:\s*repeat\(2,/);
  assert.match(provenance, /8ae73af3fbe60fa142789d12bac1dfd4a359bc33/);
  assert.doesNotMatch(client, /className=\{styles\.(?:transcript|travelBar|journeyPanel|sidePanel|sourceLink)\}/);
  assert.doesNotMatch(client, /session\.on\("history_updated"/);
  assert.doesNotMatch(client, /Today at Zürich Airport|Journey not assessed|Security \{/);
  assert.doesNotMatch(client, /Terminal 1/);
  assert.doesNotMatch(client, /className=\{styles\.(?:headerActions|cardActions|modalBackdrop)\}/);
  assert.match(client, />Departures</);
  assert.match(client, />Your flight\?</);
  assert.match(client, /data-flight-state=\{flightDisplayState\}/);
  assert.match(client, /setInterval\([^,]+, 5000\)/);
  assert.match(client, /voiceStatus !== "idle" \|\| travel\.selectedFlight \|\| pendingFlight/);
  assert.match(css, /@keyframes departureSwap/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(renderedClient, /Awaiting flight confirmation|Demo day ·|Avolta concept|Simulated gate delivery|Simulated collection|Review demo order|Demo order review|Confirm demo order|Estimated demo time|simulated fulfillment/);
  assert.doesNotMatch(renderedClient, /<span data-active=\{travel\.stage === "unknown"\}>Unknown<\/span>/);
  assert.match(client, /travel\.stage !== "unknown"/);
  assert.match(client, /data-current=\{index === orderState\.stateIndex\}/);
  assert.doesNotMatch(renderedClient, /product\.promotionEvidence && <i>/);
  assert.match(renderedClient, /selectedProduct\.promotionEvidence && <em>/);
  assert.doesNotMatch(page, /concept|preview|Enter the experience|AVOLTA_DEMO_PASSCODE/i);
  assert.match(client, /data-has-order=\{Boolean\(order\)\}/);
  assert.doesNotMatch(client, />Reset demo</);
  assert.match(client, /!session \|\| session\.transport\.status !== "connected" \|\| isMuted \|\| voiceStatus !== "listening"/);
  assert.match(client, /announcedOrderStatesRef/);
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

test("captured flight fixture is complete, immutable and never fetched at runtime", async () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(feature, "flight-day.fixture.json"), "utf8"));
  const server = fs.readFileSync(path.join(feature, "liveContextServer.mjs"), "utf8");
  const route = fs.readFileSync(path.join(root, "app", "api", "avolta-demo", "journey-context", "route.js"), "utf8");
  assert.equal(fixture.fixtureVersion, "zrh-departures-2026-09-12-v1");
  assert.equal(fixture.provenance.serviceDate, "2026-09-12");
  assert.equal(fixture.provenance.timeZone, "Europe/Zurich");
  assert.equal(fixture.flights.length, 393);
  assert.deepEqual(fixture.provenance.fieldCoverage, { scheduledDeparture: 393, estimatedDeparture: 206, actualDeparture: 342, boardingTime: 328, gate: 328, codeshare: 225 });
  assert.doesNotMatch(`${server}\n${route}`, /fetch\(|unstable_cache|revalidate/);
  const context = await import(pathToFileURL(path.join(feature, "liveContextServer.mjs")));
  assert.equal(context.getReplayJourneyContext(new Date("2026-09-12T10:00:00Z")).departureCount, 393);
  assert.equal(context.getReplayJourneyContext(new Date("2026-09-12T10:00:00Z")).sources.runtimeNetwork, false);
});

test("one Zurich replay clock maps morning and evening, survives refresh, observes DST and advances past midnight", async () => {
  const replay = await import(pathToFileURL(path.join(feature, "flightReplay.mjs")));
  assert.equal(replay.mapZurichTimeOfDayToFixture(new Date("2026-07-01T06:15:30Z"), "2026-09-12").toISOString(), "2026-09-12T06:15:30.000Z");
  assert.equal(replay.mapZurichTimeOfDayToFixture(new Date("2026-12-01T19:45:00Z"), "2026-09-12").toISOString(), "2026-09-12T18:45:00.000Z");
  assert.equal(replay.nextZurichMidnight(new Date("2026-03-28T12:00:00Z")).toISOString(), "2026-03-28T23:00:00.000Z");
  assert.equal(replay.nextZurichMidnight(new Date("2026-03-29T12:00:00Z")).toISOString(), "2026-03-29T22:00:00.000Z");
  assert.equal(replay.nextZurichMidnight(new Date("2026-10-25T12:00:00Z")).toISOString(), "2026-10-25T23:00:00.000Z");
  const anchor = replay.createReplayAnchor({ fixtureVersion: "v1", serviceDate: "2026-09-12", realNow: new Date("2030-01-01T10:00:00Z"), explicitTime: "23:59:00" });
  const restored = replay.createReplayAnchor({ fixtureVersion: "v1", serviceDate: "2026-09-12", realNow: new Date("2030-01-01T10:01:00Z"), storedAnchor: anchor });
  assert.strictEqual(restored, anchor);
  assert.equal(replay.replayNow(anchor, new Date("2030-01-01T10:00:30Z")).toISOString(), "2026-09-12T21:59:30.000Z");
  assert.equal(replay.replayClockState(anchor, new Date("2030-01-01T10:02:00Z")).scheduleEnded, true);
});

test("flight replay matches codeshares and ambiguity while keeping source observations separate", async () => {
  const replay = await import(pathToFileURL(path.join(feature, "flightReplay.mjs")));
  const fixture = JSON.parse(fs.readFileSync(path.join(feature, "flight-day.fixture.json"), "utf8"));
  const flights = replay.normalizeFixtureFlights(fixture);
  assert.equal(replay.matchFlights(flights, "LX 8402").matches[0].flightNumber, "WK402");
  assert.equal(replay.matchFlights(flights, "London").ambiguous, true);
  const previews = replay.illustrativeFlights(flights, new Date("2026-09-12T06:00:00Z"), 4);
  assert.ok(previews.every((flight) => new Date(flight.scheduledDeparture).getTime() >= new Date("2026-09-12T06:20:00Z").getTime()));
  assert.ok(previews.every((flight) => !flight.boardingTime || new Date(flight.boardingTime).getTime() <= new Date(flight.scheduledDeparture).getTime()));
  const missing = { ...flights[0], boardingTime: null, gate: null };
  assert.equal(replay.boardingCountdown(missing, new Date("2026-09-12T01:00:00Z")).known, false);
  assert.equal(replay.boardingCountdown(missing, new Date("2026-09-12T01:00:00Z")).label, "Boarding time unavailable");
  const capturedDeparted = { ...flights[0], scheduledDeparture: "2026-09-12T12:00:00Z", boardingTime: "2026-09-12T11:30:00Z", capturedObservation: { statusText: "Departed", actualDeparture: "2026-09-12T12:04:00Z" } };
  assert.equal(replay.replayFlightStatus(capturedDeparted, new Date("2026-09-12T08:00:00Z")).label, "Scheduled");
  const cancelled = { ...capturedDeparted, simulationEvents: [{ type: "cancelled", at: "2026-09-12T07:00:00Z" }] };
  assert.equal(replay.replayFlightStatus(cancelled, new Date("2026-09-12T08:00:00Z")).isCancelled, true);
  assert.equal(replay.boardingCountdown(capturedDeparted, new Date("2026-09-12T13:00:00Z")).seconds, 0);
  assert.equal(replay.formatRemaining(29), "<1 min");
  assert.equal(replay.formatRemaining(60), "1 min");
  assert.equal(replay.formatRemaining(6898), "1h 55m");
});

test("journey and simulated order paths share the replay clock and announce meaningful changes once", async () => {
  const replay = await import(pathToFileURL(path.join(feature, "flightReplay.mjs")));
  const flight = { id: "f", flightNumber: "LX1", destination: "London", scheduledDeparture: "2026-09-12T13:00:00Z", boardingTime: "2026-09-12T12:20:00Z", gate: "E52" };
  const now = new Date("2026-09-12T11:00:00Z");
  assert.equal(replay.assessReplayJourney({ stage: "past_security", flight }, now).outcome, "explore");
  assert.equal(replay.normalizeJourneyStage("near_gate"), "at_gate");
  assert.equal(replay.normalizeJourneyStage("at_airport"), "at_airport");
  assert.equal(replay.recommendFulfillment({ stage: "at_gate", flight, demoNow: now }).method, "gate_delivery");
  assert.equal(replay.recommendFulfillment({ stage: "past_security", flight, demoNow: now }).method, "collection");
  assert.equal(replay.recommendFulfillment({ stage: "at_gate", flight: { ...flight, boardingTime: "2026-09-12T11:08:00Z" }, demoNow: now }).method, "none");
  const delivery = { confirmedAtDemo: now.toISOString(), fulfillment: { method: "gate_delivery" } };
  assert.equal(replay.orderProgress(delivery, new Date("2026-09-12T11:02:00Z")).state, "Ready");
  assert.equal(replay.orderProgress(delivery, new Date("2026-09-12T11:06:00Z")).state, "Arriving");
  assert.equal(replay.orderProgress(delivery, new Date("2026-09-12T11:08:00Z")).state, "Delivered");
  const collection = { confirmedAtDemo: now.toISOString(), fulfillment: { method: "collection" } };
  assert.equal(replay.orderProgress(collection, new Date("2026-09-12T11:04:00Z")).state, "Ready for pickup");
  assert.equal(replay.orderProgress({ ...collection, collectedAtDemo: "2026-09-12T11:05:00Z" }, new Date("2026-09-12T11:05:00Z")).state, "Collected");
  assert.equal(replay.nextMeaningfulOrderAnnouncement("Preparing", "Ready", []), "Ready");
  assert.equal(replay.nextMeaningfulOrderAnnouncement("Preparing", "Ready", ["Ready"]), null);
  assert.equal(replay.nextMeaningfulOrderAnnouncement("Ready", "On the way", []), null);
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
