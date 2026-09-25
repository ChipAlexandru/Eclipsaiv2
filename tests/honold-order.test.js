const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const load = (f) => import(pathToFileURL(path.join(root, "src/honold-order", f)));
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/honold-order/catalog.json"), "utf8"));
const zod = require("zod"); const z = zod.z || zod;

// Friday 25 Sep 2026, 08:02 Zurich (UTC+2) = 06:02 UTC
const FRI_0802 = Date.UTC(2026, 8, 25, 6, 2);
// Sunday 27 Sep 2026, 12:58 Zurich
const SUN_1258 = Date.UTC(2026, 8, 27, 10, 58);
const BASE = { lang: "de", view: "menu", sheet: null, category: "baeckerei", forYou: null, basket: {}, basketOrder: [], gifts: {}, proposal: null, storeId: "erlenbach", when: { mode: "asap" }, order: null, lastOrder: null, paying: false };

async function setup(nowMs = FRI_0802) {
  const { buildMenu } = await load("menu.mjs");
  const actions = await load("actions.mjs");
  return { actions, ctx: { menu: buildMenu(catalog), nowMs } };
}

test("every catalogue product lands in exactly one menu category with a local photo", async () => {
  const { buildMenu, CATEGORIES } = await load("menu.mjs");
  const menu = buildMenu(catalog);
  assert.equal(CATEGORIES.reduce((n, c) => n + menu.byCategory[c.id].length, 0), catalog.products.length);
  for (const p of menu.products) assert.ok(fs.existsSync(path.join(root, "public", p.image)), p.image);
});

test("as-soon-as-possible pickup respects real opening hours", async () => {
  const { resolvePickup, hhmm } = await load("stores.mjs");
  const erl = resolvePickup("erlenbach", { mode: "asap" }, FRI_0802);
  assert.equal(hhmm(erl.minute), "08:15"); assert.equal(erl.dayOffset, 0);
  const sun = resolvePickup("erlenbach", { mode: "asap" }, SUN_1258);
  assert.equal(sun.dayOffset, 1); assert.equal(hhmm(sun.minute), "07:10");
  const renn = resolvePickup("rennweg", { mode: "asap" }, SUN_1258);
  assert.equal(renn.dayOffset, 1); assert.equal(hhmm(renn.minute), "07:40");
});

test("basket: several items in one call, unknown ids reported, keeps add order, clear empties", async () => {
  const { actions, ctx } = await setup();
  let r = actions.updateBasket(BASE, { items: [{ id: "1943", quantity: 2, mode: "add" }, { id: "1519", quantity: 1, mode: "add" }, { id: "nope", quantity: 1, mode: "add" }] }, ctx);
  assert.equal(r.result.ok, true); assert.deepEqual(r.result.unknown_ids, ["nope"]);
  assert.equal(r.result.screen.basket, "2× Buttergipfel [1943], 1× Birchermüesli [1519]");
  assert.ok(r.result.next_step);
  const s = r.next;
  r = actions.updateBasket(s, { items: [{ id: "1943", quantity: 0, mode: "set" }] }, ctx);
  assert.deepEqual(r.next.basket, { 1519: 1 });
  r = actions.updateBasket(s, { clear: true }, ctx);
  assert.deepEqual(r.next.basket, {});
  r = actions.updateBasket(BASE, { items: [{ id: "nope", quantity: 1, mode: "add" }] }, ctx);
  assert.equal(r.result.ok, false); assert.equal(r.next, null);
});

test("pickup: shop by id or name, times checked, shop change keeps a time that still fits", async () => {
  const { actions, ctx } = await setup();
  assert.equal(actions.setPickup(BASE, { storeId: "Küsnacht" }, ctx).next.storeId, "kuesnacht");
  assert.equal(actions.setPickup(BASE, { storeId: "Mars" }, ctx).result.reason, "unknown_store");
  assert.equal(actions.setPickup(BASE, { time: "08:05" }, ctx).result.reason, "too_soon");
  assert.equal(actions.setPickup(BASE, { time: "19:00" }, ctx).result.reason, "outside_hours");
  const at915 = actions.setPickup(BASE, { time: "9:15", day: "tomorrow" }, ctx).next;
  assert.deepEqual(at915.when, { mode: "at", dayOffset: 1, minute: 555 });
  assert.deepEqual(actions.setPickup(at915, { storeId: "witikon" }, ctx).next.when, at915.when);
  const at1730 = { ...BASE, when: { mode: "at", dayOffset: 1, minute: 17 * 60 + 30 } }; // Saturday 17:30: Erlenbach closed, Rennweg open
  assert.deepEqual(actions.setPickup(at1730, { storeId: "erlenbach" }, ctx).next.when, { mode: "asap" });
});

test("checkout, order only after a clear yes, then order status and new order", async () => {
  const { actions, ctx } = await setup();
  assert.equal(actions.goTo(BASE, { view: "checkout" }, ctx).result.reason, "basket_empty");
  const s1 = actions.updateBasket(BASE, { items: [{ id: "1943", quantity: 2, mode: "add" }] }, ctx).next;
  const co = actions.goTo(s1, { view: "checkout" }, ctx);
  assert.equal(co.next.sheet, "checkout"); assert.match(co.result.total, /CHF\s4\.00/);
  assert.equal(actions.placeOrder(co.next, { customerSaidYes: false }, ctx).next, null);
  const placed = actions.placeOrder(co.next, { customerSaidYes: true }, ctx);
  assert.equal(placed.effect, "pay"); assert.ok(placed.result.pickup_number); assert.equal(placed.next.lastOrder.summary, "2× Buttergipfel");
  const status = actions.goTo({ ...placed.next, paying: false, sheet: null, view: "order" }, { view: "order_status" }, ctx);
  assert.equal(status.result.status, "confirmed");
  const fresh = actions.newOrder(placed.next, {}, ctx).next;
  assert.equal(fresh.order, null); assert.deepEqual(fresh.basket, {});
  const again = actions.orderAgain(fresh, {}, ctx);
  assert.deepEqual(again.next.basket, { 1943: 2 });
});

test("category and language buttons", async () => {
  const { actions, ctx } = await setup();
  assert.equal(actions.browseCategory(BASE, { category: "schokolade" }, ctx).next.category, "schokolade");
  assert.equal(actions.browseCategory(BASE, { category: "Torten & Kuchen" }, ctx).next.category, "torten");
  assert.equal(actions.setLanguage(BASE, { language: "en" }, ctx).next.lang, "en");
});

test("memory keeps meaningful words, skips fillers, and is context only", async () => {
  const m = await load("memory.mjs");
  let mem = m.rememberWords(m.EMPTY_MEMORY, ["Ja", "Zwei Buttergipfel bitte", "[Start] x", "Zwei Buttergipfel bitte"]);
  assert.deepEqual(mem.words, ["Zwei Buttergipfel bitte"]);
  mem = m.rememberVisit(mem, FRI_0802); mem = m.rememberVisit(mem, FRI_0802 + 3 * 86400000);
  mem = m.rememberOrder(mem, { storeId: "kuesnacht", summary: "2× Buttergipfel" });
  const ctx = m.memoryContext(mem, FRI_0802 + 3 * 86400000 + 60000, "Küsnacht");
  assert.match(ctx, /Last order: 2× Buttergipfel at Küsnacht/); assert.match(ctx, /context only/);
  assert.match(m.memoryContext(m.EMPTY_MEMORY, FRI_0802), /First visit/);
});

test("voice: full menu in prompt, one tool per button, place_order refuses without yes", async () => {
  const { buildMenu } = await load("menu.mjs");
  const v = await load("voice.mjs");
  const menu = buildMenu(catalog);
  const prompt = v.voiceInstructions({ lang: "de", menu, stateLine: "{}", memoryLine: "First visit" });
  for (const p of menu.products) assert.ok(prompt.includes(`${p.id}|`), p.id);
  let placed = false;
  const tools = v.buildTools({ tool: (d) => d, z, api: { placeOrder: () => { placed = true; return { ok: true }; } } });
  assert.deepEqual(tools.map((t) => t.name), ["update_basket", "propose_order", "edit_proposal", "discard_proposal", "reopen_proposal", "propose_usual", "accept_proposal", "set_gift", "show_products", "browse_category", "set_pickup", "go_to", "place_order", "order_again", "new_order", "set_language"]);
  const out = JSON.parse(await tools.find((t) => t.name === "place_order").execute({ customer_said_yes: false }));
  assert.equal(out.ok, false); assert.equal(placed, false);
  assert.deepEqual(v.sayChips({ basket: {}, view: "menu", sheet: null }, "de", true), ["Zwei Buttergipfel", "Ein Schoggi-Geschenk mit Schleife", "Etwas Herzhaftes für 5 Personen"]);
});

test("need → proposal card: nothing in the basket until accepted; pickup set from the request", async () => {
  const { actions, ctx } = await setup();
  const r = actions.proposeOrder(BASE, { request: "Etwas Herzhaftes für fünf, morgen früh", title: "Teamsitzung · 5 Personen",
    items: [{ id: "1579", quantity: 5 }, { id: "1584", quantity: 5 }, { id: "1573", quantity: 5 }, { id: "zzz", quantity: 1 }],
    pickup: { storeId: null, time: "08:30", day: "tomorrow" } }, ctx);
  assert.equal(r.result.ok, true); assert.equal(r.result.pieces, 15); assert.match(r.result.total, /78\.50/);
  assert.equal(r.next.sheet, "proposal"); assert.deepEqual(r.next.basket, {});
  assert.deepEqual(r.next.when, { mode: "at", dayOffset: 1, minute: 510 });
  const tweaked = actions.adjustProposal(r.next, { id: "1573", quantity: 0 }, ctx).next;
  assert.equal(tweaked.proposal.items.length, 2);
  const acc = actions.acceptProposal(tweaked, {}, ctx);
  assert.deepEqual(acc.next.basket, { 1579: 5, 1584: 5 }); assert.equal(acc.next.proposal, null); assert.equal(acc.next.sheet, null);
});

test("gift options only on chocolate and confections, kept through order and 'wie immer'", async () => {
  const { actions, ctx } = await setup();
  const p = actions.proposeOrder(BASE, { title: "Geschenk", items: [{ id: "255", quantity: 2, ribbon: true, card: "Happy Birthday" }, { id: "1943", quantity: 1, ribbon: true }] }, ctx).next;
  assert.deepEqual(p.proposal.items[0].gift, { ribbon: true, card: "Happy Birthday" });
  assert.equal(p.proposal.items[1].gift, null); // Buttergipfel: no gift wrap
  assert.equal(actions.setGift(p, { id: "1943", ribbon: true }, ctx).result.ok, false);
  const withBasket = actions.acceptProposal(p, {}, ctx).next;
  assert.deepEqual(withBasket.gifts, { 255: { ribbon: true, card: "Happy Birthday" } });
  const placed = actions.placeOrder(withBasket, { customerSaidYes: true }, ctx).next;
  assert.equal(actions.giftLabel(placed.order.lines[0].gift), "mit Schleife · Karte «Happy Birthday»");
  const later = actions.newOrder(placed, {}, ctx).next;
  const usual = actions.proposeUsual(later, {}, ctx);
  assert.equal(usual.next.proposal.title, "Ihre übliche Bestellung");
  assert.deepEqual(usual.next.proposal.items.map((i) => [i.id, i.quantity, Boolean(i.gift)]), [["255", 2, true], ["1943", 1, false]]);
  assert.equal(actions.proposeUsual(BASE, {}, ctx).result.reason, "no_usual_yet");
});

test("pickup: a wished shop is kept even when the wished time no longer works", async () => {
  const { actions, ctx } = await setup();
  const r = actions.setPickup(BASE, { storeId: "kuesnacht", time: "08:05", day: "today" }, ctx);
  assert.equal(r.result.ok, true); assert.equal(r.result.requested_time_not_possible, "too_soon");
  assert.equal(r.next.storeId, "kuesnacht"); assert.deepEqual(r.next.when, { mode: "asap" });
});

test("one needs card survives browsing, scales with headcount, and keeps exact basket provenance", async () => {
  const { actions, ctx } = await setup();
  const base = actions.updateBasket(BASE, { items: [{ id: "1573", quantity: 2, mode: "add" }] }, ctx).next;
  const proposed = actions.proposeOrder(base, { request: "Lunch for five", title: "Lunch", headcount: 5, constraints: "Budget CHF 60",
    items: [{ id: "1573", quantity: 5 }, { id: "1579", quantity: 5 }] }, ctx).next;
  const hidden = actions.goTo(proposed, { view: "menu" }, ctx).next;
  assert.equal(hidden.proposal.items.length, 2);
  const browsed = actions.browseCategory(hidden, { category: "traiteur" }, ctx).next;
  const edited = actions.updateBasket(browsed, { items: [{ id: "1579", quantity: 1, mode: "add" }] }, ctx).next;
  assert.deepEqual(edited.basket, { 1573: 2 });
  assert.deepEqual(edited.proposal.items.map((i) => [i.id, i.quantity]), [["1573", 5], ["1579", 6]]);
  const scaled = actions.editProposal(edited, { headcount: 6 }, ctx).next;
  assert.deepEqual(scaled.proposal.items.map((i) => [i.id, i.quantity]), [["1573", 6], ["1579", 7]]);
  const accepted = actions.acceptProposal(scaled, {}, ctx).next;
  assert.deepEqual(accepted.basket, { 1573: 8, 1579: 7 });
  const reduced = actions.updateBasket(accepted, { target: "basket", items: [{ id: "1573", quantity: 4, mode: "set" }] }, ctx).next;
  const reopened = actions.reopenProposal(reduced, {}, ctx).next;
  assert.deepEqual(reopened.basket, { 1573: 2 });
  assert.deepEqual(reopened.proposal.items.map((i) => [i.id, i.quantity]), [["1573", 2], ["1579", 7]]);
  assert.equal(reopened.proposal.headcount, 6);
  assert.equal(reopened.proposal.constraints, "Budget CHF 60");
  const basketView = actions.goTo(reopened, { view: "checkout" }, ctx);
  assert.equal(basketView.result.ok, true);
  assert.equal(basketView.next.proposal.items.length, 2);
  assert.equal(basketView.next.sheet, "checkout");
  assert.equal(actions.placeOrder(basketView.next, { customerSaidYes: true }, ctx).result.reason, "draft_pending");
  const discarded = actions.discardProposal(reopened, {}, ctx).next;
  assert.deepEqual(discarded.basket, { 1573: 2 });
});

test("proposal limits never show a quantity that acceptance silently reduces", async () => {
  const { actions, ctx } = await setup();
  const base = actions.updateBasket(BASE, { items: [{ id: "1573", quantity: 2, mode: "set" }] }, ctx).next;
  const draft = actions.proposeOrder(base, { items: [{ id: "1573", quantity: 98 }] }, ctx).next;
  assert.equal(actions.acceptProposal(draft, {}, ctx).result.reason, "basket_quantity_limit");
  assert.equal(actions.editProposal(draft, { id: "1573", quantity: 100 }, ctx).result.reason, "quantity_out_of_range");
  assert.equal(actions.editProposal(draft, { headcount: 100 }, ctx).result.reason, "headcount_out_of_range");
});

test("reopening a selection preserves separate basket gift edits", async () => {
  const { actions, ctx } = await setup();
  const base = actions.updateBasket(BASE, { items: [{ id: "255", quantity: 2, mode: "set" }] }, ctx).next;
  const draft = actions.proposeOrder(base, { items: [{ id: "255", quantity: 1, ribbon: true }] }, ctx).next;
  const accepted = actions.acceptProposal(draft, {}, ctx).next;
  const changed = actions.setGift(accepted, { id: "255", ribbon: false, card: "Danke", target: "basket" }, ctx).next;
  const reopened = actions.reopenProposal(changed, {}, ctx).next;
  assert.equal(reopened.basket["255"], 2);
  assert.deepEqual(reopened.gifts["255"], { ribbon: false, card: "Danke" });
  assert.equal(reopened.proposal.items[0].quantity, 1);
});

test("voice tools reject stale sessions and deduplicate one call ID", async () => {
  const { buildMenu } = await load("menu.mjs");
  const v = await load("voice.mjs");
  let live = true, calls = 0;
  const tools = v.buildTools({ tool: (d) => d, z, api: { updateBasket: () => { calls += 1; return { ok: true }; } }, isCurrent: () => live });
  const update = tools.find((x) => x.name === "update_basket");
  const input = { items: [{ product_id: "1943", quantity: 1, mode: "add" }], clear: false };
  await update.execute(input, null, { toolCall: { callId: "one" } });
  await update.execute(input, null, { toolCall: { callId: "one" } });
  assert.equal(calls, 1);
  live = false;
  assert.equal(JSON.parse(await update.execute(input, null, { toolCall: { callId: "two" } })).reason, "stale_session");
  assert.equal(calls, 1);
});
