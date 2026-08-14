# Shared Eclipsai demo architecture

The shared presentation shell and animation engine support six demo configurations:

- `/Spruengli-demo-2`
- `/Hausammann-demo-1`
- `/BakeryBakery-demo-1`
- `/Steiner-Flughafebeck-demo-1`
- `/fresh-food-demo`
- `/restaurant-demo-0-0` (primary restaurant demo)
- `/restaurant-profit-brain-demo` (legacy alias)

Sprüngli, Hausammann, Bakery Bakery, Steiner Flughafebeck, the generic bakery demo and the restaurant demo use the shared shell. `next.config.js` rewrites each public URL to `index.html` with its configuration query parameter; the browser URL does not change.

## Files

- `index.html` — responsive seven-page presentation shell, navigation and language synchronization.
- `engine.html` — desktop animation and detailed profit views.
- `demo-configs.js` — the only place for client copy, products, locations, figures and asset paths.
- `assets/brand/` — shared Eclipsai brand assets.

Client directories retain their photographs. A migrated route also keeps a small `index.html` compatibility redirect instead of an independent demo implementation.

## Adding or changing a demo

1. Add or edit one entry in `demo-configs.js`.
2. Keep client photographs inside the client directory and reference them with absolute paths.
3. Add a public rewrite in `next.config.js` when introducing a new URL.
4. Verify German and English at 390 px and above 1120 px.

Shared presentation behavior, mobile layout and animation logic must stay in `index.html` or `engine.html`, never in a client directory.
