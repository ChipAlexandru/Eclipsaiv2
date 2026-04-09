// Default site-wide OG image rendered with next/og (ImageResponse).
// Next.js 15 convention: any app/opengraph-image.{jsx,tsx} file becomes the
// default OG image for routes in that segment. Per-route OG images can be
// added later by co-locating additional opengraph-image files in sub-segments.
//
// Edge runtime + ImageResponse give us a zero-asset OG image built at request
// time — no PNG to maintain, no font files to ship. Uses a single gradient
// backdrop with the headline so LinkedIn/Slack previews look editorial,
// not generic.
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Eclipsai — Strategy consulting for AI transformation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 90px",
          background:
            "linear-gradient(160deg, #0f0f0f 0%, #1a1a1a 30%, #8b2500 100%)",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 5,
              color: "#fb923c",
              textTransform: "uppercase",
            }}
          >
            Eclipsai
          </div>
          <div style={{ width: 44, height: 2, background: "#fb923c" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#ffffff",
              maxWidth: 980,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Most AI programs stall at pilots.&nbsp;
            <span style={{ color: "#fb923c" }}>Ours don&rsquo;t.</span>
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 500,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 960,
              lineHeight: 1.4,
            }}
          >
            Strategy consulting with deep, tested expertise in deploying AI inside organizations.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
