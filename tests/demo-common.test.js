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
    assert.ok(config.engineData.items.length > 0);
    assert.ok(config.engineData.production.length > 0);
    assert.ok(config.engineData.financials.gain > 0);
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

test("field photos preserve the visible morning-to-afternoon time cue", () => {
  const shell = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(shell, /<strong>16:03<\/strong>/);
  assert.match(shell, /<strong>10:28<\/strong>/);
  assert.match(shell, /\.field-photo\.late \.field-caption\s*\{[^}]*width: 50%/s);
});
