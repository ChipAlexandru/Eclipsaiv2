// AI Transformation deck — extracted from definitive.jsx CHAPTERS.
// Four chapters. Chapter 5 ("About Eclipsai") was dropped in milestone 3 and
// promoted to the shelf-level /about page — see shelf.aboutPage in decks/index.js.
// Lucide icons are attached by the pages that render the cover, not baked in here,
// so this module stays plain data (no React dependency).

export const aiTransformationDeck = {
  id: "ai-transformation",
  title: "Enterprise AI Transformation",
  tags: [],
  chapters: [
    {
      id: "case",
      num: "01",
      title: "Case for Action",
      iconName: "Zap",
      subtitle: "Why now — the cost of waiting exceeds the cost of acting",
      slides: [
        {
          id: "c1s1",
          type: "tufte",
          title: "The Competitive Landscape Has Shifted",
          paragraphs: [
            "Over the past eighteen months, AI-native competitors have compressed product cycles from quarters to weeks. This is not a marginal improvement — it is a structural shift in how value is created. Incumbents who delay transformation risk permanent share loss, not gradual erosion.",
            "Internal analysis confirms that manual processes consume 40% of operating spend in target functions. Every quarter of delay compounds the efficiency gap. The cost of waiting now exceeds the cost of acting.",
          ],
          notes: [
            { marker: "15–30%", label: "Revenue at risk within 3 years", detail: "Benchmarking across 47 peer organizations shows firms without AI adoption face 15–30% revenue compression within 36 months. Share migration accelerates in years two and three." },
            { marker: "2.3×", label: "Peer efficiency gain over 24 months", detail: "Early-adopter cohorts show 2.3× improvement in cost-per-transaction, 40% reduction in process time, and 18% faster decision cycles. These gains compound annually." },
            { marker: "84%", label: "Haven't redesigned workflows", detail: "Despite having AI tools, 84% of organizations haven't actually redesigned how work gets done. The gap between tool access and transformation is where value is lost — or captured." },
          ],
        },
        {
          id: "c1s2",
          type: "scroll",
          title: "Cost of Inaction — By the Numbers",
          stats: [
            { label: "Manual process cost", value: 40, unit: "%", desc: "of operating spend in target functions" },
            { label: "Peer efficiency gap", value: 2.3, unit: "×", desc: "widening every quarter of delay" },
            { label: "Talent attrition", value: 34, unit: "%", desc: "of overloaded employees considering quitting" },
          ],
          body: "These aren't projections — they're measurements from organizations already in motion. The compounding nature of automation means early movers don't just lead, they accelerate away.",
        },
        {
          id: "c1s3",
          type: "standard",
          title: "Three Converging Forcing Functions",
          pillars: [
            { title: "Regulation", desc: "AI governance frameworks in 23 operating markets now reward maturity. Delay creates compliance risk, not just competitive risk." },
            { title: "Customer Expectations", desc: "71% of enterprise buyers now expect AI-native capabilities in RFPs. This has reset baseline service levels across B2B." },
            { title: "Talent Market", desc: "Top engineers and analysts choose employers based on AI tooling sophistication. Retention risk peaks at 18–24 months of organizational inaction." },
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
        },
        {
          id: "c3s5",
          type: "custom",
          component: "MarketplaceDirectory",
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
        },
      ],
    },
  ],
};
