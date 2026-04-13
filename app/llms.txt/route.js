// /llms.txt — structured overview of Eclipsai for AI crawlers.
// Auto-generated from shelf + skills data so it never goes stale.
// Follows the llmstxt.org convention.
import { shelf } from "../../src/decks/index.js";
import { getSkills } from "../../src/marketplace/data.js";

const SITE_URL = "https://eclipsai.com";

export async function GET() {
  const skills = getSkills();
  const deck = shelf.decks[0];

  const lines = [
    "# Eclipsai",
    "",
    "> Strategy consulting with deep, tested expertise in deploying AI inside organizations. Management consultancy and transformation partner — not an AI product company.",
    "",
    "## About",
    "",
    `- [About Chip Alexandru](${SITE_URL}/about)`,
    "",
    "## The Playbook",
    "",
    `- [Cover](${SITE_URL}/${deck.id})`,
    ...deck.chapters.map(
      (ch) => `- [${ch.num}. ${ch.title}](${SITE_URL}/${deck.id}/${ch.id}/${ch.slides[0].id}): ${ch.subtitle}`
    ),
    "",
    "## Skills Directory",
    "",
    `- [All Skills](${SITE_URL}/skills)`,
    ...skills.map((s) => `- [${s.name}](${SITE_URL}/skills/${s.slug}): ${s.category}`),
    "",
    "## Contact",
    "",
    `- [LinkedIn — Chip Alexandru](${shelf.about.linkedinUrl})`,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
