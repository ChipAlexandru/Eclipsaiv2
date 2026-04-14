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
          id: "anthropic-ai-native",
          dateAdded: "2026-04-14",
          type: "scroll",
          source: "Eclipsai analysis, Anthropic",
          title: "Anthropic: internal AI use drives productivity and growth",
          stats: [
            { label: "Productivity increase", value: 50, unit: "%", desc: "self-reported, year-over-year" },
            { label: "New work created", value: 27, unit: "%", desc: "tasks that would not have been done without AI" },
            { label: "Non-developer usage", value: "50%+", unit: "", desc: "Legal, Finance, Marketing, Data, Security", isText: true },
          ],
          chart: {
            type: "line",
            title: "Anthropic — Revenue Run-Rate",
            unit: "USD, billions",
            height: 150,
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
          body: "Make AI a core operation. Distribute decision-making. Target highest-friction workflows.",
          article: {
            title: "Anthropic Operates as an AI-Native Company, and the Numbers Show It",
            sections: [
              {
                body: "Anthropic has achieved $30B annual revenue run-rate by April 2026, less than 14 months after crossing $1B in ARR. This trajectory reflects both successful product adoption and how a company can be structured, cultured, and operationally designed around AI as infrastructure. These aspects can bring operational productivity in all organizations.",
              },
              {
                body: "The company\u2019s valuation reached $380B in Series G funding completed February 12, 2026, representing a 108% increase from the prior round\u2019s. Claude Code achieved $2.5B ARR by February 2026, doubling since January. This acceleration in a developer-focused tool over a single month indicates the pace at which AI-native operations can scale once adoption bridges from power users to mainstream teams.",
              },
              {
                body: "The company operates with approximately 5,000 employees. Revenue per employee ranges from $3.8M at the $19B annualized midpoint reported in early 2026 to roughly $6M at the $30B run-rate reached by April. Either figure places Anthropic well above the $1M to $2M range typical of enterprise software companies. The ratio reflects structural decisions that prioritize leverage through AI tooling, with fewer traditional overhead functions and more distributed decision-making.",
              },
              {
                subhead: "Internal productivity gains quantify AI-native operations",
                body: "Anthropic conducted a formal productivity study across its engineering organization in August 2025. The study included 132 engineers and researchers surveyed, 53 in-depth interviews, and analysis of 200,000 Claude Code transcripts. The findings provide concrete evidence of how an AI-native company operationalizes internal adoption.",
              },
              {
                body: "Claude usage in daily work grew from 28% of engineers using the tool to 59% over the course of 12 months. Engineers integrated Claude into their workflows because the tool addressed specific friction points in their daily work. Productivity boost measurements tracked over the same period showed increases from 20% to 50% year-over-year, with power users (14% of the surveyed population) reporting productivity gains exceeding 100%. Twenty-seven percent of AI-assisted work represented tasks that would not have been completed at all without the tool. This new output capacity can determine competitive advantage.",
              },
              {
                body: "Merged pull requests per engineer per day increased by 67% among adopters. Claude Code autonomy evolved from approximately 10 actions before requiring human input to approximately 20 actions over the same period. This progression indicates that as engineers built familiarity with Claude Code\u2019s reasoning patterns, they expanded the scope of tasks delegated to the tool without requiring additional human review cycles.",
              },
              {
                type: "callout",
                value: "27%",
                label: "of AI-assisted work represented tasks that would not have been completed at all without the tool",
              },
              {
                subhead: "Cross-functional adoption reveals hidden productivity pools",
                body: "Anthropic\u2019s internal data shows that 50% or more of Claude Code usage originates from non-developer roles. This indicates that the productivity gains traditionally associated with developer tools can extend across an organization.",
              },
              {
                body: "Growth Marketing teams used Claude Code to generate hundreds of advertising variations in minutes rather than hours. Legal teams built accessibility tools and automated workflows without requiring engineering support. Data Infrastructure teams analyzed Kubernetes diagnostics via screenshot analysis, accelerating diagnosis of system failures. Finance teams generated Excel reports through Claude Code without manual data assembly. Security teams accelerated Terraform plan parsing by distributing the analysis across Claude rather than consolidating reviews.",
              },
              {
                body: "Documentation identified 9 teams using Claude Code across their daily operations and an additional measure of 7.4% to 7.5% adoption for data visualization tasks across policy and research functions. This dispersion suggests that constraints on adoption often come from inadequate change management, insufficient training on tool capabilities, or organizational silos that prevent non-engineering teams from accessing developer tools.",
              },
              {
                type: "pullquote",
                text: "A company with 10,000 employees organized into 25 functional areas can adopt AI tools selectively within each area. Anthropic\u2019s experience suggests that treating AI as an engineering-only tool leaves substantial productivity gains on the table.",
                source: "Eclipsai analysis",
              },
              {
                subhead: "Augmentation now exceeds automation in enterprise AI deployments",
                body: "Anthropic commissioned analysis of approximately 2M conversations across both Claude.ai and API usage, conducted in November 2025. This dataset provided evidence of how AI augmentation differs from automation in practice.",
              },
              {
                body: "The speedup ratio on college-level tasks was 12\u00d7, while high-school-level tasks achieved 9\u00d7 speedup. The inverse relationship between task complexity and speedup ratio reflects the nature of augmentation. Highly complex tasks benefit from AI-assisted reasoning and validation, but they typically require human oversight or specialized domain verification. AI reduces the time required to reach the threshold of completeness, but does not eliminate human judgment.",
              },
              {
                body: "Augmentation accounted for 52% of all AI-assisted work analyzed, while automation accounted for 45%. This distribution contradicts the automation-first narrative that often dominates AI adoption discussions in enterprise settings. Anthropic\u2019s data suggests that most organizational value, at least at current capability levels, derives from augmenting human work rather than replacing it.",
              },
              {
                body: "Forty-nine percent of jobs showed AI use applied to 25% or more of their tasks. This threshold represents meaningful integration into daily work rather than peripheral or experimental use.",
              },
              {
                body: "The gap between the 12\u00d7 task-level speedup and economy-wide productivity is large, and understanding it matters for any enterprise building a business case. Three filters reduce the raw number. First, AI is only applied to a subset of total work hours across the economy. Second, not every AI-assisted task succeeds on the first attempt, and failure rates rise as task complexity increases. Third, many roles and industries have minimal AI exposure so far.",
              },
              {
                body: "When Anthropic adjusted for all three factors, the effective productivity contribution fell to approximately 1.0 to 1.2 percentage points of annual productivity growth. That figure is meaningful in macroeconomic terms (the U.S. averaged roughly 1.4% annual productivity growth over the prior decade), but it is an order of magnitude smaller than what the raw speedup implies. For enterprise leaders, the takeaway is that individual team-level gains can be dramatic while the organization-wide impact remains modest until AI coverage, success rates, and task breadth all expand together.",
              },
              {
                subhead: "Organizational structure reflects AI-native design principles",
                body: "Anthropic\u2019s internal organization embeds AI integration into its decision-making hierarchy. Every technical employee, regardless of seniority, holds the title \u201cMember of Technical Staff.\u201d This organizational structure eliminates multiple management layers that traditional software companies maintain. The practical implication is that individual contributors directly influence technical direction, and AI tools expand the scope of problems they can address without escalation to management.",
              },
              {
                body: "The company operates as a remote-first organization across the United States, United Kingdom, and Canada, with an expectation of 25% in-office presence. This model allows the company to recruit talent from broader geographic pools while preserving some level of in-person collaboration and coordination. Remote-first operations depend heavily on asynchronous communication and documentation, creating an organizational environment where AI tools for knowledge synthesis and documentation generation have immediate application.",
              },
              {
                body: "Anthropic structured itself as a public benefit corporation, a legal form that requires the company to consider stakeholder interests beyond shareholder returns. In practice, this structure means that decisions about AI development incorporate explicit consideration of safety, societal impact, and long-term consequences. This approach creates operational overhead relative to traditional corporations, but it also positions the company to navigate regulatory environments where AI governance becomes increasingly central to business legitimacy.",
              },
              {
                subhead: "Implications for enterprise AI transformation",
                body: "Anthropic demonstrates that AI-native operations require simultaneous transformation across three dimensions. First, the technical infrastructure must treat AI as a component of core operations. Second, the organizational structure must distribute decision-making authority in ways that reduce bottlenecks when individuals have access to augmented reasoning capacity. Third, the adoption strategy must target the highest-friction workflows and measure success by new output capacity rather than by headcount reduction.",
              },
              {
                body: "The 50% cross-functional adoption of Claude Code indicates that productivity gains are not limited to technical functions. Organizations that treat AI adoption as an engineering problem may be overlooking opportunities in operations, finance, legal, and customer-facing functions. The constraint in many enterprises is not the availability of capable AI tools, but the organizational structures and adoption frameworks that determine which teams can access them and how those teams integrate the tools into daily workflows.",
              },
            ],
            sources: [
              { label: "How AI Is Transforming Work at Anthropic, Anthropic Research (Dec 2025)", url: "https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic" },
              { label: "How Anthropic Teams Use Claude Code, Anthropic (Jul 2025)", url: "https://claude.com/blog/how-anthropic-teams-use-claude-code" },
              { label: "Anthropic Reports $30B Revenue Run-Rate, IndexBox (Apr 2026)", url: "https://www.indexbox.io/blog/anthropic-reports-30b-revenue-run-rate-fueled-by-enterprise-ai-adoption/" },
              { label: "Anthropic Closes $30B Funding Round at $380B Valuation, CNBC (Feb 2026)", url: "https://www.cnbc.com/2026/02/12/anthropic-closes-30-billion-funding-round-at-380-billion-valuation.html" },
              { label: "Anthropic Just Hit $14B in ARR, SaaStr (Feb 2026)", url: "https://www.saastr.com/anthropic-just-hit-14-billion-in-arr-up-from-1-billion-just-14-months-ago/" },
              { label: "Claude Code Transformed Programming, Now Claude Cowork Is Coming for Everything Else, VentureBeat (Mar 2026)", url: "https://venturebeat.com/orchestration/anthropic-says-claude-code-transformed-programming-now-claude-cowork-is/" },
              { label: "Anthropic Economic Index January 2026 Report, Anthropic Research", url: "https://www.anthropic.com/research/anthropic-economic-index-january-2026-report" },
              { label: "Anthropic Economic Index: Economic Primitives, Anthropic Research (Jan 2026)", url: "https://www.anthropic.com/research/economic-index-primitives" },
            ],
          },
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
