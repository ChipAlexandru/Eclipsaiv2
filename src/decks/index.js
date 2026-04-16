// Shelf — flat list of decks per decision 3D. Tags are metadata only.
// Home (global) is not a deck; each deck has its own Cover per decision 1C.
// About lives at the shelf level (popup on Home + /about page promoted from old Chapter 5).

import { aiTransformationDeck } from "./ai-transformation.js";
import { assertShelfValid } from "../types.js";

export const shelf = {
  decks: [aiTransformationDeck],

  // About lives at the shelf level. The popup renders name+blurb+LinkedIn;
  // the /about page renders the full content (promoted from old Chapter 5 in m3).
  about: {
    name: "Chip Alexandru",
    blurb: "Strategy consultant with 20+ years at BCG, PwC, and Accenture.",
    linkedinUrl: "https://www.linkedin.com/in/chip-alexandru/",

    headline: "Tested methodology, real expertise",
    intro: "Management consultancy and transformation partner — not an AI product company. A consultant with deep, tested expertise in deploying AI inside organizations, operating as an embedded transformation lead. Claude is the current platform of focus; the methodology is platform-portable.",

    capabilities: [
      {
        title: "Skills Architecture",
        desc: "Custom skill development using blind-test methodology — build, test vs. real work, fix, retest. 15+ plugins evaluated.",
      },
      {
        title: "Knowledge Bases",
        desc: "Structured KBs that make AI organization-specific. Speed of creation from unstructured sources enables previously infeasible work.",
      },
      {
        title: "Methodology Hybrid",
        desc: "Traditional consulting discipline (stakeholder management, business case, change management) combined with rapid iteration.",
      },
    ],

    phases: [
      { num: "1", title: "Discovery",         desc: "Map workflows and pain points. Identify 'specialist bypass' opportunities. Build the quantified business case with go/no-go criteria." },
      { num: "2", title: "Foundation",        desc: "Claude Teams operational in days. Cross-functional 'ninja team' assembled. Initial knowledge bases and pre-tested skills installed." },
      { num: "3", title: "First Priorities",  desc: "Implement blind-test validated skills. Build observability alongside every deployment. Measure against business case. Build the expansion case." },
      { num: "4", title: "Scale & Deepen",    desc: "End-to-end automation. Data architecture. Expand to new functions. Transition to Enterprise. Address change management head-on." },
      { num: "5", title: "Transfer & Exit",   desc: "Train internal capability team. Document everything. Hand over the playbook. Optional ongoing advisory retainer." },
    ],

    credential: {
      value: "15+",
      label: "Plugins evaluated",
      sub: "Against a 3-level maturity framework with blind-test methodology",
    },
  },

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
