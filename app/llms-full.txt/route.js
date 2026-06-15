// /llms-full.txt — extended version with 2–3 sentence summaries per page.
// Auto-generated from shelf + skills data so it stays current.
import { shelf } from "../../src/decks/index.js";
import { getSkills } from "../../src/marketplace/data.js";

const SITE_URL = "https://eclipsai.com";

export async function GET() {
  const skills = getSkills();
  const deck = shelf.decks[0];

  const lines = [
    "# Eclipsai",
    "",
    "> Eclipsai turns the AI tools your team already uses into recurring work you can trust: one deliverable, proven against your standard, then a workflow that stays.",
    "",
    "---",
    "",
    "## About",
    "",
    `### [About Chip Alexandru](${SITE_URL}/about)`,
    shelf.about.paras.join("\n\n"),
    "",
    "---",
    "",
    "## The Playbook",
    "",
    `### [${deck.title}](${SITE_URL}/${deck.id})`,
    "",
  ];

  // Each chapter with its slides
  for (const ch of deck.chapters) {
    lines.push(`#### ${ch.num}. ${ch.title}`);
    lines.push(ch.subtitle);
    lines.push("");

    for (const slide of ch.slides) {
      const url = `${SITE_URL}/${deck.id}/${ch.id}/${slide.id}`;
      lines.push(`- [${slide.title}](${url})`);

      // Add contextual summary from slide data
      if (slide.body) {
        lines.push(`  ${slide.body.slice(0, 200)}${slide.body.length > 200 ? "..." : ""}`);
      } else if (slide.paragraphs?.length) {
        const first = typeof slide.paragraphs[0] === "string"
          ? slide.paragraphs[0]
          : slide.paragraphs[0].text;
        lines.push(`  ${first.slice(0, 200)}${first.length > 200 ? "..." : ""}`);
      } else if (slide.stats?.length) {
        lines.push(`  Key metrics: ${slide.stats.map((s) => `${s.value}${s.unit || ""} ${s.label.toLowerCase()}`).join(", ")}.`);
      }
      if (slide.article) {
        lines.push("  Long-form article available on this page.");
      }
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## Skills Directory");
  lines.push("");
  lines.push(`### [All Skills](${SITE_URL}/skills)`);
  lines.push("14 tested Claude AI skills across 11 business functions, evaluated against a three-level maturity framework with blind-test methodology.");
  lines.push("");

  for (const s of skills) {
    lines.push(`#### [${s.name}](${SITE_URL}/skills/${s.slug})`);
    lines.push(`Category: ${s.category}`);
    lines.push(s.description);
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## Contact");
  lines.push("");
  lines.push(`- [LinkedIn — Chip Alexandru](${shelf.about.linkedinUrl})`);
  lines.push(`- Website: ${SITE_URL}`);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
