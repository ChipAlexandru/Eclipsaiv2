// Fresh-food homepage content — English (canonical locale).
//
// This dictionary is the content contract: every locale file must expose the
// exact same key structure (validated in locales.js — a missing key fails the
// build rather than silently falling back to English).
//
// Evidence values (860,000 · 92% · 1 in 4 · €40-60K · €190K · 86% ·
// 988/319/189/130 · 2024 to 2025) are fixed data; only the surrounding
// language and ordinary number formatting localize. The replay day labels are
// display labels — the sales/order data arrays live in FreshFoodHome.jsx and
// are shared by every locale.

export const en = {
  locale: "en",
  languageName: "English",

  nav: {
    ariaLabel: "Main navigation",
    homeAriaLabel: "Eclipsai home",
    product: "How it works",
    proof: "Evidence",
    vision: "Beyond production",
    cta: "Find the profit leak",
    chooseLanguage: "Choose language",
    availableLanguages: "Available languages",
  },

  hero: {
    eyebrow: "The profit brain for fresh food",
    h1: "Know what to make tomorrow. Waste less. Sell more.",
    copy: "Eclipsai finds the changes worth making from daily sales, production, deliveries and what your team sees. We measure each result in cash.",
    cta: "Find the profit leak",
    audience: "Built for growing fresh-food operators with 2 to 20 locations.",
  },

  problem: {
    eyebrow: "What owners know and systems miss",
    h2: "Tomorrow is decided before today is understood.",
    lede: "Tomorrow's orders combine what is left, special orders, past averages and experience. Across hundreds of store × product × weekday decisions, the profit call is made at closing.",
    steps: [
      { time: "18:45", state: "time-1845", h3: "Count what is left", p: "What cannot stay on the shelf goes into surprise bags or the bin, rarely recorded." },
      { time: "19:00", state: "time-1900", h3: "Set tomorrow's order", p: "Averages, templates and memory compete for attention while the shop still needs cleaning." },
      { time: "02:00", state: "time-0200", h3: "Production starts", p: "Yesterday's decision becomes today's perishable stock." },
      { time: "11:40", state: "time-1140", h3: "The tray goes empty", p: "It looks like success. Customers keep asking for it." },
    ],
    quote: "The till records what sold. Not the empty shelf, the leftovers or the question at the counter. That is where the profit leak hides.",
  },

  product: {
    eyebrow: "The always-on profit brain",
    h2: "It watches every shop, every day. It asks when it needs to.",
    lede: "Eclipsai connects daily sales, production, deliveries and what your team sees. When a change is being tested, it asks the right person what happened. It brings the decisions worth making into a weekly review and answers questions at any time.",
    mediaLabel: "Example of Eclipsai monitoring a production decision through a familiar team channel",
    whatChanges: "What changes",
    items: [
      { n: "01", strong: "Captures what is needed.", text: "Leftovers, sellouts and customer requests." },
      { n: "02", strong: "Monitors every shop, product and day.", text: "Finds opportunities in waste, costs and sales." },
      { n: "03", strong: "Proposes and responds.", text: "Surfaces the changes worth making next week and answers questions when you ask." },
      { n: "04", strong: "Reports the results.", text: "Shows store performance and scores every decision against the alternative, in cash." },
    ],
  },

  proof: {
    metadata: "Evidence from one operator · 16 months",
    h2Before: "We found a ",
    h2Value: "€40-60K",
    h2After: " annual profit opportunity at one operator.",
    lede: "A multi-site fresh-food operator opened its records. We connected the POS and production systems and followed every product across every shop and day.",
    ledgerLabel: "Evidence ledger from one operator",
    rows: [
      { index: "01", h3: "We followed every piece", value: "860,000", copy: "Sixteen months of sales and deliveries, matched between till and production. 92% of all pieces covered." },
      { index: "02", h3: "We found what never sold", ratioLabel: "One in four pieces never sold", value: "1 in 4", copy: "One in four delivered pieces never sold. Hard to see day to day, unmistakable across products, shops and weekdays." },
      { index: "03", h3: "We sized the opportunity", value: "€40-60K", copy: "The credible annual opportunity was concentrated in stale, repeated production patterns. The full unsold ingredient pool was €190K." },
      { index: "04", h3: "We tested the fixes", value: "86%", copy: "When the strongest rule recommended making less, the shelf still lasted the day 86 times in 100." },
    ],
    bridgeBefore: "Some waste protects sales. The ",
    bridgeValue: "€40-60K",
    bridgeAfter: " opportunity came from excessive waste locked into old, repeated production patterns.",
    note: "From one multi-site operator's records, 2024 to 2025. Specific to that business, not a promise.",
    lessonHeading: "What we learned",
    lessonBefore: "In our test, forecasting alone ",
    lessonStrong: "lost money",
    lessonAfter: ". Low-volume demand is noisy, important context sits outside the data, and a missed sale costs more than excess ingredients. Our approach adds the signals forecasts miss, changes only the few decisions worth changing, and measures each result. Every week, across every product and location.",
  },

  loop: {
    eyebrow: "What we do",
    h2: "How a profit leak gets fixed.",
    lede: "The loop that found the opportunity can run continuously across your shops.",
    listLabel: "Decision loop",
    steps: [
      { n: "01", b: "Connect.", p: "Sales and production records become one piece-level history." },
      { n: "02", b: "Find.", p: "Repeated patterns surface: the product wasted every Friday, the Saturday sellout and the standing order that has gone stale." },
      { n: "03", b: "Propose.", p: "Small, reversible changes arrive in the weekly note. Reasons attached." },
      { n: "04", b: "Measure.", p: "Every decision is checked against real sales and measured in cash." },
      { n: "05", b: "Fix the plan.", p: "Changes that prove out are kept. The rest are revised or retired." },
      { n: "06", b: "Keep watch.", p: "The counting never stops, so nothing quietly creeps back." },
    ],
  },

  replay: {
    title: "Proposed croissant orders for 7-13 July",
    changeStrong: "130 fewer",
    changeSpan: "waste units",
    dotKey: "1 dot = 5 units",
    ariaTitle: "Croissant production decision replay",
    ariaDesc: "Fourteen days of croissant sales shown in blue dots, waste under the current order shown in orange dots and a solid proposed order line. The proposal keeps 988 sales while reducing waste from 319 to 189 units.",
    days: ["M 23", "T 24", "W 25", "T 26", "F 27", "S 28", "S 29", "M 30", "T 1", "W 2", "T 3", "F 4", "S 5", "S 6"],
    legendSold: "Sold",
    legendWaste: "Waste under current",
    legendProposed: "Proposed order",
    tableLabel: "Decision replay results",
    thPlan: "Plan",
    thSales: "Sales",
    thWaste: "Waste",
    rowCurrent: "Current",
    rowProposed: "Proposed",
  },

  vision: {
    eyebrow: "Beyond production",
    h2: "Expand to every decision that drives profit.",
    intro: "Production comes first because the decision repeats every day and the result is visible quickly.",
    pathLabel: "Eclipsai expansion path",
    steps: [
      { index: "01 · Now", h3: "Production and waste", p: "Protect sales without repeating avoidable waste. Repair stale production plans and measure every change in cash." },
      { index: "02 · Next", h3: "Buying and pricing", p: "Catch supplier cost increases, weak margins and prices that no longer cover costs." },
      { index: "03 · Then", h3: "Labour and operations", p: "See when smaller batches save waste but add work, or when understaffing costs sales." },
      { index: "04 · As you grow", h3: "The next location", p: "Apply everything Eclipsai has learned from your shops to the next one." },
    ],
    closing: "One decision at a time, Eclipsai helps you keep more of what your business earns.",
  },

  offer: {
    eyebrow: "See it in your own shops",
    h2: "Find the profit leaks worth fixing first.",
    copy: "We start with the sales and production records you already have. We find repeated waste, missed sales and production plans that no longer fit, then show what each is worth in cash.",
    cardH3: "Your first review",
    items: [
      "The leaks worth fixing first",
      "The evidence behind each one",
      "The cash opportunity",
      "The first reversible changes to test",
    ],
    reassurance: "No new system for your team. Nothing changes until the evidence is clear.",
    audience: "For growing fresh-food operators with 2 to 20 locations.",
    cta: "Find the profit leak",
  },

  faq: {
    eyebrow: "Common questions",
    h2: "What owners want to know before starting.",
    items: [
      {
        q: "Will making less cause us to sell out?",
        a: "Eclipsai measures both risks. Waste costs ingredients, while a missed sale costs most of the selling price. We propose small changes and check what actually happened before changing the standing plan.",
      },
      {
        q: "Our system already recommends quantities. What is different?",
        a: "Most systems produce a forecast or suggested order. Eclipsai also captures what the team sees, proposes the decisions worth changing and measures whether each change made or lost money.",
      },
      {
        q: "How much work does the team have to do?",
        a: "Very little. Eclipsai uses the records you already have and asks short, targeted questions only when an important signal is missing, such as a sellout, unusual leftovers or a local event.",
      },
      {
        q: "What if our data is messy?",
        a: "That is normal. We match what is reliable, identify the gaps and show what the evidence can support before recommending a change.",
      },
      {
        q: "Do we have to change every shop at once?",
        a: "No. We start with small, reversible changes for specific products and locations. A change expands only after the result supports it.",
      },
      {
        q: "How do you charge?",
        a: "A monthly fee per location. The scope depends on the number of shops, systems and decisions being monitored.",
      },
    ],
  },

  footer: {
    tagline: "The profit brain for fresh food.",
    location: "Zürich, Switzerland",
  },

  meta: {
    title: "Eclipsai | The profit brain for fresh food",
    description: "Eclipsai helps growing fresh-food operators decide what to make tomorrow, reduce waste and measure each change in cash.",
    ogDescription: "Know what to make tomorrow. Waste less. Sell more.",
  },
};
