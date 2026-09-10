# Juliette demo catalogue

`catalog.json` is a static snapshot of the public products listed at
`https://juliette-boulangerie.ch/collections/all`. It is intentionally not a
physical-store stock source.

Rebuild the snapshot from the repository root with:

```sh
node scripts/extract-juliette-catalog.mjs --force
```

The extraction walks every collection page, reconciles listed handles against
Shopify's public products feed, downloads every gallery photo at a 1400-pixel
maximum width, and writes `catalog-report.json`. A non-zero exit means at least
one completeness check or image download failed.

Current snapshot (2026-09-10): 91 listed products, 94 gallery photos, 11
collection pages, and no recorded failures. Prices and online availability are
source metadata only; neither is evidence of physical availability at the
Erlenbach store.

`stockAdapter.mjs` is the explicit boundary for a later real inventory adapter.
The current implementation returns deterministic sample quantities and never
creates orders, payments, reservations, or store messages.
