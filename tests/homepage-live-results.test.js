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
    de: "jede Filiale, jeden Artikel und jeden Wochentag",
    fr: "chaque boutique, chaque produit et chaque jour de la semaine",
    it: "ogni punto vendita, prodotto e giorno della settimana",
    ro: "fiecare magazin, produs și zi a săptămânii",
  };
  for (const [locale, phrase] of Object.entries(phrases)) {
    const contentPath = path.join(root, "src", "views", "fresh-food", `freshFoodContent.${locale}.js`);
    assert.ok(fs.readFileSync(contentPath, "utf8").includes(phrase), `${locale} must use operational hero copy`);
  }
});

test("translated visible copy matches the approved daily profit-loop intent", () => {
  const expected = {
    de: { loop: "Tägliche Verbesserungszyklen für den Gewinn aufbauen", impact: "Wirkung", actions: "Massnahmen", demo: "Demo", close: "für tägliche Gewinnmassnahmen" },
    fr: { loop: "Construire des cycles quotidiens d'amélioration du profit", impact: "Impact", actions: "Actions", demo: "Démo", close: "pour les actions quotidiennes qui influencent le profit" },
    it: { loop: "Creare cicli quotidiani di miglioramento del profitto", impact: "Impatto", actions: "Azioni", demo: "Demo", close: "per le azioni quotidiane che incidono sul profitto" },
    ro: { loop: "Construiți cicluri zilnice de îmbunătățire a profitului", impact: "Impact", actions: "Acțiuni", demo: "Demo", close: "pentru acțiunile zilnice care influențează profitul" },
  };
  for (const [locale, copy] of Object.entries(expected)) {
    const contentPath = path.join(root, "src", "views", "fresh-food", `freshFoodContent.${locale}.js`);
    const content = fs.readFileSync(contentPath, "utf8");
    assert.ok(content.includes(`h2: "${copy.loop}"`), `${locale} must translate daily profit improvement loops`);
    assert.ok(content.includes(`proof: "${copy.impact}"`), `${locale} nav must mean Impact`);
    assert.ok(content.includes(`vision: "${copy.actions}"`), `${locale} nav must mean Actions`);
    assert.ok(content.includes(`open: "${copy.demo}"`), `${locale} demo button must stay concise`);
    assert.ok(content.includes(`h2: "The Profit Brain ${copy.close}"`), `${locale} closing must use the brand-for-actions intent`);
    assert.doesNotMatch(content.split("  product: {")[1]?.split("  demo: {")[0] || "", /Nach Ladenschluss|Après la fermeture|Dopo la chiusura|După închiderea/, `${locale} measurement must be daily`);
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

test("Impact headline states the 1% opportunity without approximation in every locale", () => {
  for (const locale of ["en", "de", "fr", "it", "ro"]) {
    const contentPath = path.join(root, "src", "views", "fresh-food", `freshFoodContent.${locale}.js`);
    const content = fs.readFileSync(contentPath, "utf8");
    const proof = content.split("  proof: {")[1]?.split("  vision: {")[0];
    assert.ok(proof, `${locale} Impact section must exist`);
    assert.match(proof, /h2Value: "1%"/);
    assert.doesNotMatch(proof.split("    lede:")[0], /approximately|around|about|rund|ungefähr|environ|approximativ|circa|aproximativ|~|≈/i);
  }
});

test("mobile hides only the Profit Brain schematic and keeps the Demo control", () => {
  const css = fs.readFileSync(path.join(root, "src", "views", "homepage-demo", "homepageDemo.css"), "utf8");
  const component = fs.readFileSync(componentPath, "utf8");
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.homepage-demo-profit-graphic \{ display: none; \}/);
  assert.match(css, /\.homepage-demo-approach-stage \{ grid-template-columns: 1fr; gap: 24px; \}/);
  assert.match(component, /<ProfitBrainGraphic labels=\{c\.product\.diagram\} \/>[\s\S]*?<button[\s\S]*?className="homepage-demo-open-demo"/);
});

test("display headlines do not end in full stops", () => {
  for (const locale of ["en", "de", "fr", "it", "ro"]) {
    const contentPath = path.join(root, "src", "views", "fresh-food", `freshFoodContent.${locale}.js`);
    const content = fs.readFileSync(contentPath, "utf8");
    const displayBlocks = ["  hero: {", "  product: {", "  vision: {", "  offer: {", "  faq: {"];
    for (const marker of displayBlocks) {
      const block = content.split(marker)[1]?.split("\n  },")[0] || "";
      const headline = block.match(/\n\s+h(?:1|2): "([^"]+)"/)?.[1];
      assert.ok(headline, `${locale} ${marker.trim()} must have a headline`);
      assert.doesNotMatch(headline, /\.$/, `${locale} ${marker.trim()} headline must not end in a full stop`);
    }
  }
});
