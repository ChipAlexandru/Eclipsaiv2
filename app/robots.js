// robots.txt — Next.js 15 convention. Explicit rules for AI crawlers so each
// operator sees an unambiguous "allowed" signal for their specific user-agent.
// Low-value scrapers (training-only, no user benefit) are blocked.
//
// Three-bot frameworks:
//   OpenAI  — GPTBot (training), OAI-SearchBot (search), ChatGPT-User (live queries)
//   Anthropic — ClaudeBot (training), Claude-SearchBot (search), Claude-User (live queries)
//
// All three bots per vendor are explicitly allowed so blocking one (e.g. training)
// doesn't accidentally suppress search or user-facing results.
const SITE_URL = "https://eclipsai.com";

// AI crawlers we want indexing our content — search, training, and user-triggered.
const AI_ALLOWED = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "DuckAssistBot",
  "cohere-ai",
  "YouBot",
];

// Scrapers with no user-facing product or whose crawling is purely extractive.
const BLOCKED = ["Bytespider", "CCBot"];

export default function robots() {
  return {
    rules: [
      // Explicit allow for every AI crawler we want.
      ...AI_ALLOWED.map((ua) => ({ userAgent: ua, allow: "/" })),
      // Block low-value scrapers.
      ...BLOCKED.map((ua) => ({ userAgent: ua, disallow: "/" })),
      // Catch-all: allow everything else (regular search engines, etc.).
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
