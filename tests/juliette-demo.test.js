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

test("Realtime credentials remain server-side and pickup stays explicitly simulated", () => {
  const clientSource = fs.readFileSync(path.join(root, "src", "juliette-demo", "JulietteVoiceShop.jsx"), "utf8");
  const tokenRoute = fs.readFileSync(path.join(root, "app", "api", "juliette-demo", "realtime-token", "route.js"), "utf8");

  assert.doesNotMatch(clientSource, /process\.env\.OPENAI_API_KEY/);
  assert.match(clientSource, /needsApproval:\s*true/);
  assert.match(clientSource, /No real transaction is possible/);
  assert.match(clientSource, /do not claim photos are visible/i);
  assert.match(clientSource, /VOICE_DEMO_DURATION_MS = 5 \* 60 \* 1000/);
  assert.match(clientSource, /window\.setTimeout\(\(\) => \{[\s\S]*Five-minute demo ended/);
  assert.match(tokenRoute, /process\.env\.OPENAI_API_KEY/);
  assert.match(tokenRoute, /realtime\/client_secrets/);
  assert.match(tokenRoute, /Cache-Control/);
  assert.doesNotMatch(tokenRoute, /console\.log\([^)]*OPENAI_API_KEY/);
});
