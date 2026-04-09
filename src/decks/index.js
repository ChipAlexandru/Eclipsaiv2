// Shelf — flat list of decks per decision 3D. Tags are metadata only.
// Home (global) is not a deck; each deck has its own Cover per decision 1C.
// About lives at the shelf level (popup on Home + /about page promoted from old Chapter 5).

import { aiTransformationDeck } from "./ai-transformation.js";
import { assertShelfValid } from "../types.js";

export const shelf = {
  decks: [aiTransformationDeck],

  about: {
    name: "Chip Alexandru",
    blurb: "Strategy consultant with 20+ years at BCG, PwC, and Accenture.",
    linkedinUrl: "https://www.linkedin.com/in/chip-alexandru/",
  },

  // Deep links into specific slides. Home page reads these and renders the three featured cards.
  // Cards navigate to {deckId, chapterId, slideIdx}. Third entry is the video card — deckId null.
  featured: [
    {
      kind: "slide",
      deckId: "ai-transformation",
      chapterId: "case",
      slideIdx: 2,
      title: "Why most AI programs stall",
      blurb: "Three converging forcing functions that make the pilot graveyard inevitable — and what breaks the pattern.",
    },
    {
      kind: "slide",
      deckId: "ai-transformation",
      chapterId: "impl",
      slideIdx: 1,
      title: "What a 90-day plan looks like",
      blurb: "The proof points that matter in the first quarter — and the investment envelope to get there.",
    },
    {
      kind: "video",
      title: "The pitch in 90 seconds",
    },
  ],
};

// Dev-time sanity check — catches typos in featured deep links, duplicate
// slide ids, missing titles, unknown slide types, etc. Throws on failure so
// bad data shows up loud during development.
if (typeof process === "undefined" || process.env?.NODE_ENV !== "production") {
  assertShelfValid(shelf);
}

export function getDeck(deckId) {
  return shelf.decks.find((d) => d.id === deckId);
}
