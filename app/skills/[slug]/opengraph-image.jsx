// Per-skill OG image for /skills/[slug]. Dark theme matches the marketplace
// hero. Chip shows the maturity pill (Starting point / Professional draft /
// Production-ready) in the same color the in-app pill uses.
import { ImageResponse } from "next/og";
import { getSkillBySlug, getAllSlugs } from "../../../src/marketplace/data.js";
import { RATING_LABELS } from "../../../src/marketplace/constants.js";
import { renderOgCard, OG_SIZE, THEME_DARK } from "../../_og/card.jsx";

export const runtime = "nodejs";
export const alt = "Eclipsai skill";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

function truncate(str, max) {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + "…";
}

export default async function SkillOg({ params }) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) {
    return new ImageResponse(
      renderOgCard({ theme: THEME_DARK, headline: "Eclipsai" }),
      { ...size },
    );
  }

  const maturity = skill.rating ? RATING_LABELS[skill.rating] : "Unrated";
  const owner = skill.owner_name || skill.owner || "";

  const chips = [
    { big: maturity, small: "Maturity rating" },
  ];

  return new ImageResponse(
    renderOgCard({
      theme: THEME_DARK,
      wordmark: "Eclipsai",
      topRight: "BUSINESS SKILLS",
      eyebrow: owner ? `SKILL · ${owner.toUpperCase()}` : "SKILL",
      headline: skill.name,
      sub: truncate(skill.description, 180),
      chips,
    }),
    { ...size },
  );
}
