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
    proof: "Belege",
    vision: "Über die Produktion hinaus",
    cta: "Gespräch buchen",
    chooseLanguage: "Sprache wählen",
    availableLanguages: "Verfügbare Sprachen",
  },

  hero: {
    eyebrow: "Operative Intelligenz für Frischebetriebe.",
    h1: "Wissen, was morgen zu produzieren ist. Weniger wegwerfen. Mehr verkaufen.",
    copy: "Eclipsai verbindet Verkaufs-, Produktions- und Finanzsysteme. Es trifft Produktionsentscheidungen für jede Filiale, jeden Artikel und jeden Wochentag, schreibt freigegebene Änderungen in das Produktionssystem zurück und misst täglich ihre Wirkung auf Gewinn, Abfall und früh ausverkaufte Artikel.",
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
    linesChanged: "geänderte Positionen in Produktionsaufträgen",
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
    h2: "Es beobachtet jede Filiale, jeden Tag. Es fragt nach, wenn die Daten nicht ausreichen.",
    lede: "Eclipsai verbindet Verkaufs-, Produktions-, Bestell- und Rechnungsstellungssysteme mit E-Mail, Team-Chats und relevanten externen Daten. Wenn die Daten nicht erklären, was passiert ist, stellt es dem Personal eine gezielte Frage. Antworten sind per Text, Foto oder Sprachnachricht möglich.",
    mediaLabel: "Beispiel: Eclipsai begleitet eine Produktionsentscheidung über einen vertrauten Teamkanal",
    whatChanges: "So arbeitet Eclipsai",
    items: [
      { strong: "Daten aus allen Systemen lesen und analysieren", text: "Jede Filiale, jeder Artikel und jeder Wochentag hat ein eigenes Nachfragemuster. Eclipsai berücksichtigt vergleichbare Verkaufstage, den zeitlichen Verkaufsverlauf, wahrscheinliche Ausverkäufe, geschätzten Abfall, die Wirtschaftlichkeit des Artikels und betriebliche Vorgaben." },
      { strong: "Wirtschaftlich sinnvolle Entscheidungen erkennen", text: "Für jede Position im Produktionsplan vergleicht Eclipsai die aktuelle Menge mit umsetzbaren Alternativen. Es wägt die Kosten unverkaufter Ware gegen die gefährdete Marge ab, wenn zu wenig produziert wird." },
      { strong: "Umsetzen und nachverfolgen", text: "Freigegebene Entscheidungen werden in die Produktionssoftware geschrieben und bestätigt. Nach Ladenschluss misst Eclipsai die Wirkung auf Verkäufe, geschätzten Abfall, frühe Ausverkäufe und Gewinn. Das Ergebnis wird zum Beleg für die nächste Entscheidung." },
    ],
  },

  demo: {
    open: "Demo ansehen",
    close: "Schliessen",
  },

  proof: {
    metadata: "Unsere Wirkung",
    h2Before: "Wir haben bei einem Betrieb ein jährliches Gewinnpotenzial von ",
    h2Value: "CHF 40–60K",
    h2After: " gefunden.",
    lede: "Wir arbeiten jetzt mit dem Betrieb daran, diese Änderungen in die tägliche Produktion zu übernehmen.",
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
    h2: "Die nächsten Entscheidungen.",
    intro: "Sobald Eclipsai mit den Systemen und Kommunikationskanälen des Betriebs verbunden ist, kann es die für jede neue Entscheidung benötigten Informationen ergänzen, die Änderung umsetzen und das Ergebnis messen.",
    pathLabel: "Ausbaupfad von Eclipsai",
    steps: [
      { index: "Start", h3: "Produktion und Abfall", p: "Verkäufe schützen und zugleich wiederholten, vermeidbaren Abfall senken. Produktionspläne anpassen, die nicht mehr zur Nachfrage passen." },
      { index: "Als Nächstes", h3: "Einkauf und Preise", p: "Preiserhöhungen von Lieferanten melden und Preise, die die Kosten nicht mehr decken." },
      { index: "Danach", h3: "Personal und Betrieb", p: "Sehen, wann kleinere Chargen Abfall sparen, aber Arbeit kosten, oder wann Unterbesetzung Verkäufe kostet." },
      { index: "Beim Wachsen", h3: "Der nächste Standort", p: "Das, was in Ihren heutigen Filialen funktioniert, für die nächste nutzen." },
    ],
  },

  offer: {
    h2: "Eclipsai trifft die täglichen Entscheidungen, die einen Betrieb am Laufen halten.",
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
    h2: "Was Inhaber vor dem Start wissen wollen.",
    items: [
      {
        q: "Gefährden wir Verkäufe, wenn wir weniger produzieren?",
        a: "Eclipsai wägt beide Risiken ab. Ein entgangener Verkauf kann mehr kosten als die eingesparten Zutaten. Es schlägt eine kleinere Menge nur vor, wenn die Belege das stützen, und misst das Ergebnis danach gegen den Plan, den es ersetzt hat.",
      },
      {
        q: "Wie unterscheidet sich Eclipsai von den Mengen, die unser System bereits empfiehlt?",
        a: "Eclipsai prüft die aktuelle Menge gegen umsetzbare Alternativen und berücksichtigt den zeitlichen Verkaufsverlauf, wahrscheinliche Ausverkäufe, Abfall, die Wirtschaftlichkeit des Artikels und betriebliche Vorgaben. Freigegebene Änderungen werden in das Produktionssystem zurückgeschrieben und finanziell gemessen.",
      },
      {
        q: "Müssen wir unsere bestehenden Systeme ersetzen?",
        a: "Nein. Eclipsai arbeitet mit den bereits eingesetzten Systemen. Es liest und schreibt über APIs oder über Computersteuerung bei älteren Systemen.",
      },
      {
        q: "Wie viel Arbeit hat das Team damit?",
        a: "Eclipsai arbeitet mit den Verkaufs- und Produktionsdaten. Es stellt dem Team nur dann eine kurze Frage, wenn die Aufzeichnungen nicht erklären, was passiert ist, etwa bei einem Ausverkauf, ungewöhnlichen Resten oder einem lokalen Anlass.",
      },
      {
        q: "Wie beginnen wir?",
        a: "Wir beginnen mit den verlässlichen Aufzeichnungen und den Filial-Artikel-Kombinationen mit der stärksten Beleglage. Reichen die Daten nicht aus, fragt Eclipsai nach Kontext oder lässt die Menge unverändert. Sie müssen nicht alle Filialen auf einmal umstellen.",
      },
    ],
  },

  footer: {
    tagline: "Operative Intelligenz für Frischebetriebe.",
    location: "Zürich, Schweiz",
  },

  meta: {
    title: "Eclipsai | Operative Intelligenz für Frischebetriebe",
    description: "Eclipsai trifft und implementiert tägliche Produktionsentscheidungen für Frischebetriebe und misst ihre Wirkung auf Gewinn, Abfall und Verkäufe.",
    ogDescription: "Wissen, was morgen zu produzieren ist. Weniger wegwerfen. Mehr verkaufen.",
  },
};
