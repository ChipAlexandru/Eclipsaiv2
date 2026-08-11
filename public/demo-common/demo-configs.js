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
      decisionTitle: "Bei der Produktions\u00admenge gilt es, Absatz und Retouren auszubalancieren.",
      decisionBody: "Die optimale Menge unterscheidet sich je Artikel, Filiale und Tag.",
      missedSales: "Entgangene Verkäufe",
      bestQuantity: "Optimale Produktionsmenge",
      unsoldProduct: "Unverkaufte Ware",
      systemsKicker: "Warum diese Entscheidung schwierig bleibt",
      systemsTitle: "Die nötigen Daten liegen in verschiedenen Systemen.",
      posDesc: "Was wann und wo verkauft wurde",
      erpDesc: "Artikelstammdaten, Kosten und Margen",
      planningLabel: "Produktionsplanung",
      planningDesc: "Produktions- und Liefermengen je Filiale",
      excelLabel: "Excel & Rezepturen",
      excelDesc: "Planungsregeln, Rezepturen und lokale Anpassungen",
      ordersLabel: "Bestellungen & Filialmeldungen",
      ordersDesc: "Sonderbestellungen und Wissen aus den Filialen",
      wasteLabel: "Retouren & Tagesabschluss",
      wasteDesc: "Was am Tagesende retourniert oder abgeschrieben wurde",
      systemsStatement: "Eclipsai baut operative Intelligenz für Frischbetriebe.",
      automationTitle: "Produktionsaufträge automatisieren",
      measurementTitle: "Ergebnisse über alle Filialen auswerten",
      desktopFullCue: "Interaktive Vollversion auf Desktop",
      mobileSourceTitle: "Alle relevanten Daten systemübergreifend zusammenführen.",
      sourceProduction: "Produktionsdaten",
      sourcePlanning: "Planungsdateien & Rezepturen",
      sourceStores: "Filialfotos & Filialmeldungen",
      dailyPictureBody: "Absatz. Produktion. Retouren. Kosten. Lokale Informationen.",
      mobileOrderTitle: "Die Anpassungen mit dem grössten Gewinnpotenzial umsetzen.",
      mobileOrderHead: "Vorschlag für morgen",
      item: "Artikel",
      current: "Bisher",
      recommended: "Neu",
      orderImplemented: "3 bestätigte Mengenänderungen an das Produktionssystem übergeben",
      mobileProfitTitle: "Den Gewinn messen und ausweisen.",
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
      decisionTitle: "Production quantities must balance sales with waste.",
      decisionBody: "The right quantity changes by product, location and day.",
      missedSales: "Missed sales",
      bestQuantity: "Best production quantity",
      unsoldProduct: "Unsold product",
      systemsKicker: "Why this remains difficult",
      systemsTitle: "The required data is spread across systems.",
      posDesc: "What sold, where and when",
      erpDesc: "Products, costs and commercial structure",
      planningLabel: "Production planning",
      planningDesc: "What was made and sent to each location",
      excelLabel: "Excel & recipes",
      excelDesc: "Standing rules, yields and local adjustments",
      ordersLabel: "Orders & store messages",
      ordersDesc: "Special demand and local knowledge",
      wasteLabel: "Waste & closing",
      wasteDesc: "What remained at the end of the day",
      systemsStatement: "Eclipsai builds the Profit Brain for fresh-food businesses.",
      automationTitle: "Automate production orders",
      measurementTitle: "Measure results across all locations",
      desktopFullCue: "Full interactive version on desktop",
      mobileSourceTitle: "Bring together all relevant data across systems.",
      sourceProduction: "Production data",
      sourcePlanning: "Planning files & recipes",
      sourceStores: "Store photos & messages",
      dailyPictureBody: "Sales. Production. Returns. Costs. Local information.",
      mobileOrderTitle: "Make the changes with the greatest expected profit.",
      mobileOrderHead: "Recommendation for tomorrow",
      item: "Product",
      current: "Current",
      recommended: "New",
      orderImplemented: "3 confirmed changes sent to the production system",
      mobileProfitTitle: "Measure and report the profit.",
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

  function bakeryData(primary, secondary, namedLocations) {
    const locations = Object.assign({
      guggach: primary,
      uster: secondary,
      embrach: primary,
      uni88: secondary
    }, namedLocations || {});
    return {
      now: { p: 330, w: 250 },
      end: { p: 10000, w: 7500 },
      financials: { saved: 345, lost: 15, gain: 330 },
      sampleFinancials: { saved: 78, lost: 12, gain: 66 },
      sampleUnits: { returnsAvoided: 29, salesRisk: 2 },
      primaryLocation: primary,
      items: bakeryItems,
      production: [
        ["Zopf 500g", primary, 30, null], ["Ruchbrot 1kg", primary, 36, null],
        ["Sauerteigbrot", primary, 24, null], ["Berliner", primary, 80, 69], ["Gipfeli", primary, 45, null],
        ["Butterbrezel", primary, 80, 69], ["Nussgipfel", primary, 40, null], ["Zopf 500g", secondary, 24, 21],
        ["Butterbrezel", secondary, 24, null], ["Sauerteigbrot", secondary, 60, 54],
        ["Ruchbrot 1kg", locations.guggach, 30, 27], ["Gipfeli", locations.uster, 24, 21], ["Vollkornbrot", locations.uster, 18, null],
        ["Apfeltasche", locations.embrach, 120, 104], ["Zopf 500g", locations.embrach, 45, 41]
      ],
      chf: { 3: 13, 5: 10, 7: 3, 9: 9, 10: 4, 11: 3, 13: 21, 14: 6 },
      snapshot: [
        ["02.08", primary, "Berliner", 80, 66, 14, 0], ["03.08", primary, "Berliner", 80, 71, 9, 0],
        ["04.08", primary, "Berliner", 80, 58, 22, 0], ["05.08", primary, "Berliner", 80, 62, 18, 1],
        ["05.08", secondary, "Sauerteigbrot", 60, 40, 20, 1]
      ],
      events: [
        ["05.08", primary, "Berliner", 80, 69, 62, 7, 0, 21],
        ["05.08", primary, "Apfeltasche", 120, 104, 73, 16, 0, 30],
        ["05.08", secondary, "Sauerteigbrot", 60, 54, 40, 6, 0, 27],
        ["05.08", locations.uni88, "Apfeltasche", 18, 16, 18, 0, 2, -12]
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
            time: "10:28",
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
        de: Object.assign({}, sharedCopy.de, { clientBrand: "FRISCHBETRIEB", fieldNote: "Beispiel aus einem Frischbetrieb", fieldLate: "Verkauf", fieldEarly: "Produktion" }),
        en: Object.assign({}, sharedCopy.en, { clientBrand: "FRESH FOOD", fieldNote: "Example from a fresh-food business", fieldLate: "Sales", fieldEarly: "Production" })
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
            time: "10:28",
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
    if (path.includes("hausammann")) return "hausammann";
    if (path.includes("fresh-food")) return "generic";
    return "spruengli";
  }

  window.ECLIPSAI_DEMOS = configs;
  window.ECLIPSAI_DEMO_ID = inferDemoId();
  window.ECLIPSAI_DEMO = configs[window.ECLIPSAI_DEMO_ID];
})();
