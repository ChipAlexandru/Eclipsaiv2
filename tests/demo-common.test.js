const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..", "public", "demo-common");

function loadConfigs(search = "?demo=spruengli", pathname = "/Spruengli-demo-2") {
  const context = {
    URLSearchParams,
    location: { search, pathname },
    window: {},
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, "demo-configs.js"), "utf8"), context);
  return context.window;
}

test("all public demos are configurations of the shared shell", () => {
  const runtime = loadConfigs();
  assert.deepEqual(Object.keys(runtime.ECLIPSAI_DEMOS).sort(), ["generic", "hausammann", "spruengli"]);

  for (const [id, config] of Object.entries(runtime.ECLIPSAI_DEMOS)) {
    assert.equal(config.id, id);
    assert.ok(config.copy.de.clientBrand);
    assert.ok(config.copy.en.clientBrand);
    assert.equal(config.mobileOrders.length, 3);
    assert.equal(config.assets.sources.length, 5);
    assert.ok(config.assets.fieldEvidence.length >= 1 && config.assets.fieldEvidence.length <= 2);
    assert.ok(config.engineData.items.length > 0);
    assert.ok(config.engineData.production.length > 0);
    assert.ok(config.engineData.financials.gain > 0);
    assert.equal(
      config.engineData.sampleFinancials.saved - config.engineData.sampleFinancials.lost,
      config.engineData.sampleFinancials.gain
    );
  }
});

test("demo selection supports query parameters and public paths", () => {
  assert.equal(loadConfigs("?demo=hausammann").ECLIPSAI_DEMO_ID, "hausammann");
  assert.equal(loadConfigs("", "/fresh-food-demo").ECLIPSAI_DEMO_ID, "generic");
  assert.equal(loadConfigs("", "/Spruengli-demo-2").ECLIPSAI_DEMO_ID, "spruengli");
});

test("shared shell and engine use the neutral message protocol", () => {
  const shell = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const engine = fs.readFileSync(path.join(root, "engine.html"), "utf8");
  assert.match(shell, /demo-configs\.js/);
  assert.match(engine, /demo-configs\.js/);
  assert.doesNotMatch(shell, /spruengli-(?:activate|deactivate|set-language|language-changed|go-home)/);
  assert.doesNotMatch(engine, /spruengli-(?:activate|deactivate|set-language|language-changed|go-home)/);
  assert.match(shell, /eclipsai-demo-activate-chapter/);
  assert.match(engine, /eclipsai-demo-activate-chapter/);
});

test("field photos use configuration-driven timestamps without inventing observations", () => {
  const runtime = loadConfigs();
  const shell = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.deepEqual(
    Array.from(runtime.ECLIPSAI_DEMOS.spruengli.assets.fieldEvidence, (item) => item.time),
    ["16:03", "10:28"]
  );
  assert.deepEqual(
    Array.from(runtime.ECLIPSAI_DEMOS.hausammann.assets.fieldEvidence, (item) => item.time),
    ["16:37"]
  );
  assert.match(shell, /fieldEvidence\.slice\(0, 2\)/);
  assert.match(shell, /time\.textContent = item\.time/);
  assert.match(shell, /\.field-photo\.late \.field-caption\s*\{[^}]*width: 50%/s);
  for (const config of Object.values(runtime.ECLIPSAI_DEMOS)) {
    assert.equal(config.features.balanceAnimation, true);
  }
  assert.match(shell, /@keyframes find-balance/);
  assert.match(shell, /34%, 44% \{ left: 16%/);
  assert.match(shell, /70%, 80% \{ left: 84%/);
  assert.match(shell, /@keyframes balance-label-left/);
  assert.match(shell, /@keyframes balance-label-center/);
  assert.match(shell, /@keyframes balance-label-right/);
  assert.match(shell, /background: var\(--paper\)/);
  assert.match(shell, /classList\.remove\("balance-running"\)/);
  assert.match(shell, /<i class="balance-cursor"/);
});

test("German copy uses natural fresh-food operating language consistently", () => {
  const runtime = loadConfigs();
  const engine = fs.readFileSync(path.join(root, "engine.html"), "utf8");
  for (const config of Object.values(runtime.ECLIPSAI_DEMOS)) {
    assert.equal(config.copy.de.decisionTitle.replace(/\u00ad/g, ""), "Bei der Produktionsmenge gilt es, Absatz und Retouren auszubalancieren.");
    assert.equal(config.copy.de.systemsTitle, "Die nötigen Daten liegen in verschiedenen Systemen.");
    assert.equal(config.copy.de.savedCost, "vermiedene Warenkosten (CHF)");
    assert.equal(config.copy.de.profitGain, "Mehrgewinn");
  }
  assert.match(engine, /automatisierte Produktionsaufträge/);
  assert.match(engine, /geschätzte vermiedene Warenkosten/);
  assert.doesNotMatch(engine, /automatisierte Produktionsmengen/);
  assert.doesNotMatch(engine, /eingesparte Warenkosten, geschätzt/);
});

test("the final page has one shared copy source for desktop and mobile", () => {
  const runtime = loadConfigs();
  const engine = fs.readFileSync(path.join(root, "engine.html"), "utf8");
  for (const lang of ["de", "en"]) {
    const expected = runtime.ECLIPSAI_DEMOS.spruengli.copy[lang].outroTitle;
    assert.equal(runtime.ECLIPSAI_DEMOS.hausammann.copy[lang].outroTitle, expected);
    assert.equal(runtime.ECLIPSAI_DEMOS.generic.copy[lang].outroTitle, expected);
  }
  assert.match(engine, /outroTitle:demoConfig\.copy\.en\.outroTitle/);
  assert.match(engine, /outroTitle:demoConfig\.copy\.de\.outroTitle/);
});
