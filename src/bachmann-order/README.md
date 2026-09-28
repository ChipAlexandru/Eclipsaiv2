# Bachmann V2 concept demo

Additive, brand-isolated adaptation of the published Honold V2 order flow. Route: `/bachmann-demo-2`; token endpoint: `/api/bachmann-order/realtime-token`. No real payment, reservation, stock check, or order submission occurs. The TWINT confirmation, order tracker, pickup number, and QR are simulated. QR payloads begin `BACHMANN-DEMO|` and include the specific order's number, store, and timestamp.

The voice endpoint requires **only** `BACHMANN_ORDER_OPENAI_API_KEY`. Optional `BACHMANN_ORDER_REALTIME_MODEL` and `BACHMANN_ORDER_REASONING` customize the session. Without the dedicated key, the microphone reports that the assistant is unavailable. Neither another brand's key nor a shared fallback is used. The key must remain server-side.

The menu is an 18-product snapshot of the [official Bachmann homepage bestsellers](https://www.confiserie.ch/en), rechecked 28 September 2026. German labels were separately verified against each linked official `/de/` product page; English labels remain the homepage labels. IDs and prices do not change with language. It is not the full shop menu, and the listed prices are not live. The product images are local copies of those official listings. [Stadelhofen](https://www.confiserie.ch/de/stadelhofen) and [Bleicherweg](https://www.confiserie.ch/de/bleicherweg) addresses and ordinary weekly hours were rechecked on the same date. Special holiday hours, in-store stock, product preparation and pickup feasibility are not integrated. The ten-minute readiness delay is a demo assumption and should not be presented as a Bachmann service promise.

The pink-background standard logo comes from [Bachmann's logo page](https://www.confiserie.ch/bachmann-logos/). That page says logo download and use require Bachmann's knowledge and consent. Obtain permission for public deployment; also confirm rights for product photography and the proposed experience. This branch is for internal review, not publication.

The UI uses the V2 compact shop and shared touch/voice action layer, with proposal drafts separate from the basket, headcount and constraint editing, gift options, pickup selection, DE/EN, remembered prior order, and simulated checkout. Brand-specific local storage uses `bachmann-order-*` / `bachmann-order-2-memory` keys. No Honold runtime files are imported.

Run `node --test tests/bachmann-order.test.js` and `npm run build`. For local preview after build, run `./node_modules/.bin/next start -p 3021` and open `http://localhost:3021/bachmann-demo-2`.
