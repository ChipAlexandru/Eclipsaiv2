const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const resultsPath = path.join(root, "public", "homepage-live-results.json");
const componentPath = path.join(root, "src", "views", "homepage-demo", "HomepageDemo.jsx");
const routePath = path.join(root, "app", "api", "homepage-live-results", "route.js");

test("homepage live results contain the verified September 9 seven-day window", () => {
  const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));

  assert.equal(results.schema_version, "eclipsai-homepage-live-results-v1");
  assert.equal(results.status, "live");
  assert.deepEqual(results.period, {
    label: "Last seven completed days",
    start_date: "2026-09-03",
    end_date: "2026-09-09",
  });
  assert.equal(results.production_lines_changed, 494);
  assert.equal((results.profit_impact_share_of_sales * 100).toFixed(1), "0.5");
  assert.equal((results.estimated_waste_reduction_share * 100).toFixed(1), "17.8");
});

test("homepage renders the live endpoint and retains the verified snapshot as fallback", () => {
  const component = fs.readFileSync(componentPath, "utf8");
  const route = fs.readFileSync(routePath, "utf8");

  assert.match(component, /fetch\("\/api\/homepage-live-results"/);
  assert.match(component, /liveResults\.production_lines_changed/);
  assert.doesNotMatch(component, /homepage-demo-results-section/);
  assert.match(component, /homepage-demo-results-footer[\s\S]*homepage-demo-live-label/);
  assert.doesNotMatch(component, /<b>553<\/b>/);
  assert.match(route, /JULIETTE_PORTAL_ORIGIN/);
  assert.match(route, /\/public\/homepage-live-results\.json/);
  assert.match(route, /fallbackResults/);
  assert.match(route, /display_status/);
  assert.match(route, /remoteReached && isCurrent \? "live" : "snapshot"/);
});

test("all localized homepages carry the live-result and demo controls", () => {
  for (const locale of ["en", "de", "fr", "it", "ro"]) {
    const contentPath = path.join(root, "src", "views", "fresh-food", `freshFoodContent.${locale}.js`);
    const content = fs.readFileSync(contentPath, "utf8");
    assert.match(content, /live:\s*\{/);
    assert.match(content, /snapshot:/);
    assert.match(content, /production:/);
    assert.match(content, /linesChanged:/);
    assert.match(content, /profitImpact:/);
    assert.match(content, /wasteReduction:/);
    assert.match(content, /demo:\s*\{/);
  }
});

test("locale hero copy stays operator-facing", () => {
  const phrases = {
    en: "Make production decisions for every shop, product, and weekday. Measure the daily effect on profit, sales, and waste.",
    de: "Tägliche Produktionsaufträge je Filiale und Artikel umsetzen",
    fr: "Mettre à jour chaque jour les commandes de production",
    it: "Aggiornare ogni giorno gli ordini di produzione",
    ro: "Actualizați zilnic comenzile de producție",
  };
  for (const [locale, phrase] of Object.entries(phrases)) {
    const contentPath = path.join(root, "src", "views", "fresh-food", `freshFoodContent.${locale}.js`);
    assert.ok(fs.readFileSync(contentPath, "utf8").includes(phrase), `${locale} must use operational hero copy`);
  }
});

test("every locale uses the Profit Brain in the closing page and FAQ", () => {
  for (const locale of ["en", "de", "fr", "it", "ro"]) {
    const contentPath = path.join(root, "src", "views", "fresh-food", `freshFoodContent.${locale}.js`);
    const content = fs.readFileSync(contentPath, "utf8");
    const faq = content.split("  faq: {")[1]?.split("  footer: {")[0];
    assert.ok(faq, `${locale} FAQ must exist`);
    assert.doesNotMatch(faq, /Eclipsai/i, `${locale} FAQ must use the Profit Brain`);
    assert.match(faq, /The Profit Brain/);
    assert.match(content, /offer:\s*\{\s*h2:\s*"The Profit Brain/);
    assert.match(content, /diagram:\s*\{/);
    assert.match(content, /tracker:\s*\{/);
  }
});
