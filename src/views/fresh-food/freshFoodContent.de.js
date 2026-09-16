// Fresh-food homepage content — German (Swiss Standard German).
// Claude-produced translation of the approved English source; a native
// operator/editor should make the final call (see
// docs/fresh-food-locale-review.md). No ß (Swiss ss), no em dashes.
// Evidence values are unchanged; number separators follow Swiss convention.

export const de = {
  locale: "de",
  languageName: "Deutsch",

  nav: {
    ariaLabel: "Hauptnavigation",
    homeAriaLabel: "Eclipsai Startseite",
    product: "So funktioniert es",
    proof: "Wirkung",
    vision: "Massnahmen",
    cta: "Gespräch buchen",
    chooseLanguage: "Sprache wählen",
    availableLanguages: "Verfügbare Sprachen",
  },

  hero: {
    eyebrow: "Frischeprodukte:",
    h1: "The Profit Brain verbindet Verkauf, Produktion und Finanzdaten für tägliche Gewinnmassnahmen",
    h1Primary: "The Profit Brain",
    h1Support: "Verbindet Verkauf, Produktion und Finanzdaten für tägliche Gewinnmassnahmen",
    copy: "Produktionsentscheidungen für jede Filiale, jeden Artikel und jeden Wochentag treffen. Die tägliche Wirkung auf Gewinn, Verkauf und Abfall messen.",
    examples: [
      "Passt die Produktionsbestellungen für morgen an.",
      "Verfolgt Sonderbestellungen bis zu Lieferung und Rechnung.",
      "Meldet Preiserhöhungen von Lieferanten und Preise, die die Kosten nicht mehr decken.",
    ],
    cta: "20-Minuten-Gespräch buchen",
    audience: "Für wachsende Frischebetriebe mit 2 bis 20 Standorten.",
  },

  live: {
    ariaLabel: "Ergebnisse der letzten sieben abgeschlossenen Tage",
    period: "Letzte sieben abgeschlossene Tage",
    live: "LIVE",
    snapshot: "LETZTER BESTÄTIGTER STAND",
    production: "Produktion",
    linesChanged: "Änderungen an Produktionsaufträgen (Positionen)",
    profitImpact: "Gewinnwirkung im Verhältnis zum Umsatz",
    wasteReduction: "geschätzte Abfallreduktion in Prozent des ursprünglichen Abfalls",
    updated: "Aktualisiert",
  },

  problem: {
    eyebrow: "Was Inhaber wissen und Systeme übersehen",
    h2: "Der Produktionsplan für morgen wird festgelegt, bevor die heutigen Verkaufszahlen und Rückmeldungen aus den Filialen einfliessen können.",
    steps: [
      { time: "18:45", state: "time-1845", h3: "Zählen, was übrig ist", p: "Was nicht im Regal bleiben kann, landet in Überraschungstüten oder im Abfall. Gezählt wird es selten erfasst." },
      { time: "19:00", state: "time-1900", h3: "Bestellung für morgen festlegen", p: "Die Bestellung für morgen entsteht aus Durchschnittswerten, Vorlagen, Sonderbestellungen und Erfahrung, während der Laden noch geputzt werden muss." },
      { time: "02:00", state: "time-0200", h3: "Die Produktion beginnt", p: "Die Entscheidung von gestern wird zur verderblichen Ware von heute." },
      { time: "11:40", state: "time-1140", h3: "Das Blech ist leer", p: "Ein Ausverkauf kann heissen, dass der Plan stimmte, oder dass ein Verkauf entgangen ist. Die Kasse zeigt nicht, was von beidem." },
    ],
    quote: "Die Kasse erfasst, was verkauft wurde. Sie erfasst nicht, was übrig blieb, was ausverkauft war oder wonach Kunden fragten, als das Regal leer war. Genau dort geht Gewinn verloren.",
  },

  product: {
    eyebrow: "Operative Intelligenz im Einsatz",
    h2: "Tägliche Verbesserungszyklen für den Gewinn aufbauen",
    h2Primary: "Tägliche",
    h2Secondary: "Verbesserungszyklen für den Gewinn aufbauen",
    lede: "Eclipsai verbindet Verkaufs-, Produktions-, Bestell- und Rechnungsstellungssysteme mit E-Mail, Team-Chats und relevanten externen Daten. Wenn die Daten nicht erklären, was passiert ist, stellt es dem Personal eine gezielte Frage. Antworten sind per Text, Foto oder Sprachnachricht möglich.",
    mediaLabel: "Beispiel: Eclipsai begleitet eine Produktionsentscheidung über einen vertrauten Teamkanal",
    whatChanges: "So arbeitet Eclipsai",
    diagram: {
      ariaLabel: "The Profit Brain verknüpft Daten, misst Gewinn, erstellt Massnahmen, liest Firmensysteme und setzt Gewinnentscheidungen um",
      correlate: "Daten verknüpfen", measure: "Gewinn messen", actions: "Massnahmen planen",
      read: "Daten lesen", implement: "Entscheidungen umsetzen", systems: "Firmensysteme",
      production: "Produktion", ops: "Betrieb",
    },
    items: [
      { strong: "Daten aus allen Systemen lesen und analysieren", text: "Jede Filiale, jeder Artikel und jeder Wochentag hat ein eigenes Nachfragemuster. The Profit Brain berücksichtigt vergleichbare Verkaufstage, den zeitlichen Verkaufsverlauf, wahrscheinliche Ausverkäufe, geschätzten Abfall, die Wirtschaftlichkeit des Artikels und betriebliche Vorgaben." },
      { strong: "Gewinnentscheidungen finden", text: "Für jede Produktionsposition vergleicht The Profit Brain die aktuelle Menge mit umsetzbaren Alternativen. Es wägt die Kosten unverkaufter Ware gegen die gefährdete Marge ab, wenn zu wenig produziert wird." },
      { strong: "Umsetzen, Wirkung messen und Ergebnis verfolgen", text: "Freigegebene Entscheidungen werden in die Produktionssoftware geschrieben und bestätigt. The Profit Brain misst täglich die Wirkung auf Verkäufe, geschätzten Abfall, frühe Ausverkäufe und das Cash-Ergebnis. Die Ergebnisse fliessen in die nächsten Entscheidungen ein." },
    ],
  },

  demo: {
    open: "Demo",
    close: "Schliessen",
    chooseView: "Demoansicht wählen",
    viewOf: "von",
    slides: [
      "Tagesbild des Betriebs erstellen",
      "Produktionsmengen vorschlagen",
      "Direkt im Produktionssystem umsetzen (API oder Computersteuerung bei älteren Systemen)",
      "Ergebnisse täglich auswerten",
      "Gewinn und Abfall ausweisen",
    ],
  },

  proof: {
    metadata: "Unsere Wirkung",
    h2Before: "Wir werden ",
    h2Value: "1%",
    h2After: " Gewinnmarge erzielen",
    lede: "Gemeinsam mit einer Zürcher Bäckereikette legen wir Produktionsmengen und Sortiment je Filiale fest",
    tracker: {
      period: "1% Gewinnmarge erzielen",
      cash: "Liquiditätswirkung", economic: "Wirtschaftlicher Gewinn", waste: "Vermiedener Abfall",
      projected: "hochgerechnet", ingredients: "Zutaten",
      economics: "Zutaten + Standardarbeit + Energie",
      fullYear: "Ganzes Jahr", measured: "Gemessene Wirkung",
      ofSales: "des Umsatzes", units: "Stück", wasteRate: "Abfallquote",
      actuals: "IST-WERTE", annualized: "AUFS JAHR HOCHGERECHNET", fullYearAxis: "GANZES JAHR",
    },
    ledgerLabel: "Beleg-Journal eines Betriebs",
    rows: [
      { h3: "analysierte Stück", value: "860'000", copy: "Sechzehn Monate Verkaufs- und Produktionsdaten. 92 % liessen sich zwischen beiden zuordnen." },
      { h3: "gelieferte Stück unverkauft", ratioLabel: "Eines von vier gelieferten Stücken blieb unverkauft", value: "1 von 4", copy: "Das Muster konzentrierte sich auf bestimmte Filialen, Produkte und Wochentage." },
      { h3: "Potenzial pro Jahr", value: "€40–60K", copy: "Wiederkehrende Produktionsmuster passten nicht mehr zur Nachfrage. Die Zutatenkosten aller unverkauften Stücke lagen bei €190K." },
      { h3: "vorgeschlagene Kürzungen mit positivem geschätztem Nettowert", value: "86 %", copy: "Die Einsparung bei den Zutaten überstieg die gesamte Marge jedes möglicherweise entgangenen Verkaufs. Die Kürzungen waren in allen neun getesteten Monaten netto positiv." },
    ],
    bridgeBefore: "Ein Teil des Abfalls schützt den Verkauf. Das Potenzial von ",
    bridgeValue: "€40–60K",
    bridgeAfter: " entstand durch wiederholte Überproduktion, nachdem sich die Nachfrage verändert hatte.",
    note: "Aus den Aufzeichnungen eines Betriebs mit mehreren Standorten, 2024 bis 2025. Spezifisch für dieses Geschäft, kein Versprechen.",
    lessonHeading: "Was wir gelernt haben",
    lessonParagraphs: [
      "In unserer historischen Nachrechnung verlor es Geld, eine einzige Prognoseregel jede Produktionsbestellung bestimmen zu lassen. Sie senkte den Abfall, doch kleine Prognosefehler führten zu Ausverkäufen, deren entgangene Marge die eingesparten Zutaten überstieg.",
      "Nachfrage bei kleinen Mengen schwankt stark. Die Aufzeichnungen enthalten nicht jeden lokalen Anlass und sagen nicht, was ein Ausverkauf bedeutete.",
      "Eclipsai ergänzt die fehlenden Informationen, nimmt nur die wenigen Änderungen vor, die die Belege stützen, und misst die finanzielle Wirkung.",
    ],
  },

  vision: {
    eyebrow: "Über die Produktion hinaus",
    h2: "Die nächsten Gewinnmassnahmen",
    intro: "Sobald wir mit den Systemen und Daten des Unternehmens verbunden sind, können wir neue Chancen erkennen, Änderungen umsetzen und das Ergebnis messen.",
    pathLabel: "Ausbaupfad von The Profit Brain",
    steps: [
      { index: "Start", h3: "Produktion und Abfall", p: "Wiederholten, vermeidbaren Abfall senken und neue Nachfrage nutzen." },
      { index: "Als Nächstes", h3: "Einkauf und Preise", p: "Preiserhöhungen von Lieferanten und ihre Wirkung auf die Produktrentabilität verfolgen." },
      { index: "Danach", h3: "Personal und Betrieb", p: "Den Personaleinsatz mit Verkauf und Nachfrage in Einklang bringen." },
      { index: "Beim Wachsen", h3: "Der nächste Standort", p: "Neue Nachfragemodelle auf dem aufbauen, was in vergleichbaren Filialen funktioniert." },
    ],
  },

  offer: {
    h2: "The Profit Brain für tägliche Gewinnmassnahmen",
    copy: "Es verbindet Verkäufe, Produktion und das, was Ihr Team sieht, findet die wenigen Entscheidungen, bei denen sich Handeln lohnt, und belegt das Ergebnis finanziell.",
    cardH3: "Kostenlos starten",
    items: [
      "Wo Sie Gewinn verlieren, Filiale für Filiale, über die Zeit",
      "Bessere Produktionspläne, an vergangenen Daten getestet",
      "Empfehlungen für die Bestellungen der nächsten Woche",
      "Laufende Messung gegen den Plan, den Sie heute nutzen",
    ],
    audience: "Für wachsende Frischebetriebe mit 2 bis 20 Standorten.",
    cta: "20-Minuten-Gespräch buchen",
  },

  faq: {
    eyebrow: "Häufige Fragen",
    h2: "Häufig gestellte Fragen",
    items: [
      {
        q: "Gefährden wir Verkäufe, wenn wir weniger produzieren?",
        a: "Wir wägen beide Risiken ab. Ein entgangener Verkauf kostet in der Regel mehr als die eingesparten Zutaten. Wir schlagen nur dann eine geringere Produktion vor, wenn die Belege dafür sprechen, und messen das Ergebnis anschliessend am ursprünglichen Plan.",
      },
      {
        q: "Wie unterscheidet sich The Profit Brain von den Mengen, die unser System bereits empfiehlt?",
        a: "The Profit Brain prüft die aktuelle Menge gegen umsetzbare Alternativen und berücksichtigt den Verkaufsverlauf, wahrscheinliche Ausverkäufe, Abfall, die Wirtschaftlichkeit des Artikels und betriebliche Vorgaben. Die Gewinnwirkung jeder einzelnen Änderung wird gemessen und ausgewiesen.",
      },
      {
        q: "Müssen wir unsere bestehenden Systeme ersetzen?",
        a: "Nein. Wir bedienen die bereits eingesetzten Systeme über APIs oder über Computersteuerung bei älteren Systemen.",
      },
      {
        q: "Wie viel Arbeit hat das Team damit?",
        a: "Wir setzen Änderungen direkt um und fragen das Team nur dann, wenn die Aufzeichnungen nicht erklären, was in der Filiale passiert ist.",
      },
      {
        q: "Wie beginnen wir?",
        a: "Wir verbinden uns mit den Systemen und analysieren historische Daten, um eine erste Schätzung des Potenzials zu erstellen. Danach schlagen wir Änderungen vor, ohne sie umzusetzen, und messen die erwartete Verbesserung.",
      },
    ],
  },

  footer: {
    tagline: "Operative Intelligenz für Frischebetriebe.",
    location: "Zürich, Schweiz",
  },

  meta: {
    title: "Eclipsai — The Profit Brain für Frischebetriebe",
    description: "The Profit Brain verbindet Verkauf, Produktion und Finanzdaten, setzt tägliche Gewinnmassnahmen um und misst deren Wirkung.",
    ogDescription: "Verkauf, Produktion und Finanzdaten verbinden. Täglich Gewinnmassnahmen umsetzen.",
  },
};
