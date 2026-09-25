# Honold order-ahead demo (parallel version)

Public route: `/honold-demo-2`. Local working route: `/honold-order`. Both use the same V2 component; `/honold-demo` is unchanged.

## Idea

Order ahead on the phone, pay, walk past the queue and give your number at the counter. The pattern comes from app-first coffee chains; here it uses Honold's catalogue, shops and Swiss details (German first with Sie, TWINT, real opening hours).

Flow: menu → basket → pay with TWINT (simulated) → pickup number with live status.
Voice is an extra way to do the same steps, not a separate mode.

## What is real and what is not

- Real: 134 products, names, prices and photos (public shop snapshot from 19 Sep 2026, copied from `src/honold-demo/catalog.json`); the six shop addresses and opening hours from honold.ch/standorte (checked 25 Sep 2026).
- Demo only: 10-minute preparation time, pickup numbers, payment, order status (runs in time-lapse; tap the status bar to skip ahead), "last order" (kept in this browser only). Nothing is sent to Honold.

## Voice

What it does:
- Opens with a brief welcome and offer to help, without tutorial examples. Remembers returning customers on the same browser.
- Can press every button on the screen: add/change/remove products, show suggestions, switch category, change shop and time, go to checkout, pay (only after a clear yes), order again, new order, order status, switch DE/EN. One tool per button (`actions.mjs`); touch uses the same functions.
- Every tool result carries the current screen and a short next-step hint, so the voice guides one step at a time.
- Complex needs create an editable proposal, separate from the basket until accepted. Customers can change quantities and headcount, browse to add products, hide/resume the draft, or reopen an accepted selection.
- Remembers on this phone only (localStorage): visits, last order, preferred shop, and the customer's last few sentences. Given to the model as context, never as an instruction.

Why it should feel smoother than `/honold-demo`: full menu in the prompt (no search step), one call per request, tool answers in milliseconds, touch changes sent as silent notes, no "einen Moment" preambles, short replies.

## Setup: OpenAI key

The browser never sees the key. The server route `/api/honold-order/realtime-token` uses it to get a short-lived token.

| Variable | Needed | Value |
|---|---|---|
| `HONOLD_ORDER_OPENAI_API_KEY` | yes | the new OpenAI key (`sk-...`) |
| `HONOLD_ORDER_REALTIME_MODEL` | no | default `gpt-realtime-2.1` |
| `HONOLD_ORDER_REASONING` | no | `minimal` (default), `low` or `medium`; minimal answered fastest and without filler sentences in tests |

- Vercel: Project → Settings → Environment Variables → add `HONOLD_ORDER_OPENAI_API_KEY`, tick Preview (and Production if merged) → redeploy.
- Local: add the line `HONOLD_ORDER_OPENAI_API_KEY=sk-...` to `.env.local` in the repo root (already git-ignored), then `npm run dev` and open http://localhost:3000/honold-order.

Test without audio: open `/honold-order?debug=voice` and call `window.__honoldOrderRun("updateBasket", { items: [{ id: "1943", quantity: 2, mode: "add" }] })` in the console.

## Files

- `HonoldOrder.jsx` UI and voice session
- `actions.mjs` every shop button as one function (used by touch and voice)
- `voice.mjs` prompt and tools
- `memory.mjs` what is remembered on this phone
- `menu.mjs` menu, basket, order status
- `stores.mjs` shops, hours, pickup times
- `copy.mjs` German and English text
- tests: `tests/honold-order.test.js`
