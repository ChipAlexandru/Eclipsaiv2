// Marketplace taxonomy + rating + badge tokens.
// Migrated from the original skills-marketplace repo (lib/constants.js) in m4.
// v2 is now the canonical source — the old repo is being deprecated.

export const INDUSTRIES = [
  { id: "cpg",           label: "Consumer Goods",               color: "#b45309" },
  { id: "retail",        label: "Retail",                       color: "#1d4ed8" },
  { id: "travel",        label: "Travel & Hospitality",         color: "#0f766e" },
  { id: "financial",     label: "Financial Services",           color: "#1e3a5f" },
  { id: "healthcare",    label: "Healthcare & Life Sciences",   color: "#9f1239" },
  { id: "tmt",           label: "Technology, Media & Telecom",  color: "#6d28d9" },
  { id: "industrials",   label: "Industrials & Manufacturing",  color: "#57534e" },
  { id: "energy",        label: "Energy & Materials",           color: "#a16207" },
  { id: "logistics",     label: "Logistics & Supply Chain",     color: "#155e75" },
  { id: "public",        label: "Public Sector",                color: "#166534" },
  { id: "realestate",    label: "Real Estate",                  color: "#92400e", extra: true },
  { id: "education",     label: "Education",                    color: "#115e59", extra: true },
  { id: "aerospace",     label: "Aerospace & Defense",          color: "#1e293b", extra: true },
  { id: "chemicals",     label: "Chemicals",                    color: "#881337", extra: true },
  { id: "agriculture",   label: "Agriculture & Food",           color: "#3f6212", extra: true },
  { id: "privatecapital",label: "Private Capital",              color: "#312e81", extra: true },
];

export const FUNCTIONS = [
  { id: "strategy",         label: "Strategy",             color: "#4f46e5" },
  { id: "finance",          label: "Finance",              color: "#0f766e" },
  { id: "marketing",        label: "Marketing",            color: "#be185d" },
  { id: "sales",            label: "Sales",                color: "#9f1239" },
  { id: "data",             label: "Data & Analytics",     color: "#1d4ed8" },
  { id: "operations",       label: "Operations",           color: "#b45309" },
  { id: "procurement",      label: "Procurement",          color: "#0e7490" },
  { id: "ma",               label: "M&A",                  color: "#115e59" },
  { id: "risk",             label: "Risk & Compliance",    color: "#9f1239" },
  { id: "technology",       label: "Technology & Digital", color: "#6d28d9" },
  { id: "people",           label: "People & Organization",color: "#a21caf" },
  { id: "legal",            label: "Legal",                color: "#92400e" },
  { id: "customer-service", label: "Customer Service",     color: "#065f46" },
];

export const BADGE_COLORS = {
  "Editor's Pick": "#4f46e5",
  "Popular":       "#0f766e",
  "Trending":      "#be185d",
  "New":           "#166534",
};

// ─── RATING TAXONOMY ─────────────────────────────────────────────────
// Three-level maturity framework applied by blind-test methodology.
// Each plugin gets a rating only after being evaluated against real work.

export const RATING_LABELS = {
  1: "Starting point",
  2: "Professional draft",
  3: "Production-ready",
};

export const RATING_SUBLABEL = {
  1: "needs customization",
  2: "professional draft",
  3: "stakeholder-ready",
};

export const RATING_COLOR = {
  1: "#d97706", // amber
  2: "#2563eb", // blue
  3: "#16a34a", // green
};

export const RATING_DESCRIPTIONS = {
  1: "The plugin produces substantive output. However, the tasks are relatively simple, or work is a midpoint rather than a near-final draft. The level of specificity and expert-level input is lacking. The plugin needs customization and iteration before it is consistently useful.",
  2: "Produces well-structured output that is approximately 90% complete. A user with deep domain expertise would assess this as solid work, still needing refinement. The remaining gaps require expert-level input and judgment.",
  3: "The plugin delivers finished work product on complex tasks and handles edge cases. A user with deep domain expertise would assess this output as expert-level. This is the standard where you'd be comfortable putting the output in front of a stakeholder with only light review.",
};
