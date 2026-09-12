const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src", "juliette-demo", "catalog.json"), "utf8"));
const report = JSON.parse(fs.readFileSync(path.join(root, "src", "juliette-demo", "catalog-report.json"), "utf8"));

test("public catalogue extraction is complete and internally consistent", () => {
  assert.equal(catalog.source.currency, "CHF");
  assert.match(catalog.source.note, /not physical Erlenbach stock/i);
  assert.equal(catalog.products.length, report.extraction.listedProductCount);
  assert.equal(report.extraction.listedProductCount, report.extraction.feedProductCount);
  assert.equal(report.extraction.mappedProductCount, report.extraction.listedProductCount);
  assert.equal(report.extraction.collectionPagesFetched, 11);
  assert.equal(report.extraction.downloadedGalleryImageCount, report.extraction.expectedGalleryImageCount);
  assert.deepEqual(report.failures, []);
  assert.ok(Object.values(report.checks).every(Boolean));

  const ids = new Set();
  let imageCount = 0;
  for (const product of catalog.products) {
    assert.ok(product.id && product.handle && product.name && product.sourceUrl);
    assert.equal(product.priceCurrency, "CHF");
    assert.ok(Number.isFinite(product.priceChf));
    assert.ok(product.variants.length >= 1);
    assert.ok(product.images.length >= 1);
    assert.ok(!ids.has(product.id));
    ids.add(product.id);
    for (const image of product.images) {
      imageCount += 1;
      assert.ok(image.sourceUrl.startsWith("https://"));
      assert.ok(fs.statSync(path.join(root, "public", image.localPath)).size > 256);
    }
  }
  assert.equal(imageCount, report.extraction.downloadedGalleryImageCount);
});

test("shopping helpers support touch-relative selection and bounded basket changes", async () => {
  const shopping = await import(pathToFileURL(path.join(root, "src", "juliette-demo", "shopping.mjs")));
  const croissants = shopping.searchCatalog(catalog.products, "croissant", 6);
  assert.ok(croissants.length >= 4);
  assert.ok(croissants.every((product) => /croissant/i.test(`${product.name} ${product.description}`)));
  assert.ok(shopping.searchCatalog(catalog.products, "bread", 6).some((product) => /brot|baguette/i.test(product.name)));
  assert.ok(shopping.searchCatalog(catalog.products, "sweet pastry", 6).length >= 4);

  const product = croissants[0];
  const validIds = new Set(catalog.products.map((item) => item.id));
  const withTwo = shopping.changeBasket({}, product.id, 2, "set", validIds);
  assert.equal(withTwo[product.id], 2);
  const withThree = shopping.changeBasket(withTwo, product.id, 1, "add", validIds);
  assert.equal(withThree[product.id], 3);
  const summary = shopping.basketSummary(withThree, new Map(catalog.products.map((item) => [item.id, item])));
  assert.equal(summary.itemCount, 3);
  assert.equal(summary.totalChf, Number((product.priceChf * 3).toFixed(2)));
  assert.throws(() => shopping.changeBasket({}, "invented-product", 1, "add", validIds), /Unknown product/);
});

test("Realtime credentials remain server-side and the full-catalogue surface keeps one pickup-preview confirmation", () => {
  const clientSource = fs.readFileSync(path.join(root, "src", "juliette-demo", "JulietteVoiceShop.jsx"), "utf8");
  const clientStyles = fs.readFileSync(path.join(root, "src", "juliette-demo", "julietteVoiceShop.module.css"), "utf8");
  const brandRoot = path.join(root, "public", "juliette-demo", "brand");
  const logoSource = fs.readFileSync(path.join(brandRoot, "juliette-pain-damour.svg"), "utf8");
  const stockAdapter = fs.readFileSync(path.join(root, "src", "juliette-demo", "stockAdapter.mjs"), "utf8");
  const pageSource = fs.readFileSync(path.join(root, "app", "juliette-demo", "page.jsx"), "utf8");
  const tokenRoute = fs.readFileSync(path.join(root, "app", "api", "juliette-demo", "realtime-token", "route.js"), "utf8");

  assert.doesNotMatch(clientSource, /process\.env\.OPENAI_API_KEY/);
  assert.doesNotMatch(clientSource, /needsApproval:\s*true/);
  assert.match(clientSource, /awaitingTouchConfirmation:\s*true/);
  assert.match(clientSource, /Confirm pickup preview/);
  assert.doesNotMatch(`${clientSource}\n${stockAdapter}`, /JUL-DEMO|Tomorrow, 10:30/);
  assert.match(clientSource, /No real transaction is possible/);
  assert.match(clientSource, /belowFoldProductIds/);
  assert.match(clientSource, /useState\(\(\) => products\.map\(\(product\) => product\.id\)\)/);
  assert.match(clientSource, /showAllProducts[\s\S]*products\.map\(\(product\) => product\.id\)/);
  assert.doesNotMatch(clientSource, /validProductIds\.has\(id\)\)\.slice/);
  assert.match(clientSource, />All products</);
  assert.doesNotMatch(clientSource, /OpenAI Realtime|WebRTC|Demo:\s*\{/);
  assert.doesNotMatch(clientSource, /What would you like today\?|Demo ·|Demo only|Five-minute demo|mobile demo|This is a demonstration|simulated pickup/i);
  assert.doesNotMatch(pageSource, /title:\s*[^\n]*demo|description:\s*[^\n]*simulat/i);
  assert.match(clientSource, /VOICE_SESSION_DURATION_MS = 5 \* 60 \* 1000/);
  assert.match(clientSource, /window\.setTimeout\(\(\) => \{[\s\S]*closeVoiceSession\("Talk to Juliette"\)/);
  assert.match(clientSource, /session\.on\("audio_start"[\s\S]*setVoiceStatus\("speaking"\)/);
  assert.match(clientSource, /session\.on\("audio_stopped"[\s\S]*setVoiceStatus\(session\.muted \? "muted" : "listening"\)/);
  assert.match(clientSource, /className=\{styles\.voiceBars\}[\s\S]*className=\{styles\.connectingIndicator\}/);
  assert.match(clientSource, /aria-label="End voice session"/);
  assert.match(clientSource, /role="status" aria-live="polite"/);
  assert.match(clientSource, /juliette-pain-damour\.svg/);
  assert.match(clientSource, /className=\{styles\.productPrice\}[\s\S]*aria-label=\{`Add \$\{product\.name\} to basket`\}/);
  assert.match(logoSource, /viewBox="0 0 176 78"/);
  assert.doesNotMatch(logoSource, /<script|foreignObject|(?:xlink:)?href=/i);
  for (const fontName of ["roboto-regular.woff2", "roboto-bold.woff2", "vultura-regular.woff2"]) {
    assert.ok(fs.statSync(path.join(brandRoot, fontName)).size > 10_000);
  }
  assert.match(clientStyles, /\.controlDock \{[\s\S]*width: max-content;[\s\S]*\.voiceAction \{[\s\S]*border-radius: 999px;/);
  assert.match(clientStyles, /data-status="speaking"[\s\S]*voiceBarSpeak/);
  assert.match(clientStyles, /data-has-session="true"\]\[data-has-basket="true"\][\s\S]*grid-template-columns/);
  assert.match(clientStyles, /env\(safe-area-inset-bottom\)/);
  assert.match(clientStyles, /prefers-reduced-motion: reduce[\s\S]*animation: none !important/);
  assert.match(clientStyles, /searchTray input:focus[\s\S]*pointer-events: none/);
  assert.match(clientStyles, /--blue: #002fa1/);
  assert.match(clientStyles, /font-family: "Juliette Roboto"/);
  assert.match(clientStyles, /grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(clientStyles, /\.productCard \{[\s\S]*display: flex;[\s\S]*flex-direction: column/);
  assert.match(clientStyles, /\.imageWrap img \{ object-fit: contain; \}/);
  assert.match(clientStyles, /\.productCard\[data-selected="true"\] \.imageWrap/);
  assert.doesNotMatch(clientStyles, /\.productCard \{[^}]*border:/);
  assert.doesNotMatch(clientStyles, /--wine|--cream|#f5f0e8|#f2e5e8|#73233d|#451326/i);
  assert.doesNotMatch(clientStyles, /\.pulse\b|\.demoTruth\b/);
  assert.match(tokenRoute, /process\.env\.OPENAI_API_KEY/);
  assert.match(tokenRoute, /realtime\/client_secrets/);
  assert.match(tokenRoute, /Cache-Control/);
  assert.doesNotMatch(tokenRoute, /console\.log\([^)]*OPENAI_API_KEY/);
});
