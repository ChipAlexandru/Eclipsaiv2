const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const load = (file) => import(pathToFileURL(path.join(root, "src/bachmann-order", file)));
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/bachmann-order/catalog.json"), "utf8"));
const zod = require("zod"); const z = zod.z || zod;
// Monday 28 Sep 2026 at 08:02 in Zurich (UTC+2).
const MON_0802 = Date.UTC(2026, 8, 28, 6, 2);
// Sunday 27 Sep 2026 at 12:58 in Zurich.
const SUN_1258 = Date.UTC(2026, 8, 27, 10, 58);
const BASE = { lang: "de", view: "menu", sheet: null, category: "schokolade", forYou: null, basket: {}, basketOrder: [], gifts: {}, proposal: null, acceptedProposal: null, storeId: "stadelhofen", when: { mode: "asap" }, order: null, lastOrder: null, paying: false };

async function setup(nowMs = MON_0802) {
  const { buildMenu } = await load("menu.mjs");
  return { actions: await load("actions.mjs"), ctx: { menu: buildMenu(catalog), nowMs } };
}

test("official bestseller snapshot maps every product to one tab and a local image", async () => {
  const { buildMenu, CATEGORIES } = await load("menu.mjs");
  const menu = buildMenu(catalog);
  assert.equal(menu.products.length, 18);
  assert.equal(CATEGORIES.reduce((n, c) => n + menu.byCategory[c.id].length, 0), 18);
  for (const p of menu.products) {
    assert.ok(p.priceChf > 0);
    assert.ok(p.nameDe && p.nameEn);
    assert.ok(fs.existsSync(path.join(root, "public", p.image)), p.image);
  }
  for (const product of catalog.products) assert.equal(product.sourceUrlDe, product.sourceUrl.replace("/en/", "/de/"));
  assert.equal(menu.byId["29658"].priceChf, 17.9);
  assert.equal(menu.byId["8949"].category, "apero");
});

test("German and English product names change without changing ids, prices or basket quantities", async () => {
  const { buildMenu, basketTotals, orderSummary } = await load("menu.mjs");
  const de = buildMenu(catalog, "de"), en = buildMenu(catalog, "en");
  assert.equal(de.byId["17370"].name, "Frischschokolade Herbst");
  assert.equal(en.byId["17370"].name, "Fresh Chocolate Autumn");
  assert.equal(de.byId["1492"].name, "Dose Lucerne Pralinés");
  assert.equal(en.byId["1492"].name, "Tin Box Lucerne Pralines without Alcohol");
  assert.deepEqual(de.products.map((p) => [p.id, p.priceChf]), en.products.map((p) => [p.id, p.priceChf]));
  const basket = { 17370: 2, 1492: 1 };
  assert.equal(basketTotals(basket, de.byId).totalChf, basketTotals(basket, en.byId).totalChf);
  const last = { basket, order: ["17370", "1492"], summary: "2× Frischschokolade Herbst, 1× Dose Lucerne Pralinés" };
  assert.match(orderSummary(last, en.byId), /Fresh Chocolate Autumn/);
  assert.doesNotMatch(orderSummary(last, en.byId), /Frischschokolade/);
});

test("proposal and voice action results use the active product language", async () => {
  const { actions, ctx } = await setup();
  const deDraft = actions.proposeOrder(BASE, { title: "Geschenk", items: [{ id: "17370", quantity: 1 }] }, ctx);
  assert.match(deDraft.result.screen.proposal_open, /Frischschokolade Herbst/);
  const { buildMenu } = await load("menu.mjs");
  const enCtx = { ...ctx, menu: buildMenu(catalog, "en") };
  const enState = { ...deDraft.next, lang: "en" };
  assert.match(actions.screenSummary(enState, enCtx.menu, MON_0802).proposal_open, /Fresh Chocolate Autumn/);
  assert.deepEqual(actions.showProducts(enState, { ids: ["17370"] }, enCtx).result.shown, ["Fresh Chocolate Autumn"]);
});

test("pickup uses published Zurich hours and closes Bleicherweg on Sunday", async () => {
  const { resolvePickup, hhmm } = await load("stores.mjs");
  assert.equal(hhmm(resolvePickup("stadelhofen", { mode: "asap" }, MON_0802).minute), "08:15");
  const sun = resolvePickup("bleicherweg", { mode: "asap" }, SUN_1258);
  assert.equal(sun.dayOffset, 1);
  assert.equal(hhmm(sun.minute), "07:10");
  assert.equal(resolvePickup("stadelhofen", { mode: "asap" }, SUN_1258).dayOffset, 0);
});

test("touch and voice share basket and checkout actions; demo order identity is brand-specific", async () => {
  const { actions, ctx } = await setup();
  const add = actions.updateBasket(BASE, { items: [{ id: "29658", quantity: 2, mode: "add" }, { id: "1291", quantity: 1, mode: "add" }] }, ctx);
  assert.equal(add.result.ok, true);
  assert.equal(add.result.screen.basket, "2× The XXL Sticks [29658], 1× Macaron Variation [1291]");
  const checkout = actions.goTo(add.next, { view: "checkout" }, ctx);
  assert.match(checkout.result.total, /65\.60/);
  assert.equal(actions.placeOrder(checkout.next, { customerSaidYes: false }, ctx).result.reason, "needs_clear_yes");
  const placed = actions.placeOrder(checkout.next, { customerSaidYes: true }, ctx);
  assert.equal(placed.effect, "pay");
  assert.match(placed.next.order.number, /^B\d{3}$/);
  assert.equal(placed.next.order.totalChf, 65.6);
  const again = actions.orderAgain(actions.newOrder(placed.next, {}, ctx).next, {}, ctx);
  assert.deepEqual(again.next.basket, { 1291: 1, 29658: 2 });
});

test("pickup changes validate shop and requested time", async () => {
  const { actions, ctx } = await setup();
  assert.equal(actions.setPickup(BASE, { storeId: "Bleicherweg" }, ctx).next.storeId, "bleicherweg");
  assert.equal(actions.setPickup(BASE, { storeId: "Mars" }, ctx).result.reason, "unknown_store");
  assert.equal(actions.setPickup(BASE, { time: "08:05" }, ctx).result.reason, "too_soon");
  assert.equal(actions.setPickup(BASE, { time: "21:00" }, ctx).result.reason, "outside_hours");
});

test("need proposal stays outside basket, edits and headcount recalculate, then accepts once", async () => {
  const { actions, ctx } = await setup();
  const base = actions.updateBasket(BASE, { items: [{ id: "29658", quantity: 1, mode: "add" }] }, ctx).next;
  const proposal = actions.proposeOrder(base, { request: "Süsses für fünf", title: "Team", headcount: 5, constraints: "Ohne Alkohol",
    items: [{ id: "1291", quantity: 2 }, { id: "1467", quantity: 2 }] }, ctx).next;
  assert.deepEqual(proposal.basket, { 29658: 1 });
  assert.equal(proposal.sheet, "proposal");
  const hidden = actions.goTo(proposal, { view: "menu" }, ctx).next;
  assert.ok(hidden.proposal);
  const edited = actions.editProposal(hidden, { headcount: 6 }, ctx).next;
  assert.equal(edited.proposal.headcount, 6);
  const accepted = actions.acceptProposal(edited, {}, ctx).next;
  assert.deepEqual(accepted.basket, { 1291: 2, 1467: 2, 29658: 1 });
  assert.equal(accepted.proposal, null);
  const reopened = actions.reopenProposal(accepted, {}, ctx).next;
  assert.deepEqual(reopened.basket, { 29658: 1 });
  assert.equal(reopened.proposal.items.length, 2);
  const acceptedAgain = actions.acceptProposal(reopened, {}, ctx).next;
  assert.deepEqual(acceptedAgain.basket, accepted.basket);
  const discarded = actions.discardProposal(reopened, {}, ctx).next;
  assert.deepEqual(discarded.basket, { 29658: 1 });
});

test("gift options only apply to chocolate and confections", async () => {
  const { actions, ctx } = await setup();
  const draft = actions.proposeOrder(BASE, { title: "Geschenk", items: [{ id: "1467", quantity: 1, ribbon: true, card: "Danke" }, { id: "8949", quantity: 1, ribbon: true }] }, ctx).next;
  assert.deepEqual(draft.proposal.items[0].gift, { ribbon: true, card: "Danke" });
  assert.equal(draft.proposal.items[1].gift, null);
  assert.equal(actions.setGift(draft, { id: "8949", ribbon: true }, ctx).result.ok, false);
  const basket = actions.acceptProposal(draft, {}, ctx).next;
  assert.deepEqual(basket.gifts["1467"], { ribbon: true, card: "Danke" });
});

test("language, memory and voice prompt remain Bachmann-scoped", async () => {
  const { actions, ctx } = await setup();
  assert.equal(actions.setLanguage(BASE, { language: "en" }, ctx).next.lang, "en");
  const memory = await load("memory.mjs");
  const m = memory.rememberOrder(memory.EMPTY_MEMORY, { storeId: "stadelhofen", summary: "2× The XXL Sticks" });
  assert.match(memory.memoryContext(m, MON_0802, "Stadelhofen"), /2× The XXL Sticks/);
  const voice = await load("voice.mjs");
  const prompt = voice.voiceInstructions({ lang: "de", menu: ctx.menu, stateLine: "{}", memoryLine: "First visit" });
  assert.match(prompt, /Confiserie Bachmann/);
  assert.doesNotMatch(prompt, /Honold|Buttergipfel|Küsnacht/);
  for (const p of ctx.menu.products) assert.ok(prompt.includes(`${p.id}|`));
  assert.match(prompt, /17370\|Frischschokolade Herbst\|Fresh Chocolate Autumn/);
  const { buildMenu } = await load("menu.mjs");
  const en = buildMenu(catalog, "en");
  const enPrompt = voice.voiceInstructions({ lang: "en", menu: en, stateLine: "{}", memoryLine: "First visit" });
  assert.match(enPrompt, /17370\|Fresh Chocolate Autumn\|Frischschokolade Herbst/);
  const remembered = memory.rememberOrder(memory.EMPTY_MEMORY, { storeId: "stadelhofen", summary: "2× Frischschokolade Herbst", basket: { 17370: 2 }, order: ["17370"] });
  assert.match(memory.memoryContext(remembered, MON_0802, "Stadelhofen", en.byId), /2× Fresh Chocolate Autumn/);
});

test("voice tools deduplicate calls, reject stale sessions and require explicit payment consent", async () => {
  const voice = await load("voice.mjs");
  let live = true, calls = 0, placed = false;
  const tools = voice.buildTools({ tool: (d) => d, z, api: { updateBasket: () => { calls += 1; return { ok: true }; }, placeOrder: () => { placed = true; return { ok: true }; } }, isCurrent: () => live });
  const update = tools.find((x) => x.name === "update_basket");
  const input = { items: [{ product_id: "29658", quantity: 1, mode: "add" }], clear: false };
  await update.execute(input, null, { toolCall: { callId: "one" } });
  await update.execute(input, null, { toolCall: { callId: "one" } });
  assert.equal(calls, 1);
  live = false;
  assert.equal(JSON.parse(await update.execute(input, null, { toolCall: { callId: "two" } })).reason, "stale_session");
  const pay = tools.find((x) => x.name === "place_order");
  assert.equal(JSON.parse(await pay.execute({ customer_said_yes: false })).ok, false);
  assert.equal(placed, false);
});
