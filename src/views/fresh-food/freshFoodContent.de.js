// Fresh-food homepage content — German (Swiss-compatible Standard German).
// Claude-produced translation of freshFoodContent.en.js; native review
// recommended before broad launch. No ß (Swiss ss), no em dashes.
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
    cta: "Verlorene Marge finden",
    chooseLanguage: "Sprache wählen",
    availableLanguages: "Verfügbare Sprachen",
  },

  hero: {
    eyebrow: "Operative Intelligenz für Frischebetriebe",
    h1: "Wissen, was morgen zu produzieren ist. Weniger wegwerfen. Mehr verkaufen.",
    copy: "Eclipsai findet die Änderungen, die sich lohnen: aus täglichen Verkäufen, Produktion, Lieferungen und dem, was Ihr Team sieht. Wir messen die finanzielle Wirkung jeder Änderung.",
    cta: "Verlorene Marge finden",
    audience: "Entwickelt für wachsende Frischwaren-Betriebe mit 2 bis 20 Standorten.",
  },

  problem: {
    eyebrow: "Was Inhaber wissen und Systeme übersehen",
    h2: "Über morgen wird entschieden, bevor das Heute verstanden ist.",
    lede: "In die Bestellung für morgen fliessen Restbestände, Sonderbestellungen, alte Durchschnittswerte und Erfahrung ein. Über Hunderte Entscheidungen pro Filiale × Produkt × Wochentag fällt der Gewinnentscheid bei Ladenschluss.",
    steps: [
      { time: "18:45", state: "time-1845", h3: "Zählen, was übrig ist", p: "Was nicht im Regal bleiben kann, landet in Überraschungstüten oder im Abfall und wird selten erfasst." },
      { time: "19:00", state: "time-1900", h3: "Bestellung für morgen festlegen", p: "Durchschnittswerte, Vorlagen und Erinnerung konkurrieren um Aufmerksamkeit, während der Laden noch geputzt werden muss." },
      { time: "02:00", state: "time-0200", h3: "Die Produktion beginnt", p: "Die Entscheidung von gestern wird zur verderblichen Ware von heute." },
      { time: "11:40", state: "time-1140", h3: "Das Blech ist leer", p: "Es sieht nach Erfolg aus. Kunden fragen weiter danach." },
    ],
    quote: "Die Kasse erfasst, was verkauft wurde. Nicht das leere Regal, die Reste oder die Frage an der Theke. Genau dort geht Marge verloren.",
  },

  product: {
    eyebrow: "Operative Intelligenz im Dauereinsatz",
    h2: "Es beobachtet jede Filiale, jeden Tag. Es fragt nach, wenn es nötig ist.",
    lede: "Eclipsai verbindet tägliche Verkäufe, Produktion, Lieferungen und das, was Ihr Team sieht. Wird eine Änderung getestet, fragt es die richtige Person, was passiert ist. Es bringt die lohnenden Entscheidungen in einen wöchentlichen Überblick und beantwortet Fragen jederzeit.",
    mediaLabel: "Beispiel: Eclipsai begleitet eine Produktionsentscheidung über einen vertrauten Teamkanal",
    whatChanges: "Was sich ändert",
    items: [
      { n: "01", strong: "Erfasst, was gebraucht wird.", text: "Reste, Ausverkäufe und Kundenwünsche." },
      { n: "02", strong: "Überwacht jede Filiale, jedes Produkt, jeden Tag.", text: "Findet Potenzial bei Abfall, Kosten und Verkäufen." },
      { n: "03", strong: "Schlägt vor und antwortet.", text: "Zeigt die Änderungen, die sich nächste Woche lohnen, und beantwortet Fragen, wenn Sie sie stellen." },
      { n: "04", strong: "Berichtet die Ergebnisse.", text: "Zeigt die Leistung der Filialen und misst die finanzielle Wirkung jeder Entscheidung gegenüber der Alternative." },
    ],
  },

  proof: {
    metadata: "Belege von einem Betrieb · 16 Monate",
    h2Before: "Wir haben bei einem Betrieb ein jährliches Gewinnpotenzial von ",
    h2Value: "€40-60K",
    h2After: " gefunden.",
    lede: "Ein Frischwaren-Betrieb mit mehreren Standorten öffnete seine Daten. Wir verbanden Kassen- und Produktionssysteme und verfolgten jedes Produkt über jede Filiale und jeden Tag.",
    ledgerLabel: "Beleg-Journal eines Betriebs",
    rows: [
      { index: "01", h3: "Wir haben jedes Stück verfolgt", value: "860'000", copy: "Sechzehn Monate Verkäufe und Lieferungen, abgeglichen zwischen Kasse und Produktion. 92 % aller Stücke erfasst." },
      { index: "02", h3: "Wir haben gefunden, was nie verkauft wurde", ratioLabel: "Eines von vier Stücken wurde nie verkauft", value: "1 von 4", copy: "Eines von vier gelieferten Stücken wurde nie verkauft. Im Tagesgeschäft kaum sichtbar, über Produkte, Filialen und Wochentage hinweg unübersehbar." },
      { index: "03", h3: "Wir haben das Potenzial beziffert", value: "€40-60K", copy: "Das realistische Jahrespotenzial konzentrierte sich auf veraltete, immer gleiche Produktionsmuster. Der gesamte Pool unverkaufter Zutaten lag bei €190K." },
      { index: "04", h3: "Wir haben die Korrekturen getestet", value: "86 %", copy: "Wenn die stärkste Regel weniger Produktion empfahl, reichte das Regal in 86 von 100 Fällen trotzdem bis Ladenschluss." },
    ],
    bridgeBefore: "Ein Teil des Abfalls schützt den Verkauf. Das Potenzial von ",
    bridgeValue: "€40-60K",
    bridgeAfter: " steckte in übermässigem Abfall, festgefahren in alten, immer gleichen Produktionsmustern.",
    note: "Aus den Daten eines Betriebs mit mehreren Standorten, 2024 bis 2025. Spezifisch für dieses Geschäft, kein Versprechen.",
    lessonHeading: "Was wir gelernt haben",
    lessonBefore: "In unserem Test hat reines Forecasting ",
    lessonStrong: "Geld verloren",
    lessonAfter: ". Nachfrage bei kleinen Mengen schwankt stark, wichtiger Kontext liegt ausserhalb der Daten, und ein entgangener Verkauf kostet mehr als überschüssige Zutaten. Unser Ansatz ergänzt die Signale, die Prognosen fehlen, ändert nur die wenigen Entscheidungen, die sich lohnen, und misst jedes Ergebnis. Jede Woche, über jedes Produkt und jeden Standort.",
  },

  loop: {
    eyebrow: "Was wir tun",
    h2: "So wird verlorene Marge zurückgewonnen.",
    lede: "Der Kreislauf, der das Potenzial gefunden hat, kann dauerhaft über Ihre Filialen laufen.",
    listLabel: "Entscheidungskreislauf",
    steps: [
      { n: "01", b: "Verbinden.", p: "Verkaufs- und Produktionsdaten werden zu einer Historie auf Stückebene verbunden." },
      { n: "02", b: "Finden.", p: "Wiederkehrende Muster werden sichtbar: das Produkt, das jeden Freitag im Abfall landet, der Samstags-Ausverkauf und die Standardbestellung, die veraltet ist." },
      { n: "03", b: "Vorschlagen.", p: "Kleine, umkehrbare Änderungen kommen in der Wochennotiz. Mit Begründung." },
      { n: "04", b: "Messen.", p: "Jede Entscheidung wird anhand realer Verkäufe und ihrer finanziellen Wirkung gemessen." },
      { n: "05", b: "Plan korrigieren.", p: "Änderungen, die sich bewähren, bleiben. Der Rest wird angepasst oder verworfen." },
      { n: "06", b: "Wachsam bleiben.", p: "Das Zählen hört nie auf, damit sich nichts leise wieder einschleicht." },
    ],
  },

  replay: {
    title: "Vorgeschlagene Croissant-Bestellungen für 7. bis 13. Juli",
    changeStrong: "130 weniger",
    changeSpan: "Einheiten Abfall",
    dotKey: "1 Punkt = 5 Einheiten",
    ariaTitle: "Entscheidungs-Replay der Croissant-Produktion",
    ariaDesc: "Vierzehn Tage Croissant-Verkäufe als blaue Punkte, Abfall bei der aktuellen Bestellung als orange Punkte und eine durchgezogene Linie für die vorgeschlagene Bestellung. Der Vorschlag hält 988 Verkäufe und senkt den Abfall von 319 auf 189 Einheiten.",
    days: ["M 23", "D 24", "M 25", "D 26", "F 27", "S 28", "S 29", "M 30", "D 1", "M 2", "D 3", "F 4", "S 5", "S 6"],
    legendSold: "Verkauft",
    legendWaste: "Abfall im aktuellen Plan",
    legendProposed: "Vorgeschlagene Bestellung",
    tableLabel: "Ergebnisse des Entscheidungs-Replays",
    thPlan: "Plan",
    thSales: "Verkäufe",
    thWaste: "Abfall",
    rowCurrent: "Aktuell",
    rowProposed: "Vorschlag",
  },

  vision: {
    eyebrow: "Über die Produktion hinaus",
    h2: "Auf jede Entscheidung ausweiten, die den Gewinn bestimmt.",
    intro: "Die Produktion kommt zuerst, weil sich die Entscheidung täglich wiederholt und das Ergebnis schnell sichtbar wird.",
    pathLabel: "Ausbaupfad von Eclipsai",
    steps: [
      { index: "01 · Jetzt", h3: "Produktion und Abfall", p: "Verkäufe schützen, ohne vermeidbaren Abfall zu wiederholen. Veraltete Produktionspläne korrigieren und jede Änderung in Geld messen." },
      { index: "02 · Als Nächstes", h3: "Einkauf und Preise", p: "Lieferanten-Preiserhöhungen, schwache Margen und Preise erkennen, die die Kosten nicht mehr decken." },
      { index: "03 · Danach", h3: "Personal und Betrieb", p: "Sehen, wann kleinere Chargen Abfall sparen, aber Arbeit kosten, oder wann Unterbesetzung Verkäufe kostet." },
      { index: "04 · Beim Wachsen", h3: "Der nächste Standort", p: "Alles, was Eclipsai aus Ihren Filialen gelernt hat, auf die nächste übertragen." },
    ],
    closing: "Entscheidung für Entscheidung hilft Eclipsai Ihnen, mehr von dem zu behalten, was Ihr Geschäft erwirtschaftet.",
  },

  offer: {
    eyebrow: "In Ihren eigenen Filialen sehen",
    h2: "Finden Sie die verlorene Marge, die sich zuerst zurückzuholen lohnt.",
    copy: "Wir beginnen mit den Verkaufs- und Produktionsdaten, die Sie bereits haben. Wir finden wiederkehrenden Abfall, entgangene Verkäufe und Produktionspläne, die nicht mehr passen, und zeigen, was jedes davon in Geld wert ist.",
    cardH3: "Ihre erste Auswertung",
    items: [
      "Die Verluste, die sich zuerst zu beheben lohnen",
      "Die Belege hinter jedem einzelnen",
      "Das Potenzial in Geld",
      "Die ersten umkehrbaren Änderungen zum Testen",
    ],
    reassurance: "Kein neues System für Ihr Team. Nichts ändert sich, bevor die Belege eindeutig sind.",
    audience: "Für wachsende Frischwaren-Betriebe mit 2 bis 20 Standorten.",
    cta: "Verlorene Marge finden",
  },

  faq: {
    eyebrow: "Häufige Fragen",
    h2: "Was Inhaber vor dem Start wissen wollen.",
    items: [
      {
        q: "Sind wir ausverkauft, wenn wir weniger produzieren?",
        a: "Eclipsai misst beide Risiken. Abfall kostet Zutaten, ein entgangener Verkauf kostet den Grossteil des Verkaufspreises. Wir schlagen kleine Änderungen vor und prüfen, was tatsächlich passiert ist, bevor der Standardplan geändert wird.",
      },
      {
        q: "Unser System empfiehlt bereits Mengen. Was ist anders?",
        a: "Die meisten Systeme liefern eine Prognose oder eine Bestellempfehlung. Eclipsai erfasst zusätzlich, was das Team sieht, schlägt die Entscheidungen vor, die sich zu ändern lohnen, und misst, ob jede Änderung Geld gebracht oder gekostet hat.",
      },
      {
        q: "Wie viel Arbeit hat das Team damit?",
        a: "Sehr wenig. Eclipsai nutzt die Daten, die Sie bereits haben, und stellt kurze, gezielte Fragen nur dann, wenn ein wichtiges Signal fehlt, etwa ein Ausverkauf, ungewöhnliche Reste oder ein lokaler Anlass.",
      },
      {
        q: "Was, wenn unsere Daten unordentlich sind?",
        a: "Das ist normal. Wir gleichen ab, was verlässlich ist, benennen die Lücken und zeigen, was die Belege tragen, bevor wir eine Änderung empfehlen.",
      },
      {
        q: "Müssen wir alle Filialen auf einmal umstellen?",
        a: "Nein. Wir beginnen mit kleinen, umkehrbaren Änderungen für bestimmte Produkte und Standorte. Eine Änderung wird erst ausgeweitet, wenn das Ergebnis dafür spricht.",
      },
      {
        q: "Wie rechnen Sie ab?",
        a: "Eine monatliche Gebühr pro Standort. Der Umfang richtet sich nach der Anzahl der Filialen, Systeme und überwachten Entscheidungen.",
      },
    ],
  },

  footer: {
    tagline: "Operative Intelligenz für Frischebetriebe.",
    location: "Zürich, Schweiz",
  },

  meta: {
    title: "Eclipsai | Operative Intelligenz für Frischebetriebe",
    description: "Eclipsai hilft wachsenden Frischwaren-Betrieben zu entscheiden, was morgen produziert wird, Abfall zu senken und jede Änderung in Geld zu messen.",
    ogDescription: "Wissen, was morgen zu produzieren ist. Weniger wegwerfen. Mehr verkaufen.",
  },
};
