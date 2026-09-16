# Fresh-food homepage: operational locale alignment

**Status: aligned with approved English meaning; native-language signoff has
not occurred.** German, French, Italian, and Romanian use operational wording
rather than literal slogan translations. A native operator or editor should
make the final call before outreach or paid traffic.

Source of truth: `src/views/fresh-food/freshFoodContent.en.js`.
Locale files: `freshFoodContent.{de,fr,it,ro}.js`.
`locales.js` enforces the same key structure across all five languages.

## Decisions that must remain consistent

- The on-page Profit Brain diagram and evidence tracker are localized. The
  diagram is desktop-only; mobile keeps the Demo button without a blank
  schematic panel. The embedded demo supports English and German only; its
  surrounding controls and slide descriptions are localized in all five
  languages.
- The hero keeps "The Profit Brain" as the brand phrase in every locale. Its
  continuation names sales, production, financials, and daily profit actions.
  The supporting explanation names shop, product, weekday decisions and daily
  measurement of profit, sales, and waste.
- The second-section headline means **build daily profit improvement loops**
  and does not repeat the Profit Brain name. The three operational stages are
  reading and analyzing systems, finding profit decisions, and implementing,
  measuring, and tracking results. Measurement is daily, not merely after a
  shop closes, and includes cash rather than a generic profit claim.
- "Impact" and "Demo" are concise navigation and button labels. Display
  headlines do not end in full stops. The closing line presents The Profit
  Brain **for** daily profit actions; it does not say the brand itself takes
  every action.
- The Impact headline states an opportunity of **1%** without an approximation
  word or symbol in any locale. Supporting figures and business-specific
  qualifiers remain unchanged.
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
- The historical evidence values, tracker values, 2 to 20 locations, and
  live metrics are not translated or recalculated. Only number and date
  formatting changes by locale.

## Terms aligned to the approved meaning

| Meaning | German | French | Italian | Romanian |
|---|---|---|---|---|
| Build daily profit improvement loops | Tägliche Verbesserungszyklen für den Gewinn aufbauen | Construire des cycles quotidiens d'amélioration du profit | Creare cicli quotidiani di miglioramento del profitto | Construiți cicluri zilnice de îmbunătățire a profitului |
| Find profit decisions | Gewinnentscheidungen finden | Identifier les décisions qui comptent pour le profit | Individuare le decisioni che incidono sul profitto | Identifică deciziile care influențează profitul |
| Impact navigation | Wirkung | Impact | Impatto | Impact |
| Brand for daily profit actions | für die täglichen Gewinnmassnahmen | pour les actions quotidiennes qui influencent le profit | per le azioni quotidiane che incidono sul profitto | pentru acțiunile zilnice care influențează profitul |
| Production order lines changed | Änderungen an Produktionsaufträgen (Positionen) | commandes de production modifiées (lignes) | modifiche agli ordini di produzione (righe) | modificări ale comenzilor de producție (linii) |
| Profit impact as share of sales | Gewinnwirkung im Verhältnis zum Umsatz | impact sur le profit en part du chiffre d'affaires | impatto sul profitto in percentuale delle vendite | impact asupra profitului ca procent din vânzări |

German remains Swiss Standard German with `ss`, not `ß`. The table records a
meaning audit, not native-language approval.

## Layout review

Local browser checks on 15 September 2026 used 1920 × 929 desktop and 390 ×
844 mobile for DE, FR, IT, and RO. Each page's document width equalled its
viewport width. On desktop, text bounds of all five lower diagram boxes (ERP,
POS, CRM, Production, Operations) stayed inside their borders. The system-box
widths reserve more room for translated labels; connectors follow the measured
box edges. On mobile, the schematic is hidden and the Demo button follows the
section text. These checks do not substitute for native review.
