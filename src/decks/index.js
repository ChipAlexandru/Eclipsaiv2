// Shelf — flat list of decks per decision 3D. Tags are metadata only.
// Home (global) is not a deck; each deck has its own Cover per decision 1C.
// About lives at the shelf level (popup on Home + /about page promoted from old Chapter 5).

import { aiTransformationDeck } from "./ai-transformation.js";
import { ABOUT } from "../aboutContent.js";
import { assertShelfValid } from "../types.js";

export const shelf = {
  decks: [aiTransformationDeck],

  // About lives at the shelf level, single-sourced from aboutContent.js so the
  // shared header popup and the /about page (+ Person/Org schema via paras[0])
  // never drift. The popup reads name/blurb/linkedinUrl; the page reads paras.
  about: ABOUT,

  // Chapter cards — one per chapter. Home page renders these as the top row.
  // Each links to the first slide in its chapter.
  featured: [
    {
      kind: "chapter",
      deckId: "the-playbook",
      chapterId: "case",
      label: "Case for change",
      title: "Business impact",
      blurb: "Results from AI-natives, earnings data, and controlled studies. Continuously updated.",
    },
    {
      kind: "chapter",
      deckId: "the-playbook",
      chapterId: "approach",
      label: "Approach",
      title: "Compounding productivity",
      blurb: "Latest AI tools and self-improving workflows across functions.",
    },
    {
      kind: "chapter",
      deckId: "the-playbook",
      chapterId: "impl",
      label: "Implementation",
      title: "Making it happen",
      blurb: "Organizational and technical requirements to start, measure and scale.",
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

// Flat slide index for progress display: home = 0, then each slide in chapter
// order is 1, 2, 3, ... Returns { flatIdx, flatTotal }.
export function flatSlideIndex(deck, chapterIdx, slideIdx) {
  const totalContentSlides = deck.chapters.reduce((a, ch) => a + ch.slides.length, 0);
  const flatTotal = 1 + totalContentSlides;
  let flatIdx = 0;
  let counter = 1;
  for (let ci = 0; ci < deck.chapters.length; ci++) {
    for (let si = 0; si < deck.chapters[ci].slides.length; si++) {
      if (ci === chapterIdx && si === slideIdx) { flatIdx = counter; }
      counter++;
    }
  }
  return { flatIdx, flatTotal };
}

// Returns the most recently touched slide from each chapter of the default
// deck, in chapter order. The Home page renders these column-aligned under
// their parent chapter cards, so the "Latest" row visually maps one card per
// chapter column. Sort key is `dateUpdated || dateAdded` so authors can
// manually surface a slide whose content was rewritten without changing its
// original add date. Slides without either date sort last via a "1970-01-01"
// fallback. Chapters with zero slides are skipped.
export function getLatestSlides() {
  const results = [];
  for (const deck of shelf.decks) {
    for (const chapter of deck.chapters) {
      if (!chapter.slides?.length) continue;
      let best = null;
      for (const slide of chapter.slides) {
        const sortDate = slide.dateUpdated || slide.dateAdded || "1970-01-01";
        if (!best || sortDate.localeCompare(best.sortDate) > 0) {
          best = {
            deckId: deck.id,
            chapterId: chapter.id,
            slideId: slide.id,
            title: slide.title,
            dateAdded: slide.dateAdded || null,
            dateUpdated: slide.dateUpdated || null,
            sortDate,
          };
        }
      }
      if (best) results.push(best);
    }
  }
  return results;
}
