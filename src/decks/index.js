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

  // Deep links into specific slides. Home page reads these and renders the three featured cards.
  // Cards navigate to {deckId, chapterId, slideId}. Slide is identified by its stable id
  // (not numeric index) so reordering chapter slides never breaks featured picks or shared
  // links. Third entry is the video card — no deckId.
  featured: [
    {
      kind: "slide",
      deckId: "the-playbook",
      chapterId: "case",
      slideId: "anthropic-story",
      title: "AI-native: what the first results look like",
      blurb: "Anthropic: 50% productivity boost, $30B revenue run-rate \u2014 what happens when AI is used across every function.",
    },
    {
      kind: "slide",
      deckId: "the-playbook",
      chapterId: "impl",
      slideId: "c4s2",
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
