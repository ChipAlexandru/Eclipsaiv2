// Every button in the shop, as a pure action: (state, args, ctx) → { next, result }.
// Touch and voice both go through these, so voice can do exactly what the buttons do.
// result = { ok, ...facts, screen, next_step } — short, so the voice model answers fast.
import { CATEGORIES, applyBasket, basketTotals, chf, nextOrder, pickupNumber, statusAt } from "./menu.mjs";
import { STORES, hhmm, hoursLabel, parseClock, resolvePickup, slotsFor, storeById } from "./stores.mjs";

const readyLabel = (p) => (p?.ok ? `${p.dayOffset === 1 ? "tomorrow " : p.dayOffset > 1 ? `in ${p.dayOffset} days ` : "today "}${hhmm(p.minute)}` : "shop closed");

export function screenSummary(state, menu, nowMs) {
  const tot = basketTotals(state.basket, menu.byId, state.basketOrder);
  const pickup = resolvePickup(state.storeId, state.when, nowMs);
  const view = state.view === "order" ? "order_status" : state.sheet === "checkout" ? "checkout" : state.sheet === "pickup" ? "pickup_picker" : state.sheet === "proposal" ? "proposal_card" : "menu";
  return {
    view,
    category: state.category === "foryou" ? `for_you: ${state.forYou?.title || ""}` : state.category,
    basket: tot.lines.map((l) => `${l.quantity}× ${l.name} [${l.id}]`).join(", ") || "empty",
    total: chf(tot.totalChf, "de"),
    shop: storeById(state.storeId)?.name,
    ready: readyLabel(pickup) + (state.when.mode === "asap" ? " (asap)" : ""),
    ...(state.proposal ? { proposal_open: proposalText(state.proposal, menu), proposal_headcount: state.proposal.headcount,
      proposal_constraints: state.proposal.constraints || "", proposal_total: chf(state.proposal.items.reduce((sum, i) => sum + (menu.byId[i.id]?.priceChf || 0) * i.quantity, 0), "de") } : {}),
    ...(state.acceptedProposal ? { accepted_selection_editable: true } : {}),
    ...(Object.keys(state.gifts || {}).length ? { gifts: giftText(state.gifts, menu) } : {}),
    ...(state.order ? { order: `#${state.order.number} ${statusAt(state.order, nowMs)}` } : {}),
    language: state.lang,
  };
}

function done(state, next, ctx, result, nextStep) {
  const s = next || state;
  return { next, result: { ...result, screen: screenSummary(s, ctx.menu, ctx.nowMs), ...(nextStep ? { next_step: nextStep } : {}) } };
}

export function updateBasket(state, { items = [], clear = false, target = "auto" }, ctx) {
  if (target === "draft" && !state.proposal) return done(state, null, ctx, { ok: false, reason: "no_proposal" }, "There is no open suggestion.");
  // A visible need stays separate from the basket. Product taps and ordinary voice
  // quantity commands edit that draft until the customer accepts or discards it.
  if (state.proposal && target !== "basket") {
    if (clear) return done(state, { ...state, proposal: { ...state.proposal, items: [] } }, ctx, { ok: true, draft_cleared: true }, "The suggestion is empty. Ask what should go in it.");
    if (!items.length) return done(state, null, ctx, { ok: false, reason: "no_items" }, "Ask which product and how many.");
    let next = state;
    for (const item of items) {
      const current = next.proposal.items.find((i) => i.id === String(item.id))?.quantity || 0;
      const result = editProposal(next, { id: item.id, quantity: item.mode === "set" ? item.quantity : current + item.quantity }, ctx);
      if (!result.result.ok) return result;
      next = result.next;
    }
    return done(state, next, ctx, { ok: true, draft_updated: true }, "Confirm the suggestion changed; it is not yet in the basket.");
  }
  if (clear) {
    return done(state, { ...state, basket: {}, basketOrder: [], gifts: {}, acceptedProposal: null }, ctx, { ok: true, cleared: true }, "Say the basket is empty and ask what they would like instead.");
  }
  if (!items.length) return done(state, null, ctx, { ok: false, reason: "no_items" }, "Ask which product and how many.");
  const { basket, unknown } = applyBasket(state.basket, items, ctx.menu.byId);
  const added = items.map((i) => String(i.id)).filter((id) => basket[id] && !state.basketOrder.includes(id));
  let acceptedProposal = state.acceptedProposal;
  if (acceptedProposal) {
    const touched = new Set(items.map((i) => String(i.id)));
    const contributions = { ...acceptedProposal.contributions };
    for (const id of touched) if (contributions[id]) {
      const total = basket[id] || 0;
      const baseline = acceptedProposal.baseline?.[id] || 0;
      contributions[id] = Math.min(contributions[id], Math.max(0, total - Math.min(baseline, total)));
    }
    acceptedProposal = { ...acceptedProposal, contributions };
  }
  const next = { ...state, basket, acceptedProposal, basketOrder: nextOrder([...state.basketOrder, ...added], basket), view: "menu" };
  const ok = unknown.length < items.length;
  const count = Object.values(basket).reduce((a, b) => a + b, 0);
  return done(state, ok ? next : null, ctx,
    { ok, ...(unknown.length ? { unknown_ids: unknown } : {}) },
    !ok ? "Those ids are not on the menu. Offer 2–3 real options with show_products."
      : count === 0 ? "Say the basket is now empty and ask what they would like."
        : state.sheet === "checkout" ? "Say the new total and ask: Soll ich bestellen?"
          : "Confirm in a few words. Then one short next step: something to go with it, or 'zur Kasse'.");
}

export function showProducts(state, { ids = [], title = "" }, ctx) {
  const valid = ids.map(String).filter((id) => ctx.menu.byId[id]);
  if (!valid.length) return done(state, null, ctx, { ok: false, reason: "unknown_ids" }, "Pick ids from the MENU list and try again.");
  const next = { ...state, forYou: { ids: valid, title: title.slice(0, 40) }, category: "foryou", view: "menu", sheet: null };
  return done(state, next, ctx, { ok: true, shown: valid.map((id) => ctx.menu.byId[id].name) }, "They now see these on screen. Name at most two, then ask which one and how many.");
}

export function browseCategory(state, { category }, ctx) {
  const cat = CATEGORIES.find((c) => c.id === category || c.de.toLowerCase() === String(category).toLowerCase() || c.en.toLowerCase() === String(category).toLowerCase());
  if (!cat) return done(state, null, ctx, { ok: false, reason: "unknown_category", categories: CATEGORIES.map((c) => c.id) }, "Offer the available categories.");
  const next = { ...state, category: cat.id, view: "menu", sheet: null };
  return done(state, next, ctx, { ok: true, showing: cat.de, count: ctx.menu.byCategory[cat.id].length }, "Say they can tap or tell you what they would like from this category.");
}

export function setPickup(state, { storeId, time, day }, ctx) {
  const store = storeId
    ? STORES.find((x) => x.id === storeId || x.name.toLowerCase() === String(storeId).toLowerCase() || x.name.toLowerCase().includes(String(storeId).toLowerCase()))
    : storeById(state.storeId);
  if (!store) return done(state, null, ctx, { ok: false, reason: "unknown_store", shops: STORES.map((x) => x.name) }, "Name the Honold shops and ask which one.");
  let when = state.when;
  const dayOffset = day === "tomorrow" ? 1 : 0;
  if (time === "asap") when = { mode: "asap" };
  else if (time) {
    const minute = parseClock(time);
    if (minute == null) return done(state, null, ctx, { ok: false, reason: "unreadable_time" }, "Ask for the time again, e.g. 'um 8 Uhr 15'.");
    when = { mode: "at", dayOffset, minute };
  } else if (day === "tomorrow") {
    const first = slotsFor(store.id, ctx.nowMs, 1)[0];
    when = first ? { mode: "at", dayOffset: 1, minute: first.minute } : state.when;
  }
  let p = resolvePickup(store.id, when, ctx.nowMs);
  if (!p.ok && !time && !day) { when = { mode: "asap" }; p = resolvePickup(store.id, when, ctx.nowMs); } // shop change only: keep time if it fits, else earliest
  if (!p.ok && store.id !== state.storeId) {
    // The customer clearly wants this shop: switch to it with the earliest time and say the wished time did not work.
    const asap = resolvePickup(store.id, { mode: "asap" }, ctx.nowMs);
    if (asap.ok) {
      const next = { ...state, storeId: store.id, when: { mode: "asap" } };
      return done(state, next, ctx, { ok: true, shop: store.name, ready: readyLabel(asap), requested_time_not_possible: p.reason },
        "Say the wished time does not work, name the earliest time in this shop, and offer the wished time tomorrow instead.");
    }
  }
  if (!p.ok) {
    const alt = p.suggestion ? readyLabel({ ok: true, ...p.suggestion }) : null;
    return done(state, null, ctx, { ok: false, reason: p.reason, shop: store.name, ...(p.hours ? { opening_hours: hoursLabel(p.hours) } : {}), ...(alt ? { earliest: alt } : {}) },
      "Explain briefly and offer the earliest time or another time within opening hours.");
  }
  const next = { ...state, storeId: store.id, when };
  return done(state, next, ctx, { ok: true, shop: store.name, ready: readyLabel(p) }, state.sheet === "checkout" ? "Confirm and ask: Soll ich bestellen?" : "Confirm shop and time in one short sentence.");
}

export function goTo(state, { view }, ctx) {
  if (view === "menu" || view === "close") return done(state, { ...state, view: "menu", sheet: null }, ctx, { ok: true }, null);
  if (view === "proposal") {
    if (!state.proposal) return done(state, null, ctx, { ok: false, reason: "no_proposal" }, null);
    return done(state, { ...state, view: "menu", sheet: "proposal" }, ctx, { ok: true }, null);
  }
  if (view === "pickup") return done(state, { ...state, view: "menu", sheet: "pickup", pickupReturn: state.sheet === "checkout" || state.sheet === "proposal" ? state.sheet : null }, ctx, { ok: true, shops: STORES.map((x) => x.name) }, "Ask which shop and when, or offer 'so bald wie möglich'.");
  if (view === "order_status") {
    if (!state.order) return done(state, null, ctx, { ok: false, reason: "no_order_yet" }, "Say there is no order yet and offer help to order.");
    return done(state, { ...state, view: "order", sheet: null }, ctx, { ok: true, pickup_number: state.order.number, status: statusAt(state.order, ctx.nowMs) }, "Tell status and pickup number briefly.");
  }
  if (view === "checkout") {
    const tot = basketTotals(state.basket, ctx.menu.byId, state.basketOrder);
    if (!tot.count) return done(state, null, ctx, { ok: false, reason: "basket_empty" }, "Say the basket is empty and ask what they would like.");
    const p = resolvePickup(state.storeId, state.when, ctx.nowMs);
    return done(state, { ...state, view: "menu", sheet: "checkout" }, ctx,
      { ok: true, items: tot.count, total: chf(tot.totalChf, "de"), payment: "TWINT (simulated)", pickup_ok: p.ok },
      p.ok ? "In ONE sentence say total, shop and ready time, then ask: Soll ich bestellen?" : "The shop is closed then; offer another time first.");
  }
  return done(state, null, ctx, { ok: false, reason: "unknown_view" }, null);
}

export function placeOrder(state, { customerSaidYes, basketOnly = false }, ctx) {
  if (!customerSaidYes) return done(state, null, ctx, { ok: false, reason: "needs_clear_yes" }, "Ask: Soll ich bestellen?");
  if (state.proposal && !basketOnly) return done(state, null, ctx, { ok: false, reason: "draft_pending" }, "The basket is separate from the open suggestion. Ask whether to order only the basket or add the suggestion first.");
  const tot = basketTotals(state.basket, ctx.menu.byId, state.basketOrder);
  if (!tot.count) return done(state, null, ctx, { ok: false, reason: "basket_empty" }, "Say the basket is empty.");
  const p = resolvePickup(state.storeId, state.when, ctx.nowMs);
  if (!p.ok) return done(state, null, ctx, { ok: false, reason: "pickup_time_invalid" }, "Offer the earliest possible time first.");
  const order = {
    number: pickupNumber(ctx.nowMs), placedAtMs: ctx.nowMs, skipMs: 0, storeId: state.storeId,
    readyMinute: p.minute, readyDayOffset: p.dayOffset,
    lines: tot.lines.map((l) => ({ id: l.id, name: l.name, quantity: l.quantity, lineChf: l.lineChf, gift: (state.gifts || {})[l.id] || null })), totalChf: tot.totalChf,
  };
  const lastOrder = { basket: state.basket, order: state.basketOrder, gifts: state.gifts || {}, storeId: state.storeId, summary: order.lines.map((l) => `${l.quantity}× ${l.name}`).join(", ") };
  const next = { ...state, order, lastOrder, paying: true, sheet: "checkout", acceptedProposal: null };
  return { ...done(state, next, ctx, { ok: true, pickup_number: order.number, ready: readyLabel(p), paid: "TWINT (simulated)" },
    "Thank them warmly in one sentence: number, shop and ready time; they say the number at the counter, no queue."), effect: "pay" };
}

export function orderAgain(state, _args, ctx) {
  if (!state.lastOrder) return done(state, null, ctx, { ok: false, reason: "no_previous_order" }, "Say there is no earlier order on this phone and ask what they would like.");
  const basket = Object.fromEntries(Object.entries(state.lastOrder.basket).filter(([id]) => ctx.menu.byId[id]));
  const next = { ...state, basket, basketOrder: nextOrder(state.lastOrder.order || [], basket), gifts: { ...(state.lastOrder.gifts || {}) }, storeId: state.lastOrder.storeId || state.storeId, when: { mode: "asap" }, view: "menu", sheet: null, proposal: null, acceptedProposal: null };
  return done(state, next, ctx, { ok: true, basket: state.lastOrder.summary }, "Say it's in the basket like last time and offer: anything else, or zur Kasse.");
}

export function newOrder(state, _args, ctx) {
  const next = { ...state, view: "menu", sheet: null, order: null, basket: {}, basketOrder: [], gifts: {}, proposal: null, acceptedProposal: null, forYou: null, category: "baeckerei" };
  return done(state, next, ctx, { ok: true }, "Ask what they would like this time.");
}

export function setLanguage(state, { language }, ctx) {
  const lang = /^en/i.test(language) ? "en" : "de";
  return done(state, { ...state, lang }, ctx, { ok: true, language: lang }, lang === "en" ? "Continue in English." : "Continue in Swiss Standard German.");
}

export function skipAhead(order) {
  return order ? { ...order, skipMs: (order.skipMs || 0) + 8000 } : order;
}

// ---------- proposals: the assistant's answer to a need ("etwas Herzhaftes für 5") ----------
export const GIFT_CATEGORIES = new Set(["schokolade", "konfekt"]);
export const CARD_TEXTS = ["Happy Birthday", "Alles Gute", "Danke"];
const giftable = (menu, id) => GIFT_CATEGORIES.has(menu.byId[id]?.category);

function cleanGift(menu, id, ribbon, card) {
  if (!giftable(menu, id)) return null;
  const c = CARD_TEXTS.find((x) => x.toLowerCase() === String(card || "").toLowerCase()) || null;
  return ribbon || c ? { ribbon: Boolean(ribbon), card: c } : null;
}
export function giftLabel(gift, lang = "de") {
  if (!gift) return "";
  const parts = [];
  if (gift.ribbon) parts.push(lang === "en" ? "with ribbon" : "mit Schleife");
  if (gift.card) parts.push(lang === "en" ? `card «${gift.card}»` : `Karte «${gift.card}»`);
  return parts.join(" · ");
}
function giftText(gifts, menu) {
  return Object.entries(gifts).map(([id, g]) => `${menu.byId[id]?.name}: ${giftLabel(g, "en")}`).join("; ");
}
function proposalText(p, menu) {
  return `${p.title}${p.headcount ? ` · ${p.headcount} people` : ""}: ${p.items.map((i) => `${i.quantity}× ${menu.byId[i.id]?.name} [${i.id}]${i.gift ? ` (${giftLabel(i.gift, "en")})` : ""}`).join(", ")}`;
}

function purposeTitle(title, headcount) {
  const value = String(title || "").slice(0, 48);
  if (!headcount) return value;
  return value.replace(/(?:[·–-]\s*)?(?:für\s*|for\s*)?\d+\s*(?:Personen|people|persons)\b/gi, "").replace(/[·–-]\s*$/, "").trim();
}

export function proposeOrder(state, { request = "", title = "", items = [], pickup = null, headcount = null, constraints = "" }, ctx) {
  const clean = [];
  const unknown = [];
  for (const i of items) {
    const id = String(i.id);
    if (!ctx.menu.byId[id]) { unknown.push(id); continue; }
    if (!Number.isInteger(Number(i.quantity)) || Number(i.quantity) < 1 || Number(i.quantity) > 99)
      return done(state, null, ctx, { ok: false, reason: "quantity_out_of_range" }, "Use a quantity from one to 99.");
    const quantity = Number(i.quantity);
    const existing = clean.find((x) => x.id === id);
    if (existing) existing.quantity = quantity; else clean.push({ id, quantity, gift: cleanGift(ctx.menu, id, i.ribbon, i.card) });
  }
  if (!clean.length) return done(state, null, ctx, { ok: false, reason: "no_valid_items", unknown_ids: unknown }, "Pick real ids from the MENU and propose again.");
  let next = { ...state, proposal: { request: String(request).slice(0, 140), title: purposeTitle(title, headcount), items: clean,
    headcount: Number.isInteger(Number(headcount)) && Number(headcount) > 0 ? Math.min(99, Number(headcount)) : null,
    constraints: String(constraints || "").slice(0, 120) }, sheet: "proposal", view: "menu" };
  let pickupResult = null;
  if (pickup && (pickup.storeId || pickup.time || pickup.day)) {
    const r = setPickup(next, pickup, ctx);
    pickupResult = r.result;
    if (r.next) next = { ...r.next, sheet: "proposal", view: "menu" };
  }
  const total = clean.reduce((sum, i) => sum + ctx.menu.byId[i.id].priceChf * i.quantity, 0);
  const pieces = clean.reduce((sum, i) => sum + i.quantity, 0);
  return done(state, next, ctx, {
    ok: true, pieces, total: chf(Math.round(total * 100) / 100, "de"),
    ...(unknown.length ? { unknown_ids: unknown } : {}),
    ...(pickupResult && !pickupResult.ok ? { pickup_problem: pickupResult.reason, earliest: pickupResult.earliest } : {}),
  }, "The card is on screen. Name at most three products and ask whether to add it. For simple changes use edit_proposal; do not recreate the card.");
}

export function proposeUsual(state, _args, ctx) {
  const last = state.lastOrder;
  if (!last) return done(state, null, ctx, { ok: false, reason: "no_usual_yet" }, "Say you don't know their usual yet on this phone, then offer to put something together.");
  const ids = (last.order && last.order.length ? last.order : Object.keys(last.basket)).filter((id) => ctx.menu.byId[id] && last.basket[id]);
  const items = ids.map((id) => ({ id, quantity: last.basket[id], ribbon: last.gifts?.[id]?.ribbon, card: last.gifts?.[id]?.card }));
  const title = state.lang === "en" ? "Your usual" : "Ihre übliche Bestellung";
  const out = proposeOrder(state, { request: "", title, items, pickup: last.storeId && last.storeId !== state.storeId ? { storeId: last.storeId } : null }, ctx);
  if (out.result?.ok) out.result.next_step = "Say their usual in one short sentence (products only) and the shop, then ask: Wieder so? You may suggest ONE fitting extra product, once.";
  return out;
}

export function adjustProposal(state, { id, quantity }, ctx) {
  return editProposal(state, { id, quantity }, ctx);
}

export function editProposal(state, { id = null, quantity = null, headcount = null, title = null }, ctx) {
  if (!state.proposal) return done(state, null, ctx, { ok: false, reason: "no_proposal" }, "There is no open suggestion.");
  let items = state.proposal.items;
  if (headcount != null && (!Number.isInteger(Number(headcount)) || Number(headcount) < 1 || Number(headcount) > 99))
    return done(state, null, ctx, { ok: false, reason: "headcount_out_of_range" }, "Use a party size from one to 99.");
  if (headcount != null && state.proposal.headcount && Number(headcount) !== state.proposal.headcount) {
    // A headcount change preserves the existing mix, with a deterministic nearest-piece rounding.
    const ratio = Number(headcount) / state.proposal.headcount;
    const scaled = items.map((i) => ({ ...i, quantity: Math.max(1, Math.round(i.quantity * ratio)) }));
    if (scaled.some((i) => i.quantity > 99)) return done(state, null, ctx, { ok: false, reason: "quantity_out_of_range" }, "Reduce product quantities before increasing the party size.");
    items = scaled;
  }
  if (id != null) {
    id = String(id);
    if (!ctx.menu.byId[id]) return done(state, null, ctx, { ok: false, reason: "unknown_product" }, "Choose a real product from the menu.");
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0 || Number(quantity) > 99) return done(state, null, ctx, { ok: false, reason: "quantity_out_of_range" }, "Use a quantity from zero to 99.");
    const q = Number(quantity);
    const exists = items.some((i) => i.id === id);
    items = items.map((i) => i.id === id ? { ...i, quantity: q } : i).filter((i) => i.quantity > 0);
    if (q > 0 && !exists) items = [...items, { id, gift: null, quantity: q }];
  }
  const proposal = { ...state.proposal, items,
    ...(headcount != null ? { headcount: Number(headcount) } : {}),
    ...(title != null ? { title: purposeTitle(title, headcount ?? state.proposal.headcount) } : {}) };
  return done(state, { ...state, proposal }, ctx, { ok: true, draft_updated: true }, "Confirm the changed suggestion briefly.");
}

export function discardProposal(state, _args, ctx) {
  if (!state.proposal) return done(state, null, ctx, { ok: false, reason: "no_proposal" }, null);
  return done(state, { ...state, proposal: null, sheet: null }, ctx, { ok: true, discarded: true }, "Ask what they would like instead.");
}

export function reopenProposal(state, _args, ctx) {
  const accepted = state.acceptedProposal;
  if (!accepted) return done(state, null, ctx, { ok: false, reason: "no_accepted_proposal" }, null);
  const basket = { ...state.basket };
  const gifts = { ...(state.gifts || {}) };
  for (const [id, qty] of Object.entries(accepted.contributions)) {
    const remaining = Math.max(0, (basket[id] || 0) - qty);
    if (remaining) basket[id] = remaining; else delete basket[id];
    if (remaining && accepted.baselineGifts?.[id]) gifts[id] = accepted.baselineGifts[id]; else delete gifts[id];
  }
  const proposal = { ...accepted.proposal, items: accepted.proposal.items.map((i) => ({ ...i, quantity: accepted.contributions[i.id] || 0 })).filter((i) => i.quantity > 0) };
  return done(state, { ...state, basket, gifts, basketOrder: nextOrder(state.basketOrder, basket), proposal, acceptedProposal: null, sheet: "proposal", view: "menu" }, ctx,
    { ok: true, reopened: true }, "The selection is open for editing; other basket items stayed put.");
}

export function acceptProposal(state, _args, ctx) {
  const p = state.proposal;
  if (!p) return done(state, null, ctx, { ok: false, reason: "no_proposal" }, "There is nothing to add. Ask what they would like.");
  if (!p.items.length) return done(state, null, ctx, { ok: false, reason: "proposal_empty" }, "Add at least one product first.");
  if (p.items.some((i) => (state.basket[i.id] || 0) + i.quantity > 99))
    return done(state, null, ctx, { ok: false, reason: "basket_quantity_limit" }, "Reduce the quantity to 99 per product before adding.");
  const { basket } = applyBasket(state.basket, p.items.map((i) => ({ id: i.id, quantity: i.quantity, mode: "add" })), ctx.menu.byId);
  const gifts = { ...(state.gifts || {}) };
  for (const i of p.items) if (i.gift) gifts[i.id] = i.gift;
  const next = { ...state, basket, basketOrder: nextOrder([...state.basketOrder, ...p.items.map((i) => i.id)], basket), gifts,
    acceptedProposal: { proposal: p, contributions: Object.fromEntries(p.items.map((i) => [i.id, i.quantity])),
      baseline: Object.fromEntries(p.items.map((i) => [i.id, state.basket[i.id] || 0])), baselineGifts: { ...(state.gifts || {}) } }, proposal: null, sheet: null, view: "menu" };
  return done(state, next, ctx, { ok: true, added: p.items.map((i) => `${i.quantity}× ${ctx.menu.byId[i.id].name}`) }, "Confirm in a few words that it is in the basket, then offer: noch etwas, oder zur Kasse?");
}

export function setGift(state, { id, ribbon = false, card = null, target = "auto" }, ctx) {
  id = String(id);
  if (!giftable(ctx.menu, id)) return done(state, null, ctx, { ok: false, reason: "gift_options_only_for_chocolate_and_confections" }, "Say gift wrapping is available for chocolate and confections.");
  const gift = cleanGift(ctx.menu, id, ribbon, card);
  if (target !== "basket" && state.proposal?.items.some((i) => i.id === id)) {
    const items = state.proposal.items.map((i) => (i.id === id ? { ...i, gift } : i));
    return done(state, { ...state, proposal: { ...state.proposal, items } }, ctx, { ok: true, gift: giftLabel(gift) || "none" }, "Confirm the gift option briefly.");
  }
  if (state.proposal && target !== "basket") return done(state, null, ctx, { ok: false, reason: "product_not_in_proposal" }, "Add that product to the suggestion first.");
  if (!state.basket[id]) return done(state, null, ctx, { ok: false, reason: "product_not_in_basket_or_proposal" }, "Add the product first.");
  const gifts = { ...(state.gifts || {}) };
  if (gift) gifts[id] = gift; else delete gifts[id];
  let acceptedProposal = state.acceptedProposal;
  if (target === "basket" && acceptedProposal?.contributions?.[id]) {
    const baselineGifts = { ...acceptedProposal.baselineGifts };
    if (gift) baselineGifts[id] = gift; else delete baselineGifts[id];
    acceptedProposal = { ...acceptedProposal, baselineGifts };
  }
  return done(state, { ...state, gifts, acceptedProposal }, ctx, { ok: true, gift: giftLabel(gift) || "none" }, "Confirm the gift option briefly.");
}
