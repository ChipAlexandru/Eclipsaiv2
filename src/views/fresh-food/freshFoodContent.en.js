// Fresh-food homepage content — English (canonical locale).
//
// This dictionary is the content contract: every locale file must expose the
// exact same key structure (validated in locales.js — a missing key fails the
// build rather than silently falling back to English).
//
// Evidence values (860,000 · 92% · 1 in 4 · €40–60K · €190K · 86% ·
// 2024 to 2025) are fixed data; only the surrounding language and ordinary
// number formatting localize.

export const en = {
  locale: "en",
  languageName: "English",

  nav: {
    ariaLabel: "Main navigation",
    homeAriaLabel: "Eclipsai home",
    product: "How it works",
    proof: "Evidence",
    vision: "Beyond production",
    cta: "Book a call",
    chooseLanguage: "Choose language",
    availableLanguages: "Available languages",
  },

  hero: {
    eyebrow: "The profit brain for fresh food.",
    h1: "Know what to make tomorrow. Waste less. Sell more.",
    copy: "Eclipsai connects sales, production, and financial systems. It makes production decisions for every shop, product, and weekday, writes approved changes into the production system, and measures their daily effect on profit, waste, and early sellouts.",
    examples: [
      "Adjusts tomorrow's production orders.",
      "Monitors special orders through delivery and invoicing.",
      "Flags supplier price rises and prices that no longer cover costs.",
    ],
    cta: "Book a 20-minute call",
    audience: "For growing fresh-food operators with 2 to 20 locations.",
  },

  live: {
    ariaLabel: "Results for the last seven completed days",
    period: "Last seven completed days",
    live: "LIVE",
    snapshot: "LATEST VERIFIED",
    linesChanged: "production order lines changed",
    profitImpact: "profit impact as share of sales",
    wasteReduction: "estimated waste reduction as a percentage of initial waste",
    updated: "Updated",
  },

  problem: {
    eyebrow: "What owners know and systems miss",
    h2: "Tomorrow's production plan is set before today's sales and shop feedback can inform it.",
    steps: [
      { time: "18:45", state: "time-1845", h3: "Count what is left", p: "What cannot stay on the shelf goes into surprise bags or the bin. The count is rarely recorded." },
      { time: "19:00", state: "time-1900", h3: "Set tomorrow's order", p: "Tomorrow's order is set from averages, templates, special orders, and experience while the shop still needs cleaning." },
      { time: "02:00", state: "time-0200", h3: "Production starts", p: "Yesterday's decision becomes today's perishable stock." },
      { time: "11:40", state: "time-1140", h3: "The tray goes empty", p: "A sell-out may mean the plan was right, or it may mean a missed sale. The till cannot tell which." },
    ],
    quote: "The till records what sold. It does not record what was left, what sold out, or what customers asked for after the shelf was empty. That is where profit is lost.",
  },

  product: {
    eyebrow: "The profit brain at work",
    h2: "Watches every shop, every day. Asks when the data is not enough.",
    lede: "Eclipsai connects sales, production, ordering, and invoicing systems with email, team chats, and relevant external data. When the data cannot explain what happened, it asks staff a targeted question. They can answer with text, photos, or voice notes.",
    mediaLabel: "Example of Eclipsai monitoring a production decision through a familiar team channel",
    whatChanges: "How Eclipsai works",
    items: [
      { strong: "Read and analyze data from all systems", text: "Each shop, product, and weekday has its own demand pattern. Eclipsai considers comparable trading days, sales timing, likely sellouts, estimated waste, product economics, and operating constraints." },
      { strong: "Identify the decisions that make economic sense", text: "For each production line, Eclipsai compares the current quantity with feasible alternatives. It weighs the cost of unsold product against the margin at risk when too little is made." },
      { strong: "Implement and follow through", text: "Approved decisions are written into the production software and confirmed. After each shop closes, Eclipsai measures the effect on sales, estimated waste, early sellouts, and cash. The result becomes evidence for the next decision." },
    ],
  },

  demo: {
    open: "View demo",
    close: "Close",
  },

  proof: {
    metadata: "Our impact",
    h2Before: "We found a ",
    h2Value: "CHF 40–60K",
    h2After: " annual profit opportunity with one operator.",
    lede: "We are now working with the operator to put these changes into daily production.",
    ledgerLabel: "Evidence ledger from one operator",
    rows: [
      { h3: "pieces analyzed", value: "860,000", copy: "Sixteen months of sales and production records. We matched 92% between the two." },
      { h3: "delivered pieces unsold", ratioLabel: "One in four delivered pieces went unsold", value: "1 in 4", copy: "The pattern concentrated in particular shops, products, and weekdays." },
      { h3: "annual opportunity", value: "€40–60K", copy: "Recurring production patterns no longer matched demand. The ingredient cost of all unsold pieces was €190K." },
      { h3: "suggested cuts with positive estimated net value", value: "86%", copy: "Ingredient savings exceeded the full margin of any sale the cut might have missed. The cuts were net positive in all nine months tested." },
    ],
    bridgeBefore: "Some waste protects sales. The ",
    bridgeValue: "€40–60K",
    bridgeAfter: " opportunity came from repeated overproduction after demand had changed.",
    note: "From one multi-site operator's records, 2024 to 2025. Specific to that business, not a promise.",
    lessonHeading: "What we learned",
    lessonParagraphs: [
      "In our historical replay, letting one forecast rule set every production order lost money. It cut waste, but small forecast misses became sell-outs whose lost margin outweighed the ingredients saved.",
      "Low-volume demand is noisy. The record does not contain every local event, or tell you what a sell-out meant.",
      "Eclipsai adds the missing information, makes only the few changes the evidence supports, and measures the impact in cash.",
    ],
  },

  vision: {
    eyebrow: "Beyond production",
    h2: "The next decisions.",
    intro: "Once connected to the company's systems and communication channels, Eclipsai can add the information needed for each new decision, implement the change, and measure the result.",
    pathLabel: "Eclipsai expansion path",
    steps: [
      { index: "Start", h3: "Production and waste", p: "Protect sales while cutting repeated, avoidable waste. Update production plans that no longer match demand." },
      { index: "Next", h3: "Buying and pricing", p: "Flag supplier price rises and prices that no longer cover costs." },
      { index: "Then", h3: "Labor and operations", p: "See when smaller batches save waste but add work, or when understaffing costs sales." },
      { index: "As you grow", h3: "The next location", p: "Use what works in your current shops to start the next one." },
    ],
  },

  offer: {
    h2: "Eclipsai makes the daily decisions that run a food business.",
    copy: "It connects sales, production, and what your team sees to find the few decisions worth acting on and prove the result in cash.",
    cardH3: "Start free",
    items: [
      "Where you lose profit, shop by shop, over time",
      "Better production plans tested against past data",
      "Recommendations for next week's orders",
      "Live measurement against the plan you use today",
    ],
    audience: "For growing fresh-food operators with 2 to 20 locations.",
    cta: "Book a 20-minute call",
  },

  faq: {
    eyebrow: "Common questions",
    h2: "What to know before starting.",
    items: [
      {
        q: "Will making less put sales at risk?",
        a: "Eclipsai weighs both risks. A missed sale can cost more than the ingredients saved. It only suggests making less when the evidence supports it, then measures the result against the plan it replaced.",
      },
      {
        q: "How is Eclipsai different from the quantities our system already recommends?",
        a: "Eclipsai tests the current quantity against feasible alternatives using sales timing, likely sellouts, waste, product economics, and operating constraints. Approved changes are written back into the production system and measured in cash.",
      },
      {
        q: "Do we need to replace our existing systems?",
        a: "No. Eclipsai works with the systems already in use. It reads from and writes back through APIs or computer use for older systems.",
      },
      {
        q: "How much work does the team have to do?",
        a: "Eclipsai works from sales and production records. It asks the team a short question only when the records cannot explain what happened, such as a sell-out, unusual leftovers, or a local event.",
      },
      {
        q: "How do we start?",
        a: "We begin with the records that can be trusted and the shop-product combinations where the evidence is strongest. When the data is not sufficient, Eclipsai asks for context or leaves the quantity unchanged. You do not need to change every shop at once.",
      },
    ],
  },

  footer: {
    tagline: "The profit brain for fresh food.",
    location: "Zürich, Switzerland",
  },

  meta: {
    title: "Eclipsai | The profit brain for fresh food",
    description: "Eclipsai makes and implements daily production decisions for fresh-food operators, then measures their effect on profit, waste, and sales.",
    ogDescription: "Know what to make tomorrow. Waste less. Sell more.",
  },
};
