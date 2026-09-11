# Avolta feature seed import

- Source repository: `https://github.com/ChipAlexandru/Eclipsaiv2`
- Source commit: `295570de2627f82748527ea3111b747754d4a14b`
- Import date: `2026-09-11` (`Europe/Zurich`)
- Purpose: one-time feature seed for an independently evolving Avolta demo

Copied files:

- `src/juliette-demo/JulietteVoiceShop.jsx` → `src/avolta-demo/AvoltaVoiceShop.jsx`
- `src/juliette-demo/julietteVoiceShop.module.css` → `src/avolta-demo/avoltaVoiceShop.module.css`
- `src/juliette-demo/shopping.mjs` → `src/avolta-demo/shopping.mjs`
- `src/juliette-demo/stockAdapter.mjs` → `src/avolta-demo/stockAdapter.mjs`
- `app/juliette-demo/page.jsx` → `app/avolta-demo/page.jsx`
- `app/api/juliette-demo/realtime-token/route.js` → `app/api/avolta-demo/realtime-token/route.js`
- `tests/juliette-demo.test.js` → `tests/avolta-demo.test.js`

The copied files become Avolta-owned snapshots. The Avolta implementation must not import Juliette runtime files or assets.
