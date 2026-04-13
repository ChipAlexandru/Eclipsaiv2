// AI Transformation deck — extracted from definitive.jsx CHAPTERS.
// Four chapters. Chapter 5 ("About Eclipsai") was dropped in milestone 3 and
// promoted to the shelf-level /about page — see shelf.aboutPage in decks/index.js.
// Lucide icons are attached by the pages that render the cover, not baked in here,
// so this module stays plain data (no React dependency).

export const aiTransformationDeck = {
  id: "the-playbook",
  title: "The Playbook",
  tags: [],
  chapters: [
    {
      id: "case",
      num: "01",
      title: "Case for change",
      iconName: "Zap",
      subtitle: "AI impact is clear, just not evenly distributed",
      slides: [
        {
          id: "anthropic-story",
          dateAdded: "2026-04-10",
          type: "scroll",
          source: "Eclipsai analysis, Anthropic",
          title: "Anthropic: internal AI use drives productivity and growth",
          stats: [
            { label: "Productivity increase", value: 50, unit: "%", desc: "across all employees" },
            { label: "Power users (14%)", value: "2×", unit: "", desc: "productivity boost", isText: true },
            { label: "Product releases", value: "1+", unit: "/day", desc: "Anthropic, past quarter", isText: true },
          ],
          chart: {
            type: "line",
            title: "Anthropic — Revenue Run-Rate",
            unit: "USD, billions",
            yMax: 32,
            yTicks: [0, 10, 20, 30],
            yFormat: "${}B",
            xMin: 2023.3,
            xMax: 2026.5,
            xLabels: [
              { label: "2023", at: 2023.5 },
              { label: "Q1 '24", at: 2024.0 },
              { label: "Q3 '24", at: 2024.5 },
              { label: "Q1 '25", at: 2025.17 },
              { label: "End '25", at: 2025.92 },
              { label: "Apr '26", at: 2026.25 },
            ],
            series: [
              {
                label: "Reported",
                style: "solid",
                points: [
                  { xVal: 2023.5,  value: 0.2 },
                  { xVal: 2024.0,  value: 0.15 },
                  { xVal: 2024.25, value: 0.4 },
                  { xVal: 2024.58, value: 1.0,  showValue: true, label: "$1B" },
                  { xVal: 2024.92, value: 2.0,  showValue: true, label: "$2B" },
                  { xVal: 2025.17, value: 3.6,  showValue: true, label: "$3.6B" },
                  { xVal: 2025.92, value: 9.0,  showValue: true, label: "$9B" },
                ],
              },
              {
                label: "Estimated / projected",
                style: "dashed",
                points: [
                  { xVal: 2025.92, value: 9.0 },
                  { xVal: 2026.12, value: 14.0, showValue: true, label: "$14B" },
                  { xVal: 2026.17, value: 19.0, showValue: true, label: "$19B" },
                  { xVal: 2026.25, value: 30.0, showValue: true, label: "$30B" },
                ],
              },
            ],
          },
          isText: true,
        },
        {
          id: "anthropic-departments",
          dateAdded: "2026-04-10",
          type: "tufte",
          source: "Anthropic",
          title: "Anthropic: broad AI use in all functions",
          paragraphs: [
            "Internal study documented broad use of AI outside software development (Legal, Growth, Product Design, Data and Analytics, Security).",
            { text: "\u201CLegal is shipping software now.\u201D", italic: true },
            "Employee report better performance.",
            { text: "\u201CIt did a way better job than I ever would\u2019ve.\u201D", italic: true },
            "Most work with AI is iterative, not hands-off (only 0–20% fully delegated to AI).",
          ],
          notes: [
            { marker: "10–15 → 5 min", label: "Security review" },
            { marker: "1 week → 2 calls", label: "Product Design iteration" },
            { marker: "5–10 → 100", label: "Growth Marketing creative variations per batch" },
          ],
        },
        {
          id: "medvi-telehealth",
          dateAdded: "2026-04-10",
          type: "standard",
          title: "Hyper-growth: 1B+ AI telehealth platform with no staff.",
          source: "The New York Times",
          bodyLines: [
            "Medvi.org launched in September 2024 with $20,000 and zero employees.",
            "AI runs development, marketing, customer service.",
            "Achieved $401M in 2025 sales, 16.2% net margin.",
          ],
          callout: { value: "$0K → $1.8B", sub: "2024–26 Revenue growth (projected)" },
        },
        {
          id: "ai-results-rare",
          dateAdded: "2026-04-10",
          type: "tufte",
          title: "AI impact not everywhere: S&P 500 quantified benefits still rare",
          source: "Goldman Sachs",
          paragraphs: [
            "While 70% of S&P 500 management teams discussed AI on their quarterly calls, with 54% specifically framing the technology around productivity and efficiency…",
            "…only 10% of S&P 500 quantified AI's impact on specific use cases, and just 1% show impact on earnings.",
            "However, where companies do measure, the median gain on specific tasks is ~30%.",
          ],
          notes: [
            { marker: "70%", label: "Discuss AI on quarterly calls" },
            { marker: "54%", label: "Frame it around productivity" },
            { marker: "10%", label: "Quantify specific use cases" },
            { marker: "1%", label: "Quantify earnings impact" },
          ],
        },
      ],
    },
    {
      id: "approach",
      num: "02",
      title: "Approach",
      iconName: "Target",
      subtitle: "From pockets of AI to enterprise intelligence",
      slides: [
        {
          id: "c2s1",
          dateAdded: "2026-04-08",
          type: "standard",
          title: "From Pockets of AI to Enterprise Intelligence",
          body: "The vision moves beyond isolated use cases toward a fundamentally redesigned operating model. AI becomes the connective tissue between decision-making, customer engagement, operations, and knowledge — not a feature added to existing workflows but the foundation they run on.",
          callout: { value: "AI-Native", label: "Target state", sub: "Operating model within 24 months" },
        },
        {
          id: "c2s2",
          dateAdded: "2026-04-08",
          type: "standard",
          title: "Four Transformation Pillars",
          body: "Each pillar addresses a distinct capability gap with its own success metrics, ownership, and timeline.",
          pillars: [
            { title: "Decision Intelligence", desc: "AI-augmented strategy, pricing, forecasting, and resource allocation across business units" },
            { title: "Customer Experience", desc: "Personalization at scale, predictive service, and autonomous issue resolution" },
            { title: "Operational Automation", desc: "End-to-end process automation with human-in-the-loop governance for exceptions" },
            { title: "Knowledge & Collaboration", desc: "Institutional knowledge captured, indexed, and surfaced at the point of need" },
          ],
        },
        {
          id: "c2s3",
          dateAdded: "2026-04-08",
          type: "tufte",
          title: "What This IS and What It Is NOT",
          paragraphs: [
            "Clarity on scope prevents drift. This transformation is not a technology procurement exercise — it's a business capability build. The distinction matters: pilots generate learning, capability builds generate value.",
            "This is an operating model redesign, a capability build at scale, a program with measurable business outcomes, and an executive-sponsored transformation. It is not a vendor selection exercise, an IT-only initiative, proof-of-concept theater, or a cost-cutting program disguised as innovation.",
          ],
          notes: [
            { marker: "Scope", label: "Operating model, not procurement", detail: "The scope is structural: how decisions are made, how customers are served, how operations run, how knowledge flows. Technology selection is a consequence of this design, not its starting point." },
            { marker: "Risk", label: "Where AI programs die", detail: "Most AI initiatives die at Phase 3→4: first priorities succeed, client says 'thanks' and stops. The expansion business case must be built into the initial delivery." },
          ],
        },
      ],
    },
    {
      id: "impl",
      num: "03",
      title: "Implementation",
      iconName: "Settings",
      subtitle: "Architecture, talent, and governance for speed",
      slides: [
        {
          id: "c3s1",
          dateAdded: "2026-04-08",
          type: "standard",
          title: "A Three-Layer Architecture",
          body: "The technical approach separates concerns to allow independent evolution and prevent vendor lock-in at any tier.",
          pillars: [
            { title: "Infrastructure", desc: "Cloud-native data platform, model serving, security guardrails, and cost management" },
            { title: "Intelligence", desc: "Foundation models, fine-tuned domain models, RAG pipelines, and evaluation frameworks" },
            { title: "Interface", desc: "AI embedded in existing tools and workflows — no new standalone applications to learn" },
          ],
        },
        {
          id: "c3s2",
          dateAdded: "2026-04-08",
          type: "scroll",
          title: "Talent Strategy: Build, Buy, Borrow",
          stats: [
            { label: "Internal upskilling", value: 60, unit: "%", desc: "of capability need — proprietary models, governance" },
            { label: "Strategic hires", value: 25, unit: "%", desc: "ML engineering, prompt design, data architecture" },
            { label: "Partner augmentation", value: 15, unit: "%", desc: "surge capacity and niche expertise" },
          ],
          body: "No single talent strategy works at this scale. The 60/25/15 model builds deep internal capability while avoiding the bottleneck of trying to hire your way to readiness.",
        },
        {
          id: "c3s3",
          dateAdded: "2026-04-08",
          type: "standard",
          title: "Governance That Enables Speed",
          body: "Tiered review by risk level — not blanket bureaucracy. This removes friction from 80% of use cases while maintaining rigorous oversight where stakes are highest.",
          callout: { value: "Tiered Risk", label: "Governance model", sub: "Low-risk use cases deploy in days, not months" },
        },
        // m4: tested-skills showcase. Explainer (maturity + example) first,
        // then the interactive directory. Both render full-bleed in marketplace
        // palette via the custom component registry in SlidePage.
        {
          id: "c3s4",
          dateAdded: "2026-04-11",
          type: "custom",
          component: "MarketplaceExplainer",
          title: "Tested Skills — Maturity Framework",
          ogDescription: "How we rate Claude skills against real work — the three-level blind-test framework.",
        },
        {
          id: "c3s5",
          dateAdded: "2026-04-11",
          type: "custom",
          component: "MarketplaceDirectory",
          title: "Business Skills Directory",
          ogDescription: "14 skills across 11 functions — every role, dramatically more capable.",
        },
      ],
    },
  ],
};
