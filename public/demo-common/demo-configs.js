(function () {
  "use strict";

  const sharedCopy = {
    de: {
      heroTitle: "Operative Intelligenz für Frischbetriebe:",
      topicOrders: "Produktionsaufträge automatisieren",
      topicProducts: "Neue Produkte",
      topicPricing: "Einkauf und Preise",
      topicLabor: "Personal und Betrieb",
      topicLocation: "Nächster Standort",
      decisionKicker: "Die tägliche Produktionsentscheidung",
      decisionTitle: "Die tägliche Produktionsentscheidung",
      decisionBody: "Produktionsmengen sollen für jeden Artikel, jede Filiale und jeden Tag den Absatz maximieren und Retouren reduzieren.",
      missedSales: "Entgangene Verkäufe",
      bestQuantity: "Optimale Menge",
      unsoldProduct: "Retouren",
      methodKicker: "Was wir tun",
      methodTitle: "Was wir tun",
      systemsKicker: "Wie wir es tun",
      systemsTitle: "Wir lesen täglich Daten aus allen Systemen.",
      systemsWriteback: "…und schreiben die daraus abgeleiteten Produktionsentscheidungen direkt in diese Systeme zurück.",
      posLabel: "POS",
      posDesc: "Was wann und wo verkauft wurde",
      erpLabel: "ERP / SAP",
      erpDesc: "Artikelstammdaten, Kosten und Margen",
      planningLabel: "Produktionsplanung",
      planningDesc: "Produktions- und Liefermengen je Filiale",
      excelLabel: "Excel & Rezepturen",
      excelDesc: "Planungsregeln, Rezepturen und lokale Anpassungen",
      ordersLabel: "Bestellungen & Filialmeldungen",
      ordersDesc: "Sonderbestellungen und Wissen aus den Filialen",
      wasteLabel: "Retouren & Tagesabschluss",
      wasteDesc: "Was am Tagesende retourniert oder abgeschrieben wurde",
      methodStep1: "Historische Ergebnisse auswerten und Gewinnpotenziale bei Absatz und Retouren nach Artikel, Filiale und Tag identifizieren.",
      methodStep2: "Prognosemethoden testen, darunter Artikelhistorie, vergleichbare Wochentage, Saison, Wetter, Frequenz, Stockout-Signale, Nachfrageperzentile, statistische Prognosen und Machine Learning.",
      methodStep3: "Mengenänderungen für den Folgetag vorschlagen und umsetzen, wenn sie den erwarteten Gewinn verbessern. Den tatsächlichen Mehrgewinn ausweisen und aus jeder Änderung lernen.",
      methodStep4: "Laufend neue Methoden ergänzen, um Entscheidungen weiter zu verbessern und Retouren zu reduzieren, darunter Prognosen nach Konsumanlass und substituierbaren Artikelgruppen.",
      automationTitle: "Produktionsaufträge automatisieren",
      measurementTitle: "Ergebnisse über alle Filialen auswerten",
      desktopFullCue: "Interaktive Vollversion auf Desktop",
      mobileSourceTitle: "Alle Systeme und Datenquellen anbinden",
      mobileSourceSystems: "POS & ERP",
      sourceProduction: "Produktionsdaten",
      sourcePlanning: "Planungsdateien & Rezepturen",
      sourceStores: "Filialfotos & Filialmeldungen",
      dailyPictureBody: "Absatz. Produktion. Retouren. Kosten. Lokale Informationen.",
      mobileOrderTitle: "Die richtigen Mengen ermitteln\nund direkt ins Produktionssystem schreiben",
      mobileOrderHead: "Vorschlag für morgen",
      item: "Artikel",
      current: "Bisher",
      recommended: "Neu",
      orderImplemented: "3 bestätigte Mengenänderungen an das Produktionssystem übergeben",
      mobileProfitTitle: "Mehrgewinn messen und ausweisen",
      period: "1.–5. August · alle Filialen",
      savedCost: "vermiedene Warenkosten (CHF)",
      lostProfit: "potenziell entgangener Deckungsbeitrag (CHF)",
      profitGain: "Mehrgewinn",
      outroTitle: "Bessere Produktionsmengen. Mehr Gewinn.",
      outroLine1: "Eclipsai erkennt, welche Anpassungen bei den Produktionsmengen den Gewinn messbar steigern.",
      outroLine2: "Wir testen die Vorschläge, messen die Wirkung und automatisieren die Umsetzung.",
      outroLine3: "Mit Ihren bestehenden Systemen.",
      homeLink: "Zur ersten Seite",
      eclipsaiWebsite: "Eclipsai-Website",
      sourceFrameTitle: "Tägliches Gesamtbild erstellen",
      orderFrameTitle: "Produktionsmengen empfehlen und umsetzen",
      profitFrameTitle: "Mehrgewinn messen",
      outroFrameTitle: "Bessere Produktionsmengen und mehr Gewinn",
      previous: "Vorherige Seite",
      next: "Nächste Seite",
      pages: "Präsentationsseiten",
      goTo: "Gehe zu Seite"
    },
    en: {
      heroTitle: "The Profit Brain for Fresh Food:",
      topicOrders: "Automate Production Orders",
      topicProducts: "New Products",
      topicPricing: "Buying and Pricing",
      topicLabor: "Labor and Operations",
      topicLocation: "Next Location",
      decisionKicker: "The daily production decision",
      decisionTitle: "The daily production decision",
      decisionBody: "Production quantities should maximize sales and reduce waste for every product, store and day.",
      missedSales: "Missed sales",
      bestQuantity: "Optimal quantity",
      unsoldProduct: "Waste",
      methodKicker: "What we do",
      methodTitle: "What we do",
      systemsKicker: "How we do it",
      systemsTitle: "We read data from all systems daily.",
      systemsWriteback: "…and write the resulting production decisions directly back into these systems.",
      posLabel: "POS",
      posDesc: "What sold, where and when",
      erpLabel: "ERP / SAP",
      erpDesc: "Products, costs and commercial structure",
      planningLabel: "Production planning",
      planningDesc: "What was made and sent to each location",
      excelLabel: "Excel & recipes",
      excelDesc: "Standing rules, yields and local adjustments",
      ordersLabel: "Orders & store messages",
      ordersDesc: "Special demand and local knowledge",
      wasteLabel: "Waste & closing",
      wasteDesc: "What remained at the end of the day",
      methodStep1: "Review historical performance to identify profit opportunities in sales and waste, by product, store and day.",
      methodStep2: "Test forecasting methods, including product history, comparable weekdays, seasonality, weather, traffic, stockout signals, demand percentiles, statistical forecasts and machine learning.",
      methodStep3: "Propose and implement next-day quantity changes that improve expected profit. Measure the actual profit impact and learn from every change.",
      methodStep4: "Continuously add new methods that improve decisions and reduce waste, including forecasting by consumer occasion and substitutable product pool.",
      automationTitle: "Automate production orders",
      measurementTitle: "Measure results across all locations",
      desktopFullCue: "Full interactive version on desktop",
      mobileSourceTitle: "Connect to all systems and data",
      mobileSourceSystems: "POS & ERP",
      sourceProduction: "Production data",
      sourcePlanning: "Planning files & recipes",
      sourceStores: "Store photos & messages",
      dailyPictureBody: "Sales. Production. Returns. Costs. Local information.",
      mobileOrderTitle: "Estimate the right quantities\nand write them directly into the production system",
      mobileOrderHead: "Recommendation for tomorrow",
      item: "Product",
      current: "Current",
      recommended: "New",
      orderImplemented: "3 confirmed changes sent to the production system",
      mobileProfitTitle: "Measure and report profit impact",
      period: "1–5 August · all locations",
      savedCost: "product cost saved (CHF)",
      lostProfit: "potential lost profit (CHF)",
      profitGain: "Profit gain",
      outroTitle: "Better production orders. More profit.",
      outroLine1: "Eclipsai finds the few production changes most likely to improve profit.",
      outroLine2: "We test, measure the result, and automate.",
      outroLine3: "Using the systems you have.",
      homeLink: "Go to the first page",
      eclipsaiWebsite: "Eclipsai website",
      sourceFrameTitle: "Build a daily picture of the business",
      orderFrameTitle: "Recommend and implement production quantities",
      profitFrameTitle: "Measure profit gain",
      outroFrameTitle: "Better production quantities and more profit",
      previous: "Previous page",
      next: "Next page",
      pages: "Presentation pages",
      goTo: "Go to page"
    }
  };

  const defaultSystemSources = [
    { labelKey: "posLabel", descriptionKey: "posDesc" },
    { labelKey: "erpLabel", descriptionKey: "erpDesc" },
    { labelKey: "planningLabel", descriptionKey: "planningDesc" },
    { labelKey: "excelLabel", descriptionKey: "excelDesc" },
    { labelKey: "ordersLabel", descriptionKey: "ordersDesc" },
    { labelKey: "wasteLabel", descriptionKey: "wasteDesc" }
  ];

  const defaultMobileSourceKeys = ["mobileSourceSystems", "sourceProduction", "sourcePlanning", "sourceStores"];

  const bakeryItems = [
    ["Gipfeli", 2, "4.40"], ["Zopf 500g", 1, "6.80"], ["Butterbrezel", 3, "7.50"],
    ["Berliner", 2, "5.60"], ["Kaffee Crème", 2, "9.00"], ["Ruchbrot 1kg", 1, "6.20"],
    ["Apfeltasche", 4, "14.00"], ["Gipfeli", 1, "2.20"], ["Sauerteigbrot", 1, "8.40"],
    ["Nussgipfel", 2, "7.60"], ["Zopf 500g", 2, "13.60"], ["Butterbrezel", 1, "2.50"],
    ["Vollkornbrot", 1, "7.20"], ["Berliner", 3, "8.40"], ["Gipfeli", 4, "8.80"],
    ["Apfeltasche", 1, "3.50"], ["Sandwich Schinken", 2, "15.00"], ["Ruchbrot 1kg", 2, "12.40"]
  ];

  const spruengliItems = [
    ["Birchermüesli Classique", 1, "9.50"], ["Hörnli-Salat VGN", 1, "8.90"], ["Croissant", 2, "7.60"],
    ["Caesar Salad", 1, "14.50"], ["Kaffee Crème", 2, "9.00"], ["Luxemburgerli", 6, "14.40"],
    ["Wasabi-Kartoffel-Salat", 1, "8.90"], ["Truffes du Jour", 2, "6.40"], ["Chicken And Salad", 1, "14.50"],
    ["Landrauchschinken-Mixkornbrötli", 1, "8.50"], ["Planted Protein Bowl", 1, "15.50"],
    ["Birchermüesli Heidelbeer-Vanille", 1, "9.50"], ["Couscous-Salat", 2, "17.80"], ["Luxemburgerli", 12, "28.80"]
  ];

  const bakeryBakeryItems = [
    ["Zimtschnecke", 1, "5.90"], ["Schoggigipfeli", 2, "9.80"], ["Laugen-Gipfeli", 2, "8.80"],
    ["Cremeschnitte", 1, "6.50"], ["Kaffee Crème", 2, "9.00"], ["Hausbrot", 1, "7.80"],
    ["Mandelgipfel", 2, "9.80"], ["Zimtschnecke", 2, "11.80"], ["Sauerteigbrot", 1, "8.40"],
    ["Sandwich Hummus", 1, "9.50"], ["Zopf vegan 500g", 1, "7.90"], ["Schoggigipfeli", 1, "4.90"],
    ["Mehrkornbrot", 1, "7.60"], ["Cremeschnitte", 2, "13.00"], ["Laugen-Gipfeli", 3, "13.20"],
    ["Mandelgipfel", 1, "4.90"], ["Sandwich Caprese", 2, "19.00"], ["Hausbrot", 2, "15.60"]
  ];

  const steinerItems = [
    ["Buttergipfel", 2, "4.80"], ["Butterzopf 500g", 1, "7.20"], ["Laugenbrezel", 2, "6.40"],
    ["Berliner", 2, "6.20"], ["Kaffee Crème", 2, "9.00"], ["Ruchbrot 500g", 1, "5.80"],
    ["Apfeljalousie", 2, "8.40"], ["Buttergipfel", 1, "2.40"], ["Sauerteigbrot", 1, "8.20"],
    ["Nussgipfel", 2, "8.20"], ["Butterzopf 500g", 2, "14.40"], ["Laugenbrezel", 1, "3.20"],
    ["Dinkelvollkornbrot", 1, "7.40"], ["Berliner", 3, "9.30"], ["Buttergipfel", 4, "9.60"],
    ["Apfeljalousie", 1, "4.20"], ["Sandwich Schinken", 2, "15.80"], ["Ruchbrot 500g", 2, "11.60"]
  ];

  function bakeryData(primary, secondary, namedLocations, productProfile) {
    const locations = Object.assign({
      guggach: primary,
      uster: secondary,
      embrach: primary,
      uni88: secondary
    }, namedLocations || {});
    const products = Object.assign({
      items: bakeryItems,
      zopf: "Zopf 500g",
      loaf: "Ruchbrot 1kg",
      sourdough: "Sauerteigbrot",
      focus: "Berliner",
      croissant: "Gipfeli",
      pretzel: "Butterbrezel",
      nut: "Nussgipfel",
      whole: "Vollkornbrot",
      pastry: "Apfeltasche"
    }, productProfile || {});
    return {
      now: { p: 330, w: 250 },
      end: { p: 10000, w: 7500 },
      financials: { saved: 345, lost: 15, gain: 330 },
      sampleFinancials: { saved: 78, lost: 12, gain: 66 },
      sampleUnits: { returnsAvoided: 29, salesRisk: 2 },
      primaryLocation: primary,
      items: products.items,
      production: [
        [products.zopf, primary, 30, null], [products.loaf, primary, 36, null],
        [products.sourdough, primary, 24, null], [products.focus, primary, 80, 69], [products.croissant, primary, 45, null],
        [products.pretzel, primary, 80, 69], [products.nut, primary, 40, null], [products.zopf, secondary, 24, 21],
        [products.pretzel, secondary, 24, null], [products.sourdough, secondary, 60, 54],
        [products.loaf, locations.guggach, 30, 27], [products.croissant, locations.uster, 24, 21], [products.whole, locations.uster, 18, null],
        [products.pastry, locations.embrach, 120, 104], [products.zopf, locations.embrach, 45, 41]
      ],
      chf: { 3: 13, 5: 10, 7: 3, 9: 9, 10: 4, 11: 3, 13: 21, 14: 6 },
      snapshot: [
        ["02.08", primary, products.focus, 80, 66, 14, 0], ["03.08", primary, products.focus, 80, 71, 9, 0],
        ["04.08", primary, products.focus, 80, 58, 22, 0], ["05.08", primary, products.focus, 80, 62, 18, 1],
        ["05.08", secondary, products.sourdough, 60, 40, 20, 1]
      ],
      events: [
        ["05.08", primary, products.focus, 80, 69, 62, 7, 0, 21],
        ["05.08", primary, products.pastry, 120, 104, 73, 16, 0, 30],
        ["05.08", secondary, products.sourdough, 60, 54, 40, 6, 0, 27],
        ["05.08", locations.uni88, products.pastry, 18, 16, 18, 0, 2, -12]
      ]
    };
  }

  const configs = {
    spruengli: {
      id: "spruengli",
      route: "/Spruengli-demo-2",
      title: "Sprüngli × Eclipsai — Operative Intelligenz",
      description: "Wie Eclipsai Produktionsaufträge für Sprüngli automatisieren und den Gewinnbeitrag messen kann.",
      features: {
        balanceAnimation: true
      },
      copy: {
        de: Object.assign({}, sharedCopy.de, {
          clientBrand: "SPRÜNGLI",
          fieldNote: "Beobachtungen vor Ort · Zürich · August 2026",
          fieldLate: "4. August · Zürich",
          fieldEarly: "3. August · Zürich"
        }),
        en: Object.assign({}, sharedCopy.en, {
          clientBrand: "SPRÜNGLI",
          fieldNote: "Field observations · Zürich · August 2026",
          fieldLate: "4 August · Zürich",
          fieldEarly: "3 August · Zürich"
        })
      },
      assets: {
        fieldEvidence: [
          {
            src: "/Spruengli-demo-2/assets/field-evidence/spruengli-2026-08-04-1603-1600.jpg",
            small: "/Spruengli-demo-2/assets/field-evidence/spruengli-2026-08-04-1603-720.jpg",
            time: "16:03",
            copyKey: "fieldLate"
          },
          {
            src: "/Spruengli-demo-2/assets/field-evidence/spruengli-2026-08-03-1028-1600.jpg",
            small: "/Spruengli-demo-2/assets/field-evidence/spruengli-2026-08-03-1028-720.jpg",
            time: "6:28",
            copyKey: "fieldEarly"
          }
        ],
        sources: [
          "/Spruengli-demo-2/assets/source-photos/pos-900.jpg",
          "/Spruengli-demo-2/assets/field-evidence/spruengli-product-display.jpg",
          "/Spruengli-demo-2/assets/source-photos/computer.jpg",
          "/Spruengli-demo-2/assets/field-evidence/spruengli-shelf-selection.jpg",
          "/Spruengli-demo-2/assets/source-photos/phone-message.jpg"
        ]
      },
      systemVendors: {
        de: ["Produktionssysteme", "POS", "ERP"],
        en: ["Production systems", "POS", "ERP"]
      },
      systemSources: defaultSystemSources,
      mobileSourceKeys: defaultMobileSourceKeys,
      mobileOrders: [["Caesar Salad", 80, 69], ["Birchermüesli Classique", 120, 104], ["Planted Protein Bowl", 60, 54]],
      engineCopy: {
        en: {
          demoBrand: "Sprüngli",
          appSub1: "Fri 5 Aug 2026 · Zürich 1, till 1",
          appSub2: "Thu 6 Aug 2026 · all shops",
          cSub: "Illustrative. All shops, 1 to 5 August 2026.",
          cSubProj: "Projected to 31 December, at the rate measured so far.",
          match: [["Bircher Müesli", "renamed, matched to Birchermüesli Classique", "matched", ""], ["Summer Bowl", "new, no history yet, left unchanged", "new", "n"], ["Asparagus Salad", "no sales for 4 weeks, excluded", "excluded", "c"]]
        },
        de: {
          demoBrand: "Sprüngli",
          appSub1: "Fr 5. Aug 2026 · Zürich 1, Kasse 1",
          appSub2: "Do 6. Aug 2026 · alle Filialen",
          cSub: "Illustratives Beispiel. Alle Filialen, 1. bis 5. August 2026.",
          cSubProj: "Auf den 31. Dezember hochgerechnet, basierend auf dem bisher gemessenen Effekt.",
          match: [["Bircher Müesli", "umbenannt und Birchermüesli Classique zugeordnet", "zugeordnet", ""], ["Sommer-Bowl", "neu, noch ohne Historie; unverändert übernommen", "neu", "n"], ["Spargel-Salat", "seit vier Wochen ohne Absatz; ausgeschlossen", "ausgeschlossen", "c"]]
        }
      },
      engineData: {
        now: { p: 6600, w: 2900 }, end: { p: 200000, w: 87000 },
        financials: { saved: 7800, lost: 1200, gain: 6600 },
        sampleFinancials: { saved: 1560, lost: 240, gain: 1320 },
        sampleUnits: { returnsAvoided: 580, salesRisk: 40 },
        primaryLocation: "Zürich 1", items: spruengliItems,
        production: [
          ["Birchermüesli Classique", "Zürich 1", 30, null], ["Hörnli-Salat VGN", "Zürich 1", 36, null],
          ["Wasabi-Kartoffel-Salat", "Zürich 1", 24, null], ["Caesar Salad", "Zürich 1", 80, 69],
          ["Croissant", "Zürich 1", 45, null], ["Chicken And Salad", "Zürich 1", 80, 69],
          ["Landrauchschinken-Mixkornbrötli", "Zürich 1", 40, null], ["Truffes du Jour", "Zürich 2", 24, 21],
          ["Luxemburgerli", "Zürich 2", 24, null], ["Planted Protein Bowl", "Zürich 2", 60, 54],
          ["Levante Bowl", "Zürich 1", 30, 27], ["Sandwich Caprese", "Zürich 2", 24, 21],
          ["Canapé Lachs", "Zürich 2", 18, null], ["Birchermüesli Classique", "Zürich 1", 120, 104],
          ["Pâtisserie", "Zürich 1", 45, 41]
        ],
        chf: { 3: 1300, 5: 1000, 7: 300, 9: 900, 10: 400, 11: 300, 13: 2100, 14: 600 },
        snapshot: [
          ["02.08", "Zürich 1", "Caesar Salad", 80, 66, 14, 0], ["03.08", "Zürich 1", "Caesar Salad", 80, 71, 9, 0],
          ["04.08", "Zürich 1", "Caesar Salad", 80, 58, 22, 0], ["05.08", "Zürich 1", "Caesar Salad", 80, 62, 18, 1],
          ["05.08", "Zürich 2", "Planted Protein Bowl", 60, 40, 20, 1]
        ],
        events: [
          ["05.08", "ALL", "Caesar Salad", 1600, 1380, 1240, 140, 0, 420],
          ["05.08", "ALL", "Birchermüesli Classique", 2400, 2080, 1460, 320, 0, 600],
          ["05.08", "ALL", "Planted Protein Bowl", 1200, 1080, 800, 120, 0, 540],
          ["05.08", "ALL", "Birchermüesli Classique", 360, 320, 360, 0, 40, -240]
        ]
      }
    },
    hausammann: {
      id: "hausammann",
      route: "/Hausammann-demo-1",
      title: "Hausammann × Eclipsai — Operative Intelligenz",
      description: "Wie Eclipsai Produktionsaufträge für Hausammann automatisieren und den Gewinnbeitrag messen kann.",
      features: {
        balanceAnimation: true
      },
      copy: {
        de: Object.assign({}, sharedCopy.de, {
          clientBrand: "HAUSAMMANN",
          fieldNote: "Beobachtungen vor Ort · 5. August 2026",
          fieldLate: "5. August · Hausammann",
          fieldEarly: "5. August · Hausammann"
        }),
        en: Object.assign({}, sharedCopy.en, {
          clientBrand: "HAUSAMMANN",
          fieldNote: "Field observations · 5 August 2026",
          fieldLate: "5 August · Hausammann",
          fieldEarly: "5 August · Hausammann"
        })
      },
      assets: {
        clientLogo: "/Hausammann-demo-1/assets/brand/hausammann-logo.png",
        fieldEvidence: [
          {
            src: "/Hausammann-demo-1/assets/field-evidence/hausammann-2026-08-05-1637-1600.jpg",
            small: "/Hausammann-demo-1/assets/field-evidence/hausammann-2026-08-05-1637-720.jpg",
            time: "16:37",
            copyKey: "fieldLate"
          }
        ],
        sources: [
          "/Hausammann-demo-1/assets/source-photos/pos.jpg", "/Hausammann-demo-1/assets/source-photos/baker-production.jpg",
          "/Hausammann-demo-1/assets/source-photos/computer.jpg", "/Hausammann-demo-1/assets/source-photos/hausammann-counter-900.jpg",
          "/Hausammann-demo-1/assets/source-photos/phone-message.jpg"
        ]
      },
      systemVendors: {
        de: ["HS Soft", "Protecdata BackStar", "Mark.One", "Lightspeed", "TurboBack"],
        en: ["HS Soft", "Protecdata BackStar", "Mark.One", "Lightspeed", "TurboBack"]
      },
      systemSources: defaultSystemSources,
      mobileSourceKeys: defaultMobileSourceKeys,
      mobileOrders: [["Berliner", 80, 69], ["Apfeltasche", 120, 104], ["Sauerteigbrot", 60, 54]],
      engineCopy: {
        en: { demoBrand: "Hausammann", appSub1: "Fri 5 Aug 2026 · Thalwil, till 1", appSub2: "Thu 6 Aug 2026 · all shops", cSub: "Illustrative. 1 to 5 August 2026.", cSubProj: "Projected to 31 December, at the rate measured so far.", evTot: "4 product-days", match: [["Gipfeli Butter", "renamed, matched back to its own history", "matched", ""], ["Sandwich Schinken", "new, no history yet, left alone", "new", "n"], ["Tirggel", "not sold for 4 weeks, closed", "closed", "c"]] },
        de: { demoBrand: "Hausammann", appSub1: "Fr 5. Aug 2026 · Thalwil, Kasse 1", appSub2: "Do 6. Aug 2026 · alle Filialen", cSub: "Beispielrechnung. 1. bis 5. August 2026.", cSubProj: "Bis zum 31. Dezember hochgerechnet, basierend auf dem bisher gemessenen Effekt.", evTot: "4 Artikeltage", match: [["Gipfeli Butter", "umbenannt und wieder der bisherigen Artikelhistorie zugeordnet", "zugeordnet", ""], ["Sandwich Schinken", "neu, noch ohne Historie; unverändert übernommen", "neu", "n"], ["Tirggel", "seit vier Wochen ohne Absatz; ausgelistet", "ausgelistet", "c"]] }
      },
      engineData: bakeryData("Thalwil", "Zollikon", {
        guggach: "Guggach",
        uster: "Uster",
        embrach: "Embrach",
        uni88: "Uni 88"
      })
    },
    bakerybakery: {
      id: "bakerybakery",
      route: "/BakeryBakery-demo-1",
      title: "Bakery Bakery × Eclipsai — Operative Intelligenz",
      description: "Wie Eclipsai Produktionsaufträge für Bakery Bakery automatisieren und den Gewinnbeitrag messen kann.",
      features: {
        balanceAnimation: true
      },
      copy: {
        de: Object.assign({}, sharedCopy.de, {
          clientBrand: "BAKERY BAKERY",
          fieldNote: "Produktions- und Verkaufssituation",
          fieldLate: "Verkauf",
          fieldEarly: "Produktion",
          posLabel: "Kassensystem / POS",
          posDesc: "Was wann und an welchem Standort verkauft wurde",
          erpLabel: "Artikel & Kosten",
          erpDesc: "Sortiment, Verkaufspreise und Warenkosten",
          planningLabel: "Produktionsplanung",
          planningDesc: "Produktionsmengen und Verteilung je Standort",
          excelLabel: "Rezepte & Produktionslisten",
          excelDesc: "Rezepturen, Ausbeuten und Planungsregeln",
          ordersLabel: "Bestellungen & Standortmeldungen",
          ordersDesc: "Sonderbestellungen und lokales Wissen",
          wasteLabel: "Retouren & Abschriften",
          wasteDesc: "Was am Tagesende übrig blieb oder abgeschrieben wurde"
        }),
        en: Object.assign({}, sharedCopy.en, {
          clientBrand: "BAKERY BAKERY",
          fieldNote: "Production and sales context",
          fieldLate: "Sales",
          fieldEarly: "Production",
          posLabel: "POS system",
          posDesc: "What sold, when and at which location",
          erpLabel: "Products & costs",
          erpDesc: "Range, selling prices and product costs",
          planningLabel: "Production planning",
          planningDesc: "Production quantities and allocation by location",
          excelLabel: "Recipes & production lists",
          excelDesc: "Recipes, yields and planning rules",
          ordersLabel: "Orders & location messages",
          ordersDesc: "Special orders and local knowledge",
          wasteLabel: "Returns & write-offs",
          wasteDesc: "What remained or was written off at the end of the day"
        })
      },
      assets: {
        clientLogo: "/BakeryBakery-demo-1/assets/brand/bakery-bakery-logo.png",
        fieldEvidence: [
          {
            src: "/BakeryBakery-demo-1/assets/field-evidence/opening-display.png",
            time: "",
            copyKey: "fieldLate"
          },
          {
            src: "/BakeryBakery-demo-1/assets/field-evidence/opening-production.jpg",
            time: "",
            copyKey: "fieldEarly"
          }
        ],
        sources: [
          "/BakeryBakery-demo-1/assets/source-photos/pos.jpg", "/BakeryBakery-demo-1/assets/source-photos/baker-production.jpg",
          "/BakeryBakery-demo-1/assets/source-photos/computer.jpg", "/BakeryBakery-demo-1/assets/source-photos/bakery-display-neutral.png",
          "/BakeryBakery-demo-1/assets/source-photos/phone-message.jpg"
        ]
      },
      systemVendors: {
        de: ["Kassensystem", "Produktionslisten", "Bestellungen"],
        en: ["POS", "Production lists", "Orders"]
      },
      systemSources: defaultSystemSources,
      mobileSourceKeys: defaultMobileSourceKeys,
      mobileOrders: [["Zimtschnecke", 80, 69], ["Cremeschnitte", 120, 104], ["Sauerteigbrot", 60, 54]],
      engineCopy: {
        en: { demoBrand: "Bakery Bakery", appSub1: "Fri 5 Aug 2026 · Zürich HB, till 1", appSub2: "Thu 6 Aug 2026 · all locations", cSub: "Illustrative. 1 to 5 August 2026.", cSubProj: "Projected to 31 December, at the rate measured so far.", evTot: "4 product-days", match: [["Chocolate croissant", "renamed, matched to Schoggigipfeli", "matched", ""], ["Sandwich Hummus", "new, no history yet, left unchanged", "new", "n"], ["Summer tart", "not sold for 4 weeks, excluded", "excluded", "c"]] },
        de: { demoBrand: "Bakery Bakery", appSub1: "Fr 5. Aug 2026 · Zürich HB, Kasse 1", appSub2: "Do 6. Aug 2026 · alle Standorte", cSub: "Beispielrechnung. 1. bis 5. August 2026.", cSubProj: "Bis zum 31. Dezember hochgerechnet, basierend auf dem bisher gemessenen Effekt.", evTot: "4 Artikeltage", match: [["Schokoladengipfel", "umbenannt und Schoggigipfeli zugeordnet", "zugeordnet", ""], ["Sandwich Hummus", "neu, noch ohne Historie; unverändert übernommen", "neu", "n"], ["Sommertarte", "seit vier Wochen ohne Absatz; ausgeschlossen", "ausgeschlossen", "c"]] }
      },
      engineData: bakeryData("Zürich HB", "Schaffhauserplatz", {
        guggach: "ThreeOfive",
        uster: "Bern Bahnhof",
        embrach: "Basel Bahnhof",
        uni88: "Winterthur Bahnhof"
      }, {
        items: bakeryBakeryItems,
        zopf: "Zopf vegan 500g",
        loaf: "Hausbrot",
        sourdough: "Sauerteigbrot",
        focus: "Zimtschnecke",
        croissant: "Laugen-Gipfeli",
        pretzel: "Schoggigipfeli",
        nut: "Mandelgipfel",
        whole: "Mehrkornbrot",
        pastry: "Cremeschnitte"
      })
    },
    steiner: {
      id: "steiner",
      route: "/Steiner-Flughafebeck-demo-1",
      title: "Steiner Flughafebeck × Eclipsai — Operative Intelligenz",
      description: "Wie Eclipsai Produktionsaufträge für Steiner Flughafebeck automatisieren und den Gewinnbeitrag messen kann.",
      features: {
        balanceAnimation: true
      },
      copy: {
        de: Object.assign({}, sharedCopy.de, {
          clientBrand: "STEINER FLUGHAFEBECK",
          fieldNote: "Produktions- und Verkaufssituation",
          fieldLate: "Verkauf",
          fieldEarly: "Produktion",
          posLabel: "Kassensystem / POS",
          posDesc: "Was wann und in welcher Filiale verkauft wurde",
          erpLabel: "Warenwirtschaft / ERP",
          erpDesc: "Artikelstammdaten, Kosten, Preise und Filialstruktur",
          planningLabel: "Produktions- & Tourenplanung",
          planningDesc: "Produktionsmengen, Lieferungen und Verteilung je Filiale",
          excelLabel: "Rezepte & Planungsdateien",
          excelDesc: "Rezepturen, Ausbeuten und lokale Anpassungen",
          ordersLabel: "Filialbestellungen & Meldungen",
          ordersDesc: "Sonderbestellungen und Wissen aus den Filialen",
          wasteLabel: "Retouren & Tagesabschluss",
          wasteDesc: "Was am Tagesende retourniert oder abgeschrieben wurde"
        }),
        en: Object.assign({}, sharedCopy.en, {
          clientBrand: "STEINER FLUGHAFEBECK",
          fieldNote: "Production and sales context",
          fieldLate: "Sales",
          fieldEarly: "Production",
          posLabel: "POS system",
          posDesc: "What sold, when and in which shop",
          erpLabel: "Merchandise system / ERP",
          erpDesc: "Products, costs, prices and location structure",
          planningLabel: "Production & route planning",
          planningDesc: "Production quantities, deliveries and allocation by location",
          excelLabel: "Recipes & planning files",
          excelDesc: "Recipes, yields and local adjustments",
          ordersLabel: "Shop orders & messages",
          ordersDesc: "Special orders and knowledge from the shops",
          wasteLabel: "Returns & closing",
          wasteDesc: "What was returned or written off at the end of the day"
        })
      },
      assets: {
        clientLogo: "/Steiner-Flughafebeck-demo-1/assets/brand/steiner-flughafebeck-logo.svg",
        fieldEvidence: [
          {
            src: "/Steiner-Flughafebeck-demo-1/assets/field-evidence/opening-display.png",
            time: "",
            copyKey: "fieldLate"
          },
          {
            src: "/Steiner-Flughafebeck-demo-1/assets/field-evidence/opening-production.jpg",
            time: "",
            copyKey: "fieldEarly"
          }
        ],
        sources: [
          "/Steiner-Flughafebeck-demo-1/assets/source-photos/pos.jpg", "/Steiner-Flughafebeck-demo-1/assets/source-photos/baker-production.jpg",
          "/Steiner-Flughafebeck-demo-1/assets/source-photos/computer.jpg", "/Steiner-Flughafebeck-demo-1/assets/source-photos/bakery-display-neutral.png",
          "/Steiner-Flughafebeck-demo-1/assets/source-photos/phone-message.jpg"
        ]
      },
      systemVendors: {
        de: ["Kassensystem", "Warenwirtschaft", "Produktionsplanung"],
        en: ["POS", "ERP", "Production planning"]
      },
      systemSources: defaultSystemSources,
      mobileSourceKeys: defaultMobileSourceKeys,
      mobileOrders: [["Berliner", 80, 69], ["Apfeljalousie", 120, 104], ["Sauerteigbrot", 60, 54]],
      engineCopy: {
        en: { demoBrand: "Steiner Flughafebeck", appSub1: "Fri 5 Aug 2026 · Sihlpost, till 1", appSub2: "Thu 6 Aug 2026 · all shops", cSub: "Illustrative. 1 to 5 August 2026.", cSubProj: "Projected to 31 December, at the rate measured so far.", evTot: "4 product-days", match: [["Butter croissant", "renamed, matched to Buttergipfel", "matched", ""], ["Sandwich Schinken", "new, no history yet, left unchanged", "new", "n"], ["Seasonal pastry", "not sold for 4 weeks, excluded", "excluded", "c"]] },
        de: { demoBrand: "Steiner Flughafebeck", appSub1: "Fr 5. Aug 2026 · Sihlpost, Kasse 1", appSub2: "Do 6. Aug 2026 · alle Filialen", cSub: "Beispielrechnung. 1. bis 5. August 2026.", cSubProj: "Bis zum 31. Dezember hochgerechnet, basierend auf dem bisher gemessenen Effekt.", evTot: "4 Artikeltage", match: [["Buttercroissant", "umbenannt und Buttergipfel zugeordnet", "zugeordnet", ""], ["Sandwich Schinken", "neu, noch ohne Historie; unverändert übernommen", "neu", "n"], ["Saisongebäck", "seit vier Wochen ohne Absatz; ausgeschlossen", "ausgeschlossen", "c"]] }
      },
      engineData: bakeryData("Sihlpost", "Flughafen", {
        guggach: "Wipkingen",
        uster: "Oerlikon",
        embrach: "Pfingstweidpark",
        uni88: "Höngg Dorf"
      }, {
        items: steinerItems,
        zopf: "Butterzopf 500g",
        loaf: "Ruchbrot 500g",
        sourdough: "Sauerteigbrot",
        focus: "Berliner",
        croissant: "Buttergipfel",
        pretzel: "Laugenbrezel",
        nut: "Nussgipfel",
        whole: "Dinkelvollkornbrot",
        pastry: "Apfeljalousie"
      })
    },
    restaurant: {
      id: "restaurant",
      route: "/restaurant-demo-0-0",
      title: "The Profit Brain for Fresh Food | Eclipsai",
      description: "See how Eclipsai improves restaurant profit by lowering food cost without losing sales.",
      ogTitle: "The Profit Brain for Fresh Food | Eclipsai",
      ogDescription: "From sales, recipes, purchases and counts to better order and prep decisions and measurable profit.",
      defaultLanguage: "en",
      features: {
        balanceAnimation: true,
        fieldEvidenceLayout: "overlap",
        profitOperator: "+",
        secondaryProfitTerm: "gain"
      },
      copy: {
        en: Object.assign({}, sharedCopy.en, {
          clientBrand: "FRESH FOOD",
          heroTitle: "The Profit Brain for Fresh Food",
          topicOrders: "Food Cost & Availability",
          topicProducts: "Ordering & Prep",
          topicPricing: "Menu & Pricing",
          decisionKicker: "The daily ingredient decision",
          decisionTitle: "Ingredient quantities must balance availability with waste.",
          decisionBody: "Too much becomes waste. Too little makes menu items unavailable.",
          missedSales: "Lost sales",
          bestQuantity: "Best quantity",
          unsoldProduct: "Waste and excess stock",
          fieldNote: "Illustrative restaurant example",
          fieldLate: "Grilled chicken unavailable",
          fieldEarly: "8 prep portions remained",
          systemsTitle: "We read data from all systems daily.",
          systemsWriteback: "…and write the resulting ordering and prep decisions directly back into these systems.",
          posLabel: "POS & delivery",
          posDesc: "What sold, when, and which items became unavailable",
          recipeLabel: "Recipes & menu",
          recipeDesc: "What every sale should consume and contribute",
          purchaseLabel: "Purchases & invoices",
          purchaseDesc: "What was bought, from whom, and at what price",
          countLabel: "Stock & prep counts",
          countDesc: "What was available, prepared, left, or discarded",
          methodStep1: "Review historical performance to identify profit opportunities in food cost, sales, availability and waste, by component and day.",
          methodStep2: "Test forecasting methods, including sales history, comparable weekdays, seasonality, weather, traffic, availability signals, demand percentiles, statistical forecasts and machine learning.",
          methodStep3: "Propose and implement next-day ordering and prep changes that improve expected profit. Measure the actual profit impact and learn from every change.",
          methodStep4: "Continuously add new methods that improve decisions, availability and food cost, including forecasting by menu occasion and substitutable ingredient group.",
          automationTitle: "Improve food cost & availability",
          measurementTitle: "Measure results for the restaurant",
          mobileSourceTitle: "Connect to all systems and data",
          dailyPictureBody: "Sales. Theoretical use. Actual use. Waste. Availability.",
          mobileOrderTitle: "Estimate the right ordering and prep quantities\nand write them directly into operational systems",
          mobileOrderHead: "Tomorrow's order & prep",
          item: "Component",
          orderImplemented: "2 confirmed changes sent to the order sheet and prep plan",
          mobileProfitTitle: "Measure and report profit impact",
          period: "1–5 August · Restaurant 1",
          savedCost: "food-cost improvement (CHF)",
          lostProfit: "contribution recovered from availability (CHF)",
          outroTitle: "Lower food cost. Better availability. More profit.",
          outroLine1: "Eclipsai finds the few ordering and prep changes most likely to improve profit.",
          outroLine2: "We test, measure the result, and automate.",
          outroLine3: "Using the systems you have.",
          sourceFrameTitle: "Build a daily picture of the restaurant business",
          orderFrameTitle: "Recommend and implement restaurant ordering and prep quantities",
          profitFrameTitle: "Measure the profit impact of ordering and prep changes",
          outroFrameTitle: "Lower food cost, better availability and more profit"
        }),
        de: Object.assign({}, sharedCopy.de, {
          clientBrand: "FRESH FOOD",
          topicOrders: "Warenkosten & Verfügbarkeit",
          topicProducts: "Bestellung & Vorbereitung",
          topicPricing: "Menü & Preise",
          decisionKicker: "Die tägliche Zutatenentscheidung",
          decisionTitle: "Zutatenmengen müssen Verfügbarkeit und Abfall ausbalancieren.",
          decisionBody: "Zu viel wird zu Abfall. Zu wenig macht Gerichte unverfügbar.",
          bestQuantity: "Beste Menge",
          unsoldProduct: "Abfall und Überbestand",
          fieldNote: "Illustratives Restaurantbeispiel",
          fieldLate: "Grillhähnchen nicht verfügbar",
          fieldEarly: "8 vorbereitete Portionen übrig",
          systemsTitle: "Wir lesen täglich Daten aus allen Systemen.",
          systemsWriteback: "…und schreiben die daraus abgeleiteten Bestell- und Vorbereitungsentscheidungen direkt in diese Systeme zurück.",
          posLabel: "POS & Lieferplattformen",
          posDesc: "Was verkauft wurde und welche Artikel nicht verfügbar waren",
          recipeLabel: "Rezepturen & Menü",
          recipeDesc: "Was jeder Verkauf verbrauchen und beitragen sollte",
          purchaseLabel: "Einkauf & Rechnungen",
          purchaseDesc: "Was bei wem und zu welchem Preis eingekauft wurde",
          countLabel: "Bestand & Vorbereitung",
          countDesc: "Was verfügbar, vorbereitet, übrig oder entsorgt war",
          methodStep1: "Historische Ergebnisse auswerten und Gewinnpotenziale bei Warenkosten, Absatz, Verfügbarkeit und Abfall nach Komponente und Tag identifizieren.",
          methodStep2: "Prognosemethoden testen, darunter Absatzhistorie, vergleichbare Wochentage, Saison, Wetter, Frequenz, Verfügbarkeitssignale, Nachfrageperzentile, statistische Prognosen und Machine Learning.",
          methodStep3: "Bestell- und Vorbereitungsmengen für den Folgetag vorschlagen und umsetzen, wenn sie den erwarteten Gewinn verbessern. Den tatsächlichen Mehrgewinn ausweisen und aus jeder Änderung lernen.",
          methodStep4: "Laufend neue Methoden ergänzen, um Entscheidungen, Verfügbarkeit und Warenkosten weiter zu verbessern, darunter Prognosen nach Menüanlass und substituierbaren Zutatengruppen.",
          automationTitle: "Warenkosten & Verfügbarkeit verbessern",
          measurementTitle: "Ergebnisse für das Restaurant auswerten",
          mobileSourceTitle: "Alle Systeme und Datenquellen anbinden",
          dailyPictureBody: "Absatz. Sollverbrauch. Istverbrauch. Abfall. Verfügbarkeit.",
          mobileOrderTitle: "Die richtigen Bestell- und Vorbereitungsmengen ermitteln\nund direkt in die operativen Systeme schreiben",
          mobileOrderHead: "Bestellung & Vorbereitung für morgen",
          item: "Komponente",
          orderImplemented: "2 bestätigte Änderungen ins Bestellblatt und in den Vorbereitungsplan übernommen",
          mobileProfitTitle: "Mehrgewinn messen und ausweisen",
          period: "1.–5. August · Restaurant 1",
          savedCost: "Verbesserung der Warenkosten (CHF)",
          lostProfit: "zurückgewonnener Deckungsbeitrag aus Verfügbarkeit (CHF)",
          outroTitle: "Tiefere Warenkosten. Bessere Verfügbarkeit. Mehr Gewinn.",
          outroLine1: "Eclipsai erkennt die wenigen Bestell- und Vorbereitungsänderungen, die den Gewinn verbessern können.",
          outroLine2: "Wir testen sie, messen den Effekt und automatisieren die Umsetzung.",
          sourceFrameTitle: "Tägliches Gesamtbild des Restaurantbetriebs erstellen",
          orderFrameTitle: "Bestell- und Vorbereitungsmengen empfehlen und umsetzen",
          profitFrameTitle: "Mehrgewinn aus Bestell- und Vorbereitungsänderungen messen",
          outroFrameTitle: "Tiefere Warenkosten, bessere Verfügbarkeit und mehr Gewinn"
        })
      },
      assets: {
        fieldEvidence: [
          {
            src: "/restaurant-profit-brain-demo/assets/source-photos/unavailable-plate-v2.jpg",
            small: "/restaurant-profit-brain-demo/assets/source-photos/unavailable-plate-v2-720.jpg",
            width: 880,
            position: "center 66%",
            time: "13:42",
            copyKey: "fieldLate"
          },
          {
            src: "/restaurant-profit-brain-demo/assets/source-photos/remaining-chicken-plate-v2.jpg",
            small: "/restaurant-profit-brain-demo/assets/source-photos/remaining-chicken-plate-v2-720.jpg",
            width: 880,
            position: "center 66%",
            time: "21:35",
            copyKey: "fieldEarly"
          }
        ],
        sources: [
          "/restaurant-profit-brain-demo/assets/source-photos/pos.jpg",
          "/restaurant-profit-brain-demo/assets/source-photos/recipes-menu.jpg",
          "/restaurant-profit-brain-demo/assets/source-photos/purchases-invoice.jpg",
          "/restaurant-profit-brain-demo/assets/source-photos/remaining-chicken-plate-v2.jpg",
          "/restaurant-profit-brain-demo/assets/source-photos/phone-message.jpg"
        ]
      },
      systemSources: [
        { labelKey: "posLabel", descriptionKey: "posDesc" },
        { labelKey: "recipeLabel", descriptionKey: "recipeDesc" },
        { labelKey: "purchaseLabel", descriptionKey: "purchaseDesc" },
        { labelKey: "countLabel", descriptionKey: "countDesc" }
      ],
      mobileSourceKeys: ["posLabel", "recipeLabel", "purchaseLabel", "countLabel"],
      systemVendors: {
        en: ["Order & prep plan", "POS", "Purchases"],
        de: ["Bestell- & Vorbereitungsplan", "POS", "Einkauf"]
      },
      mobileOrders: [["Grilled chicken portions", 80, 70], ["Avocado portions", 36, 42]],
      engineCopy: {
        en: {
          demoBrand: "FRESH FOOD",
          headline: "We improve profit: <b>lower food cost without losing sales</b>",
          profitPrefix: "The Profit Brain",
          profitRotations: ["Food Cost & Availability", "Ordering & Prep", "Menu & Pricing", "Labor & Operations", "Next Location"],
          say: ["Connect to all systems and data", "Estimate the right ordering and prep quantities\nand write them directly into operational systems", "Measure and report profit impact"],
          voiceover: [
            ["We connect POS sales, recipes, supplier purchases, and stock and prep counts.", "Sales and recipes show what should have been used. Purchases and counts show what was actually used.", "This creates one daily picture of food cost, waste, and availability."],
            ["Every day, we reassess sales, availability, stock, costs, and manager feedback.", "We propose the few ordering and prep quantity changes most likely to improve profit.", "After approval, confirmed quantities update the existing order sheet or prep plan."],
            ["For the restaurant, we measure sales, use, closing stock, and availability.", "We calculate the profit effect of each change. We keep what works and stop what does not.", "This creates a daily learning and improvement loop."]
          ],
          capLeft: "POS · recipes · purchases · counts",
          panelFirst: "Build a daily picture of the business",
          panelSecond: "Propose and implement order & prep quantities",
          panelFinalAnalysis: "Analyse results for the restaurant",
          panelFinalReport: "Report restaurant profit — daily and total",
          flowFirst: "Sales\nRecipes\nPurchases\nCounts",
          flowSecond: "New order & prep\nquantities",
          navTill: "POS", navProd: "Order & prep", tabProd: "Order & prep",
          appProd: "Tomorrow's order & prep",
          appSub1: "Fri 5 Aug 2026 · Restaurant 1, POS 1",
          appSub2: "Thu 6 Aug 2026 · Restaurant 1",
          thShop: "Restaurant",
          countChanged: (n) => n + " of 64 order and prep quantities changed",
          lkIn: ["SALES", "FOOD COST"], lkOut: "ORDER & PREP",
          match: [["Chicken breast", "matched to five menu recipes", "matched", ""], ["Seasonal dressing", "new, no history yet, left unchanged", "new", "n"], ["Retired garnish", "no longer on the menu, excluded", "excluded", "c"]],
          snapTh: ["Date", "Restaurant", "Component", "Prepared", "Used", "Left"],
          eqSaved: "food-cost improvement (CHF)",
          eqLost: "contribution recovered from availability (CHF)",
          evTh: ["Date", "Restaurant", "Component", "Old", "New", "Used", "Waste ↓", "Availability ↑", "CHF"],
          evTot: "Restaurant total",
          cProfit: "Profit gain", cWaste: "Waste avoided", cUnits: "portions",
          cOfSales: "(<b>0.7%</b> of sales)", cRange: "(<b>12%</b> to <b>10%</b>)",
          cSub: "Illustrative. Restaurant 1, 1 to 5 August 2026.",
          cSubProj: "Projected to 31 December, at the rate measured so far.",
          systemProduction: "Order & prep plan", systemPos: "POS", systemErp: "Purchases",
          allShops: "Restaurant 1", network: "Restaurant 1",
          sourcePos: "POS & delivery", sourceProduction: "Recipes & menu", sourceAccounting: "Accounting",
          sourceFiles: "Purchases & invoices", sourceEmails: "Emails", sourcePhotos: "Photos", sourceVoice: "Voice messages",
          sourceShelf: "Stock & prep counts", sourceMessages: "Manager notes",
          checkWaste: "Waste and unavailable items", checkHistory: "Daily and weekly sales patterns",
          checkWeather: "Weather and local events", checkNew: "Menu changes and new items",
          checkSupplier: "Supplier prices and recipe costs", checkFeedback: "Manager feedback", checkStock: "Closing stock and prep counts",
          p2Scope: "1–5 AUGUST · RESTAURANT 1",
          p2Note: "Restaurant total. Profit gain combines food-cost improvement with contribution recovered when better availability generated additional sales.",
          streamKeys: { receipt: "receipt", time: "time", location: "restaurant", item: "item", quantity: "quantity", amount: "amount" }
        },
        de: {
          demoBrand: "FRESH FOOD",
          headline: "Mehr Gewinn durch <b>tiefere Warenkosten ohne Umsatzverlust</b>",
          profitPrefix: "Operative Intelligenz für Frischbetriebe",
          profitRotations: ["Warenkosten & Verfügbarkeit", "Bestellung & Vorbereitung", "Menü & Preise", "Personal & Betrieb", "Nächster Standort"],
          say: ["Alle Systeme und Datenquellen anbinden", "Die richtigen Bestell- und Vorbereitungsmengen ermitteln\nund direkt in die operativen Systeme schreiben", "Mehrgewinn messen und ausweisen"],
          voiceover: [
            ["Eclipsai verbindet POS-Verkäufe, Rezepturen, Einkäufe sowie Bestands- und Vorbereitungszählungen.", "Verkäufe und Rezepturen zeigen den Sollverbrauch. Einkäufe und Zählungen zeigen den Istverbrauch.", "So entsteht täglich ein Bild von Warenkosten, Abfall und Verfügbarkeit."],
            ["Täglich werden Absatz, Verfügbarkeit, Bestand, Kosten und Betriebsfeedback neu ausgewertet.", "Daraus entstehen die wenigen Mengenänderungen, die den Gewinn am wahrscheinlichsten verbessern.", "Nach Freigabe werden die Mengen im bestehenden Bestellblatt oder Vorbereitungsplan aktualisiert."],
            ["Für das Restaurant messen wir Absatz, Verbrauch, Schlussbestand und Verfügbarkeit.", "Wir berechnen den Gewinnbeitrag jeder Anpassung und behalten nur, was funktioniert.", "So entsteht ein täglicher Lern- und Verbesserungszyklus."]
          ],
          capLeft: "POS · Rezepturen · Einkauf · Zählungen",
          panelFirst: "Tägliches Gesamtbild erstellen",
          panelSecond: "Bestell- und Vorbereitungsmengen empfehlen und umsetzen",
          panelFinalAnalysis: "Ergebnisse für das Restaurant auswerten",
          panelFinalReport: "Restaurantgewinn — täglich und kumuliert",
          flowFirst: "Absatz\nRezepturen\nEinkauf\nZählungen",
          flowSecond: "Neue Bestell- und\nVorbereitungsmengen",
          navTill: "POS", navProd: "Bestellung & Vorbereitung", tabProd: "Bestellung & Vorbereitung",
          appProd: "Bestellung & Vorbereitung für morgen",
          appSub1: "Fr 5. Aug 2026 · Restaurant 1, POS 1",
          appSub2: "Do 6. Aug 2026 · Restaurant 1",
          thShop: "Restaurant",
          countChanged: (n) => n + " von 64 Bestell- und Vorbereitungsmengen angepasst",
          lkIn: ["ABSATZ", "WARENKOSTEN"], lkOut: "BESTELLUNG & VORBEREITUNG",
          match: [["Hähnchenbrust", "fünf Menürezepturen zugeordnet", "zugeordnet", ""], ["Saisonales Dressing", "neu, noch ohne Historie; unverändert", "neu", "n"], ["Ehemalige Garnitur", "nicht mehr auf der Karte; ausgeschlossen", "ausgeschlossen", "c"]],
          snapTh: ["Datum", "Restaurant", "Komponente", "Vorbereitet", "Verbraucht", "Übrig"],
          eqSaved: "Verbesserung der Warenkosten (CHF)",
          eqLost: "zurückgewonnener Deckungsbeitrag aus Verfügbarkeit (CHF)",
          evTh: ["Datum", "Restaurant", "Komponente", "Bisher", "Neu", "Verbraucht", "Abfall ↓", "Verfügbarkeit ↑", "CHF"],
          evTot: "Restaurant gesamt",
          cProfit: "Mehrgewinn", cWaste: "Vermiedener Abfall", cUnits: "Portionen",
          cOfSales: "(<b>0,7&nbsp;%</b> des Umsatzes)", cRange: "(von <b>12&nbsp;%</b> auf <b>10&nbsp;%</b>)",
          cSub: "Illustratives Beispiel. Restaurant 1, 1. bis 5. August 2026.",
          cSubProj: "Auf den 31. Dezember hochgerechnet, basierend auf dem bisher gemessenen Effekt.",
          systemProduction: "Bestell- und Vorbereitungsplan", systemPos: "POS", systemErp: "Einkauf",
          allShops: "Restaurant 1", network: "Restaurant 1",
          sourcePos: "POS & Lieferplattformen", sourceProduction: "Rezepturen & Menü", sourceAccounting: "Buchhaltung",
          sourceFiles: "Einkauf & Rechnungen", sourceEmails: "E-Mails", sourcePhotos: "Fotos", sourceVoice: "Sprachnachrichten",
          sourceShelf: "Bestand & Vorbereitung", sourceMessages: "Betriebsnotizen",
          checkWaste: "Abfall und nicht verfügbare Artikel", checkHistory: "Tages- und Wochenmuster",
          checkWeather: "Wetter und lokale Veranstaltungen", checkNew: "Menüänderungen und neue Artikel",
          checkSupplier: "Lieferpreise und Rezeptkosten", checkFeedback: "Betriebsfeedback", checkStock: "Schlussbestand und Vorbereitungszählungen",
          p2Scope: "1.–5. AUGUST · RESTAURANT 1",
          p2Note: "Restaurant gesamt. Der Mehrgewinn kombiniert verbesserte Warenkosten mit zurückgewonnenem Deckungsbeitrag aus besserer Verfügbarkeit.",
          streamKeys: { receipt: "beleg", time: "zeit", location: "restaurant", item: "artikel", quantity: "menge", amount: "betrag" }
        }
      },
      engineData: {
        now: { p: 330, w: 29 },
        end: { p: 10000, w: 880 },
        financials: { saved: 255, lost: 75, gain: 330 },
        sampleFinancials: { saved: 51, lost: 15, gain: 66 },
        sampleUnits: { returnsAvoided: 16, salesRisk: 3 },
        primaryLocation: "Restaurant 1",
        items: [
          ["Chicken Caesar Salad", 1, "17.50"], ["Green Goddess Bowl", 1, "18.50"], ["Falafel Wrap", 2, "27.00"],
          ["Avocado Chicken Bowl", 1, "19.50"], ["Espresso", 2, "9.00"], ["Tomato Soup", 1, "10.50"],
          ["Miso Salmon Bowl", 1, "21.50"], ["Iced Tea", 2, "11.00"], ["Grilled Chicken Wrap", 1, "16.50"],
          ["Roasted Vegetable Bowl", 1, "17.50"], ["Protein Salad", 1, "19.00"], ["Mediterranean Bowl", 1, "18.50"],
          ["Hummus Side", 2, "9.80"], ["Fresh Juice", 2, "15.00"], ["Caprese Wrap", 1, "15.50"],
          ["Avocado Toast", 1, "14.50"], ["Seasonal Salad", 2, "31.00"], ["Sparkling Water", 2, "9.00"]
        ],
        production: [
          ["Grilled chicken portions", "Restaurant 1", 80, 70], ["Cooked grain portions", "Restaurant 1", 120, null],
          ["Avocado portions", "Restaurant 1", 36, 42], ["Roasted vegetables", "Restaurant 1", 54, null],
          ["Falafel mix portions", "Restaurant 1", 45, null], ["Herb dressing portions", "Restaurant 1", 72, null],
          ["Tomato soup portions", "Restaurant 1", 40, null], ["Salmon portions", "Restaurant 1", 28, null],
          ["Pickled cabbage portions", "Restaurant 1", 32, null], ["Hummus portions", "Restaurant 1", 48, null],
          ["Fresh herb portions", "Restaurant 1", 30, null], ["Bread portions", "Restaurant 1", 42, null],
          ["Juice prep portions", "Restaurant 1", 24, null], ["Cooked grain portions", "Restaurant 1", 104, null],
          ["Seasonal dressing portions", "Restaurant 1", 26, null]
        ],
        chf: { 0: 18, 2: 24 },
        snapshot: [
          ["02.08", "Restaurant 1", "Grilled chicken", 80, 66, 14, 0],
          ["03.08", "Restaurant 1", "Grilled chicken", 80, 71, 9, 0],
          ["04.08", "Restaurant 1", "Grilled chicken", 80, 58, 22, 0],
          ["05.08", "Restaurant 1", "Grilled chicken", 80, 62, 18, 1],
          ["05.08", "Restaurant 1", "Avocado portions", 36, 36, 0, 1]
        ],
        events: [
          ["05.08", "ALL", "Grilled chicken", 80, 70, 66, 4, 0, 21],
          ["05.08", "ALL", "Cooked grain", 120, 108, 105, 12, 0, 30],
          ["05.08", "ALL", "Avocado portions", 36, 42, 41, 0, 3, 27],
          ["05.08", "ALL", "Grilled chicken", 18, 16, 18, 0, -2, -12]
        ],
        detailRows: [
          ["01.–05.08", "ALL", "Grilled chicken portions", 400, 350, 330, 20, 0, 105],
          ["01.–05.08", "ALL", "Cooked grain portions", 600, 540, 500, 40, 0, 150],
          ["01.–05.08", "ALL", "Avocado portions", 300, 320, 318, 0, 8, 135],
          ["01.–05.08", "ALL", "Grilled chicken portions", 90, 80, 90, 0, -2, -60]
        ]
      }
    },
    generic: {
      id: "generic",
      route: "/fresh-food-demo",
      title: "Fresh-food Production Demo | Eclipsai",
      description: "See how Eclipsai turns fresh-food operating data into better production orders and measurable profit improvements.",
      ogTitle: "Fresh-food production demo | Eclipsai",
      ogDescription: "From sales, production, stock and costs to better production orders and measurable profit improvements.",
      features: {
        balanceAnimation: true
      },
      copy: {
        de: Object.assign({}, sharedCopy.de, { clientBrand: "FRISCHBETRIEB", fieldNote: "", fieldLate: "Verkauf", fieldEarly: "Produktion" }),
        en: Object.assign({}, sharedCopy.en, { clientBrand: "FRESH FOOD", fieldNote: "", fieldLate: "Sales", fieldEarly: "Production" })
      },
      assets: {
        fieldEvidence: [
          {
            src: "/fresh-food-demo/assets/source-photos/bakery-display-neutral.png",
            small: "/fresh-food-demo/assets/source-photos/bakery-display-neutral.png",
            time: "16:03",
            copyKey: "fieldLate"
          },
          {
            src: "/fresh-food-demo/assets/source-photos/baker-production.jpg",
            time: "6:28",
            copyKey: "fieldEarly"
          }
        ],
        sources: [
          "/fresh-food-demo/assets/source-photos/pos.jpg", "/fresh-food-demo/assets/source-photos/baker-production.jpg",
          "/fresh-food-demo/assets/source-photos/computer.jpg", "/fresh-food-demo/assets/source-photos/bakery-display-neutral.png",
          "/fresh-food-demo/assets/source-photos/phone-message.jpg"
        ]
      },
      systemVendors: {
        de: ["Produktionssysteme", "POS", "ERP"],
        en: ["Production systems", "POS", "ERP"]
      },
      systemSources: defaultSystemSources,
      mobileSourceKeys: defaultMobileSourceKeys,
      mobileOrders: [["Berliner", 80, 69], ["Apfeltasche", 120, 104], ["Sauerteigbrot", 60, 54]],
      engineCopy: {
        en: { demoBrand: "Fresh-food business", appSub1: "Fri 5 Aug 2026 · Zürich 1, till 1", appSub2: "Thu 6 Aug 2026 · all shops", cSub: "Illustrative. 1 to 5 August 2026.", cSubProj: "Projected to 31 December, at the rate measured so far.", evTot: "4 product-days", match: [["Gipfeli Butter", "renamed, matched back to its own history", "matched", ""], ["Sandwich Schinken", "new, no history yet, left alone", "new", "n"], ["Tirggel", "not sold for 4 weeks, closed", "closed", "c"]] },
        de: { demoBrand: "Frischbetrieb", appSub1: "Fr 5. Aug 2026 · Zürich 1, Kasse 1", appSub2: "Do 6. Aug 2026 · alle Filialen", cSub: "Beispielrechnung. 1. bis 5. August 2026.", cSubProj: "Bis zum 31. Dezember hochgerechnet, basierend auf dem bisher gemessenen Effekt.", evTot: "4 Artikeltage", match: [["Gipfeli Butter", "umbenannt und wieder der bisherigen Artikelhistorie zugeordnet", "zugeordnet", ""], ["Sandwich Schinken", "neu, noch ohne Historie; unverändert übernommen", "neu", "n"], ["Tirggel", "seit vier Wochen ohne Absatz; ausgelistet", "ausgelistet", "c"]] }
      },
      engineData: bakeryData("Zürich 1", "Zürich 2")
    }
  };

  function inferDemoId() {
    const requested = new URLSearchParams(location.search).get("demo");
    if (requested && configs[requested]) return requested;
    const path = location.pathname.toLowerCase();
    if (path.includes("bakerybakery")) return "bakerybakery";
    if (path.includes("steiner-flughafebeck")) return "steiner";
    if (path.includes("hausammann")) return "hausammann";
    if (path.includes("restaurant-demo") || path.includes("restaurant-profit-brain")) return "restaurant";
    if (path.includes("fresh-food")) return "generic";
    return "spruengli";
  }

  window.ECLIPSAI_DEMOS = configs;
  window.ECLIPSAI_DEMO_ID = inferDemoId();
  window.ECLIPSAI_DEMO = configs[window.ECLIPSAI_DEMO_ID];
})();
