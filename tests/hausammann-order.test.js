const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const load = (name) => import(pathToFileURL(path.join(root, 'src/hausammann-order', name)));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/hausammann-order/catalog.json'), 'utf8'));
const zod = require('zod');
const z = zod.z || zod;
const MON_0802 = Date.UTC(2026, 8, 28, 6, 2);
const SUN_1658 = Date.UTC(2026, 8, 27, 14, 58);
const BREAD = 'bro-chnebelbrot-1';
const PASTRY = 'pat-tiramisu-9';
const LUNCH = 'tra-sandwiches-32';
const GIFT = 'con-hauskonfekt-35';
const BASE = { lang: 'de', view: 'menu', sheet: null, category: 'brote', forYou: null, basket: {}, basketOrder: [], gifts: {}, proposal: null, acceptedProposal: null, storeId: 'uni88', when: { mode: 'asap' }, order: null, lastOrder: null, paying: false };

async function setup(nowMs = MON_0802) {
  const { buildMenu } = await load('menu.mjs');
  return { actions: await load('actions.mjs'), ctx: { menu: buildMenu(catalog), nowMs } };
}

test('official Hausammann catalogue maps to five categories with local photographs and deterministic illustrative prices', async () => {
  const { buildMenu, CATEGORIES, samplePriceChf } = await load('menu.mjs');
  const menu = buildMenu(catalog);
  assert.equal(menu.products.length, 41);
  assert.equal(CATEGORIES.reduce((sum, c) => sum + menu.byCategory[c.id].length, 0), 41);
  assert.deepEqual(CATEGORIES.map((c) => menu.byCategory[c.id].length), [7, 16, 9, 6, 3]);
  for (const p of menu.products) {
    assert.ok(fs.existsSync(path.join(root, 'public', p.image)), p.image);
    assert.ok(p.priceChf > 0);
    assert.equal(p.priceChf, samplePriceChf(catalog.products.find((item) => item.id === p.id)));
  }
  assert.ok(fs.existsSync(path.join(root, 'public/hausammann-demo-2/brand/zopfbeck-logo-white.png')));
});

test('verified shop hours and pickup lead vary by branch and day', async () => {
  const { STORES, resolvePickup, hhmm, slotsFor } = await load('stores.mjs');
  assert.equal(STORES.length, 8);
  for (const store of STORES) { assert.match(store.source, /^https:\/\/www\.zopfbeck\.ch\/fil\./); assert.equal(store.hours.length, 7); }
  assert.equal(hhmm(resolvePickup('uni88', { mode: 'asap' }, MON_0802).minute), '08:15');
  assert.equal(hhmm(resolvePickup('raegimaert', { mode: 'asap' }, MON_0802).minute), '08:15');
  assert.equal(hhmm(resolvePickup('uni88', { mode: 'asap' }, SUN_1658).minute), '06:10');
  assert.equal(resolvePickup('uni88', { mode: 'at', dayOffset: 0, minute: 19 * 60 }, MON_0802).reason, 'outside_hours');
  assert.ok(slotsFor('zumikon', MON_0802, 1).length > 0);
});

test('touch and voice actions update quantities, choose store and language, then require explicit order approval', async () => {
  const { actions, ctx } = await setup();
  const added = actions.updateBasket(BASE, { items: [{ id: BREAD, quantity: 2, mode: 'add' }, { id: PASTRY, quantity: 1, mode: 'add' }] }, ctx);
  assert.deepEqual(added.next.basket, { [BREAD]: 2, [PASTRY]: 1 });
  assert.match(added.result.screen.basket, /2× Chnebelbrot/);
  const selected = actions.setPickup(added.next, { storeId: 'Rägimärt', time: '09:15', day: 'today' }, ctx).next;
  assert.equal(selected.storeId, 'raegimaert');
  const english = actions.setLanguage(selected, { language: 'en' }, ctx).next;
  assert.equal(english.lang, 'en');
  const checkout = actions.goTo(english, { view: 'checkout' }, ctx).next;
  assert.equal(checkout.sheet, 'checkout');
  assert.equal(actions.placeOrder(checkout, { customerSaidYes: false }, ctx).result.reason, 'needs_clear_yes');
  const placed = actions.placeOrder(checkout, { customerSaidYes: true }, ctx);
  assert.equal(placed.effect, 'pay');
  assert.match(placed.next.order.number, /^H-[0-9A-Z]{6}$/);
  assert.equal(placed.next.order.storeId, 'raegimaert');
  const fresh = actions.newOrder(placed.next, {}, ctx).next;
  assert.deepEqual(fresh.basket, {});
  assert.deepEqual(actions.orderAgain(fresh, {}, ctx).next.basket, added.next.basket);
});

test('need draft remains separate; headcount, browsing, acceptance and reopening preserve independently added items', async () => {
  const { actions, ctx } = await setup();
  const base = actions.updateBasket(BASE, { items: [{ id: BREAD, quantity: 2, mode: 'add' }] }, ctx).next;
  const draft = actions.proposeOrder(base, { request: 'Znüni für fünf, ohne Nüsse', title: 'Znüni', headcount: 5, constraints: 'Nussallergie abklären', items: [{ id: BREAD, quantity: 5 }, { id: LUNCH, quantity: 5 }] }, ctx).next;
  assert.deepEqual(draft.basket, { [BREAD]: 2 });
  assert.equal(draft.sheet, 'proposal');
  const hidden = actions.goTo(draft, { view: 'menu' }, ctx).next;
  assert.equal(hidden.proposal.items.length, 2);
  const browsed = actions.browseCategory(hidden, { category: 'patisserie' }, ctx).next;
  const extended = actions.updateBasket(browsed, { items: [{ id: PASTRY, quantity: 1, mode: 'add' }] }, ctx).next;
  assert.deepEqual(extended.basket, { [BREAD]: 2 });
  assert.equal(extended.proposal.items.length, 3);
  const scaled = actions.editProposal(extended, { headcount: 6 }, ctx).next;
  assert.equal(scaled.proposal.headcount, 6);
  assert.equal(scaled.proposal.constraints, 'Nussallergie abklären');
  const accepted = actions.acceptProposal(scaled, {}, ctx).next;
  assert.equal(accepted.proposal, null);
  assert.ok(accepted.basket[BREAD] > 2);
  const reopened = actions.reopenProposal(accepted, {}, ctx).next;
  assert.deepEqual(reopened.basket, { [BREAD]: 2 });
  assert.equal(reopened.proposal.headcount, 6);
  assert.equal(actions.placeOrder(reopened, { customerSaidYes: true }, ctx).result.reason, 'draft_pending');
});

test('gift options apply only to Confiserie and an order specific QR has a Hausammann identity', async () => {
  const { actions, ctx } = await setup();
  const draft = actions.proposeOrder(BASE, { title: 'Geschenk', items: [{ id: GIFT, quantity: 1, ribbon: true, card: 'Danke' }, { id: BREAD, quantity: 1, ribbon: true }] }, ctx).next;
  assert.deepEqual(draft.proposal.items[0].gift, { ribbon: true, card: 'Danke' });
  assert.equal(draft.proposal.items[1].gift, null);
  assert.equal(actions.setGift(draft, { id: BREAD, ribbon: true }, ctx).result.ok, false);
  const accepted = actions.acceptProposal(draft, {}, ctx).next;
  const placed = actions.placeOrder(accepted, { customerSaidYes: true }, ctx).next;
  const { qrMatrix, orderIdentity } = await load('orderQr.mjs');
  const payload = `HAUSAMMANN-DEMO|${placed.order.number}|${placed.order.storeId}|${placed.order.placedAtMs}`;
  const qr = qrMatrix(payload);
  assert.ok(qr.length > 20 && qr.every((row) => row.length === qr.length));
  assert.match(orderIdentity({ orderId: 'A', pickupCode: 'B', branchId: 'C', slotId: 'D' }), /^HAUSAMMANN-DEMO\|/);
});

test('voice prompt uses only Hausammann catalogue and guards stale or duplicate tool calls', async () => {
  const { buildMenu } = await load('menu.mjs');
  const { voiceInstructions, buildTools } = await load('voice.mjs');
  const menu = buildMenu(catalog);
  const prompt = voiceInstructions({ lang: 'de', menu, stateLine: '{}', memoryLine: 'First visit' });
  assert.match(prompt, /Grüezi bei Hausammann/);
  assert.match(prompt, /illustrative amounts/);
  assert.doesNotMatch(prompt, /Honold|Buttergipfel|Küsnacht/);
  for (const p of menu.products) assert.ok(prompt.includes(`${p.id}|`), p.id);
  let live = true, calls = 0;
  const tools = buildTools({ tool: (def) => def, z, api: { updateBasket: () => { calls += 1; return { ok: true }; } }, isCurrent: () => live });
  const update = tools.find((def) => def.name === 'update_basket');
  const input = { items: [{ product_id: BREAD, quantity: 1, mode: 'add' }], clear: false };
  await update.execute(input, null, { toolCall: { callId: 'same' } });
  await update.execute(input, null, { toolCall: { callId: 'same' } });
  assert.equal(calls, 1);
  live = false;
  assert.equal(JSON.parse(await update.execute(input, null, { toolCall: { callId: 'new' } })).reason, 'stale_session');
});

test('browser memory and token route are isolated from Honold and shared keys', async () => {
  const memory = await load('memory.mjs');
  const remembered = memory.rememberWords(memory.EMPTY_MEMORY, ['Ja', 'Zwei Chnebelbrote', 'Zwei Chnebelbrote']);
  assert.deepEqual(remembered.words, ['Zwei Chnebelbrote']);
  assert.match(memory.memoryContext(memory.rememberVisit(remembered, MON_0802), MON_0802, ''), /context only/);
  const component = fs.readFileSync(path.join(root, 'src/hausammann-order/HausammannOrder.jsx'), 'utf8');
  const route = fs.readFileSync(path.join(root, 'app/api/hausammann-order/realtime-token/route.js'), 'utf8');
  assert.match(component, /hausammann-order-last/);
  assert.match(component, /hausammann-order-lang/);
  assert.match(component, /\/api\/hausammann-order\/realtime-token/);
  assert.match(route, /process\.env\.HAUSAMMANN_ORDER_OPENAI_API_KEY/);
  assert.doesNotMatch(route, /Honold2|HONOLD_ORDER_OPENAI_API_KEY|process\.env\.OPENAI_API_KEY/);
});
