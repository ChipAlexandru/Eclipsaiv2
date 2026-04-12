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
      title: "Case for action",
      iconName: "Zap",
      subtitle: "AI impact is clear, just not evenly distributed",
      slides: [
        {
          id: "anthropic-story",
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
      id: "what",
      num: "02",
      title: "What",
      iconName: "Target",
      subtitle: "From pockets of AI to enterprise intelligence",
      slides: [
        {
          id: "c2s1",
          type: "standard",
          title: "From Pockets of AI to Enterprise Intelligence",
          body: "The vision moves beyond isolated use cases toward a fundamentally redesigned operating model. AI becomes the connective tissue between decision-making, customer engagement, operations, and knowledge — not a feature added to existing workflows but the foundation they run on.",
          callout: { value: "AI-Native", label: "Target state", sub: "Operating model within 24 months" },
        },
        {
          id: "c2s2",
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
      id: "how",
      num: "03",
      title: "How",
      iconName: "Settings",
      subtitle: "Architecture, talent, and governance for speed",
      slides: [
        {
          id: "c3s1",
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
          type: "custom",
          component: "MarketplaceExplainer",
          title: "Tested Skills — Maturity Framework",
          ogDescription: "How we rate Claude skills against real work — the three-level blind-test framework.",
        },
        {
          id: "c3s5",
          type: "custom",
          component: "MarketplaceDirectory",
          title: "Business Skills Directory",
          ogDescription: "14 skills across 11 functions — every role, dramatically more capable.",
        },
      ],
    },
    {
      id: "impl",
      num: "04",
      title: "Implementation",
      iconName: "Rocket",
      subtitle: "Three horizons — quick wins to frontier capability",
      slides: [
        {
          id: "c4s1",
          type: "standard",
          title: "Three Horizons, One Program",
          body: "Each horizon funds and de-risks the next. Quick wins generate savings and credibility, core transformation delivers structural change, frontier initiatives create moats.",
          pillars: [
            { title: "H1: Quick Wins (0–6 mo)", desc: "Deploy 5 high-impact use cases, establish data foundation, stand up AI Center of Excellence" },
            { title: "H2: Core Transform (6–18 mo)", desc: "Redesign target processes end-to-end, scale proven patterns, build internal ML capability" },
            { title: "H3: Frontier (18–36 mo)", desc: "Autonomous operations in selected domains, AI-native products, ecosystem orchestration" },
          ],
        },
        {
          id: "c4s2",
          type: "scroll",
          title: "First 90 Days — Proof Points That Matter",
          stats: [
            { label: "Weeks 1–4", value: "Found", unit: "ation", desc: "Data access, team formation, governance charter" },
            { label: "Weeks 5–8", value: "First", unit: " Deploy", desc: "2 use cases live in production with metrics" },
            { label: "Weeks 9–12", value: "Scale", unit: " Signal", desc: "ROI validated, expansion roadmap approved" },
          ],
          body: "The first 90 days are engineered to produce visible, measurable wins that convert skeptics and secure sustained commitment.",
          isText: true,
        },
        {
          id: "c4s3",
          type: "standard",
          title: "Investment & Returns",
          body: "Total program investment is front-loaded in H1 to establish infrastructure and prove value. Payback begins mid-H2 as automation compounds.",
          callout: { value: "14 months", label: "Expected payback", sub: "with 3.2× ROI by end of Year 2" },
          article: {
            sections: [
              {
                subhead: "The revenue trajectory",
                body: "From ~$200M in 2023 revenue to $30B annualized run-rate in April 2026 — a 150× increase in under three years. Growth accelerated from $14B to $30B ARR in just eight weeks (Feb–Apr 2026), driven by enterprise adoption at scale: 1,000+ clients each spending $1M+/year.",
              },
              {
                body: "This trajectory is unprecedented in enterprise software. For context, Salesforce took 17 years to reach $30B in annual revenue. Anthropic reached the same run-rate in under three years.",
              },
              {
                type: "pullquote",
                text: "We're seeing a new category of company emerge — one where AI isn't a feature, it's the operating system.",
                source: "Anthropic internal report, 2026",
              },
              {
                subhead: "Productivity at every level",
                body: "Anthropic's internal study documented a 50% median productivity increase across all employees who use AI tools regularly. Among the top 14% of power users, productivity doubled — a 100%+ boost. These gains span engineering, legal, growth marketing, product design, and data analytics.",
              },
              {
                type: "callout",
                value: "150×",
                label: "revenue growth in 3 years",
              },
              {
                subhead: "What this means for enterprises",
                body: "The Anthropic case demonstrates that AI-native organizations don't just adopt AI as a tool — they restructure workflows around it. The result is compounding returns: higher individual productivity feeds faster product cycles, which drives revenue growth, which funds more AI investment.",
              },
            ],
            source: "Eclipsai analysis; Bloomberg; The Information; CNBC; Reuters",
          },
        },
      ],
    },
  ],
};
