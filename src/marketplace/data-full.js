// Verbatim migration from the old skills-marketplace repo (lib/skills.js).
// v2 is now the canonical source — the old repo is being retired at the end
// of m5.2. Do NOT edit shape-wise: consumers go through the adapter in data.js
// so that future per-skill file splits only touch the adapter, not components.
//
// Rich per-skill fields: long_description, version, category, use_cases,
// inputs, outputs, how_it_works, tools, skills_list. These power the
// /skills/[slug] detail pages added in m5.2.

export const SKILLS = [
  {
    id: 1,
    slug: "brand-voice",
    name: "Brand Voice",
    author: "Unknown",
    description: "Turn scattered brand materials into enforceable AI guardrails so every piece of content Claude generates sounds like your company wrote it.",
    long_description: "Brand Voice searches your existing knowledge platforms — Notion, Confluence, Google Drive, Box, SharePoint, Gong, Granola, Slack, and Figma — to find the brand materials your team already has but no one can find quickly. It distills those scattered documents, pitch decks, call transcripts, and style guides into a single set of guidelines that Claude can enforce automatically. Every time you ask Claude to write a cold email, proposal, or LinkedIn post, the output matches your company’s voice from the start rather than sounding like generic AI copy.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: null,
    version: "1.0.0",
    category: "Marketing & Brand",
    industries: [],
    functions: [],
    use_cases: [
      {
        ask: "Discover our brand voice across all our platforms",
        returns: "A discovery report listing every brand material found, ranked by reliability, with conflicts and gaps flagged for your review."
      },
      {
        ask: "Generate brand guidelines from the discovery report and these PDFs",
        returns: "A structured guideline document with voice attributes, a tone-by-context matrix, terminology standards, and confidence scores per section."
      },
      {
        ask: "Write a cold email to a VP of Sales at a mid-market SaaS company",
        returns: "A brand-aligned email with the right formality, energy, and terminology for that audience, plus notes explaining which guidelines were applied."
      }
    ],
    inputs: [
      {
        label: "Connected platforms (required for discovery)",
        detail: "At least one document storage platform (Notion, Confluence, Google Drive, Box, or SharePoint). Additional platforms like Gong, Granola, Slack, and Figma enrich the results.",
        required: false
      },
      {
        label: "Brand documents",
        detail: "PDF, DOCX, PPTX, or Markdown files uploaded directly if you already know where they are.",
        required: false
      },
      {
        label: "Call transcripts",
        detail: "Sales call recordings from Gong or Granola, or manually uploaded transcript files.",
        required: false
      },
      {
        label: "Per-project settings file",
        detail: "A local configuration file specifying your company name, enabled platforms, and known brand material locations.",
        required: false
      }
    ],
    outputs: [
      {
        label: "Discovery report",
        detail: "Ranked inventory of all brand materials found across platforms, with source categories, conflicts, coverage gaps, and open questions."
      },
      {
        label: "Brand voice guidelines (Markdown)",
        detail: "A durable document with voice attributes, “We Are / We Are Not” table, messaging framework, tone-by-context matrix, terminology guide, and confidence scores. Saved locally for automatic use in future sessions."
      },
      {
        label: "Brand-aligned content",
        detail: "Emails, proposals, social posts, and other content written against your guidelines, with brand application notes explaining voice and tone choices."
      }
    ],
    how_it_works: [
      {
        title: "Federated platform search",
        detail: "Runs parallel searches across all connected platforms using brand-specific query patterns, so materials are found regardless of where teams stored them."
      },
      {
        title: "Five-tier source ranking",
        detail: "Categorizes every source from official brand guides down to stale documents and scores them on recency, authority, and specificity, so the most trustworthy materials drive the guidelines."
      },
      {
        title: "Conversation pattern recognition",
        detail: "Analyzes sales call transcripts to surface how top performers actually speak, extracting phrases that win deals and language patterns that stall them."
      },
      {
        title: "Voice-constant, tone-flex enforcement",
        detail: "Keeps the brand’s personality fixed while adjusting formality, energy, and technical depth for each content type, so a cold email and an enterprise proposal both sound like the same company."
      },
      {
        title: "Confidence scoring with open questions",
        detail: "Rates every guideline section by the strength of its evidence and surfaces unresolved ambiguities as confirm-or-override decisions, so teams know exactly where to focus their review."
      }
    ],
    tools: "Connects to nine platforms via MCP connectors and native integrations: Notion (which federates across Google Drive, SharePoint, Slack, and Jira), Atlassian Confluence, Box, Microsoft 365 (SharePoint and OneDrive), Figma, Gong, and Granola. Google Drive and Slack are available natively through Claude Desktop without additional setup. The plugin works standalone with uploaded documents if no platforms are connected, but discovery requires at least one document storage platform.",
    skills_list: [
      {
        name: "discover-brand",
        description: "Searches connected platforms for brand materials, categorizes and ranks them, and produces a structured discovery report with conflicts and gaps.",
        type: "Invocable"
      },
      {
        name: "guideline-generation",
        description: "Synthesizes source materials into a structured guideline document with voice attributes, tone matrix, terminology standards, and confidence scores.",
        type: "Invocable"
      },
      {
        name: "brand-voice-enforcement",
        description: "Applies stored guidelines to content requests, keeping voice constant while adjusting tone for each content type and audience.",
        type: "Invocable"
      }
    ],
    install_steps: [
      "Open the Claude Desktop app and switch to the Cowork tab.",
      "Click Customize in the left sidebar, then Browse plugins.",
      "Search for “Brand Voice” and click Install."
    ]
  },
  {
    id: 2,
    slug: "data",
    name: "Data",
    author: "Unknown",
    description: "Turn raw data into validated insights, interactive dashboards, and publication-quality charts — from a single conversation.",
    long_description: "This plugin transforms Claude into a data analyst collaborator that handles the full analytics workflow. Upload a spreadsheet or connect a data warehouse, ask a question in plain language, and get back validated findings with charts — not just raw numbers. It works with any SQL dialect and produces self-contained deliverables that open in any browser.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "1.1.0",
    category: "Data Analytics & Business Intelligence",
    industries: [
      "financial",
      "retail",
      "cpg",
      "industrials",
      "tmt",
      "healthcare",
      "logistics"
    ],
    functions: [
      "data",
      "operations",
      "finance",
      "strategy"
    ],
    use_cases: [
      {
        ask: "What's driving the drop in our conversion rate this quarter?",
        returns: "A multi-dimensional analysis breaking down conversion by channel, device, and cohort — with charts highlighting the key driver and caveats noted before you share it"
      },
      {
        ask: "Explore our orders table and tell me what's interesting",
        returns: "A full data profile covering row counts, null rates, distributions, quality flags, and recommended follow-up analyses — so you know what to trust before building on it"
      },
      {
        ask: "Build me a dashboard showing monthly revenue, top products, and regional breakdown",
        returns: "A self-contained interactive HTML file with KPI cards, filterable Chart.js visualizations, and a sortable detail table — opens in any browser, no server needed"
      }
    ],
    inputs: [
      {
        label: "CSV or Excel files",
        detail: "required if no warehouse connected",
        required: false
      },
      {
        label: "Natural-language questions or analysis requests",
        detail: "required",
        required: false
      },
      {
        label: "Data warehouse connection via MCP server",
        detail: "optional — enables direct querying",
        required: false
      },
      {
        label: "SQL dialect preference",
        detail: "optional — auto-detected when warehouse connected",
        required: false
      },
      {
        label: "Chart type or dashboard layout preferences",
        detail: "optional",
        required: false
      }
    ],
    outputs: [
      {
        label: "Narrative analysis reports with embedded findings and caveats",
        detail: ""
      },
      {
        label: "Interactive HTML dashboards with Chart.js charts and dropdown filters",
        detail: ""
      },
      {
        label: "Publication-quality PNG charts generated with matplotlib or plotly",
        detail: ""
      },
      {
        label: "Optimized SQL queries with dialect-specific syntax and performance notes",
        detail: ""
      },
      {
        label: "Data profiling summaries with quality scores and follow-up recommendations",
        detail: ""
      },
      {
        label: "Pre-delivery validation reports rating analysis readiness",
        detail: ""
      }
    ],
    how_it_works: [
      {
        title: "Adaptive complexity routing",
        detail: "Classifies each question as a quick lookup, full analysis, or formal report, then adjusts the depth of SQL, validation, and narrative accordingly, so a simple count finishes in seconds while a quarterly review gets the rigor it needs."
      },
      {
        title: "Built-in validation before delivery",
        detail: "Every analysis passes through sanity checks (row counts, null rates, magnitude plausibility, trend continuity) before results are shown, catching errors that typically surface only after a stakeholder asks an awkward question."
      },
      {
        title: "Dialect-aware SQL generation",
        detail: "Writes optimized queries for the user's specific warehouse, using partition filters, clustering keys, and dialect-specific functions, reducing both query cost and analyst back-and-forth."
      },
      {
        title: "Self-contained dashboard output",
        detail: "Produces single HTML files with embedded data, Chart.js visualizations, and filter logic that open in any browser with no server, so anyone on the team can interact with the results immediately."
      },
      {
        title: "Statistical guardrails",
        detail: "Applies standard caution around correlation-versus-causation, survivorship bias, average-of-averages, and small sample sizes, flagging risks before conclusions are drawn rather than after."
      },
      {
        title: "Company-context learning",
        detail: "The Data Context Extractor captures tribal knowledge (entity definitions, metric formulas, standard filters, common gotchas) into a reusable skill, so the plugin remembers how your organization defines \"active user\" or \"revenue\" across future sessions."
      }
    ],
    tools: "Works standalone with uploaded files. Connects optionally to data warehouses (Snowflake, BigQuery, Databricks, Redshift, PostgreSQL), notebook platforms (Hex, Jupyter), product analytics tools (Amplitude, Mixpanel), and project trackers (Jira, Confluence) via MCP servers.",
    skills_list: [
      {
        name: "analyze",
        description: "Answer data questions from quick lookups to full formal reports",
        type: "Invocable"
      },
      {
        name: "explore-data",
        description: "Profile a dataset's shape, quality, and patterns before analysis",
        type: "Invocable"
      },
      {
        name: "build-dashboard",
        description: "Build interactive HTML dashboards with KPI cards, charts, and filters",
        type: "Invocable"
      },
      {
        name: "create-viz",
        description: "Generate publication-quality Python visualizations",
        type: "Invocable"
      },
      {
        name: "validate-data",
        description: "QA an analysis for methodology, accuracy, and bias before sharing",
        type: "Invocable"
      },
      {
        name: "write-query",
        description: "Write optimized SQL for any dialect with performance notes",
        type: "Invocable"
      },
      {
        name: "data-context-extractor",
        description: "Generate company-specific data skills from analyst tribal knowledge",
        type: "Invocable"
      },
      {
        name: "sql-queries",
        description: "Reference library of SQL patterns, dialect syntax, and performance tips",
        type: "Reference"
      },
      {
        name: "data-visualization",
        description: "Chart selection guide, design principles, and Python code patterns",
        type: "Reference"
      },
      {
        name: "statistical-analysis",
        description: "Statistical methods, trend analysis, outlier detection, and hypothesis testing",
        type: "Reference"
      }
    ],
    install_steps: [
      "Method 1 — Browse (Anthropic plugins)"
    ]
  },
  {
    id: 3,
    slug: "equity-research",
    name: "Equity Research",
    author: "Anthropic FSI",
    description: "Produces the core deliverables of a sell-side equity research analyst — from first-time company coverage reports with full financial models, to fast-turnaround quarterly earnings updates, to daily mor",
    long_description: "Produces the core deliverables of a sell-side equity research analyst — from first-time company coverage reports with full financial models, to fast-turnaround quarterly earnings updates, to daily morning notes and investment idea screens. Each workflow follows institutional standards (JPMorgan, Goldman Sachs, Morgan Stanley format) and generates publication-ready Word documents, Excel models, and professional charts.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "0.1.0",
    category: "Capital Markets & Investment Research",
    industries: [
      "financial"
    ],
    functions: [
      "finance",
      "strategy",
      "data"
    ],
    use_cases: [
      {
        ask: "Create an initiating coverage report for CrowdStrike",
        returns: "A 5-task workflow producing a 6,000–8,000 word research document, 6-tab Excel financial model with 5-year projections, DCF and comparable company valuation, 25–35 professional charts, and a 30–50 page final report with embedded visuals."
      },
      {
        ask: "Write an earnings update for Nike's latest quarter",
        returns: "An 8–12 page earnings update report with beat/miss analysis, updated estimates (old vs. new), 8–12 embedded charts, thesis impact assessment, revised price target, and sources section with clickable hyperlinks to SEC filings and transcripts."
      },
      {
        ask: "Screen for undervalued mid-cap growth stocks in healthcare",
        returns: "A shortlist of 5–10 investment ideas with one-page summaries, valuation comparisons, thesis bullets, risk factors, and a prioritized research pipeline."
      }
    ],
    inputs: [
      {
        label: "Required:",
        detail: "Company name or ticker symbol (all skills)",
        required: false
      },
      {
        label: "Required:",
        detail: "Access to SEC EDGAR filings (for financial modeling and earnings analysis)",
        required: false
      },
      {
        label: "Optional:",
        detail: "Pre-extracted historical financials (.xlsx) for financial modeling",
        required: false
      },
      {
        label: "Optional:",
        detail: "Existing coverage universe list (for catalyst calendar and morning notes); Prior financial model for model updates",
        required: false
      }
    ],
    outputs: [
      {
        label: "Initiating coverage:",
        detail: "30–50 page Word report (.docx), 6-tab Excel financial model (.xlsx), 25–35 PNG charts in zip"
      },
      {
        label: "Earnings update:",
        detail: "8–12 page Word report (.docx) with 8–12 embedded charts"
      },
      {
        label: "Morning note:",
        detail: "1-page markdown or Word document"
      },
      {
        label: "Thesis tracker:",
        detail: "Structured markdown with scorecard and catalyst calendar"
      },
      {
        label: "Idea generation:",
        detail: "5–10 idea shortlist with comparison tables"
      },
      {
        label: "Sector overview:",
        detail: "Word or PowerPoint report with market sizing and competitive landscape"
      }
    ],
    how_it_works: [
      {
        title: "Real-time data verification",
        detail: "Every earnings analysis starts with a mandatory date-checking protocol that searches for the latest filings and cross-references release dates against transcript dates, preventing the most common analyst error: using stale data from training instead of current results."
      },
      {
        title: "Institutional report templating",
        detail: "Reports follow specific page-by-page structures modeled on top-tier investment bank formats, with standardized sections (beat/miss analysis, thesis assessment, valuation), professional chart placement, and required citation formats including clickable hyperlinks to source documents."
      },
      {
        title: "Bottom-up financial modeling",
        detail: "The Excel model builds revenue from 20–30 product line items and 15–20 geographic segments, flows through a 40–50 line item income statement, and connects to cash flow and balance sheet tabs with three scenario overlays (bull/base/bear)."
      },
      {
        title: "Integrated valuation framework",
        detail: "Combines discounted cash flow analysis with sensitivity tables, comparable company analysis using 5–10 peers with statistical summaries, and precedent transactions to arrive at a price target with explicit methodology disclosure."
      },
      {
        title: "Quality gates at every stage",
        detail: "Each skill includes verification checklists covering numerical accuracy, source citation completeness, formatting standards, and minimum content thresholds (word counts, chart counts, table counts), with red-flag detection for outdated data or missing prerequisites."
      }
    ],
    tools: "Works standalone using web search for company data, SEC EDGAR for filings, and Python (matplotlib, pandas, seaborn) for chart generation. No external API keys or data terminal subscriptions required. Enhanced with Bloomberg/FactSet/Refinitiv access if available through connected tools.",
    install_steps: [
      "Open the Claude Desktop app and switch to the Cowork tab",
      "Click Customize in the left sidebar, then Browse plugins",
      "Search for \"Equity Research\" and click Install"
    ]
  },
  {
    id: 4,
    slug: "finance",
    name: "Finance",
    author: "Anthropic",
    description: "Automate month-end close, journal entries, reconciliations, variance analysis, and SOX testing so your finance team closes faster and audits cleaner.",
    long_description: "This plugin handles the core workflows of a corporate accounting team: preparing journal entries, reconciling accounts, generating financial statements with variance analysis, managing the month-end close process, and supporting SOX 404 compliance testing. It works standalone from uploaded spreadsheets or pasted data, and becomes more powerful when connected to your ERP, data warehouse, or BI tools via MCP integrations.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "1.2.0",
    category: "Finance & Accounting",
    industries: [
      "financial",
      "retail",
      "cpg",
      "industrials",
      "tmt",
      "healthcare",
      "privatecapital"
    ],
    functions: [
      "finance",
      "risk",
      "operations"
    ],
    use_cases: [
      {
        ask: "Book AP accruals for December 2025",
        returns: "Formatted journal entry with debits, credits, department codes, supporting calculations, reversal flag, and a review checklist"
      },
      {
        ask: "Reconcile our bank account for March",
        returns: "Two-sided reconciliation showing adjusted bank and GL balances, categorized reconciling items with aging analysis, and escalation flags for stale items"
      },
      {
        ask: "Run SOX testing for revenue recognition Q4",
        returns: "Control matrix, risk-based sample selections, testing workpaper templates with pre-built test steps, and a deficiency classification framework"
      }
    ],
    inputs: [
      {
        label: "Trial balance or GL account data",
        detail: "paste, upload spreadsheet, or connect ERP",
        required: true
      },
      {
        label: "Prior period data for comparison, budget/forecast figures, bank statements, fixed asset registers, depreciation schedules, contract details for revenue recognition, and organization-specific materiality thresholds",
        detail: "",
        required: false
      }
    ],
    outputs: [
      {
        label: "Formatted journal entries with debits, credits, and supporting detail",
        detail: "Account reconciliation workpapers with categorized reconciling items"
      },
      {
        label: "Multi-column income statements with variance flags and key metrics",
        detail: "Waterfall variance decompositions with narrative explanations"
      },
      {
        label: "SOX control matrices, sample selections, and testing workpaper templates",
        detail: "Month-end close checklists with task sequencing and status tracking"
      }
    ],
    how_it_works: [
      {
        title: "Structured entry templates",
        detail: "Generates journal entries in standard accounting format with balanced debits and credits, department coding, and auto-reversal flags, so entries are audit-ready before they reach the reviewer."
      },
      {
        title: "Two-sided reconciliation",
        detail: "Compares GL balances against bank statements or subledgers from both directions, categorizes every reconciling item by type (timing, adjustment, investigation), and ages outstanding items to surface stale balances that need attention."
      },
      {
        title: "Variance decomposition",
        detail: "Breaks down financial variances into specific business drivers (volume, price, mix, timing, one-time) using standard analytical techniques, so leadership sees the \"why\" behind the numbers rather than just the gap."
      },
      {
        title: "Materiality-driven flagging",
        detail: "Applies configurable dollar and percentage thresholds to automatically highlight variances that warrant investigation, preventing both over-analysis of immaterial items and under-investigation of significant ones."
      },
      {
        title: "Risk-based sample selection",
        detail: "Calculates SOX testing sample sizes based on control frequency, risk level, and prior-year results, then generates random or targeted sample selections with full documentation of the selection methodology."
      },
      {
        title: "Close sequencing engine",
        detail: "Maps task dependencies across the entire month-end close process, identifies the critical path, and provides day-by-day checklists with status tracking so nothing falls through the cracks."
      }
    ],
    tools: "Works standalone from uploaded files or pasted data. Optionally connects to ERP/accounting systems (NetSuite, SAP), data warehouses (Snowflake, BigQuery, Databricks), spreadsheet tools, BI platforms (Tableau, Looker), email (Microsoft 365), and team chat (Slack) for automated data pulls and status updates.",
    skills_list: [
      {
        name: "journal-entry",
        description: "Prepare journal entries with debits, credits, and supporting detail for any standard entry type",
        type: "Invocable"
      },
      {
        name: "journal-entry-prep",
        description: "Best practices, standard accrual types, documentation requirements, and review workflows",
        type: "Reference"
      },
      {
        name: "reconciliation",
        description: "Account reconciliation methodology for GL-to-subledger, bank, and intercompany",
        type: "Invocable"
      },
      {
        name: "financial-statements",
        description: "Income statement, balance sheet, and cash flow generation with GAAP presentation",
        type: "Invocable"
      },
      {
        name: "variance-analysis",
        description: "Variance decomposition, waterfall analysis, and narrative generation",
        type: "Invocable"
      },
      {
        name: "sox-testing",
        description: "SOX 404 sample selections, testing workpapers, and control assessments",
        type: "Invocable"
      },
      {
        name: "close-management",
        description: "Month-end close checklists, task sequencing, dependencies, and status tracking",
        type: "Reference"
      },
      {
        name: "audit-support",
        description: "SOX 404 testing methodology, documentation standards, and deficiency classification",
        type: "Reference"
      }
    ],
    install_steps: [
      "Open the Claude Desktop app and switch to the Cowork tab",
      "Click Customize in the left sidebar, then Browse plugins",
      "Search for “Finance” and click Install"
    ]
  },
  {
    id: 5,
    slug: "financial-analysis",
    name: "Financial Analysis",
    author: "Anthropic FSI",
    description: "Build institutional-quality financial models — DCF, comps, LBO, and 3-statement — directly from data inputs and SEC filings.",
    long_description: "Automates the construction of professional financial models used in investment banking and equity research. Analysts can generate discounted cash flow valuations, comparable company analyses, leveraged buyout models, and integrated 3-statement models with live Excel formulas, sensitivity tables, and sourced cell comments. The plugin also includes presentation QC, data cleaning, and deck refresh tools for end-to-end deal workflow support.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: null,
    version: "0.1.0",
    category: "Finance & Investment Banking",
    industries: [],
    functions: [],
    use_cases: [
      {
        ask: "Build a DCF model for NVIDIA with bear/base/bull scenarios",
        returns: "Excel workbook with 5-year cash flow projections, WACC calculations, three sensitivity tables, and an implied share price with upside/downside to market"
      },
      {
        ask: "Run a comps analysis on cloud infrastructure companies — CrowdStrike, Datadog, Snowflake, Cloudflare",
        returns: "Formatted Excel with operating metrics, valuation multiples, and statistical benchmarks (median, quartiles) across all peers"
      },
      {
        ask: "Check my pitch deck for number consistency before the client meeting",
        returns: "Slide-by-slide QC report flagging conflicting figures, stale growth rates, and data-narrative misalignment"
      }
    ],
    inputs: [
      {
        label: "Excel template file (optional for LBO, 3-statement",
        detail: "uses built-in templates if not provided)",
        required: false
      },
      {
        label: "Historical financial data or SEC filing references (optional",
        detail: "fetches from web/MCP if not provided)",
        required: false
      }
    ],
    outputs: [
      {
        label: "Excel workbooks (.xlsx) with live formulas, color-coded inputs, sensitivity tables, and cell comments citing data sources",
        detail: ""
      },
      {
        label: "QC reports summarizing findings by category (number consistency, narrative alignment, language, formatting)",
        detail: ""
      },
      {
        label: "Refreshed presentation decks with updated figures across all slides",
        detail: ""
      }
    ],
    how_it_works: [
      {
        title: "Retrieves financial data from SEC filings, analyst reports, or connected data providers, then validates inputs against historical trends and cross-references before modeling begins.",
        detail: ""
      },
      {
        title: "Builds every projection, discount factor, and valuation output as a live Excel formula",
        detail: "never a pre-computed number — so the model updates automatically when any assumption changes."
      },
      {
        title: "Structures bear, base, and bull scenarios in separate assumption blocks, using conditional formulas that switch the entire model between cases from a single selector cell.",
        detail: ""
      },
      {
        title: "Generates sensitivity tables by programmatically writing full DCF recalculation formulas into each cell of a grid, showing how valuation changes across combinations of key assumptions.",
        detail: ""
      },
      {
        title: "Attaches source citations as cell comments to every hard-coded input, creating an audit trail that traces each number back to a specific filing, page, or data provider.",
        detail: ""
      }
    ],
    tools: "Works standalone with web search for financial data. Enhanced when connected to S&P Kensho MCP, FactSet MCP, or Daloopa MCP for institutional-grade data sourcing. Also works inside the Excel Office Add-in for live formula editing.",
    skills_list: [
      {
        name: "DCF Model",
        description: "Builds discounted cash flow valuations with WACC, terminal value, and sensitivity analysis",
        type: "Invocable"
      },
      {
        name: "Comps Analysis",
        description: "Constructs comparable company analyses with operating metrics and valuation multiples",
        type: "Invocable"
      },
      {
        name: "LBO Model",
        description: "Completes leveraged buyout model templates with debt schedules and returns analysis",
        type: "Invocable"
      },
      {
        name: "3-Statement Model",
        description: "Populates integrated income statement, balance sheet, and cash flow templates",
        type: "Invocable"
      },
      {
        name: "Competitive Analysis",
        description: "Builds competitive landscape presentation decks with market positioning and peer deep-dives",
        type: "Invocable"
      },
      {
        name: "Audit Spreadsheet",
        description: "Audits formulas for errors, inconsistencies, and financial model integrity",
        type: "Invocable"
      },
      {
        name: "Clean Data",
        description: "Cleans messy spreadsheet data — trims, fixes casing, converts types, removes duplicates",
        type: "Invocable"
      },
      {
        name: "IB Deck Checker",
        description: "Reviews investment banking presentations for consistency and alignment",
        type: "Invocable"
      },
      {
        name: "Deck Refresh",
        description: "Updates presentation figures across all slides, tables, charts, and footnotes",
        type: "Invocable"
      },
      {
        name: "PPT Template Creator",
        description: "Creates reusable PowerPoint template skills from user-provided templates",
        type: "Invocable"
      },
      {
        name: "Skill Creator",
        description: "Guide for creating new skills that extend the plugin's capabilities",
        type: "Reference-only"
      }
    ],
    install_steps: [
      "Open the Claude Desktop app and switch to Cowork",
      "Click Customize in the left sidebar, then Browse plugins",
      "Search for \"Financial Analysis\" and click Install"
    ]
  },
  {
    id: 6,
    slug: "human-resources",
    name: "Human Resources",
    author: "Anthropic",
    description: "Turn people operations into structured, audit-ready deliverables — from offer letters and onboarding plans to compensation benchmarks and calibration packages.",
    long_description: "The Human Resources plugin handles the full people operations lifecycle. It drafts offer letters with complete compensation packages and negotiation guidance, generates onboarding checklists with day-by-day schedules, structures performance reviews with self-assessment templates and calibration documents, benchmarks compensation against market data, and produces workforce analytics reports covering headcount, attrition, and diversity. Every deliverable follows a consistent, professional format ready for leadership review.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "1.2.0",
    category: "Human Resources & People Operations",
    industries: [
      "financial",
      "retail",
      "cpg",
      "industrials",
      "tmt",
      "healthcare"
    ],
    functions: [
      "people",
      "operations"
    ],
    use_cases: [
      {
        ask: "What should we pay a Senior Product Manager in Austin?",
        returns: "Percentile-banded compensation table with base, equity, and total comp benchmarks, location adjustment, and retention risk flags"
      },
      {
        ask: "Prep calibration for my team's H1 performance reviews",
        returns: "Rating distribution table, promotion candidates with evidence, compensation action recommendations, and discussion points for borderline cases"
      },
      {
        ask: "Generate a headcount and attrition report from this employee data",
        returns: "Executive summary with key metrics, department-level breakdown, turnover trends, flight risk indicators, and data-driven retention recommendations"
      }
    ],
    inputs: [
      {
        label: "Role details",
        detail: "(required for offers and comp) — title, level, location, hiring manager",
        required: false
      },
      {
        label: "Compensation parameters",
        detail: "(required for offers, optional for comp) — base salary, equity, signing bonus, vesting schedule",
        required: false
      },
      {
        label: "Employee data file —",
        detail: "CSV or spreadsheet with names, departments, titles, levels, start dates, compensation, demographics",
        required: false
      },
      {
        label: "Review context —",
        detail: "review period, employee accomplishments, goals from prior cycle",
        required: false
      },
      {
        label: "Policy documents —",
        detail: "employee handbook text or connected knowledge base for policy lookup",
        required: false
      }
    ],
    outputs: [
      {
        label: "Offer letters",
        detail: "complete draft with compensation table, terms, benefits summary, and hiring manager negotiation notes"
      },
      {
        label: "Onboarding plans",
        detail: "pre-start checklist, Day 1 schedule, Week 1 tasks, 30/60/90-day goals, key contacts, and tool access matrix"
      },
      {
        label: "Performance reviews",
        detail: "self-assessment templates, manager review forms with behavioral examples, and calibration packages with rating distributions"
      },
      {
        label: "Compensation analysis",
        detail: "market benchmark tables at four percentile bands, band placement analysis, outlier flags, and equity modeling"
      },
      {
        label: "People reports",
        detail: "executive summaries with key metrics, departmental breakdowns, trend analysis, and action recommendations"
      }
    ],
    how_it_works: [
      {
        title: "Role-aware compensation framing",
        detail: "Structures every compensation discussion around total comp (base, equity, bonus, benefits) rather than just salary, ensuring candidates and managers see the full picture."
      },
      {
        title: "Competency-mapped interview design",
        detail: "Maps each interview question to a specific skill or behavior the role requires, then scores them on a consistent rubric so hiring decisions are based on evidence rather than gut feel."
      },
      {
        title: "Calibration-ready review packaging",
        detail: "Bundles individual performance assessments into a team-level view with rating distributions and promotion cases, so managers walk into calibration meetings prepared."
      },
      {
        title: "Structured onboarding sequencing",
        detail: "Breaks the new hire experience into timed phases (pre-start, Day 1, Week 1, 30/60/90 days) with owner assignments, ensuring nothing falls through the cracks."
      },
      {
        title: "Multi-dimension workforce analytics",
        detail: "Slices employee data across departments, levels, tenure, and demographics simultaneously, surfacing patterns (like attrition clustering in a specific team) that single-dimension reports miss."
      }
    ],
    tools: "Works entirely standalone — provide details manually or upload data files. Optionally connects to HRIS systems (Workday, BambooHR, Rippling) for live employee data, applicant tracking systems (Greenhouse, Lever, Ashby) for pipeline management, compensation platforms (Pave, Radford) for verified benchmarks, knowledge bases (Notion, Confluence) for policy documents, and communication tools (Slack, Gmail, Calendar) for candidate coordination and scheduling.",
    skills_list: [
      {
        name: "comp-analysis",
        description: "Benchmark compensation against market data with percentile bands, band placement, and equity modeling",
        type: "Invocable"
      },
      {
        name: "draft-offer",
        description: "Draft complete offer letters with compensation tables, terms, and negotiation guidance",
        type: "Invocable"
      },
      {
        name: "interview-prep",
        description: "Create structured interview plans with competency-mapped questions and scoring rubrics",
        type: "Reference"
      },
      {
        name: "onboarding",
        description: "Generate phased onboarding plans with checklists, schedules, and goal-setting",
        type: "Invocable"
      },
      {
        name: "org-planning",
        description: "Model headcount plans, org structure, and team design with cost analysis",
        type: "Reference"
      },
      {
        name: "people-report",
        description: "Produce workforce analytics reports on headcount, attrition, diversity, and org health",
        type: "Invocable"
      },
      {
        name: "performance-review",
        description: "Structure reviews with self-assessments, manager templates, and calibration packages",
        type: "Invocable"
      },
      {
        name: "policy-lookup",
        description: "Search and explain company policies in plain language from connected knowledge bases",
        type: "Invocable"
      },
      {
        name: "recruiting-pipeline",
        description: "Track candidates through pipeline stages with conversion metrics",
        type: "Reference"
      }
    ],
    install_steps: [
      "This plugin is available through the Anthropic open-source repository and can also be installed via direct upload."
    ]
  },
  {
    id: 7,
    slug: "investment-banking",
    name: "Investment Banking",
    author: "Unknown",
    description: "Accelerate sell-side and buy-side deal execution with automated CIMs, merger models, buyer lists, and pitch materials.",
    long_description: "The Investment Banking plugin handles the core document and analytical workstreams of M&A advisory. It drafts confidential information memorandums, builds accretion/dilution merger models, generates tiered buyer universes with contact mapping, and creates anonymous teasers and process letters. It also tracks deal pipelines across stages from mandate through close, and populates pitch deck templates with financial data. The plugin works standalone from uploaded financials, company descriptions, and deal parameters. It produces Word documents, Excel workbooks, and PowerPoint files that follow investment banking formatting conventions.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "0.2.0",
    category: "Investment Banking & Deal Advisory",
    industries: [
      "financial",
      "privatecapital"
    ],
    functions: [
      "finance",
      "ma",
      "strategy"
    ],
    use_cases: [
      {
        ask: "Draft a CIM for our $200M specialty chemicals client being marketed to strategic and financial buyers.",
        returns: "A 40-60 page Word document with executive summary, business overview, industry analysis, growth opportunities, customer profile, operations summary, and detailed financial overview with charts."
      },
      {
        ask: "Build a merger model for Acquirer Corp buying Target Inc at a 25% premium, 60/40 cash-stock split, with $50M of expected synergies.",
        returns: "An Excel workbook with assumptions, sources & uses, pro forma income statement, accretion/dilution summary, sensitivity tables on premium vs. synergies and cash/stock mix, and breakeven synergy analysis."
      },
      {
        ask: "Create a buyer list for a $150M revenue industrial services platform. Focus on strategics with bolt-on appetite and PE firms with sector platforms.",
        returns: "An Excel workbook with tiered strategic buyers (competitors, adjacents, vertical integrators, platform builders), financial sponsors with portfolio overlap, Tier 1 contact mapping, and a one-page buyer universe summary."
      }
    ],
    inputs: [
      {
        label: "Company financials",
        detail: "Historical income statement, balance sheet, and cash flow data. Accepts Excel, CSV, or described in text. 3-5 years preferred.",
        required: true
      },
      {
        label: "Company description",
        detail: "Business model, products/services, market position, geographic footprint, and key selling points.",
        required: true
      },
      {
        label: "Deal parameters (required for merger model)",
        detail: "Offer price or premium, consideration mix, synergy estimates, financing terms, and expected close date.",
        required: false
      },
      {
        label: "PowerPoint template (required for pitch deck)",
        detail: "Branded .pptx template with placeholder slides to populate with financial data and market analysis.",
        required: false
      },
      {
        label: "Buyer preferences",
        detail: "Seller preferences on strategic vs. financial buyers, excluded parties, geographic constraints, and timeline.",
        required: false
      },
      {
        label: "Management presentations and board decks",
        detail: "Supplementary materials for richer CIM drafting and deeper context.",
        required: false
      }
    ],
    outputs: [
      {
        label: "CIM (.docx)",
        detail: "40-60 page Word document with executive summary, 7 chapters, embedded charts, and financial appendix."
      },
      {
        label: "Merger model (.xlsx)",
        detail: "Multi-tab Excel workbook with formulas for accretion/dilution, sources & uses, pro forma financials, and sensitivity tables."
      },
      {
        label: "Buyer list (.xlsx)",
        detail: "Tiered buyer universe with strategic and financial tabs, contact mapping, and summary statistics."
      },
      {
        label: "Teaser (.docx)",
        detail: "One-page anonymized company profile with financial highlights, suitable for pre-NDA distribution."
      },
      {
        label: "Process letter (.docx)",
        detail: "Bid instructions covering IOI requirements, final bid procedures, or management meeting logistics."
      },
      {
        label: "Deal tracker (.xlsx)",
        detail: "Pipeline workbook with milestone tracking, action items, and weekly review summaries."
      },
      {
        label: "Data pack (.xlsx)",
        detail: "8-tab standardized financial workbook with formulas, formatting, and investment committee-ready presentation."
      },
      {
        label: "Pitch deck (.pptx)",
        detail: "Populated template with financial tables, charts, market data, and formatting per IB conventions."
      },
      {
        label: "Strip profile (.pptx)",
        detail: "1-4 slide company profiles with quadrant layouts, charts, and brand-colored accents."
      }
    ],
    how_it_works: [
      {
        title: "Mechanism",
        detail: ""
      },
      {
        title: "Structured financial extraction",
        detail: "Reads uploaded financials and normalizes line items into consistent formats across all periods, catching accounting changes and ensuring data integrity before any analysis begins."
      },
      {
        title: "Investment banking document frameworks",
        detail: "Each skill follows the standard IB document structure (CIM chapters, merger model tabs, process letter sections) so outputs match what analysts would produce manually."
      },
      {
        title: "Tiered buyer classification",
        detail: "Categorizes potential acquirers into strategic types (competitors, adjacents, vertical integrators, platform builders) and financial types (platform, bolt-on, growth equity), then ranks them into contact priority tiers."
      },
      {
        title: "Formula-driven sensitivity analysis",
        detail: "Merger models use live Excel formulas rather than hardcoded values, allowing buyers and bankers to adjust assumptions and see accretion/dilution impact in real time."
      },
      {
        title: "Anonymization safeguards",
        detail: "Teasers are checked against a disclosure filter that removes company names, specific cities, named customers, and distinctive employee counts to prevent inadvertent identification."
      },
      {
        title: "Template-aware slide population",
        detail: "Pitch deck generation reads the existing PowerPoint template structure, identifies placeholder areas, and populates them with formatted tables, charts, and sourced data while preserving brand styling."
      }
    ],
    tools: "The plugin works entirely standalone with no external API connections or MCP servers required. All inputs come from uploaded files or text descriptions provided in conversation. It uses the docx npm package for Word documents, openpyxl/pandas for Excel workbooks, and PptxGenJS for PowerPoint presentations. Web search is available for researching public company data, market sizing, and brand colors when creating strip profiles.",
    skills_list: [
      {
        name: "cim-builder",
        description: "Drafts a full Confidential Information Memorandum with 8 chapters, financial charts, and professional formatting.",
        type: "Invocable"
      },
      {
        name: "teaser",
        description: "Creates anonymous one-page company teasers with anonymization safeguards.",
        type: "Invocable"
      },
      {
        name: "process-letter",
        description: "Drafts IOI instructions, final bid letters, and management meeting invitations.",
        type: "Invocable"
      },
      {
        name: "buyer-list",
        description: "Builds tiered buyer universes with strategic and financial categorization and contact mapping.",
        type: "Invocable"
      },
      {
        name: "datapack-builder",
        description: "Transforms financial data from multiple sources into standardized 8-tab investment committee workbooks.",
        type: "Invocable"
      },
      {
        name: "merger-model",
        description: "Builds accretion/dilution models with pro forma financials, sensitivity tables, and breakeven analysis.",
        type: "Invocable"
      },
      {
        name: "deal-tracker",
        description: "Tracks deal pipelines with milestones, action items, and weekly review summaries.",
        type: "Invocable"
      },
      {
        name: "strip-profile",
        description: "Creates information-dense company profile slides with quadrant layouts and charts.",
        type: "Invocable"
      },
      {
        name: "pitch-deck",
        description: "Populates existing PowerPoint templates with financial data, tables, and charts.",
        type: "Invocable"
      }
    ],
    install_steps: [
      "Open the Claude Desktop app and switch to the Cowork tab.",
      "Click Customize in the left sidebar, then Browse plugins.",
      "Search for \"Investment Banking\" and click Install."
    ]
  },
  {
    id: 8,
    slug: "legal",
    name: "Legal",
    author: "Unknown",
    description: "Automates contract review, NDA triage, compliance checks, and legal briefings so in-house counsel can focus on judgment calls.",
    long_description: "The Legal plugin turns contract review, NDA screening, and compliance checks into structured, repeatable workflows for in-house legal teams. Instead of starting from scratch on every agreement, counsel reviews AI-generated analysis anchored to their own negotiation playbook and risk framework. The plugin also consolidates vendor agreement status, generates legal briefings from connected tools, and produces templated responses with built-in escalation safeguards.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "1.2.0",
    category: "Legal & Compliance",
    industries: [
      "financial",
      "retail",
      "cpg",
      "industrials",
      "tmt",
      "healthcare",
      "privatecapital"
    ],
    functions: [
      "legal",
      "risk",
      "operations"
    ],
    use_cases: [
      {
        ask: "Review this vendor MSA and flag anything outside our playbook",
        returns: "Clause-by-clause analysis with GREEN/YELLOW/RED ratings, specific redline language, negotiation strategy, and business impact summary"
      },
      {
        ask: "Triage this NDA from the sales team — can we sign as-is?",
        returns: "Screening report classifying the NDA as GREEN (approve), YELLOW (counsel review), or RED (reject/counter), with specific issues flagged and suggested fixes"
      },
      {
        ask: "Run a compliance check on launching biometric login in our EU app",
        returns: "Applicable regulations mapped (GDPR, ePrivacy), requirements checklist with status, risk areas ranked by severity, and recommended approvals"
      }
    ],
    inputs: [
      {
        label: "Contract or NDA document",
        detail: "PDF, DOCX, or pasted text for review and triage skills",
        required: true
      },
      {
        label: "Negotiation playbook",
        detail: "Organization-specific standard positions, acceptable ranges, and escalation triggers configured in a local settings file",
        required: false
      },
      {
        label: "Business context",
        detail: "Your side of the deal, deadline, focus areas, and deal size to tailor analysis",
        required: false
      },
      {
        label: "Initiative description (required for compliance)",
        detail: "Plain-language description of a proposed action, feature, or campaign to check against regulations",
        required: false
      },
      {
        label: "Vendor name (required for vendor check)",
        detail: "Company name to search across connected systems",
        required: false
      }
    ],
    outputs: [
      {
        label: "Contract review report",
        detail: "Clause-by-clause analysis with deviation flags, specific redline language, fallback positions, and a negotiation strategy organized by priority tier"
      },
      {
        label: "NDA triage report",
        detail: "Screening checklist results, GREEN/YELLOW/RED classification, flagged issues with suggested fixes, and routing recommendation"
      },
      {
        label: "Compliance assessment",
        detail: "Regulation-to-requirement mapping, requirements checklist, risk matrix, approval chain, and recommended actions"
      },
      {
        label: "Risk assessment memo",
        detail: "Formal risk memo with severity-by-likelihood scoring, mitigation options, residual risk estimate, and monitoring plan"
      },
      {
        label: "Legal briefings",
        detail: "Structured daily, topic, or incident briefings compiled from connected sources with action items"
      },
      {
        label: "Templated responses",
        detail: "Customized legal responses for data subject requests, discovery holds, vendor inquiries, NDA requests, and subpoenas"
      }
    ],
    how_it_works: [
      {
        title: "Playbook-anchored review",
        detail: "Every contract clause is compared against your organization’s own standard positions, acceptable ranges, and escalation triggers — so the output reflects your risk appetite, not generic advice."
      },
      {
        title: "Three-tier triage classification",
        detail: "Incoming NDAs and contract clauses are classified GREEN, YELLOW, or RED, giving reviewers an instant priority map and clear routing for signature, counsel review, or rejection."
      },
      {
        title: "Regulation-aware compliance mapping",
        detail: "Proposed business actions are matched against applicable privacy and data-protection regulations (GDPR, CCPA, PIPL, and others) with jurisdiction-specific requirements and timelines."
      },
      {
        title: "Structured risk scoring",
        detail: "Legal risks are scored on a severity-times-likelihood matrix (1–25) with defined escalation paths, so the team applies a consistent framework instead of ad-hoc judgment."
      },
      {
        title: "Multi-source context gathering",
        detail: "Briefings and vendor checks pull from email, calendar, chat, document storage, and CLM simultaneously, assembling a single view that would otherwise require manual searches across systems."
      },
      {
        title: "Escalation-gated templating",
        detail: "Templated legal responses include built-in escalation triggers that block the template and route to counsel when the situation is too complex or sensitive for a standard reply."
      }
    ],
    tools: "Works standalone with uploaded documents and user-provided context. Connects optionally to Slack, Gmail, Google Calendar, Box, Egnyte, Microsoft 365, Atlassian (Jira/Confluence), DocuSign, and CLM or CRM systems via MCP. When tools are not connected, the plugin notes gaps and suggests manual checks.",
    skills_list: [
      {
        name: "review-contract",
        description: "Review contracts clause-by-clause against your negotiation playbook",
        type: "Invocable"
      },
      {
        name: "triage-nda",
        description: "Screen incoming NDAs and classify as GREEN/YELLOW/RED for routing",
        type: "Invocable"
      },
      {
        name: "compliance-check",
        description: "Check proposed actions against applicable regulations and flag requirements",
        type: "Invocable"
      },
      {
        name: "legal-risk-assessment",
        description: "Score legal risks on a severity-by-likelihood matrix with escalation paths",
        type: "Invocable"
      },
      {
        name: "brief",
        description: "Generate daily, topic, or incident briefings from connected sources",
        type: "Invocable"
      },
      {
        name: "meeting-briefing",
        description: "Prepare structured meeting briefings with legal context and action tracking",
        type: "Invocable"
      },
      {
        name: "legal-response",
        description: "Generate templated responses with escalation gates for common inquiries",
        type: "Invocable"
      },
      {
        name: "vendor-check",
        description: "Consolidate vendor agreement status and gap analysis across systems",
        type: "Invocable"
      },
      {
        name: "signature-request",
        description: "Run pre-signature checklists and route documents for e-signature",
        type: "Invocable"
      }
    ],
    install_steps: [
      "Open the Claude Desktop app and switch to the Cowork tab",
      "Click Customize in the left sidebar, then Browse plugins",
      "Search for \"Legal\" and click Install"
    ]
  },
  {
    id: 9,
    slug: "marketing",
    name: "Marketing",
    author: "Unknown",
    description: "Turn campaign goals into structured plans, performance data into executive insights, and audience briefs into production-ready email sequences — all from a single plugin.",
    long_description: "The Marketing plugin handles end-to-end marketing workflows: planning multi-week campaigns with audience targeting and budget allocation, drafting channel-specific content (blog posts, social media, landing pages, press releases, email sequences), reviewing drafts against brand voice and compliance standards, researching competitors for positioning and battlecard creation, building performance reports with trend analysis and prioritized recommendations, and running SEO audits with keyword gap analysis. It works standalone using web research, and integrates with connected tools (HubSpot, Ahrefs, Klaviyo, Slack, and others) when available.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "1.2.0",
    category: "Marketing & Content",
    industries: [
      "retail",
      "cpg",
      "tmt",
      "travel",
      "healthcare"
    ],
    functions: [
      "marketing",
      "sales",
      "strategy"
    ],
    use_cases: [
      {
        ask: "Create a 6-week campaign plan to drive 2,000 signups for our AI wellness product targeting HR leaders, with a $45K budget",
        returns: "A 10-section campaign brief covering audience profiling, channel strategy, week-by-week content calendar, budget breakdown, success metrics, and risk mitigation"
      },
      {
        ask: "Here’s 8 weeks of channel data — build me a performance report with recommendations",
        returns: "Executive summary, KPI dashboard, channel-by-channel trend analysis, anomaly flagging, a 2×2 prioritization matrix, and next-period targets"
      },
      {
        ask: "Design a 6-email lead nurture sequence to convert free trial users to paid subscribers within 21 days",
        returns: "Full email copy for each message, subject line variants, a branching flow diagram, exit conditions, A/B test suggestions, and performance benchmarks"
      }
    ],
    inputs: [
      {
        label: "•  Performance data",
        detail: "spreadsheets, CSV, or pasted metrics (required for reporting)",
        required: false
      },
      {
        label: "•  Brand voice guidelines or style guide (optional",
        detail: "enhances all outputs)",
        required: false
      },
      {
        label: "•  Competitor names or URLs (optional",
        detail: "for competitive briefs and SEO audits)",
        required: false
      }
    ],
    outputs: [
      {
        label: "•  Campaign briefs with structured sections, content calendars, and budget tables",
        detail: ""
      },
      {
        label: "•  Channel-specific content drafts: blog posts, social media, emails, landing pages, press releases, and case studies",
        detail: ""
      },
      {
        label: "•  Performance reports with KPI dashboards, trend analysis, and prioritized action plans",
        detail: ""
      },
      {
        label: "•  Email sequences with full copy, branching logic diagrams, and A/B testing plans",
        detail: ""
      },
      {
        label: "•  Competitive briefs with positioning maps, messaging matrices, and sales battlecards",
        detail: ""
      },
      {
        label: "•  SEO audits with keyword tables, on-page issue logs, and quick-win action plans",
        detail: ""
      }
    ],
    how_it_works: [
      {
        title: "Structured intake gathering",
        detail: "Each skill collects specific inputs (goals, audiences, data, constraints) before producing anything, so the output is tailored rather than generic."
      },
      {
        title: "Framework-driven analysis",
        detail: "Campaign plans use a five-part framework (Objective, Audience, Message, Channel, Measure); performance reports follow a funnel-stage optimization model; competitive briefs use narrative and positioning analysis. These frameworks ensure consistent, comprehensive coverage."
      },
      {
        title: "Channel-specific content templates",
        detail: "Content drafts follow proven structures for each format (blog, email, landing page, press release, social) with channel-appropriate length, tone, CTAs, and SEO considerations."
      },
      {
        title: "Brand voice enforcement",
        detail: "A dedicated brand review skill evaluates content against voice attributes, terminology standards, and compliance requirements, flagging deviations by severity with before/after fixes."
      },
      {
        title: "Benchmark-calibrated recommendations",
        detail: "Performance reports and SEO audits compare results against industry benchmarks and use impact/effort prioritization matrices, so recommendations are actionable rather than theoretical."
      },
      {
        title: "Lifecycle email architecture",
        detail: "Email sequences include branching logic, exit conditions, suppression rules, and engagement-based path selection — the full automation logic needed to configure a sequence in any email platform."
      }
    ],
    tools: "Works standalone using web research for competitor analysis, SEO insights, and market context. Connects to HubSpot or Marketo for campaign data and lead scoring, Ahrefs or Semrush for keyword rankings and backlink data, Klaviyo or Mailchimp for email sequence setup, Amplitude or Mixpanel for product analytics, Slack for team sharing, Canva and Figma for design asset references, and Notion for briefs and style guides. All skills produce usable output without any connected tools.",
    skills_list: [
      {
        name: "campaign-plan",
        description: "Generate campaign briefs with audience, messaging, channels, calendar, budget, and KPIs",
        type: "Invocable"
      },
      {
        name: "draft-content",
        description: "Draft blog posts, social media, emails, landing pages, press releases, and case studies",
        type: "Invocable"
      },
      {
        name: "brand-review",
        description: "Audit content against brand voice, terminology, style guide, and compliance standards",
        type: "Invocable"
      },
      {
        name: "competitive-brief",
        description: "Research competitors and produce positioning analysis, messaging matrices, and battlecards",
        type: "Invocable"
      },
      {
        name: "email-sequence",
        description: "Design multi-email sequences with full copy, branching logic, and performance benchmarks",
        type: "Invocable"
      },
      {
        name: "performance-report",
        description: "Build performance reports with KPI dashboards, trend analysis, and optimization plans",
        type: "Invocable"
      },
      {
        name: "seo-audit",
        description: "Run keyword research, on-page audits, content gap analysis, and competitor SEO comparison",
        type: "Invocable"
      },
      {
        name: "content-creation",
        description: "Reference library of content templates, SEO fundamentals, headline formulas, and CTA best practices",
        type: "Reference"
      }
    ],
    install_steps: [
      "Open the Claude Desktop app and switch to the Cowork tab",
      "Click Customize in the left sidebar, then Browse plugins",
      "Search for \"Marketing\" and click Install"
    ]
  },
  {
    id: 10,
    slug: "operations",
    name: "Operations",
    author: "Anthropic",
    description: "Turn operational chaos into structured processes, plans, and reports your team can actually follow.",
    long_description: "Helps operations teams document processes, review vendors, plan capacity, track compliance, manage changes, and report status — all from a single plugin. Works standalone with your descriptions and uploads, or connects to project trackers, knowledge bases, and IT service management tools for richer, automated output.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "1.2.0",
    category: "Business Operations",
    industries: [
      "retail",
      "cpg",
      "industrials",
      "logistics",
      "tmt",
      "healthcare"
    ],
    functions: [
      "operations",
      "procurement",
      "strategy"
    ],
    use_cases: [
      {
        ask: "You ask...",
        returns: "You get..."
      },
      {
        ask: "Review this vendor proposal and tell me if we should renew",
        returns: "Cost analysis with total cost of ownership, risk flags, negotiation leverage points, and a proceed/negotiate/pass recommendation"
      },
      {
        ask: "Document our employee offboarding process",
        returns: "Complete SOP with RACI matrix, step-by-step procedures, exception handling, and process metrics"
      },
      {
        ask: "How's our team's capacity looking for next quarter?",
        returns: "Utilization analysis per person, bottleneck identification, upcoming demand gaps, and hire-or-deprioritize scenarios"
      }
    ],
    inputs: [
      {
        label: "Process descriptions",
        detail: "Verbal walkthrough or existing documentation (.docx, .md, .pdf) — optional",
        required: false
      },
      {
        label: "Vendor proposals or contracts",
        detail: "Pricing, terms, SLAs in any document format — optional, for vendor reviews",
        required: false
      },
      {
        label: "Team and workload data",
        detail: "Headcount, roles, current assignments (.xlsx, verbal) — optional, for capacity planning",
        required: false
      },
      {
        label: "Project updates and KPIs",
        detail: "Status, metrics, risks — optional, for status reports",
        required: false
      }
    ],
    outputs: [
      {
        label: "Standard operating procedures",
        detail: "Step-by-step process documents with RACI matrices, flowcharts, exception handling, and metrics"
      },
      {
        label: "Vendor evaluations",
        detail: "Cost breakdowns with total cost of ownership, risk registers, strengths/concerns, and negotiation points"
      },
      {
        label: "Capacity plans",
        detail: "Utilization tables by person, demand forecasts, bottleneck flags, and hire-or-deprioritize scenarios"
      },
      {
        label: "Change requests",
        detail: "Impact analysis, risk assessment, implementation timeline, communication plan, and rollback procedures"
      },
      {
        label: "Runbooks",
        detail: "Repeatable step-by-step procedures with troubleshooting guides, escalation paths, and verification checklists"
      },
      {
        label: "Status reports",
        detail: "Executive summaries with KPI dashboards, risk tables, decision requests, and next-period priorities"
      }
    ],
    how_it_works: [
      {
        title: "Structured frameworks for every deliverable",
        detail: "Each skill applies a proven operational framework — assess-plan-execute-sustain for changes, total cost of ownership for vendors, likelihood-impact matrices for risks — so outputs follow industry best practice rather than ad hoc formatting."
      },
      {
        title: "Scenario-based capacity modeling",
        detail: "Resource plans include multiple what-if scenarios (do nothing, hire, deprioritize) with utilization targets calibrated by role type, so leaders can compare trade-offs side by side."
      },
      {
        title: "Edge case and exception capture",
        detail: "Process documentation explicitly prompts for and documents the unusual scenarios that informal knowledge transfer misses — the situations that cause the most confusion."
      }
    ],
    tools: "Works entirely standalone — describe your situation and get a complete deliverable. Optionally connects to IT service management tools (ServiceNow, Zendesk), project trackers (Asana, Jira), knowledge bases (Notion, Confluence), chat platforms (Slack, Teams), calendars, email, and procurement systems to pull data automatically instead of manual input.",
    skills_list: [
      {
        name: "vendor-review",
        description: "Evaluate a vendor with cost analysis, risk assessment, and renewal recommendation",
        type: "Invocable"
      },
      {
        name: "process-doc",
        description: "Document a business process with flowcharts, RACI matrices, and SOPs",
        type: "Invocable"
      },
      {
        name: "change-request",
        description: "Create a change management request with impact analysis and rollback plan",
        type: "Invocable"
      },
      {
        name: "capacity-plan",
        description: "Plan resource capacity with workload analysis and utilization forecasting",
        type: "Invocable"
      },
      {
        name: "status-report",
        description: "Generate a status report with KPIs, risks, and action items",
        type: "Invocable"
      },
      {
        name: "runbook",
        description: "Create operational runbooks with step-by-step procedures and troubleshooting",
        type: "Invocable"
      },
      {
        name: "process-optimization",
        description: "Analyze and improve business processes, identifying bottlenecks and waste",
        type: "Reference"
      },
      {
        name: "risk-assessment",
        description: "Identify, assess, and mitigate operational risks with prioritized registers",
        type: "Reference"
      },
      {
        name: "compliance-tracking",
        description: "Track compliance requirements, audit readiness, and regulatory deadlines",
        type: "Reference"
      }
    ],
    install_steps: [
      "Method 1 — Browse (Anthropic Plugin Catalog)",
      "Open the Claude Desktop app and switch to the Cowork tab",
      "Click Customize in the left sidebar, then Browse plugins",
      "Search for \"Operations\" and click Install",
      "Visit github.com/anthropics/knowledge-work-plugins",
      "Download the operations plugin folder or .skill file",
      "In Cowork, click Customize → Upload plugin and select the downloaded file"
    ]
  },
  {
    id: 11,
    slug: "private-equity",
    name: "Private Equity",
    author: "Unknown",
    description: "This plugin covers the entire private equity workflow: finding and evaluating deals, running due diligence, modeling returns, writing investment committee memos, and managing portfolio companies after",
    long_description: "This plugin covers the entire private equity workflow: finding and evaluating deals, running due diligence, modeling returns, writing investment committee memos, and managing portfolio companies after acquisition. It works from uploaded files — CIMs, financial packages, data room documents — or from web research when sourcing new targets. Each skill produces a specific deliverable (screening memo, DD checklist, returns model, value creation plan) rather than general analysis, so outputs are ready for partners and investment committees with light editing.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "0.1.0",
    category: "Private Equity & Deal Management",
    industries: [
      "financial",
      "privatecapital"
    ],
    functions: [
      "finance",
      "ma",
      "strategy"
    ],
    use_cases: [
      {
        ask: "Screen this CIM — is it worth a first call?",
        returns: "One-page screening memo with pass/fail criteria table, bull/bear cases, and first-call questions"
      },
      {
        ask: "Model returns at 8x entry, 5% growth, 4x leverage",
        returns: "Excel workbook with base/bull/bear IRR and MOIC, two-way sensitivity tables, and returns attribution waterfall"
      },
      {
        ask: "Build the 100-day plan for this acquisition",
        returns: "Value creation roadmap with EBITDA bridge, phased action plan, KPI dashboard, and owner accountability matrix"
      }
    ],
    inputs: [
      {
        label: "Deal materials",
        detail: "CIMs, teasers, broker packages (PDF, Word, or PowerPoint). Required for deal screening and IC memos.",
        required: false
      },
      {
        label: "Financial packages",
        detail: "monthly or quarterly reporting workbooks (Excel or CSV). Required for portfolio monitoring and unit economics.",
        required: false
      },
      {
        label: "Deal parameters",
        detail: "entry EBITDA, valuation, leverage, growth assumptions. Required for returns analysis.",
        required: false
      },
      {
        label: "Sector and size criteria",
        detail: "target sector, geography, revenue range, EBITDA floor. Optional for deal sourcing.",
        required: false
      }
    ],
    outputs: [
      {
        label: "Screening memos",
        detail: "one-page pass/fail assessments with criteria tables and risk summaries"
      },
      {
        label: "Excel workbooks",
        detail: "returns sensitivity tables, DD trackers, unit economics dashboards, and portfolio monitoring reports"
      },
      {
        label: "Word documents",
        detail: "IC memos, value creation plans, meeting prep docs, and AI readiness reports"
      },
      {
        label: "Company shortlists",
        detail: "sourced targets with personalized founder outreach emails"
      }
    ],
    how_it_works: [
      {
        title: "Structured extraction from deal documents",
        detail: "pulls financials, deal terms, customer data, and risk factors from CIMs and teasers so the screening and IC memo skills have clean inputs to work from"
      },
      {
        title: "Pass/fail investment criteria framework",
        detail: "scores each deal against the fund’s specific thresholds (revenue range, margins, sector, valuation) so partners see a clear verdict, not just analysis"
      },
      {
        title: "Multi-scenario returns modeling",
        detail: "builds sensitivity tables that vary entry multiple, leverage, exit timing, and growth simultaneously so the deal team can stress-test assumptions in minutes"
      },
      {
        title: "Sector-tailored due diligence generation",
        detail: "adds workstream items specific to the target’s industry (reimbursement risk for healthcare, SOC2 for software) so nothing sector-critical gets missed"
      },
      {
        title: "EBITDA bridge construction",
        detail: "maps every value creation lever to dollar impact by year so operating partners have a quantified execution roadmap, not a generic strategy slide"
      },
      {
        title: "Portfolio-wide opportunity stacking",
        detail: "ranks AI and operational improvements across all portfolio companies by dollar impact so the operating team deploys resources where the math is biggest"
      }
    ],
    tools: "Works standalone from uploaded files and web research. No external API connections are required. When connected, can integrate with CRM systems, email (Gmail), and Slack for deal sourcing relationship checks and outreach drafting. Data rooms and file storage (SharePoint, Google Drive) enhance portfolio monitoring and AI readiness scans.",
    skills_list: [
      {
        name: "Deal Sourcing",
        description: "Discover target companies by sector and criteria, check CRM for existing relationships, draft personalized founder outreach",
        type: "Invocable"
      },
      {
        name: "Deal Screening",
        description: "Screen inbound CIMs and teasers against fund criteria with pass/fail framework and one-page screening memo",
        type: "Invocable"
      },
      {
        name: "Due Diligence Checklist",
        description: "Generate sector-tailored DD checklists across all workstreams with status tracking and red flag escalation",
        type: "Invocable"
      },
      {
        name: "DD Meeting Prep",
        description: "Prepare targeted questions, benchmarks, and red flags for management presentations, expert calls, and customer references",
        type: "Invocable"
      },
      {
        name: "IC Memo",
        description: "Draft structured investment committee memos synthesizing DD findings, financials, and deal terms",
        type: "Invocable"
      },
      {
        name: "Returns Analysis",
        description: "Build IRR/MOIC sensitivity tables across entry multiple, leverage, exit multiple, and growth scenarios",
        type: "Invocable"
      },
      {
        name: "Unit Economics",
        description: "Analyze ARR cohorts, LTV/CAC, net retention, payback periods, and revenue quality for subscription businesses",
        type: "Invocable"
      },
      {
        name: "Value Creation Plan",
        description: "Structure post-acquisition EBITDA bridges, 100-day plans, KPI dashboards, and accountability frameworks",
        type: "Invocable"
      },
      {
        name: "Portfolio Monitoring",
        description: "Track portfolio company performance against plan with KPI extraction, variance flagging, and covenant compliance",
        type: "Invocable"
      },
      {
        name: "AI Readiness",
        description: "Scan portfolio for highest-leverage AI opportunities ranked by EBITDA impact with go/wait gates per company",
        type: "Invocable"
      }
    ],
    install_steps: [
      "Open the Claude Desktop app and switch to the Cowork tab",
      "Click Customize in the left sidebar, then Browse plugins",
      "Search for \"Private Equity\" and click Install"
    ]
  },
  {
    id: 12,
    slug: "sales",
    name: "Sales",
    author: "Unknown",
    description: "Turn web research, pipeline data, and call notes into personalized outreach, deal forecasts, and meeting prep in minutes — no integrations required.",
    long_description: "Sales is a productivity plugin that helps reps prospect, prepare for calls, manage their pipeline, and craft outreach that moves deals forward. It works immediately with web search and whatever context you provide — paste call notes, upload a pipeline CSV, or just name a company. Connect your CRM, email, or call recording tool and every skill automatically pulls richer data without any configuration changes.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "1.2.0",
    category: "Sales & Revenue",
    industries: [
      "financial",
      "retail",
      "cpg",
      "tmt",
      "industrials",
      "healthcare"
    ],
    functions: [
      "sales",
      "marketing",
      "strategy"
    ],
    use_cases: [
      {
        ask: "Research Acme Corp before my call tomorrow",
        returns: "Company profile with recent news, key contacts, hiring signals, qualification signals, and a recommended outreach approach"
      },
      {
        ask: "Process these call notes and draft a follow-up email",
        returns: "Structured summary with action items, objection log, competitive intel, and a ready-to-send follow-up email"
      },
      {
        ask: "Generate my Q2 forecast from this pipeline CSV",
        returns: "Weighted forecast with best/likely/worst scenarios, commit vs. upside breakdown, risk flags, and gap-to-quota analysis"
      }
    ],
    inputs: [
      {
        label: "Pipeline data",
        detail: "CSV export from any CRM, or describe your deals in plain text",
        required: false
      },
      {
        label: "Call notes or transcript",
        detail: "paste rough notes, a transcript, or describe the call",
        required: false
      },
      {
        label: "Company or contact name",
        detail: "(required for research/outreach) — domain or name is enough",
        required: false
      },
      {
        label: "Quota and period",
        detail: "(required for forecasting) — annual or quarterly target and close date",
        required: false
      }
    ],
    outputs: [
      {
        label: "Structured Markdown reports",
        detail: "account research briefs, call summaries, pipeline reviews, forecasts, daily briefings"
      },
      {
        label: "Self-contained HTML files",
        detail: "interactive competitive battlecards and custom sales assets (landing pages, one-pagers, demos)"
      },
      {
        label: "Ready-to-send emails",
        detail: "plain-text follow-ups and outreach drafts formatted for any email client"
      }
    ],
    how_it_works: [
      {
        title: "Research-first workflow",
        detail: "Every outreach and prep skill researches the prospect before generating output, so messaging reflects real company context rather than generic templates."
      },
      {
        title: "Stage-weighted probability model",
        detail: "The forecasting engine assigns conversion probabilities by deal stage and adjusts for activity recency, producing three scenarios instead of a single-point estimate."
      },
      {
        title: "Multi-signal risk scoring",
        detail: "Pipeline review combines deal age, activity gaps, close-date accuracy, and contact coverage into a composite health score that flags problems before they stall."
      },
      {
        title: "Connector-agnostic enrichment",
        detail: "Skills define what data they need by category (CRM, enrichment, transcripts) rather than specific products, so any compatible tool upgrades the output automatically."
      }
    ],
    tools: "Works fully standalone using web search. Optionally connects to CRM (HubSpot, Close, Salesforce, Pipedrive), email (Gmail, Microsoft 365), calendar, chat (Slack, Teams), call transcription (Fireflies, Gong, Chorus), data enrichment (Clay, ZoomInfo, Apollo), knowledge bases (Notion, Confluence), and sales engagement platforms (Outreach, Salesloft). Connectors are category-based: swap any tool in a category without reconfiguration.",
    skills_list: [
      {
        name: "account-research",
        description: "Researches any company or person via web search, producing a profile with news, hiring signals, and recommended outreach angle",
        type: "Invocable"
      },
      {
        name: "call-prep",
        description: "Builds a complete meeting prep brief with attendee research, suggested agenda, discovery questions, and objection handling",
        type: "Invocable"
      },
      {
        name: "call-summary",
        description: "Processes call notes or transcripts into a structured summary with action items and a customer follow-up email",
        type: "Invocable"
      },
      {
        name: "competitive-intelligence",
        description: "Researches competitors and generates an interactive HTML battlecard with comparison matrix and talk tracks",
        type: "Invocable"
      },
      {
        name: "create-an-asset",
        description: "Generates tailored sales assets (landing pages, one-pagers, workflow demos) customized to a specific prospect and audience",
        type: "Invocable"
      },
      {
        name: "daily-briefing",
        description: "Produces a prioritized daily sales briefing covering meetings, pipeline alerts, email priorities, and suggested actions",
        type: "Invocable"
      },
      {
        name: "draft-outreach",
        description: "Researches a prospect then drafts personalized cold email and LinkedIn messages with follow-up sequences",
        type: "Invocable"
      },
      {
        name: "forecast",
        description: "Generates a weighted sales forecast with three scenarios, commit vs. upside breakdown, and gap-to-quota analysis",
        type: "Invocable"
      },
      {
        name: "pipeline-review",
        description: "Analyzes pipeline health with a composite score, deal prioritization matrix, risk flags, and weekly action plan",
        type: "Invocable"
      }
    ],
    install_steps: [
      "Browse (Anthropic Plugin Catalog)",
      "Open the Claude Desktop app and switch to the Cowork tab",
      "Click Customize in the left sidebar, then Browse plugins",
      "Search for \"Sales\" and click Install",
      "Visit github.com/anthropics/knowledge-work-plugins",
      "Download the sales plugin folder or .skill file",
      "In Cowork, click Customize → Upload plugin and select the downloaded file"
    ]
  },
  {
    id: 13,
    slug: "strategy-consultant",
    name: "Strategy Consultant",
    author: "Chip Alexandru",
    description: "Runs a complete consulting-grade analytical workflow from problem definition to an executive-grade, source-traced Word document in a single engagement.",
    long_description: "Takes a business question and runs the full analytical cycle a strategy consultant would perform: scoping the problem into a decision-oriented question, dispatching two independent research agents in parallel to reduce confirmation bias, cross-validating all findings through a third agent, pressure-testing the evidence through triangulation and counter-argument construction, building a storyline that answers the client question, and delivering a professionally formatted Word document with full source traceability. Supports multiple data tiers including public research, uploaded client data, and expert interview transcripts, adjusting the research strategy based on what is available. All outputs are designed as high-quality working drafts for expert review, covering the analytical workload so the consultant can focus on client relationship judgment and final recommendations.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 2,
    version: "1.3.1",
    category: "Strategy & Management Consulting",
    industries: [
      "financial",
      "retail",
      "cpg",
      "industrials",
      "tmt",
      "healthcare",
      "privatecapital"
    ],
    functions: [
      "strategy",
      "finance",
      "operations",
      "ma"
    ],
    use_cases: [
      {
        ask: "Run a full engagement on whether our client should enter the European EV charging market",
        returns: "A scoped problem statement, validated research from three agents, a sense-check report, a synthesized storyline, and a 4-6 page executive brief with numbered Research Notes tracing every claim to its source."
      },
      {
        ask: "Research the competitive landscape for retail media networks in grocery",
        returns: "Two independent research memos covering different angles, a validated and cross-checked evidence base, and an executive summary with confidence scores and identified gaps."
      },
      {
        ask: "Define the problem for this client brief\" (with uploaded documents)",
        returns: "A structured problem statement with context, tension, question, and scope; a Precision Anchor to prevent analytical drift; a Deliverable Blueprint; and a Client Question Checklist extracted from the source material."
      }
    ],
    inputs: [
      {
        label: "•  Business question or client brief",
        detail: "required. Can be a vague challenge or a specific decision.",
        required: false
      },
      {
        label: "•  Client documents",
        detail: "optional. Decks, reports, call transcripts, prior analyses, or data files. The plugin extracts every factual claim, question, and concern with structural coordinates.",
        required: false
      },
      {
        label: "•  Expert interview notes",
        detail: "optional. Transcripts or notes from industry practitioners, processed with confidence scoring and cross-referenced against public findings.",
        required: false
      },
      {
        label: "•  Internal data files",
        detail: "optional. Spreadsheets, financial models, or operational metrics that set the analytical direction.",
        required: false
      }
    ],
    outputs: [
      {
        label: "•  Executive brief (.docx)",
        detail: "4-6 page default, or comprehensive 10-20 page report. Includes executive summary, evidence-backed body sections, counter-argument section, numbered recommendations, and mandatory Research Notes with URLs and confidence scores."
      },
      {
        label: "•  Alternative formats available: Excel (.xlsx) for structured dimension mapping, or PowerPoint (.pptx) for stakeholder presentations. Source traceability is required regardless of format.",
        detail: ""
      },
      {
        label: "•  Intermediate artifacts: problem statement with Precision Anchor, research memos from independent agents, validated evidence base, sense-check report, and synthesis storyline document.",
        detail: ""
      }
    ],
    how_it_works: [
      {
        title: "Precision Anchor architecture",
        detail: "Every engagement starts by distilling the business question into a decision-oriented problem statement, a Deliverable Blueprint describing the ideal output, and a success metric that defines what a precise answer looks like. This anchor travels through every downstream phase, preventing the common failure where the analysis drifts to answer an easier question than the one the client asked."
      },
      {
        title: "Dual-agent parallel research",
        detail: "Two independent research agents investigate the question simultaneously from dynamically generated, non-overlapping angles. Neither agent sees the other's findings. This architecture reduces confirmation bias: where a single researcher tends to find evidence supporting their initial direction, two independent threads surface contradictions and blind spots."
      },
      {
        title: "Three-tier validation",
        detail: "A dedicated validator agent cross-checks both research memos for consistency, flags contradictions, scores every source on a four-level confidence scale, and compiles a unified source registry with URLs. The user can optionally dispatch a third deep-dive agent targeting specific under-explored areas identified by the validator."
      },
      {
        title: "Answer-first synthesis",
        detail: "The storyline starts with a one-sentence governing message that directly answers the client question, then builds 2-4 supporting arguments with evidence mapped to each. The structure follows the logic of the answer, not a rigid framework, choosing from patterns like recommendation-with-pillars, option comparison, or diagnostic-then-prescription based on what fits the question."
      },
      {
        title: "Independent deliverable validation",
        detail: "The agent that wrote the report never audits its own output. A separate validator checks the final document against the source registry, the sense-check report, the synthesis storyline, and the Client Question Checklist. The report must pass source completeness, counter-argument coverage, headline fidelity, and banned-language checks before delivery."
      }
    ],
    tools: "Works fully standalone using built-in web search, file creation, and document generation. Optional document storage connectors (Google Drive, SharePoint, OneDrive, Box, Dropbox) allow pulling client briefs from and saving reports to shared drives. No external APIs or paid data subscriptions are required.",
    skills_list: [
      {
        name: "engagement-manager",
        description: "Orchestrates the full end-to-end workflow with mandatory checkpoints",
        type: "Invocable"
      },
      {
        name: "problem-definition",
        description: "Scopes the client question into a decision-oriented problem statement with Precision Anchor",
        type: "Invocable"
      },
      {
        name: "hypothesis-tree",
        description: "Builds testable hypothesis trees when structured decomposition adds value",
        type: "Invocable"
      },
      {
        name: "research",
        description: "Dispatches three agents for parallel research and cross-validation",
        type: "Invocable"
      },
      {
        name: "sense-check",
        description: "Seven-step pressure test on evidence robustness and analytical precision",
        type: "Invocable"
      },
      {
        name: "synthesis",
        description: "Builds the answer-first storyline with evidence mapping",
        type: "Invocable"
      },
      {
        name: "client-report",
        description: "Produces the executive-grade Word document with mandatory quality checks",
        type: "Invocable"
      },
      {
        name: "expert-interview",
        description: "Plans interview guides and processes transcripts with confidence scoring",
        type: "Invocable"
      }
    ],
    install_steps: [
      "Upload (.skill file)",
      "Obtain the .skill file from the plugin author or colleague.",
      "Open the Claude Desktop app and switch to the Cowork tab.",
      "Click Customize in the left sidebar, then Upload plugin.",
      "Select the .skill file and confirm installation."
    ]
  },
  {
    id: 14,
    slug: "wealth-management",
    name: "Wealth Management",
    author: "Anthropic FSI",
    description: "Turn client data into meeting-ready reviews, financial plans, and tax-optimized portfolio actions — in minutes, not hours.",
    long_description: "The Wealth Management plugin equips financial advisors with six tools that cover the core advisory workflow: preparing for client meetings, building comprehensive financial plans, generating performance reports, creating prospect proposals, rebalancing portfolios with tax awareness, and harvesting tax losses. Each tool takes client or portfolio data and produces structured, client-ready deliverables with built-in compliance considerations.",
    repo_url: null,
    installs: 0,
    stars: 0,
    badge: null,
    rating: 1,
    version: "0.1.0",
    category: "Wealth Management & Financial Advisory",
    industries: [
      "financial"
    ],
    functions: [
      "finance",
      "risk"
    ],
    use_cases: [
      {
        ask: "Prep me for my quarterly review with the Hendersons — they have $2.4M across a joint taxable, two IRAs, and a 529.",
        returns: "A one-page meeting summary with performance vs. benchmark, allocation drift flags, talking points tailored to their life stage, and a prioritized action item list."
      },
      {
        ask: "The Garcias want to know if they can retire at 60. Build me a plan with Social Security at 67 and 70 scenarios.",
        returns: "A 15-25 page financial plan with cash flow projections, Monte Carlo simulations at multiple spending levels, education funding gaps, and a prioritized recommendation checklist."
      },
      {
        ask: "Scan the Morrison taxable account for tax-loss harvesting — they've already realized $18K in short-term gains this year.",
        returns: "A ranked list of harvestable positions with replacement securities, wash sale window tracking across all household accounts, and an estimated tax savings summary."
      }
    ],
    inputs: [
      {
        label: "Client profile data(name, accounts, balances, goals)",
        detail: "Required",
        required: false
      },
      {
        label: "Portfolio holdings with cost basis",
        detail: "Required for rebalance and tax-loss harvesting",
        required: false
      },
      {
        label: "Investment Policy Statement(target allocation, risk tolerance)",
        detail: "Required for rebalance, recommended for others",
        required: false
      },
      {
        label: "Realized gains/losses year-to-date",
        detail: "Optional, used for tax-loss harvesting budget",
        required: false
      },
      {
        label: "Firm branding details(logo, colors, disclaimers)",
        detail: "Optional, used for client reports and proposals",
        required: false
      }
    ],
    outputs: [
      {
        label: "Client review summary (Word/PDF, 1 page)",
        detail: ""
      },
      {
        label: "Financial plan document (Word/PDF, 15-25 pages) with cash flow spreadsheet (Excel)",
        detail: ""
      },
      {
        label: "Client performance report (PDF, 8-12 pages) with data appendix",
        detail: ""
      },
      {
        label: "Investment proposal (PowerPoint, 12-15 slides) with PDF leave-behind",
        detail: ""
      },
      {
        label: "Rebalancing trade list (Excel) with tax impact summary",
        detail: ""
      },
      {
        label: "Tax-loss harvesting execution sheet (Excel) with wash sale tracking calendar",
        detail: ""
      }
    ],
    how_it_works: [
      {
        title: "Each skill follows a defined intake sequence that maps client information into the specific fields needed for analysis, ensuring nothing is missed during preparation.",
        detail: ""
      },
      {
        title: "Portfolio analysis, rebalancing, and tax-loss harvesting operate across all accounts in a household simultaneously, catching cross-account issues like wash sales that single-account tools miss.",
        detail: ""
      },
      {
        title: "Rebalancing and harvesting recommendations factor in holding period, cost basis, account type, and wash sale windows before suggesting any trade, preventing costly tax mistakes.",
        detail: ""
      },
      {
        title: "Client reviews and reports calculate returns against the benchmark specified in the Investment Policy Statement, not a generic market index, so performance context is always accurate.",
        detail: ""
      },
      {
        title: "Financial plans run multiple retirement, spending, and market scenarios with Monte Carlo simulations, giving clients probability-weighted outcomes instead of single-point projections.",
        detail: ""
      },
      {
        title: "Every skill includes reminders for regulatory requirements, disclosure language, and documentation standards, reducing the risk of compliance oversights in client deliverables.",
        detail: ""
      }
    ],
    tools: "Works standalone with uploaded data files. No external API integrations required. Connects to CRM or portfolio management systems if available, but all skills function with manually provided data.",
    skills_list: [
      {
        name: "client-review",
        description: "Prepare for client review meetings with performance summary, allocation analysis, talking points, and action items.",
        type: "Invocable"
      },
      {
        name: "financial-plan",
        description: "Build or update comprehensive financial plans covering retirement, education, estate, and cash flow.",
        type: "Invocable"
      },
      {
        name: "client-report",
        description: "Generate professional client-facing performance reports with returns, allocation, and market commentary.",
        type: "Invocable"
      },
      {
        name: "investment-proposal",
        description: "Create personalized investment proposals for prospective clients with strategy, projections, and fees.",
        type: "Invocable"
      },
      {
        name: "portfolio-rebalance",
        description: "Analyze allocation drift and generate tax-aware rebalancing trade recommendations.",
        type: "Invocable"
      },
      {
        name: "tax-loss-harvesting",
        description: "Identify harvestable losses, suggest replacement securities, and track wash sale windows.",
        type: "Invocable"
      }
    ],
    install_steps: [
      "Wealth Management · Anthropic FSI · Page"
    ]
  }
];
