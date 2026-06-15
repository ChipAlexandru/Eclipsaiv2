// Single source of truth for the About copy. Used by the shared AboutPopup
// (opened from the SiteHeader on every surface) AND by the /about page +
// Person/Org schema (via shelf.about). Keeping it here means the popup and the
// page can never drift, and the product-home bundle can import the copy without
// pulling in the deck data that lives in decks/index.js.
export const ABOUT = {
  name: "Chip Alexandru",
  blurb: "Strategy consultant with 20+ years at BCG, PwC, and Accenture.",
  linkedinUrl: "https://www.linkedin.com/in/chip-alexandru/",
  paras: [
    "Eclipsai comes from hands-on work building and testing AI workflows, on top of two decades redesigning how global organizations work.",
    "The method came from testing, not theory: take a finished deliverable as the standard, rebuild it with AI agents, and close the gap with rules, examples, and checks until it clears the bar. Then it becomes a repeatable, reusable product.",
  ],
};
