# Hausammann V2 order ahead concept

Route: `/hausammann-demo-4`. This is a separate Hausammann implementation of the published Honold V2 format. The existing `/hausammann-demo` route and Honold routes are unchanged.

## Source basis, checked 28 September 2026

- The 41 photographed product names and images come from Hausammann's official [bread](https://www.zopfbeck.ch/pro.bro), [patisserie](https://www.zopfbeck.ch/pro.pat), [traiteur](https://www.zopfbeck.ch/pro.tra), [confiserie](https://www.zopfbeck.ch/pro.con), and [glacerie](https://www.zopfbeck.ch/pro.gla) pages. `catalog.json` retains each source URL. Photos and the official logo are copied into `public/hausammann-demo-4/`.
- The eight selectable branches, addresses and regular weekly hours are from their official branch pages: [Uni 88](https://www.zopfbeck.ch/fil.uni), [Rägimärt](https://www.zopfbeck.ch/fil.rag), [Vorderberg](https://www.zopfbeck.ch/fil.vor), [Zollikon](https://www.zopfbeck.ch/fil.zol), [Uster](https://www.zopfbeck.ch/fil.ust), [Zumikon](https://www.zopfbeck.ch/fil.zum), [Guggach](https://www.zopfbeck.ch/fil.gug), and [Embrach](https://www.zopfbeck.ch/fil.emb). Special holiday hours are not modelled.
- Hausammann publishes a [2025 illustrated price list](https://www.zopfbeck.ch/assets/images/Hausammann_Preisliste_allgemein-mit-Abbildungen_2025_01.pdf) for particular catering products, but it does not establish current single item prices for the photographed 41 item catalogue. The CHF prices in this concept are **illustrative**, generated deterministically by `samplePriceChf` in `menu.mjs` from the earlier Hausammann demo. They must not be presented as Hausammann's live prices. There is no live inventory or item availability feed.

## Interaction

The Honold V2 hierarchy is preserved: phone canvas, brand header and DE/EN switch, compact branch/time bar, category rail and contained product photos, microphone and basket dock, basket, simulated TWINT checkout, and order specific pickup QR and progress. Touch and voice call the same pure actions. A complex need creates an editable draft separate from the basket. It can retain headcount and constraints, be hidden while browsing, accept into the basket, and reopen without duplicating separately added items. Simple commands change the basket directly. Checkout requires a clear final yes. Reorder rebuilds the last basket, with a fresh simulated checkout.

The ten minute preparation lead, pickup number, QR, payment, status time lapse, gift options, and prices are concept behavior. No real payment, reservation, order, or store message is made. Dietary and stock information are not verified. The QR encodes a `HAUSAMMANN-DEMO` identity for the specific simulated order.

## Voice and browser state

Voice uses only `HAUSAMMANN_ORDER_OPENAI_API_KEY` on the server. Set that dedicated variable in `.env.local` to activate it locally; there is deliberately no fallback to Honold, Honold2, V1, or a shared key. Optional variables are `HAUSAMMANN_ORDER_REALTIME_MODEL` (default `gpt-realtime-2.1`) and `HAUSAMMANN_ORDER_REASONING` (default `minimal`). The token route is `/api/hausammann-order/realtime-token` and returns a short lived client secret. Without the dedicated key, touch shopping remains usable. A voice session needs browser microphone permission and account quota; action tests do not establish live voice quality.

Browser memory, last order and language use `hausammann-order-memory`, `hausammann-order-last` and `hausammann-order-lang`. No state or key is shared with other bakery demos. The `?debug=voice` route exposes `window.__hausammannOrderRun(name, args)` for action testing without audio.

Run focused tests with `node --test tests/hausammann-order.test.js`. Preview on port 3022 with `./node_modules/.bin/next dev -p 3022` and open `http://localhost:3022/hausammann-demo-4`.
