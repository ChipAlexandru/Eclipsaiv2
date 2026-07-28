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
    copy: "Eclipsai finds where fresh-food operations lose profit, makes the change, and proves the impact in cash. It starts with production, then extends to orders, pricing, buying, and labour.",
    examples: [
      "Adjusts tomorrow's production orders.",
      "Monitors special orders through delivery and invoicing.",
      "Flags supplier price rises and prices that no longer cover costs.",
    ],
    cta: "Book a 20-minute call",
    audience: "For growing fresh-food operators with 2 to 20 locations.",
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
    h2: "It watches every shop, every day. It asks when the data is not enough.",
    lede: "Eclipsai connects sales, production, ordering, and invoicing systems with email, team chats, and relevant external data. When the data cannot explain what happened, it asks staff a targeted question. They can answer with text, photos, or voice notes.",
    mediaLabel: "Example of Eclipsai monitoring a production decision through a familiar team channel",
    whatChanges: "How Eclipsai works",
    items: [
      { strong: "Finds the few changes worth making", text: "Across shops, products, and days, it weighs waste against missed sales." },
      { strong: "Makes daily recommendations", text: "The owner sees the recommended quantity, reason, and expected profit impact." },
      { strong: "Reviews the results each week", text: "The weekly review shows which changes improved profit and which should become the standing plan." },
      { strong: "Implements proven decisions", text: "The owner approves each change initially. Once a decision type proves reliable, the product updates the production plan within owner-set limits and measures the profit improvement over the old plan." },
    ],
  },

  proof: {
    metadata: "Evidence from one operator · 16 months",
    h2Before: "We found a ",
    h2Value: "€40–60K",
    h2After: " annual profit opportunity at one operator.",
    lede: "A multi-site fresh-food operator gave us sixteen months of records. We connected its POS and production data and matched what was delivered with what sold across shops, products, and days.",
    ledgerLabel: "Evidence ledger from one operator",
    rows: [
      { h3: "pieces analysed", value: "860,000", copy: "Sixteen months of sales and production records. We matched 92% between the two." },
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
    h2: "The next decisions to improve.",
    intro: "Once connected to the company's systems and communication channels, Eclipsai can add the information needed for each new decision, implement the change, and measure the result.",
    pathLabel: "Eclipsai expansion path",
    steps: [
      { index: "Start", h3: "Production and waste", p: "Protect sales while cutting repeated, avoidable waste. Update production plans that no longer match demand." },
      { index: "Next", h3: "Buying and pricing", p: "Flag supplier price rises and prices that no longer cover costs." },
      { index: "Then", h3: "Labour and operations", p: "See when smaller batches save waste but add work, or when understaffing costs sales." },
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
    h2: "What owners want to know before starting.",
    items: [
      {
        q: "Will making less cause us to sell out?",
        a: "Eclipsai weighs both risks. A missed sale can cost more than the ingredients saved. It only suggests making less when the evidence supports it, then measures the result against the plan it replaced.",
      },
      {
        q: "Our system already recommends quantities. What is different?",
        a: "Eclipsai keeps the current plan as the baseline, adds what the records miss, and shows only where the evidence supports a different order. Once approved, it can implement the change in the production system and measure the result in cash.",
      },
      {
        q: "How much work does the team have to do?",
        a: "Eclipsai works from sales and production records. It asks the team a short question only when the records cannot explain what happened, such as a sell-out, unusual leftovers, or a local event.",
      },
      {
        q: "What if our data is messy?",
        a: "We match the records that can be trusted and make the gaps visible. If the data cannot support a recommendation, Eclipsai asks for context or leaves the plan alone.",
      },
      {
        q: "Do we have to change every shop at once?",
        a: "No. We begin with the shop-product combinations where the evidence is strongest. We use the result there before applying the same rule elsewhere.",
      },
      {
        q: "How do you charge?",
        a: "Starting is free. If you continue, we charge a monthly subscription based on the number of locations and decision areas monitored.",
      },
    ],
  },

  footer: {
    tagline: "The profit brain for fresh food.",
    location: "Zürich, Switzerland",
  },

  meta: {
    title: "Eclipsai | The profit brain for fresh food",
    description: "Eclipsai makes the daily decisions that run a fresh-food business, starting with what to make tomorrow.",
    ogDescription: "Know what to make tomorrow. Waste less. Sell more.",
  },
};
