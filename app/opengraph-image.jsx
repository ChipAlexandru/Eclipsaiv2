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
// Restrained Eclipse & Signal treatment: the supplied fresh-food hero still
// under the approved eclipse-ink overlay, the brand line in mineral paper,
// and a single solar rule. No decorative extras.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OG_SIZE } from "./_og/card.jsx";

export const runtime = "nodejs";
export const alt = "Eclipsai. The profit brain for fresh food.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage() {
  const hero = await readFile(
    join(process.cwd(), "public", "assets", "fresh-food", "hero-closing-hour-v2.jpg"),
  );
  const heroSrc = `data:image/jpeg;base64,${hero.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#19171F",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Hero still, eclipse-ink overlay (matches the homepage hero grade) */}
        <img
          src={heroSrc}
          width={OG_SIZE.width}
          height={675}
          style={{ position: "absolute", inset: 0, objectFit: "cover", objectPosition: "58% center" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(25,23,31,.94) 0%, rgba(25,23,31,.72) 46%, rgba(25,23,31,.16) 80%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(0deg, rgba(25,23,31,.88) 0%, rgba(25,23,31,0) 55%)",
          }}
        />
        {/* Copy block */}
        <div
          style={{
            position: "absolute",
            left: 84,
            right: 84,
            bottom: 72,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 6, color: "#EFEEE7", textTransform: "uppercase" }}>
              Eclipsai
            </div>
            <div style={{ width: 44, height: 3, background: "#E9B84A" }} />
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: -2,
              color: "#EFEEE7",
              maxWidth: 860,
              display: "flex",
            }}
          >
            The profit brain for fresh food.
          </div>
          <div style={{ fontSize: 26, color: "rgba(239,238,231,.78)", display: "flex" }}>
            Know what to make tomorrow. Waste less. Sell more.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
