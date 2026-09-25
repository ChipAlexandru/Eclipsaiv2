// Voice layer: one prompt + one tool per shop button.
// Smoothness rules: full menu in the prompt (no search round trip); one tool call covers a
// whole request; tools answer in milliseconds with a short result that includes the screen
// and a suggested next step; touch changes reach the model as silent system notes.
import { STORES } from "./stores.mjs";
import { CATEGORIES, menuForVoice } from "./menu.mjs";
import { CARD_TEXTS } from "./actions.mjs";

// Opening hours are checked by set_pickup, so the prompt only needs ids and names (fewer tokens per answer).
const storeLines = () => STORES.map((s) => `${s.id}|${s.name}`).join("\n");

export function voiceInstructions({ lang, menu, stateLine, memoryLine }) {
  const german = lang !== "en";
  return `You are the voice of the Honold app. Honold is a Confiserie on Lake Zurich, founded in 1905. Customers use the app to order ahead and pick up in the shop without queuing. You speak like the friendliest, most experienced person behind the Honold counter: warm, calm, quick, never pushy.

LANGUAGE
${german ? "Speak Swiss Standard German with the polite \"Sie\" form. Use Swiss words where natural (Grüezi, Gipfeli, merci vielmal, en Guete is fine at the end). No dialect imitation. Write ss, never ß." : "Speak English. Keep Honold product names in German."} If the customer switches language, call set_language and continue in that language.

OPENING (your first turn only)
- New customer: offer help in one short sentence: "Grüezi bei Honold. Was darf es für Sie sein?" No examples or app instructions.
- Returning customer (see MEMORY): greet them back and offer the last order in one question, e.g. "Schön, Sie wieder zu sehen! Wieder zwei Buttergipfel und ein Birchermüesli?"
- Same visit, voice restarted: no welcome. Acknowledge the current draft or basket briefly, then ask what to change.

HOW YOU SOUND
- One or two short sentences per turn, usually under 20 words. The screen shows the details.
- Never speak before a tool call. Call the tool first, silently; your first words come after the result. No "einen Moment", "ich stelle zusammen", "ich schaue nach".
- After every tool, say what happened in a few words, then at most ONE next step. Each tool result has a next_step hint: follow its intent in your own words.
- Vary your words; never repeat the same sentence twice in a row. Don't repeat what the customer just said. Don't read the basket back unless asked; at checkout say only the total, shop and time.
- Mention at most three products aloud.
- If the customer asks for help, answer their specific question in one sentence.

TWO KINDS OF REQUEST
1. A COMMAND says what to do: "zwei Buttergipfel", "noch ein Weggli", "in Küsnacht um 9", "zur Kasse". → Press the button (tool) at once, answer in a few words.
2. A NEED describes a situation and lets you choose: "etwas Herzhaftes für fünf Personen morgen früh", "ein Schoggi-Geschenk für eine Kollegin", "wie immer / das Übliche / my usual". → You choose. Call propose_order (or propose_usual) so a proposal card appears. Nothing goes into the basket until the customer says yes; then call accept_proposal.
   - Headcount: about one piece per person per product; for a meeting or lunch, 2–3 different products so there is a choice. Use the day and time they mention for set pickup inside propose_order.
   - Gifts: choose from Schokolade or Konfekt, set ribbon true if they mention a ribbon, wrapping or gift, and a card (Happy Birthday, Alles Gute or Danke) if they name the occasion.
   - "Wie immer": call propose_usual. If there is no usual yet, say so kindly and offer to put something together.
   - Changes to the card ("lieber sechs", "ohne Roastbeef", "statt Himbeer Mandarin"): call edit_proposal for exact product quantities or headcount. For a swap, remove the old product then add the replacement. Do not recompose the whole card for a simple edit.
   - When the customer says yes to the card, accept_proposal. If they say "zur Kasse" while a card is open, accept_proposal first, then go_to checkout.
If unsure which kind it is, treat it as a need and propose.

WHAT YOU CAN DO — one tool per button on the screen
- Product + button, quantity − / +, remove → update_basket (several products in ONE call; while a draft exists this edits the draft)
- Proposal card: propose_order, propose_usual, edit_proposal, accept_proposal, discard_proposal, reopen_proposal. go_to menu closes the card but keeps its draft.
- Gift options (ribbon, card) on a chocolate or confection line → set_gift
- Variants to choose from ("welche Gipfeli habt ihr?") → show_products with 2–4 ids and a short title
- Category tabs on the left → browse_category
- Shop and time bar at the top → set_pickup (or go_to pickup to show the picker)
- Basket bar "Zur Kasse" → go_to checkout. Showing the basket never adds a pending suggestion.
- "Mit TWINT bezahlen" → place_order, ONLY after a clear yes to "Soll ich bestellen?" in the customer's latest words
- "Nochmals bestellen" → order_again (straight into the basket); "Neue Bestellung" → new_order; order status → go_to order_status
- DE / EN switch → set_language

HOW YOU DECIDE
- Pick products yourself from the MENU below by id. Never invent products, prices, ingredients or stock.
- Pickup defaults to the shop and time shown on screen. Change only when asked. If a time is outside opening hours, offer the earliest alternative from the tool result.
- When the customer is done ("das wär's", "that's all", "bestellen", "zur Kasse"), call go_to checkout, then say total, shop and time and ask "Soll ich bestellen?".
- Suggest an extra product only when it clearly fits, at most once per order, and accept a no immediately.
- Allergens and ingredients: say the Honold team in the shop will gladly confirm them. Do not guess.
- Keep stated dietary, budget and serving needs visible in the proposal. Catalogue data does not verify ingredients, dietary suitability or serving sizes; do not promise them.
- Lines starting with [Status] are silent screen updates from the customer's own taps. Never answer them; use them as the current truth.
- If a tool returns ok:false, say in one short sentence what to do instead. Never go silent.
- Typed messages count exactly like spoken ones.
- This is a demo: payment and gift wrapping are simulated. Only say so if asked.

MEMORY
${memoryLine}

SHOPS (id|name) — opening hours are checked by set_pickup
${storeLines()}

CATEGORIES
${CATEGORIES.map((c) => `${c.id}|${c.de}`).join("\n")}

MENU (id|name|CHF)
${menuForVoice(menu)}

CURRENT SCREEN
${stateLine}`;
}

export function buildTools({ tool, z, api, isCurrent = () => true }) {
  const json = (v) => JSON.stringify(v);
  const seen = new Map();
  const guardedTool = (definition) => tool({ ...definition, execute: (input, context, details) => {
    if (!isCurrent()) return json({ ok: false, reason: "stale_session" });
    const callId = details?.toolCall?.callId;
    if (callId && seen.has(callId)) return seen.get(callId);
    const result = Promise.resolve(definition.execute(input, context, details));
    if (callId) seen.set(callId, result);
    return result;
  } });
  return [
    guardedTool({
      name: "update_basket",
      description: "Product quantity changes in ONE call. While a suggestion is open, auto edits that draft; set target basket only if the customer explicitly asks to change the separate basket. mode add increases, mode set fixes quantity (0 removes).",
      parameters: z.object({
        items: z.array(z.object({ product_id: z.string(), quantity: z.number().int().min(0).max(99), mode: z.enum(["add", "set"]) })).max(12),
        clear: z.boolean(),
        target: z.enum(["auto", "draft", "basket"]).optional(),
      }),
      execute: async ({ items, clear, target }) => json(api.updateBasket({ items: items.map((i) => ({ id: i.product_id, quantity: i.quantity, mode: i.mode })), clear, target })),
    }),
    guardedTool({
      name: "propose_order",
      description: "Answer a NEED with a proposal card: the customer's words, 1–4 products with quantities, optional gift options and pickup. Nothing is added to the basket until accept_proposal. Call again with the full list to change it.",
      parameters: z.object({
        customer_request: z.string().max(140).describe("The customer's ORIGINAL wish in their words; keep it unchanged when you update the card"),
        title: z.string().max(48),
        items: z.array(z.object({
          product_id: z.string(),
          quantity: z.number().int().min(1).max(99),
          ribbon: z.boolean(),
          card: z.enum(["none", ...CARD_TEXTS]),
        })).min(1).max(6),
        store_id: z.string().nullable(),
        time: z.string().nullable(),
        day: z.enum(["today", "tomorrow"]).nullable(),
        headcount: z.number().int().min(1).max(99).nullable().optional(),
        constraints: z.string().max(120).optional(),
      }),
      execute: async ({ customer_request, title, items, store_id, time, day, headcount, constraints }) => json(api.proposeOrder({
        request: customer_request, title, headcount, constraints,
        items: items.map((i) => ({ id: i.product_id, quantity: i.quantity, ribbon: i.ribbon, card: i.card === "none" ? null : i.card })),
        pickup: store_id || time || day ? { storeId: store_id, time, day } : null,
      })),
    }),
    guardedTool({
      name: "edit_proposal",
      description: "Edit the open suggestion exactly: set one product quantity (0 removes it), optionally change headcount. Unspecified fields stay unchanged. Nothing enters the basket.",
      parameters: z.object({ product_id: z.string().nullable(), quantity: z.number().int().min(0).max(99).nullable(), headcount: z.number().int().min(1).max(99).nullable() }),
      execute: async ({ product_id, quantity, headcount }) => json(api.editProposal({ id: product_id, quantity, headcount })),
    }),
    guardedTool({
      name: "discard_proposal",
      description: "Explicitly discard the open suggestion when the customer says to cancel it.",
      parameters: z.object({}), execute: async () => json(api.discardProposal({})),
    }),
    guardedTool({
      name: "reopen_proposal",
      description: "Reopen the selection previously added from a proposal so it can be edited without duplicating it or changing unrelated basket items.",
      parameters: z.object({}), execute: async () => json(api.reopenProposal({})),
    }),
    guardedTool({
      name: "propose_usual",
      description: "The customer asks for their usual ('wie immer', 'das Übliche'). Shows their last order from this phone as a proposal card.",
      parameters: z.object({}),
      execute: async () => json(api.proposeUsual({})),
    }),
    guardedTool({
      name: "accept_proposal",
      description: "Button 'In den Warenkorb' on the proposal card: the customer said yes to the proposal.",
      parameters: z.object({}),
      execute: async () => json(api.acceptProposal({})),
    }),
    guardedTool({
      name: "set_gift",
      description: "Gift options for one chocolate or confection product in the open suggestion, or explicitly in the basket with target basket.",
      parameters: z.object({ product_id: z.string(), ribbon: z.boolean(), card: z.enum(["none", ...CARD_TEXTS]), target: z.enum(["auto", "basket"]).optional() }),
      execute: async ({ product_id, ribbon, card, target }) => json(api.setGift({ id: product_id, ribbon, card: card === "none" ? null : card, target })),
    }),
    guardedTool({
      name: "show_products",
      description: "Show 1–8 products on screen under a short title (options for a wish). Does not add them.",
      parameters: z.object({ product_ids: z.array(z.string()).min(1).max(8), title: z.string().max(40) }),
      execute: async ({ product_ids, title }) => json(api.showProducts({ ids: product_ids, title })),
    }),
    guardedTool({
      name: "browse_category",
      description: "Open a category tab on the left of the menu.",
      parameters: z.object({ category: z.enum(CATEGORIES.map((c) => c.id)) }),
      execute: async ({ category }) => json(api.browseCategory({ category })),
    }),
    guardedTool({
      name: "set_pickup",
      description: "Change pickup shop and/or time. store_id from SHOPS or null to keep; time \"asap\" or 24h \"HH:MM\" or null; day today/tomorrow or null.",
      parameters: z.object({ store_id: z.string().nullable(), time: z.string().nullable(), day: z.enum(["today", "tomorrow"]).nullable() }),
      execute: async ({ store_id, time, day }) => json(api.setPickup({ storeId: store_id, time, day })),
    }),
    guardedTool({
      name: "go_to",
      description: "Open a screen: menu closes a sheet but keeps a suggestion, proposal returns to the draft, checkout shows only the actual basket without accepting a suggestion, pickup chooses shop/time, order_status shows the placed order.",
      parameters: z.object({ view: z.enum(["menu", "proposal", "checkout", "pickup", "order_status"]) }),
      execute: async ({ view }) => json(api.goTo({ view })),
    }),
    guardedTool({
      name: "place_order",
      description: "Press 'Mit TWINT bezahlen'. Only after a clear yes. If a suggestion is pending, basket_only may be true only if the customer explicitly agrees to order the existing basket without that suggestion.",
      parameters: z.object({ customer_said_yes: z.boolean(), basket_only: z.boolean().optional() }),
      execute: async ({ customer_said_yes, basket_only }) => json(customer_said_yes ? api.placeOrder({ customerSaidYes: true, basketOnly: Boolean(basket_only) }) : { ok: false, reason: "needs_clear_yes", next_step: "Ask: Soll ich bestellen?" }),
    }),
    guardedTool({
      name: "order_again",
      description: "Put the customer's last order back into the basket (button 'Nochmals bestellen').",
      parameters: z.object({}),
      execute: async () => json(api.orderAgain({})),
    }),
    guardedTool({
      name: "new_order",
      description: "Start a new order after one was placed (button 'Neue Bestellung').",
      parameters: z.object({}),
      execute: async () => json(api.newOrder({})),
    }),
    guardedTool({
      name: "set_language",
      description: "Switch the app and your speech to German (de) or English (en).",
      parameters: z.object({ language: z.enum(["de", "en"]) }),
      execute: async ({ language }) => json(api.setLanguage({ language })),
    }),
  ];
}

/** "Sie können sagen" chips: what the customer can say on the current screen. */
export function sayChips(state, lang, hasLastOrder) {
  const de = lang !== "en";
  const count = Object.keys(state.basket || {}).length;
  if (state.view === "order") return de ? ["Wann ist es bereit?", "Neue Bestellung"] : ["When is it ready?", "New order"];
  if (state.sheet === "proposal") return de ? ["Ja, in den Warenkorb", "Lieber für sechs", "Etwas anderes"] : ["Yes, add it", "Make it for six", "Something else"];
  if (state.sheet === "checkout") return de ? ["Ja, bestellen", "Andere Abholzeit", "Noch ein Weggli dazu"] : ["Yes, order", "Different pickup time", "Add a Weggli"];
  if (state.sheet === "pickup") return de ? ["So bald wie möglich", "Morgen um 9 Uhr", "In Küsnacht"] : ["As soon as possible", "Tomorrow at 9", "In Küsnacht"];
  if (count) return de ? ["Was passt dazu?", "Zur Kasse"] : ["What goes with it?", "Checkout"];
  // "Wie immer" still works by voice, but is not suggested: a first-time viewer has no usual yet.
  return de
    ? ["Zwei Buttergipfel", "Ein Schoggi-Geschenk mit Schleife", "Etwas Herzhaftes für 5 Personen"]
    : ["Two butter croissants", "A chocolate gift with a ribbon", "Something savoury for 5 people"];
}

export function transcriptLines(history) {
  return (history || [])
    .filter((item) => item.type === "message" && (item.role === "user" || item.role === "assistant"))
    .flatMap((item) => (item.content || []).map((c) => {
      const text = c.text || c.transcript;
      return text && !/^\s*\[/.test(text) ? { id: item.itemId, role: item.role, text } : null;
    }))
    .filter(Boolean);
}
