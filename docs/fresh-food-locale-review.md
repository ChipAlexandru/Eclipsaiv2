# Fresh-food homepage: locale review handoff

**Status: contextually adapted, not native-reviewed.** The English homepage is
the approved source. German, French, Italian, and Romanian reuse the operating
language already established on the previous homepage, but a native operator
or editor should make the final call before outreach or paid traffic.

Source of truth: `src/views/fresh-food/freshFoodContent.en.js`.
Locale files: `freshFoodContent.{de,fr,it,ro}.js`.
`locales.js` enforces the same key structure across all five languages.

## Decisions that must remain consistent

- The visual demo stays in English on every localized page. Only the website
  control that opens and closes it is localized.
- "Profit brain" is not translated literally. Each locale keeps the existing
  operating-intelligence formulation.
- "Profit impact" in the live box means implemented profit from verified
  production changes. It is not the theoretical economic-profit opportunity.
- "Production order lines changed" counts individual order lines whose
  quantity changed, not products, recommendations, or shops.
- "Estimated waste reduction" is measured against initial waste, not against
  production or sales.
- Sellout and missed sale remain distinct. A sellout can be correct; a missed
  sale is margin that may have been lost.
- "Write into the production system" means a confirmed operational update,
  through an API or computer use for an older system. Avoid language that
  sounds like a report was merely handed to the operator.
- LIVE is a status, not decorative copy. The site shows it only when the
  current production source is reached and recent. A fallback is labeled as
  the latest verified result.
- CHF 40–60K, 2 to 20 locations, and the live metrics are not translated or
  recalculated. Only number and date formatting changes by locale.

## High-priority native review

| Meaning | German | French | Italian | Romanian |
|---|---|---|---|---|
| Profit brain for fresh food | Operative Intelligenz für Frischebetriebe | L'intelligence opérationnelle des métiers du frais | Intelligenza operativa per il fresco | Inteligență operațională pentru afacerile cu produse proaspete |
| Production order lines changed | geänderte Positionen in Produktionsaufträgen | lignes de commande de production modifiées | righe degli ordini di produzione modificate | linii modificate în comenzile de producție |
| Profit impact as share of sales | Gewinnwirkung im Verhältnis zum Umsatz | impact sur le profit en part du chiffre d'affaires | impatto sul profitto in percentuale delle vendite | impact asupra profitului ca procent din vânzări |
| Implement and follow through | Umsetzen und nachverfolgen | Mettre en œuvre et suivre | Implementare e verificare | Implementăm și urmărim rezultatul |

Review these phrases for the vocabulary an owner would actually use, not for
literal similarity to the English. German must remain Swiss Standard German
with `ss`, not `ß`. Italian and Romanian should retain the register already
used elsewhere on their pages.

## Layout review

Check all five routes at desktop and narrow mobile widths. The longest current
risks are the German hero and the localized fallback-status label inside the
live-results box. Confirm that the call-to-action remains the final element of
the mobile hero and that no translated text introduces horizontal overflow.
