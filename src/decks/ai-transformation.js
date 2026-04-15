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
          dateUpdated: "2026-04-13",
          type: "tufte",
          title: "$400M in revenue with two employees. What worked and what broke.",
          source: "NYT, FDA, Eclipsai analysis",
          paragraphs: [
            "Founded September 2024. Scaled to $400M revenue in 15 months with two employees, no external funding, profitable.",
            "Outsourced regulated components to third-party vendors. Retained the customer relationship and scaled from 300 to 250,000 customers.",
            "Built the entire customer-facing business with AI tools: ChatGPT, Claude, and Grok for code and copy, Midjourney and Runway for ad creative, custom agents to orchestrate workflows.",
            "2026: FDA warning letter, class action lawsuit, FTC investigation request.",
          ],
          notes: [
            { marker: "$400M", label: "2025 Revenue (first full year)" },
            { marker: "250K", label: "2025 Customers (first full year)" },
            { marker: "AI tools-driven", label: "No engineering team" },
            { marker: "Compliance breakdown", label: "deepfake patient photos, fake accounts, unlicensed physician names" },
          ],
          article: {
            title: "$401M in AI-native revenue with two employees. What worked and what broke.",
            sections: [
              {
                body: "Medvi.org is a boundary case for enterprise AI deployment. It demonstrates both the extraordinary productivity potential of AI-native operations and the regulatory and ethical risks when scale vastly outpaces ethical guardrails.",
              },
              {
                subhead: "The AI operational achievement",
                body: "Matthew Gallagher founded Medvi in September 2024 with $20,000 and scaled it to $401 million in revenue within 15 months with two employees. The company generates approximately $3 million in daily revenue with a 16.2% net margin and no external funding.",
              },
              {
                body: "The operational model is straightforward. Gallagher built the entire customer-facing business (branding, website, paid media, checkout flow, customer communications) using commodity AI tools. He used ChatGPT, Claude, and Grok for code generation and copywriting. He deployed Midjourney and Runway for advertisement creative and image generation. He tested ElevenLabs for voice-based customer communication. He connected these tools with custom AI agents to orchestrate workflows across disparate systems.",
              },
              {
                body: "Medvi outsourced the regulated components (prescriptions, pharmacy operations, compliance, licensed physicians) to third-party vendors: CareValidate and OpenLoop Health absorbed the burden of ensuring that actual doctors reviewed cases, that pharmacies fulfilled orders, and that shipping complied with state regulations. Gallagher retained ownership of the customer relationship.",
              },
              {
                body: "By April 2026, Gallagher\u2019s projected revenue for 2026 was $1.8 billion. The company had grown from 300 to over 250,000 customers. That growth rate represents a different category of business outcome, one that is possible only when the operational constraint is moved entirely outside the human system.",
              },
              {
                subhead: "What broke",
                body: "By early 2026, Medvi faced an FDA warning letter, a class action lawsuit, and an FTC investigation request. The specific violations:",
                items: [
                  "AI-generated deepfake \u201cbefore and after\u201d patient photos",
                  "Recycled images from Reddit users who lost weight years before GLP-1 medications existed",
                  "At least 800 fake Facebook accounts featuring AI-generated doctor profiles",
                  "Licensed physicians named in company materials who had no involvement with Medvi",
                ],
              },
              {
                subhead: "What this means for enterprise AI deployment",
                body: "What Medvi did well: built a $401M revenue operation with two employees and $20,000 in starting capital. Used commodity AI tools (ChatGPT, Claude, Grok, Midjourney, Runway) for the entire customer-facing business: branding, website, paid media, checkout, customer communications. Outsourced regulated components to third-party vendors. Scaled from 300 to 250,000 customers in 15 months. Projected $1.8B for 2026.",
              },
              {
                body: "What it needed: machine-executable governance matching the speed of the operation.",
                items: [
                  "Automated compliance checking in customer-facing text (caught by the FDA for misbranding claims)",
                  "Image verification before publication (deepfake patient photos, recycled Reddit images)",
                  "Identity validation for marketing assets (800 fake Facebook accounts with AI-generated doctor profiles)",
                  "Physician credentialing checks (real doctors named without involvement)",
                ],
              },
              {
                body: "None of these require human manual review. All require systems designed to enforce rules at machine speed.",
              },
            ],
            sources: [
              { label: "Techmeme: AI-powered startup Medvi hits $401M in 2025 sales; tracking for $1.8B in 2026", url: "https://www.techmeme.com/260402/p12" },
              { label: "The Decoder: Telehealth startup Medvi generated billions in revenue with AI-powered fake advertising", url: "https://the-decoder.com/telehealth-startup-medvi-generated-billions-in-revenue-with-ai-powered-fake-advertising/" },
              { label: "Futurism: Why Is the New York Times Laundering the Reputation of a Sleazy AI Startup", url: "https://futurism.com/artificial-intelligence/new-york-times-medvi-ai-glp1s" },
              { label: "StatNews: The FDA is targeting telehealth marketing of GLP-1 drugs", url: "https://www.statnews.com/2026/03/12/fda-telehealth-marketing-glp1-prescribers-behind-warning-letters/" },
              { label: "Techdirt: The New York Times Got Played By A Telehealth Scam And Called It The Future Of AI", url: "https://www.techdirt.com/2026/04/07/the-new-york-times-got-played-by-a-telehealth-scam-and-called-it-the-future-of-ai/" },
              { label: "Drug Discovery and Development: The New York Times spotlighted MEDVi. The FDA had already warned the self-proclaimed 'fastest growing company in history.'", url: "https://www.drugdiscoverytrends.com/the-new-york-times-spotlighted-medvi-the-fda-had-already-warned-the-self-proclaimed-fastest-growing-company-in-history/" },
            ],
          },
        },
        {
          id: "ai-results-rare",
          dateAdded: "2026-04-10",
          dateUpdated: "2026-04-12",
          type: "scroll",
          title: "Reported AI gains concentrated in 1% of organizations",
          source: "Goldman Sachs, McKinsey, BCG, Eclipsai analysis",
          stats: [
            { value: 70, unit: "%", label: "S&P 500 discuss AI", desc: "on quarterly earnings calls" },
            { value: 6, unit: "%", label: "see material EBIT impact", desc: "McKinsey, 1,993 organizations" },
            { value: 1, unit: "%", label: "quantify earnings impact", desc: "S&P 500, Q4 2025 calls" },
          ],
          body: "McKinsey tested 25 organizational variables and found workflow redesign had the strongest correlation with EBIT impact. However only 21% of organizations have redesigned workflows around AI.",
          article: {
            title: "AI Productivity Impact: What the Evidence Actually Shows",
            sections: [
              {
                subhead: "Executive Summary",
                body: "AI is generating measurable productivity gains in specific domains, with documented improvements ranging from 4% to 30% where firms actually measure. Yet the aggregate macroeconomic data shows minimal impact on overall GDP or labor productivity. Only a small fraction of firms have redesigned workflows around AI, and most organizations lack the measurement infrastructure to identify where AI actually delivers value.",
              },
              {
                subhead: "The Macroeconomic Puzzle: Productivity Gains Without Economic Acceleration",
                body: "Goldman Sachs' \"AI-nxiety\" report found no aggregate relationship between AI adoption and GDP growth. Despite massive AI investment, U.S. GDP growth did not accelerate in 2025, and Goldman's analysis concluded that AI investment contributed \"basically zero\" to U.S. GDP that year.",
              },
              {
                body: "The earnings call data tells the story. 70% of S&P 500 management teams discussed AI on their Q4 2025 quarterly calls. 54% specifically framed it around productivity and efficiency. But only 10% quantified AI's impact on a specific use case, and just 1% quantified impact on earnings. Where firms did measure, median productivity gains reached ~30%, concentrated in customer support and software development.",
              },
              {
                body: "The Federal Reserve Bank of St. Louis measured a 1.3% implied productivity gain from AI deployment since late 2022. Their November 2025 survey found that 37.4% of U.S. workers now use AI at work, with time savings equivalent to 1.6% of all work hours. Material but modest, consistent with early-stage adoption rather than transformation.",
              },
              {
                body: "Acemoglu's macroeconomic model projects AI will generate a 1.1–1.6% GDP increase over a decade, equivalent to roughly 0.53–0.66% in total factor productivity gains annually. His core finding: most firms pursue \"so-so automation,\" replacing workers on tasks where the productivity gain is marginal. The U.S. tax code reinforces this, burdening labor more heavily than capital investment, giving firms incentive to automate even when the gain is minimal. The wider potential lies in augmentation and new task creation, but both require complementary investment in training, workflow redesign, and organizational change that most firms have not made.",
              },
              {
                subhead: "Measured Productivity Gains: Where AI Delivers",
                body: "Brynjolfsson, Li, and Raymond tracked 5,172 customer support agents at a single firm and found an average 15% productivity improvement from AI access. The gains were uneven: 34% for novice workers, but minimal improvement for experienced workers, who saw small declines in output quality. The authors caution against generalizing. The study covered one firm, one function, in a structured domain with clear right answers. They note that firms may respond to novice productivity gains by de-skilling positions rather than augmenting the workforce.",
              },
              {
                body: "The European Investment Bank and Bank for International Settlements found that AI adoption increased labor productivity by 4% on average across 12,000+ European firms, with no adverse employment effects in the short run. Productivity gains concentrated in medium and large firms with complementary IT infrastructure. Small firms showed minimal benefit. Gains amplified substantially when firms invested in complementary software, data infrastructure, and training.",
              },
              {
                subhead: "The Value Concentration Problem: Why Most Firms See Little Benefit",
                body: "McKinsey surveyed 1,993 organizations. 88% use AI regularly. Only 6% see more than 5% EBIT impact. The differentiator: workflow redesign had the strongest correlation with EBIT impact of all 25 organizational variables tested. Only 21% of organizations had done it.",
              },
              {
                body: "BCG surveyed 1,250+ firms. 60% report no material value from AI investment. 5% capture value at scale. The top 5% achieve 5x the revenue increases and 3x the cost reductions versus peers. They share three characteristics: they redesign workflows, they invest in complementary capabilities (IT infrastructure, talent, organizational design), and they measure continuously.",
              },
              {
                body: "BCG's employee survey found frontline adoption stalled at 51%, a \"silicon ceiling.\" Leadership support is the lever: employee positivity about AI rose from 15% to 55% with strong executive sponsorship.",
              },
              {
                subhead: "Management Capability as the Binding Constraint",
                body: "Mollick's MBA experiment: students using AI agents completed startup prototypes in 4 days that previously required a full semester. A 20x acceleration. The bottleneck was management quality: scoping problems precisely, delegating clearly, evaluating output, and iterating.",
              },
              {
                subhead: "Synthesis: The Three Core Findings",
                body: "First, aggregate economic impact remains modest to date. The Fed's 1.3% implied productivity gain, Acemoglu's 1.1–1.6% over a decade, and Brynjolfsson's contested 2.7% jump in 2025 represent the plausible range. All modest compared to pre-2020 productivity growth cycles.",
              },
              {
                body: "Second, firm-level productivity gains are real but concentrate in specific domains and organizations. Controlled studies document 4–34% productivity improvements in customer support, software development, and augmentation contexts. These gains reach only the firms that redesign workflows and measure impact, estimated at 5–6% of organizations.",
              },
              {
                body: "Third, the critical bottleneck is organizational readiness, not AI capability. Complementary investment in IT infrastructure, workflow redesign, measurement systems, and management capability determine whether AI deployment yields value. Most organizations have not invested in these complements.",
              },
            ],
            sources: [
              { label: "Acemoglu, Daron. \"The Simple Macroeconomics of AI.\" Economic Policy, Vol. 40(121), January 2025.", url: "https://academic.oup.com/economicpolicy/article-abstract/40/121/13/7728473" },
              { label: "Brynjolfsson, Erik. \"The AI Productivity Take-Off.\" Stanford Digital Economy Lab, February 2026.", url: "https://fortune.com/2026/02/15/ai-productivity-liftoff-doubling-2025-jobs-report-transition-harvest-phase-j-curve/" },
              { label: "Brynjolfsson, Erik, Li, Danielle, and Raymond, Lanier. \"Generative AI at Work.\" Quarterly Journal of Economics, Vol. 140(2), 2025.", url: "https://academic.oup.com/qje/article/140/2/889/7990658" },
              { label: "Goldman Sachs Research. \"AI Earnings and GDP Impact.\" February-March 2026.", url: "https://fortune.com/2026/03/03/goldman-earnings-ai-anxiety-no-meaningful-impact-productivity-economy-30-percent-in-2-areas/" },
              { label: "Boston Consulting Group. \"The Widening AI Value Gap.\" September-October 2025.", url: "https://www.bcg.com/publications/2025/are-you-generating-value-from-ai-the-widening-gap" },
              { label: "Boston Consulting Group. \"AI at Work 2025.\" June 2025.", url: "https://www.bcg.com/publications/2025/ai-at-work-momentum-builds-but-gaps-remain" },
              { label: "Federal Reserve Bank of St. Louis. \"AI Adoption in 2025.\" November 2025.", url: "https://www.stlouisfed.org/on-the-economy/2025/nov/state-generative-ai-adoption-2025" },
              { label: "European Central Bank. \"AI Adoption in the Euro Area.\" March 2025-March 2026.", url: "https://www.ecb.europa.eu/press/blog/date/2025/html/ecb.blog20250321~6af1337b6b.en.html" },
              { label: "European Investment Bank & Bank for International Settlements. \"AI Adoption, Productivity & Employment.\" 2026.", url: "https://www.bis.org/publ/work1325.htm" },
              { label: "Deloitte. \"State of AI in the Enterprise 2026.\" Early 2026.", url: "https://www.deloitte.com/us/en/what-we-do/capabilities/applied-artificial-intelligence/content/state-of-ai-in-the-enterprise.html" },
              { label: "McKinsey & Company. \"The State of AI in 2025.\" March-November 2025.", url: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai" },
              { label: "Wharton School & GBK Collective. \"Accountable Acceleration.\" October 2025.", url: "https://ai.wharton.upenn.edu/wp-content/uploads/2025/10/2025-Wharton-GBK-AI-Adoption-Report_Full-Report.pdf" },
              { label: "Mollick, Ethan. \"Management as AI Superpower.\" One Useful Thing, 2025.", url: "https://www.oneusefulthing.org/p/management-as-ai-superpower" },
              { label: "U.S. Bureau of Labor Statistics. \"AI Employment Projections.\" February 2025.", url: "https://www.bls.gov/opub/mlr/2025/article/incorporating-ai-impacts-in-bls-employment-projections.htm" },
            ],
          },
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
          id: "deployment-modes",
          dateAdded: "2026-04-14",
          type: "standard",
          title: "Five enterprise AI deployment modes",
          source: "Eclipsai analysis",
          pillarsLayout: "list",
          pillars: [
            { title: "AI Work Platforms", desc: "Claude Code, Claude Cowork. Custom agents and workflows on shared infrastructure." },
            { title: "Horizontal Assistants", desc: "ChatGPT Enterprise, Microsoft Copilot, Gemini. General-purpose AI across knowledge work." },
            { title: "Vertical Solutions", desc: "Harvey (legal), Abridge (clinical), Feedzai (fraud). Domain-specific AI with built-in compliance." },
            { title: "SaaS-Embedded AI", desc: "Salesforce Agentforce, Adobe Firefly, ServiceNow. AI inside platforms you already use." },
            { title: "Custom Builds", desc: "Internal agents and pipelines." },
          ],
          callout: {
            text: "We believe the future is the AI work platform, which absorbs capabilities from every other mode: horizontal assistant features, vertical workflow depth, and custom build flexibility.",
          },
          article: {
            title: "Five Enterprise AI Deployment Modes",
            sections: [
              { body: "Enterprise AI has crystallized around five deployment modes." },

              { subhead: "1. Horizontal Assistants", body: "ChatGPT Enterprise, Microsoft Copilot for Microsoft 365, Google Gemini Enterprise. General-purpose AI across knowledge work: writing, analysis, coding, design." },
              { body: "The largest segment at $8.4 billion in 2025, growing 5.3x year-over-year. Copilots account for 86% of that spend. ChatGPT Enterprise seats grew 9x year-over-year to 7+ million." },
              { body: "Advantages: Fastest time-to-use. No integration engineering required." },
              { body: "Limitations: Adoption stalls after purchase. Microsoft Copilot achieved 15 million paid seats but only 35.8% active usage per a Recon Analytics survey of 150,000+ respondents. However ChatGPT Enterprise reached 83.1%, indicating the gap is product-specific." },

              { subhead: "2. AI Work Platforms", body: "Claude Code, Claude Cowork. AI as productivity infrastructure for building custom agents and workflows." },
              { body: "Claude Code reached a $1 billion run rate six months after launch. Claude Cowork reached general availability in April 2026. Usage is spreading beyond engineering into operations, marketing, finance, and legal." },
              { body: "Advantages: Organizations build domain-specific workflows on shared infrastructure. Plugin architecture enables reuse across teams." },
              { body: "Limitations: Requires internal capability building." },

              { subhead: "3. Vertical Solutions", body: "Harvey for legal, Abridge for clinical documentation, Feedzai for fraud detection. AI optimized for a single domain with built-in compliance and workflow fit." },
              { body: "Vertical AI reached $3.5 billion in 2025, tripling from $1.2 billion in 2024. Healthcare dominates at $1.5 billion, with ambient scribes alone at $600 million. Legal AI reached $650 million. Bessemer projects the vertical AI market cap could grow 10x larger than legacy SaaS." },
              { body: "Advantages: Fastest domain-specific ROI. Pre-built compliance controls for regulated industries. Strong adoption: 100% of Harvey law firms said lawyers would be upset if it was taken away." },
              { body: "Limitations: Cannot be repurposed across domains." },

              { subhead: "4. SaaS-Embedded AI", body: "Salesforce Agentforce, Adobe Firefly, ServiceNow. AI capabilities integrated directly into enterprise platforms organizations already use." },
              { body: "Salesforce Agentforce and Data 360 combined hit $1.4 billion ARR. Over 60% of enterprise SaaS products now have embedded AI features." },
              { body: "Advantages: No new vendor relationship. AI works within existing workflows, data, and permissions. Reduced implementation burden." },
              { body: "Limitations: End-user engagement lags behind deal closure. Actual Agentforce adoption rates run sub-20% in many implementations." },

              { subhead: "5. Custom Builds", body: "Internal agents and pipelines built from first principles. Coinbase, Spotify, Ramp, and similar engineering-heavy organizations." },
              { body: "Only 5.2% of organizations have AI agents live in production. Coinbase moved from proof-of-concept to production in six weeks, then published \u201Cpaved roads\u201D cutting new agent build time from 12+ weeks to under one week." },
              { body: "Advantages: Maximum control and customization. Proprietary workflows become competitive moats. No vendor lock-in." },
              { body: "Limitations: Requires dedicated engineering teams, production-grade infrastructure, and evaluation discipline most organizations lack." },

              { subhead: "Our point of view", body: "We believe the future is the AI work platforms, and vertical AI when regulation or domain complexity demands it. Horizontal assistants are table stakes and face the adoption ceiling." },
              { body: "AI Work platforms are absorbing capabilities from every other mode. The platform architecture expands into adjacent territory: horizontal assistant features, vertical workflow depth, and custom build flexibility, all on shared infrastructure." },
            ],
            sources: [
              { label: "Menlo Ventures, \u201C2025: The State of Generative AI in the Enterprise\u201D (2025)", url: "https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/" },
              { label: "Recon Analytics, Microsoft Copilot Adoption Survey (2026)", url: "https://www.bitget.com/news/detail/12560605336991" },
              { label: "Anthropic, Revenue and Claude Code Growth (2026)", url: "https://www.indexbox.io/blog/anthropic-reports-30b-revenue-run-rate-fueled-by-enterprise-ai-adoption/" },
              { label: "Bessemer Venture Partners, \u201CThe State of AI 2025\u201D", url: "https://www.bvp.com/atlas/the-state-of-ai-2025" },
              { label: "Cleanlab, \u201CAI Agents in Production 2025\u201D", url: "https://cleanlab.ai/ai-agents-in-production-2025/" },
              { label: "Harvey, Legal AI Impact and Growth", url: "https://www.harvey.ai" },
              { label: "Salesforce, Agentforce Metrics", url: "https://www.salesforce.com/agentforce/metrics/" },
              { label: "Coinbase, Building Enterprise AI Agents", url: "https://www.coinbase.com" },
            ],
          },
        },
        // Tested-skills showcase. Explainer (maturity + example) first,
        // then the interactive directory. Both render full-bleed in marketplace
        // palette via the custom component registry in SlidePage.
        {
          id: "c2s4",
          dateAdded: "2026-04-11",
          type: "custom",
          component: "MarketplaceExplainer",
          title: "Tested Skills — Maturity Framework",
          ogDescription: "How we rate Claude skills against real work — the three-level blind-test framework.",
        },
        {
          id: "c2s5",
          dateAdded: "2026-04-11",
          type: "custom",
          component: "MarketplaceDirectory",
          title: "Business Skills Directory",
          ogDescription: "14 skills across 11 functions — every role, dramatically more capable.",
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
          id: "model-routing",
          dateAdded: "2026-04-14",
          type: "standard",
          title: "Model routing: optimize costs by using the best model for each task",
          source: "RouteLLM (ICLR 2025), Anthropic Building Effective Agents, OpenAI Reasoning Best Practices",
          body: "Model routing matches each query to the cheapest model that meets the quality bar, concentrating expensive reasoning tokens on the planning phase.",
          callout: {
            value: "85%",
            label: "cost reduction",
            sub: "Cost reduction for production deployments, while retaining 95% of frontier-model quality",
          },
          pillars: [
            { title: "Rule-based routing", desc: "Assign complexity tiers to query types. No ML required. Audit your query mix and implement within a week." },
            { title: "Classifier-based routing", desc: "Train a lightweight model on production logs to predict which queries need frontier capabilities. Handles the ambiguous middle." },
            { title: "Cascade routing", desc: "Start every query on the cheapest model. Escalate only when the output fails a quality check. Progressive cost control." },
          ],
          article: {
            title: "Model routing: optimize costs by using best model for task",
            sections: [
              { body: "Most enterprise AI deployments send every query to the most expensive model available. A 12x productivity speedup at 10x the per-query cost is a 1.2x improvement in unit economics. Model routing fixes this by matching each query to the cheapest model that meets the quality bar. Production deployments report 85% cost reduction while retaining 95% of frontier-model quality." },

              { subhead: "The planner/doer pattern separates reasoning from execution", body: "A reasoning model plans the approach. A cheaper execution model carries out the steps. This applies to data validation, code review, financial analysis, and agentic planning. The cost savings come from concentrating expensive reasoning tokens on the planning phase and running execution on models that cost a fraction per token." },
              { body: "Anthropic structures this as three tiers. Opus handles complex reasoning and orchestration. Sonnet covers the majority of production workloads. Haiku processes classification, extraction, and formatting. The tier boundaries map to task complexity: augmented LLMs for simple tool use, workflows for deterministic multi-step processes, autonomous agents for open-ended reasoning." },

              { subhead: "Three routing strategies, layered progressively", body: "Rule-based routing assigns complexity tiers to query types and sends each tier to the appropriate model. This requires no machine learning, just an audit of your query mix." },
              { body: "Classifier-based routing trains a lightweight model on production logs to predict which queries need frontier capabilities. This handles the ambiguous queries that rules miss." },
              { body: "Cascade routing starts every query on the cheapest model and escalates only when the output fails a quality check." },
              { body: "The implementation sequence: audit your query distribution, implement rules to catch obvious low-complexity traffic, then train a classifier on the queries where rules are ambiguous." },

              { subhead: "Model selection starts from the cheapest option that works", body: "Free-tier models handle a meaningful share of production workloads. Each model has a specific cost profile and a specific capability boundary. Organizations that route effectively map those boundaries to their actual task distribution." },
              { body: "Extended reasoning time improves performance on complex tasks but burns tokens on simple queries where the additional computation adds nothing. Monitoring reasoning traces also detects misbehavior, so the same mechanism that improves quality serves as a safety check." },

              { subhead: "Implementation path", body: "Start with a query audit. Implement rule-based routing within a week. Measure cost reduction over 30 days. Invest in classifier-based routing for the ambiguous middle." },
            ],
            sources: [
              { label: "RouteLLM: Learning to Route LLMs with Preference Data, UC Berkeley (ICLR 2025)", url: "https://proceedings.iclr.cc/paper_files/paper/2025/file/5503a7c69d48a2f86fc00b3dc09de686-Paper-Conference.pdf" },
              { label: "Reasoning Best Practices, OpenAI", url: "https://developers.openai.com/api/docs/guides/reasoning-best-practices" },
              { label: "Prompting Best Practices (Claude 4.x Models), Anthropic", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices" },
              { label: "Building Effective Agents, Anthropic Research (December 2024)", url: "https://www.anthropic.com/research/building-effective-agents" },
              { label: "LLM Routing: How to Stop Paying Frontier Model Prices for Simple Queries, Tian Pan (October 2025)", url: "https://tianpan.co/blog/2025-10-19-llm-routing-production" },
              { label: "Practical Guide for Model Selection for Real-World Use Cases, OpenAI Cookbook", url: "https://cookbook.openai.com/examples/partners/model_selection_guide/model_selection_guide" },
              { label: "Anthropic Economic Index V4, Economic Primitives (January 2026)", url: "https://www.anthropic.com/research/economic-index-primitives" },
            ],
          },
        },
        {
          id: "enterprise-connectors",
          dateAdded: "2026-04-14",
          type: "standard",
          title: "Enterprise connectors: give AI access to enterprise systems and tools",
          source: "MCP Specification v2025-11-25, Anthropic Agent Skills, Microsoft Foundry, Google Gemini Enterprise",
          body: "A customer support agent using MCP reads CRM records, pulls ticket history, searches the knowledge base, and escalates to a human in the same conversation. MCP orchestrates across multiple tools and data sources in a persistent session, handling discovery, authentication, and execution.",
          callout: {
            value: "2,000",
            label: "MCP registry entries",
            sub: "By November 2025. Endorsed by GitHub, OpenAI, Microsoft, and AWS.",
          },
          pillars: [
            { title: "Platform adoption", desc: "Azure AI Foundry: 1,400+ tools. Gemini Enterprise: 50+ connectors. ChatGPT Enterprise: Gmail, SharePoint, GitHub, Teams. Catalog size is visible. Integration depth varies." },
            { title: "Skills framework", desc: "Bundles tool integrations into shareable directories. Each Skill loads only the context the agent needs, preventing the context window from filling with irrelevant tool descriptions." },
            { title: "Per-connector governance", desc: "Platform-level controls cover permissions, spend caps, and audit trails. The unsolved layer: which employees use which integrations on which data with which approval workflows." },
          ],
          article: {
            title: "Enterprise connectors: give AI access to enterprise systems and tools",
            sections: [
              { body: "A customer support agent using MCP reads CRM records, pulls ticket history, searches the knowledge base, and escalates to a human in the same conversation. The Model Context Protocol reached 2,000 registry entries by November 2025, with endorsements from GitHub, OpenAI, Microsoft, and AWS. Enterprise deployments rarely involve a single integration. MCP orchestrates across multiple tools and data sources in a persistent session, handling discovery, authentication, and execution." },

              { subhead: "Every major platform adopted MCP as the connector standard", body: "Azure AI Foundry includes over 1,400 tools. Google Gemini Enterprise offers 50+ enterprise connectors. ChatGPT Enterprise added connectors to Gmail, SharePoint, GitHub, and Teams. All support MCP. The catalog size is visible. The integration depth varies. A Salesforce connector that reads opportunity records is available from every platform. A connector that maps your sales stages, applies your forecasting methodology, and reads the custom fields where pipeline intelligence lives requires configuration work specific to each organization." },

              { subhead: "Skills package tool access into reusable, scoped capabilities", body: "The Agent Skills framework bundles tool integrations into shareable directories. Each Skill loads only the context the agent needs for the current task. For enterprises running agents with dozens of connected tools, this prevents the context window from filling with irrelevant tool descriptions and truncating critical instructions." },

              { subhead: "Per-connector governance is the unsolved layer", body: "Platform-level admin controls cover compliance APIs, tool permissions, file access restrictions, spend caps, and usage analytics. These address the question every CISO asks: who has access to what, and how do we audit it. The gap is one layer deeper: which employees can use which tool integrations on which data sets with which approval workflows. That layer is still custom work for each organization." },

              { subhead: "Implementation path", body: "Inventory the systems your highest-value workflows touch. Build or source MCP connectors for those systems first. Validate integration depth against actual use cases before scaling the connector catalog." },
            ],
            sources: [
              { label: "MCP Specification v2025-11-25, Model Context Protocol", url: "https://modelcontextprotocol.io/specification/2025-11-25" },
              { label: "One Year of MCP, MCP Core Maintainers (November 2025)", url: "https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/" },
              { label: "Function Calling, OpenAI API Guide", url: "https://platform.openai.com/docs/guides/function-calling" },
              { label: "Equipping Agents for the Real World with Agent Skills, Anthropic Engineering (2025)", url: "https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills" },
              { label: "Microsoft Foundry Documentation, Microsoft (2025-2026)", url: "https://learn.microsoft.com/en-us/azure/foundry/" },
              { label: "Gemini Enterprise, Google Cloud (October 2025)", url: "https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise" },
              { label: "Claude Code and New Admin Controls for Business Plans, Anthropic (August 2025)", url: "https://www.anthropic.com/news/claude-code-on-team-and-enterprise" },
            ],
          },
        },
        {
          id: "memory-workflows",
          dateAdded: "2026-04-15",
          type: "standard",
          title: "Memory and workflows: deliver output where work happens",
          source: "Anthropic Research, Claude Code docs, OpenAI Projects, Ethan Mollick, Latent Space",
          body: "Most AI-generated output requires manual transfer into the system where the work happens. A contract review lands in a chat window; the lawyer copies it into the contract management system. Organizations extracting the most value build automated pipelines from AI output to downstream systems.",
          callout: {
            text: "The gap between generating a useful answer and delivering it where work happens is where the productivity upside lives.",
          },
          pillars: [
            { title: "Persistent context files", desc: "CLAUDE.md files load automatically by directory: user-level for preferences, project-level for team conventions, directory-level for task requirements. No manual configuration between sessions." },
            { title: "Three interface modes", desc: "Chat for decisions. Code for repos and infrastructure. Cowork for documents, spreadsheets, and reports written directly to desktop folders. Each reduces the manual transfer step." },
            { title: "Pipeline to system of record", desc: "Match each workflow to the interface that delivers closest to where work happens. Extend with MCP connectors where output needs to reach systems the interface cannot write to directly." },
          ],
          article: {
            title: "Memory and workflows: deliver output where work happens",
            sections: [
              { body: "Most AI-generated output requires manual transfer into the system where the work happens. A contract review lands in a chat window. The lawyer copies it into the contract management system. A financial analysis appears as markdown. The analyst reformats it for the board deck. Organizations extracting the most value build automated pipelines from AI output to downstream systems: dashboards, approval chains, project trackers, compliance records." },

              { subhead: "Persistent context files retain project knowledge across sessions", body: "CLAUDE.md files store instructions that load automatically based on directory structure. A user-level file sets global preferences. A project-level file sets team or codebase conventions. A directory-level file sets task-specific requirements. The agent inherits all three without manual configuration. OpenAI Projects takes a different approach, keeping chats, files, and instructions together in a shared workspace that teams can branch and reuse. Projects usage grew 19x year-to-date, with over 1 million organizations on the platform." },

              { subhead: "Three interface modes move output closer to where work happens", body: "Claude Chat handles conversational interaction. Claude Code operates from the terminal, writing directly to files, repos, and project structures. Claude Cowork writes spreadsheets, documents, and reports directly to the user's desktop folders. OpenAI Canvas opened a separate creation window for code and text editing alongside the chat. Each mode reduces the manual transfer step between AI-generated output and the system of record. The interfaces are early and evolving. Cowork is a research preview. Canvas adoption data is limited." },

              { subhead: "Workflow UX remains the thinnest-documented capability area", body: "After surveying 84 sources across the enterprise AI capability stack, workflow UX has the least practitioner documentation. Most public guidance describes chat-based interfaces. Documentation on building AI outputs that integrate into existing enterprise workflows, meaning dashboards, reports, approval chains, and compliance systems, is nearly nonexistent. The gap between generating a useful answer and delivering it into the system where work happens is where custom integration work lives." },

              { subhead: "Implementation path", body: "Match each workflow to the interface mode that delivers output closest to the system of record. Use Code for repo and infrastructure changes. Use Cowork for documents, spreadsheets, and reports that belong in project folders. Use Chat for exploration and decisions that need a human before going anywhere. Start with the workflows where the manual transfer step consumes the most time. Extend with MCP connectors where the output needs to reach systems the interface cannot write to directly." },
            ],
            sources: [
              { label: "How AI Is Transforming Work at Anthropic, Anthropic Research (December 2025)", url: "https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic" },
              { label: "Claude Code Overview and CLAUDE.md Documentation, Anthropic", url: "https://code.claude.com/docs/en/overview" },
              { label: "Projects in ChatGPT, OpenAI Help Center", url: "https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt" },
              { label: "OpenAI Canvas, OpenAI (October 2024)", url: "https://openai.com/index/introducing-canvas/" },
              { label: "The Shape of the Thing, Ethan Mollick (March 2026)", url: "https://www.oneusefulthing.org/p/the-shape-of-the-thing" },
              { label: "Agent Engineering, Swyx / Latent Space (June 2025)", url: "https://www.latent.space/p/agent" },
            ],
          },
        },
      ],
    },
  ],
};
