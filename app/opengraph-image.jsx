// Default site-wide OG image. Next.js 15 walks UP the folder tree to resolve
// opengraph-image files, so this is the fallback for any route that doesn't
// have its own co-located card:
//   /                           → this file
//   /about                      → this file
//   /skills                     → this file (index, not [slug])
//   /[deck]                     → app/[deck]/opengraph-image.jsx
//   /[deck]/[chapter]/[slide]   → app/[deck]/[chapter]/[slide]/opengraph-image.jsx
//   /skills/[slug]              → app/skills/[slug]/opengraph-image.jsx
//
// Uses renderOgCard from app/_og/card.jsx so all four files share chrome.
import { ImageResponse } from "next/og";
import { renderOgCard, OG_SIZE, THEME_DARK } from "./_og/card.jsx";

export const runtime = "nodejs";
export const alt = "Eclipsai — Strategy consulting for AI transformation";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    renderOgCard({
      theme: THEME_DARK,
      headline: "The Playbook: every role, dramatically more capable.",
      sub: "Strategy consulting with deep, tested expertise in deploying AI inside organizations.",
    }),
    { ...size },
  );
}
