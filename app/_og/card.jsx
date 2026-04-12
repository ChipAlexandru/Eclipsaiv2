// Shared OG card layout primitives.
//
// Next.js 15 ignores folders prefixed with "_" under app/, so this directory
// doesn't become a route — it's just a shared module that the four
// opengraph-image.jsx files import. One layout primitive, four themes, so all
// OG cards share chrome (masthead, headline block, footer) without duplicating
// ~100 lines of inline styles each.
//
// Fonts: system-ui sans only for v1. Adding Charter/serif would require
// shipping font buffers on the edge runtime — tracked as a follow-up. The
// default sans reads a bit more "tech" than the in-app Charter, but all text
// is legible and on-brand via color + weight + letterspacing.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// ─── THEMES ────────────────────────────────────────────────────────
// Every OG family picks one of these. Keeps the palette consistent with the
// in-app surfaces (cream for decks/slides, dark gradient for marketing/skills).

export const THEME_CREAM = {
  bg: "linear-gradient(155deg, #F8F4EE 0%, #F1E8D9 100%)",
  text: "#2a1613",
  textMuted: "#6b4a42",
  accent: "#c2410c",
  wordmark: "#8b2500",
  rule: "#c2410c",
};

export const THEME_DARK = {
  bg: "linear-gradient(160deg, #0f0f0f 0%, #1a1a1a 30%, #8b2500 100%)",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.72)",
  accent: "#fb923c",
  wordmark: "#fb923c",
  rule: "#fb923c",
};

// ─── CARD RENDERER ─────────────────────────────────────────────────
// Returns JSX (not ImageResponse). The opengraph-image.jsx file wraps the
// return value in `new ImageResponse(...)` so each file can set its own
// alt/runtime/contentType exports.
//
// Parameters:
//   theme     — THEME_CREAM or THEME_DARK
//   wordmark  — left masthead text (usually "Eclipsai")
//   topRight  — optional right masthead text (e.g. deck title on slides)
//   eyebrow   — small uppercase line above the headline (e.g. "01 · CASE FOR ACTION")
//   headline  — big headline text
//   sub       — optional sub-headline / description line
//   chips     — optional array of { big?, small } — renders as vertical tiles
//               with a left accent rule. Used for slide stats/pillars, skill
//               maturity pills, etc. Renders nothing if empty.
//   footer    — optional string rendered bottom-left in place of chips
export function renderOgCard({
  theme,
  wordmark = "Eclipsai",
  topRight,
  eyebrow,
  headline,
  sub,
  chips = [],
  footer,
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 88px",
        background: theme.bg,
        color: theme.text,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Masthead */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 5, color: theme.wordmark, textTransform: "uppercase" }}>
            {wordmark}
          </div>
          <div style={{ width: 40, height: 2, background: theme.rule }} />
        </div>
        {topRight ? (
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.wordmark, letterSpacing: 3, textTransform: "uppercase" }}>
            {topRight}
          </div>
        ) : null}
      </div>

      {/* Headline block */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {eyebrow ? (
          <div style={{ fontSize: 16, fontWeight: 800, color: theme.accent, letterSpacing: 2.5 }}>
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: theme.text,
            maxWidth: 1020,
            display: "flex",
          }}
        >
          {headline}
        </div>
        {sub ? (
          <div style={{ fontSize: 24, color: theme.textMuted, maxWidth: 1000, lineHeight: 1.35, display: "flex" }}>
            {sub}
          </div>
        ) : null}
      </div>

      {/* Footer: chips row and/or plain footer text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {chips.length > 0 ? (
          <div style={{ display: "flex", gap: 24 }}>
            {chips.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 22px",
                  borderLeft: `3px solid ${theme.rule}`,
                  minWidth: 160,
                }}
              >
                {c.big ? (
                  <div style={{ fontSize: 34, fontWeight: 900, color: theme.accent, letterSpacing: -0.5 }}>{c.big}</div>
                ) : null}
                <div style={{ fontSize: 15, color: theme.textMuted, marginTop: c.big ? 4 : 0, fontWeight: c.big ? 400 : 700 }}>{c.small}</div>
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ fontSize: 18, color: theme.textMuted }}>
          {footer || (chips.length === 0 ? "eclipsai.com" : null)}
        </div>
      </div>
    </div>
  );
}
