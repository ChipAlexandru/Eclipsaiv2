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
    cta: "Kostenlos starten",
    chooseLanguage: "Sprache wählen",
    availableLanguages: "Verfügbare Sprachen",
  },

  hero: {
    eyebrow: "Operative Intelligenz für Frischebetriebe.",
    h1: "Wissen, was morgen zu produzieren ist. Weniger wegwerfen. Mehr verkaufen.",
    copy: "Eclipsai findet, wo Frischebetriebe Gewinn verlieren, setzt die Änderung um und belegt die finanzielle Wirkung. Es beginnt bei der Produktion und erweitert sich auf Bestellungen, Preise, Einkauf und Personal.",
    examples: [
      "Passt die Produktionsbestellungen für morgen an.",
      "Verfolgt Sonderbestellungen bis zu Lieferung und Rechnung.",
      "Meldet Preiserhöhungen von Lieferanten und Preise, die die Kosten nicht mehr decken.",
    ],
    cta: "Kostenlos starten",
    audience: "Für wachsende Frischebetriebe mit 2 bis 20 Standorten.",
  },

  problem: {
    eyebrow: "Was Inhaber wissen und Systeme übersehen",
    h2: "Der Plan für morgen steht, bevor Verkäufe und Rückmeldungen aus der Filiale ihn noch ändern können.",
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
    lede: "Eclipsai verbindet tägliche Verkäufe, Produktion, Lieferungen und das, was Ihr Team sieht. Wenn die Aufzeichnungen nicht erklären, was passiert ist, fragt es die Person, die es weiss. Es bringt die wenigen lohnenden Änderungen in den wöchentlichen Überblick und beantwortet Fragen, sobald sie auftauchen.",
    mediaLabel: "Beispiel: Eclipsai begleitet eine Produktionsentscheidung über einen vertrauten Teamkanal",
    whatChanges: "So arbeitet Eclipsai",
    items: [
      { strong: "Erfasst, was in den Daten fehlt", text: "Reste, Ausverkäufe, Kundenwünsche und den Kontext dahinter." },
      { strong: "Findet, wo der Plan Gewinn verliert", text: "Über Filialen, Produkte und Tage hinweg." },
      { strong: "Empfiehlt die nächste Änderung", text: "Zeigt, was zu ändern ist, warum, und was auf dem Spiel steht." },
      { strong: "Belegt das Ergebnis", text: "Vergleicht jede Änderung finanziell mit dem Plan, den sie ersetzt hat." },
    ],
  },

  proof: {
    metadata: "Belege von einem Betrieb · 16 Monate",
    h2Before: "Wir haben bei einem Betrieb ein jährliches Gewinnpotenzial von ",
    h2Value: "€40–60K",
    h2After: " gefunden.",
    lede: "Ein Frischebetrieb mit mehreren Standorten gab uns sechzehn Monate an Aufzeichnungen. Wir verbanden Kassen- und Produktionsdaten und glichen ab, was geliefert und was verkauft wurde, über Filialen, Produkte und Tage hinweg.",
    ledgerLabel: "Beleg-Journal eines Betriebs",
    rows: [
      { h3: "analysierte Stück", value: "860'000", copy: "Sechzehn Monate Verkaufs- und Produktionsdaten. 92 % liessen sich zwischen beiden zuordnen." },
      { h3: "gelieferte Stück unverkauft", ratioLabel: "Eines von vier gelieferten Stücken blieb unverkauft", value: "1 von 4", copy: "Das Muster konzentrierte sich auf bestimmte Filialen, Produkte und Wochentage." },
      { h3: "Potenzial pro Jahr", value: "€40–60K", copy: "Wiederkehrende Produktionsmuster passten nicht mehr zur Nachfrage. Die Zutatenkosten aller unverkauften Stücke lagen bei €190K." },
      { h3: "der Reduktionen deckten die Nachfrage", value: "86 %", copy: "Die stärkste historische Regel reduzierte ausgewählte Bestellungen, ohne dass die Ware ausging." },
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

  loop: {
    eyebrow: "Was wir tun",
    h2: "So entstehen bessere Entscheidungen.",
    lede: "Derselbe Kreislauf kann den Gewinn in allen Ihren Filialen verbessern.",
    listLabel: "Entscheidungskreislauf",
    steps: [
      { b: "Erfassen", p: "Verbindet tägliche Verkäufe, Produktion, Lieferungen und das, was Ihr Team sieht." },
      { b: "Entscheiden", p: "Erkennt die wenigen Entscheidungen, die sich zu ändern lohnen, und wägt Abfall gegen entgangene Verkäufe ab." },
      { b: "Handeln", p: "Passt die Bestellung an oder führt den freigegebenen nächsten Schritt aus, innerhalb der vom Betrieb gesetzten Grenzen." },
      { b: "Messen", p: "Prüft das Ergebnis finanziell anhand tatsächlicher Verkäufe und Kosten." },
      { b: "Verbessern", p: "Behält Änderungen, die den Gewinn verbessern, und korrigiert jene, die es nicht tun." },
    ],
  },

  replay: {
    title: "Vorgeschlagene Croissant-Bestellungen für 7. bis 13. Juli",
    changeStrong: "130 weniger",
    changeSpan: "Einheiten Abfall",
    dotKey: "1 Punkt = 5 Einheiten",
    ariaTitle: "Entscheidungs-Nachrechnung der Croissant-Produktion",
    ariaDesc: "Vierzehn Tage Croissant-Verkäufe als blaue Punkte, Abfall bei der aktuellen Bestellung als orange Punkte und eine durchgezogene Linie für die vorgeschlagene Bestellung. Der Vorschlag hält 988 Verkäufe und senkt den Abfall von 319 auf 189 Einheiten.",
    days: ["M 23", "D 24", "M 25", "D 26", "F 27", "S 28", "S 29", "M 30", "D 1", "M 2", "D 3", "F 4", "S 5", "S 6"],
    legendSold: "Verkauft",
    legendWaste: "Abfall im aktuellen Plan",
    legendProposed: "Vorgeschlagene Bestellung",
    tableLabel: "Ergebnisse der Entscheidungs-Nachrechnung",
    thPlan: "Plan",
    thSales: "Verkäufe",
    thWaste: "Abfall",
    rowCurrent: "Aktuell",
    rowProposed: "Vorschlag",
  },

  vision: {
    eyebrow: "Über die Produktion hinaus",
    h2: "Die nächsten Entscheidungen, die besser werden.",
    intro: "Die Produktion kommt zuerst, weil sich die Entscheidung täglich wiederholt und das Ergebnis schnell sichtbar wird.",
    pathLabel: "Ausbaupfad von Eclipsai",
    steps: [
      { index: "Start", h3: "Produktion und Abfall", p: "Verkäufe schützen und zugleich wiederholten, vermeidbaren Abfall senken. Produktionspläne anpassen, die nicht mehr zur Nachfrage passen." },
      { index: "Als Nächstes", h3: "Einkauf und Preise", p: "Preiserhöhungen von Lieferanten melden und Preise, die die Kosten nicht mehr decken." },
      { index: "Danach", h3: "Personal und Betrieb", p: "Sehen, wann kleinere Chargen Abfall sparen, aber Arbeit kosten, oder wann Unterbesetzung Verkäufe kostet." },
      { index: "Beim Wachsen", h3: "Der nächste Standort", p: "Das, was in Ihren heutigen Filialen funktioniert, für die nächste nutzen." },
    ],
  },

  offer: {
    h2: "Eclipsai unterstützt Sie bei den täglichen Entscheidungen, die über den Gewinn bestimmen.",
    copy: "Es verbindet Verkäufe, Produktion und das, was Ihr Team sieht, findet die wenigen Entscheidungen, bei denen sich Handeln lohnt, und belegt das Ergebnis finanziell.",
    cardH3: "Kostenlos starten",
    items: [
      "Wo Sie Gewinn verlieren, Filiale für Filiale, über die Zeit",
      "Bessere Produktionspläne, an vergangenen Daten getestet",
      "Empfehlungen für die Bestellungen der nächsten Woche",
      "Laufende Messung gegen den Plan, den Sie heute nutzen",
    ],
    audience: "Für wachsende Frischebetriebe mit 2 bis 20 Standorten.",
    cta: "Kostenlos starten",
  },

  faq: {
    eyebrow: "Häufige Fragen",
    h2: "Was Inhaber vor dem Start wissen wollen.",
    items: [
      {
        q: "Sind wir ausverkauft, wenn wir weniger produzieren?",
        a: "Eclipsai wägt beide Risiken ab. Ein entgangener Verkauf kann mehr kosten als die eingesparten Zutaten. Es schlägt eine kleinere Menge nur vor, wenn die Belege das stützen, und misst das Ergebnis danach gegen den Plan, den es ersetzt hat.",
      },
      {
        q: "Unser System empfiehlt bereits Mengen. Was ist anders?",
        a: "Eclipsai behält den aktuellen Plan als Ausgangsbasis, ergänzt, was in den Daten fehlt, und zeigt nur dort eine andere Bestellung, wo die Belege sie stützen. Danach misst es das Ergebnis finanziell.",
      },
      {
        q: "Wie viel Arbeit hat das Team damit?",
        a: "Eclipsai arbeitet mit den Verkaufs- und Produktionsdaten. Es stellt dem Team nur dann eine kurze Frage, wenn die Aufzeichnungen nicht erklären, was passiert ist, etwa bei einem Ausverkauf, ungewöhnlichen Resten oder einem lokalen Anlass.",
      },
      {
        q: "Was, wenn unsere Daten unordentlich sind?",
        a: "Wir gleichen die Aufzeichnungen ab, denen man trauen kann, und machen die Lücken sichtbar. Tragen die Daten keine Empfehlung, fragt Eclipsai nach Kontext oder lässt den Plan unverändert.",
      },
      {
        q: "Müssen wir alle Filialen auf einmal umstellen?",
        a: "Nein. Wir beginnen bei den Filial-Produkt-Kombinationen mit der stärksten Beleglage. Das Ergebnis dort nutzen wir, bevor wir dieselbe Regel anderswo anwenden.",
      },
      {
        q: "Wie rechnen Sie ab?",
        a: "Der Start ist kostenlos. Wenn Sie weitermachen, berechnen wir eine monatliche Gebühr pro Standort, je nach Filialen, Systemen und überwachten Entscheidungen.",
      },
    ],
  },

  footer: {
    tagline: "Operative Intelligenz für Frischebetriebe.",
    location: "Zürich, Schweiz",
  },

  meta: {
    title: "Eclipsai | Operative Intelligenz für Frischebetriebe",
    description: "Eclipsai unterstützt Frischebetriebe bei den täglichen Entscheidungen, die über den Gewinn bestimmen, beginnend bei der Produktion für morgen.",
    ogDescription: "Wissen, was morgen zu produzieren ist. Weniger wegwerfen. Mehr verkaufen.",
  },
};
