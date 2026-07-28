# Fresh-food homepage: locale review handoff

**Status: not native-reviewed.** These translations were produced by Claude from
the approved English source. A native operator or editor should make the final
call before paid traffic or outreach, **especially for Swiss German**, where
register and compound-noun readability matter more than literal accuracy.

Source of truth: `src/views/fresh-food/freshFoodContent.en.js`.
Locale files: `freshFoodContent.{de,fr,it,ro}.js`.
`locales.js` enforces an identical key structure across all five.

## Cross-locale decisions

- **"Profit brain" is not translated literally.** Each locale uses the
  established operating-intelligence phrasing already live on the site rather
  than a word-for-word "brain," which reads as gimmicky in all four languages.
- **"In cash" is never physical money.** Rendered as financial impact or
  economic result per locale (`finanzielle Wirkung`, `impact économique`,
  `in termini economici`, `impact financiar`).
- **Sell-out vs missed sale is kept distinct** in every locale. A sell-out may
  be a good outcome; a missed sale is the lost opportunity.
- **"Shop feedback" means operational information from shop teams, not
  customer satisfaction feedback.** The translations therefore use feedback
  from branches or observations from shop teams rather than the most literal
  local word for "feedback."
- **The 86% result is an estimated financial result from historical replay.**
  Every locale states that the proposed cuts had positive estimated net value;
  none reduces the claim to "demand was covered."
- **Approval and implementation are translated functionally.** The source
  describes owner approval first, then direct implementation once a class of
  recommendation has repeatedly proved reliable. Literal translations of
  "decision type proves reliable" were avoided where they sounded technical.
- **Quantities are untouched:** €40–60K, €190K, 860,000, 92%, 1 in 4, 86%,
  16 months, and 2 to 20 locations. Only decimal and thousands separators
  follow local convention.
- **"Start free"** is rendered as a free start, never as a time-limited trial
  or a claim that the product is free forever.
- **Booking CTAs are not forced into one literal length.** Navigation uses a
  shorter local "book a call" label; the hero and final offer state that the
  call lasts 20 minutes. This preserves meaning without causing navigation
  wrapping in German, Italian, or Romanian.

## German (Swiss Standard German, no ß)

| English | Implemented | Why it needs review |
|---|---|---|
| The profit brain for fresh food | Operative Intelligenz für Frischebetriebe | Deliberately avoids `Gewinnhirn`. Confirm `Frischebetriebe` is what Swiss bakery/café owners call themselves. |
| Know what to make tomorrow | Wissen, was morgen zu produzieren ist | Slightly formal. A native might prefer `Wissen, was Sie morgen produzieren`. |
| what your team sees | was Ihr Team sieht | Literal but idiomatic; confirm it does not sound like surveillance. |
| shop feedback | Rückmeldungen aus den Filialen | Operational feedback from branches, not customer reviews. |
| sell-out vs missed sale | Ausverkauf vs entgangener Verkauf | `Ausverkauf` can suggest a clearance sale in retail German. Confirm it reads as "sold out" in a bakery context. |
| proves the impact in cash | belegt die finanzielle Wirkung | Check `belegt` vs `weist nach` for tone. |
| the daily decisions that run a food business | die täglichen Entscheidungen, die einen Lebensmittelbetrieb am Laufen halten | Natural rather than literal. Confirm `Lebensmittelbetrieb` covers the intended operator set. |
| Book a 20-minute call | 20-Minuten-Gespräch buchen | Navigation shortens this to `Gespräch buchen`. |
| Where you lose profit, shop by shop, over time | Wo Sie Gewinn verlieren, Filiale für Filiale, über die Zeit | `über die Zeit` is slightly flat; `im Zeitverlauf` is an alternative. |
| the plan it replaced / current plan as the baseline | den Plan, den sie ersetzt hat / den aktuellen Plan als Ausgangsbasis | Confirm `Ausgangsbasis` over `Referenz`. |
| surprise bags | Überraschungstüten | Confirm the term Swiss operators actually use (Too Good To Go context). |
| shop-product combinations | Filial-Produkt-Kombinationen | Compound is heavy; a native may prefer a short relative clause. |
| production orders | Produktionsbestellungen | Confirm vs `Produktionsaufträge`, which some bakeries prefer. |

**Fit check:** hero, offer headline, and CTA read naturally, though the offer
headline is the longest of the five locales. Watch it on narrow mobile.

## French (European/Swiss)

| English | Implemented | Why it needs review |
|---|---|---|
| The profit brain for fresh food | L'intelligence opérationnelle des métiers du frais | `métiers du frais` is idiomatic; confirm it covers bakery and café. |
| Know what to make tomorrow | Savoir quoi produire demain | Confirm `produire` over `fabriquer` for baked goods. |
| what your team sees | ce que votre équipe observe | `observe` chosen over `voit` as less passive. |
| shop feedback | retours des équipes en magasin | Avoids the customer-review meaning of `retours clients`. |
| sell-out vs missed sale | rupture vs vente manquée | Both standard and correctly distinct. Confirm `rupture` alone is clear without `de stock`. |
| proves the impact in cash | en démontre l'impact économique | Deliberately avoids `en cash`. |
| the daily decisions that run a food business | les décisions quotidiennes qui font fonctionner une entreprise alimentaire | Natural business French; confirm `entreprise alimentaire` is not too broad. |
| Book a 20-minute call | Réserver un appel de 20 min | Navigation shortens this to `Réserver un appel`. |
| Where you lose profit, shop by shop, over time | Où vous perdez du profit, boutique par boutique, dans le temps | `dans le temps` may read better as `au fil du temps`. |
| the plan it replaced / baseline | le plan qu'il a remplacé / le plan actuel comme référence | Confirm gender agreement reads naturally with Eclipsai as subject. |
| surprise bags | paniers surprises | Confirm local term. |
| shop-product combinations | couples boutique-produit | `couples` is analytical; a native may prefer `combinaisons`. |
| production orders | commandes de production | Standard. |

**Fit check:** natural throughout. The CTA is the length risk, not the copy.

## Italian

| English | Implemented | Why it needs review |
|---|---|---|
| The profit brain for fresh food | Intelligenza operativa per il fresco | `il fresco` is trade shorthand; confirm it is not too clipped for a homepage. |
| Know what to make tomorrow | Sapere cosa produrre domani | Confirm `produrre` over `preparare` for a bakery. |
| what your team sees | ciò che vede il vostro team | Uses the `voi` register throughout. Confirm `voi` over `Lei` for this audience. |
| shop feedback | osservazioni del personale nei punti vendita | Deliberately describes staff observations, not customer feedback. |
| sell-out vs missed sale | esaurito vs vendita persa | Confirm `esaurito` reads as sold-out rather than out-of-stock upstream. |
| proves the impact in cash | ne dimostra l'impatto economico | Avoids `in denaro`. |
| the daily decisions that run a food business | le decisioni quotidiane che fanno funzionare un'attività alimentare | Natural rather than literal. Confirm `attività alimentare` is the preferred category term. |
| Book a 20-minute call | Prenota una chiamata di 20 minuti | Navigation shortens this to `Prenota una chiamata`. The imperative remains informal, as in the previous CTA. |
| Where you lose profit, shop by shop, over time | Dove perdete profitto, punto vendita per punto vendita, nel tempo | Long. `punto vendita` repeated may want shortening. |
| the plan it replaced / baseline | il piano che ha sostituito / il piano attuale come riferimento | Confirm `riferimento` over `base di partenza`. |
| surprise bags | sacchetti sorpresa | Confirm local term. |
| shop-product combinations | combinazioni punto vendita-prodotto | Heavy. A native may prefer a rephrase. |
| production orders | ordini di produzione | Standard. |

**Fit check:** hero and offer headline read naturally. The `voi` body vs
`tu` CTA mix is the one register decision worth a native ruling.

## Romanian (full diacritics)

| English | Implemented | Why it needs review |
|---|---|---|
| The profit brain for fresh food | Inteligență operațională pentru afacerile cu produse proaspete | Long. Confirm a shorter industry term exists. |
| Know what to make tomorrow | Știți ce să produceți mâine | Polite plural, consistent with the rest of the page. |
| what your team sees | ce observă echipa dumneavoastră | `dumneavoastră` is formal; confirm it suits owner-to-owner tone. |
| shop feedback | observațiile echipelor din magazine | Keeps the source of the information explicit and avoids customer-review language. |
| sell-out vs missed sale | stoc epuizat vs vânzare ratată | Correctly distinct. Confirm `stoc epuizat` is natural in a bakery. |
| proves the impact in cash | dovedește impactul financiar | Avoids `în bani`. |
| the daily decisions that run a food business | deciziile zilnice care fac să funcționeze o afacere alimentară | Natural Romanian while retaining the broad food-business ambition. |
| Book a 20-minute call | Programați o discuție de 20 de minute | Navigation shortens this to `Programați o discuție`; polite plural is preserved. |
| Where you lose profit, shop by shop, over time | Unde pierdeți profit, magazin cu magazin, în timp | Confirm `în timp` vs `de-a lungul timpului`. |
| the plan it replaced / baseline | planul pe care l-a înlocuit / planul actual ca punct de referință | Standard. |
| surprise bags | pungi surpriză | Confirm local term. |
| shop-product combinations | combinațiile magazin-produs | Acceptable; confirm naturalness. |
| production orders | comenzi de producție | Standard. |

**Fit check:** hero and CTA fit. The eyebrow/tagline is the longest string of
any locale and is the main wrapping risk on narrow mobile.

## Open items for the reviewer

1. The four operating-intelligence phrases replacing "profit brain" (one per
   locale) are the highest-leverage decision here.
2. The Italian `voi` body vs `tu` CTA register mix.
3. Local terminology for "surprise bags" in all four markets.
4. "Shop-product combinations" is heavy in DE, IT, and RO.
5. The broad category terms for "food business" need a native commercial
   check: `Lebensmittelbetrieb`, `entreprise alimentaire`,
   `attività alimentare`, and `afacere alimentară`.
