const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const resultsPath = path.join(root, "public", "homepage-live-results.json");
const componentPath = path.join(root, "src", "views", "homepage-demo", "HomepageDemo.jsx");
const routePath = path.join(root, "app", "api", "homepage-live-results", "route.js");

test("homepage live results contain the verified September 2 seven-day window", () => {
  const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));

  assert.equal(results.schema_version, "eclipsai-homepage-live-results-v1");
  assert.equal(results.status, "live");
  assert.deepEqual(results.period, {
    label: "Last seven completed days",
    start_date: "2026-08-27",
    end_date: "2026-09-02",
  });
  assert.equal(results.production_lines_changed, 544);
  assert.equal((results.profit_impact_share_of_sales * 100).toFixed(1), "0.9");
  assert.equal((results.estimated_waste_reduction_share * 100).toFixed(1), "20.8");
});

test("homepage renders the live endpoint and retains the verified snapshot as fallback", () => {
  const component = fs.readFileSync(componentPath, "utf8");
  const route = fs.readFileSync(routePath, "utf8");

  assert.match(component, /fetch\("\/api\/homepage-live-results"/);
  assert.match(component, /liveResults\.production_lines_changed/);
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
    assert.match(content, /linesChanged:/);
    assert.match(content, /profitImpact:/);
    assert.match(content, /wasteReduction:/);
    assert.match(content, /demo:\s*\{/);
  }
});
