# Zürich Duty Free voice-shopping concept

An isolated Avolta feature for open-ended, voice-and-touch discovery around a captured Zürich flight day. The companion uses 205 source-backed product listings, explicit flight confirmation, traveler-provided journey context and simulated same-journey fulfillment. It has no runtime dependency on the legacy demo feature or on airport data services.

## Run locally

```bash
AVOLTA_DEMO_PASSCODE='choose-a-passcode' AVOLTA_OPENAI_API_KEY='server-only-key' AVOLTA_OPENAI_REALTIME_MODEL='gpt-realtime-2.1-mini' npm run dev
```

Open `http://localhost:3000/avolta-demo`. Touch browsing works without the OpenAI key; voice requires it.

## Public sources captured 2026-09-11

- Storefront and product pages: `https://zurich.shopdutyfree.com/de/48/`
- Departure-shop context: `https://zurich.shopdutyfree.com/de/pickup-points` — the official site describes the main duty-free store after security and its current pickup facilities.
- Reserve & Collect overview: `https://www.flughafen-zuerich.ch/en/passengers/shopping-and-enjoy/shops/duty-free`
- Avolta visual-identity reference: `https://www.avoltaworld.com/system/files/2025-08/250626%20Avolta_CMD%2025_FINAL.pdf` and `https://www.avoltaworld.com/`.

This concept is not a copy of the current Reserve & Collect service. It proposes quick pickup during the traveler’s current airport journey, so it does not inherit the public service’s advance-booking window. The demo requires an upcoming departure but does not promise an exact preparation or walking time.

The visual palette is derived from current public Avolta presentation and web material (deep violet, pale lavender, coral and lime). It is not asserted to be a reproduction of confidential brand guidelines.

## Catalog basis

`catalog.json` contains 205 public product records across fragrance, beauty and skincare, spirits, Swiss chocolate and Swiss gifts. Each record retains the product URL, original image URL, local image, capture timestamp, CHF price, variant and public-listing basis. Tobacco is excluded. Run `node scripts/extract-avolta-catalog.mjs` from the repository root to regenerate the catalog and local images from the recorded source snapshot.

Prices, offer labels and online listing status are captured public data. They are not live physical-store inventory. The UI identifies the set as a curated captured selection rather than the full store assortment.

## Security and product boundaries

- `AVOLTA_DEMO_PASSCODE` is checked server-side and represented by an HttpOnly, same-site access cookie.
- `AVOLTA_OPENAI_API_KEY` is Avolta-specific and is read only by the server-side Realtime token route; it does not replace the key used by other demos.
- `AVOLTA_OPENAI_REALTIME_MODEL` defaults to the proven `gpt-realtime-2.1-mini` configuration. The explicit full-model option is `gpt-realtime-2.1`; invalid values fail closed rather than falling back.
- The Realtime token endpoint requires the same access cookie, returns only a short-lived client secret and applies a per-instance session-start limit.
- Voice sessions end after five minutes.
- Page metadata, response behavior and `robots.txt` keep the route out of indexing; it is absent from the sitemap.
- Reservations are local concept summaries only. No payment, stock hold, store submission, notification or live system mutation occurs.
- Flight context comes from the immutable `zrh-departures-2026-09-12-v1` fixture. Production makes no airport, queue or traffic request; one session clock replays the captured day and persists only in the current browser tab.
- Shortlist, journey, flight and demo-order state persist only in the current tab's session storage. Audio is not retained and no transcript UI is built.

The in-memory session limiter is a defense-in-depth demo control, not a globally consistent distributed rate limiter. A production deployment should use a shared rate-limit store or identity-aware access proxy.
