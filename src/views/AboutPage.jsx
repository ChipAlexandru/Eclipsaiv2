import { C, FONT } from "../theme.js";

// /about — shelf-level page content. The wordmark + nav now come from the
// global <SiteHeader> rendered by the App shell, so this view is just the
// long-form content: an "About" eyebrow, the two-paragraph positioning, the
// credential line, and a LinkedIn CTA. It scrolls inside the App's content
// area (no fixed height of its own).
export function AboutPage({ about }) {
  return (
    <div style={{
      maxWidth: 720, margin: "0 auto",
      padding: "clamp(32px, 7vh, 80px) clamp(24px, 5vw, 56px) 96px",
      color: C.text, fontFamily: FONT.sans,
    }}>
      {/* About eyebrow */}
      <div style={{ animation: "cardSlideUp 0.5s ease 0.04s both" }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.textMuted,
          letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 18,
        }}>
          About
        </div>
      </div>

      {/* Positioning paragraphs — serif, the first as a larger lead */}
      <div style={{ animation: "cardSlideUp 0.5s ease 0.12s both" }}>
        {about.paras?.map((para, i) => (
          <p key={i} style={{
            fontFamily: FONT.serif,
            fontSize: i === 0 ? "clamp(20px, 2.6vw, 26px)" : 17,
            fontWeight: i === 0 ? 700 : 400,
            lineHeight: i === 0 ? 1.32 : 1.72,
            letterSpacing: i === 0 ? -0.3 : 0,
            color: i === 0 ? C.text : C.textMed,
            margin: i === 0 ? "0 0 22px" : "0 0 18px",
            maxWidth: 640,
          }}>
            {para}
          </p>
        ))}
        <div style={{ width: 60, height: 3, background: C.accent, marginTop: 14, borderRadius: 2 }} />
      </div>

      {/* Name + credential line */}
      <div style={{ marginTop: 40, animation: "cardSlideUp 0.5s ease 0.2s both" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>
          {about.name}
        </div>
        <div style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6, marginTop: 4 }}>
          {about.blurb}
        </div>
      </div>

      {/* LinkedIn CTA */}
      <div style={{ marginTop: 32, animation: "cardSlideUp 0.5s ease 0.28s both" }}>
        <a
          href={about.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 8,
            background: C.accent, color: "#fff",
            fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 16, height: 16, borderRadius: 2,
            background: "rgba(255,255,255,0.22)",
            fontSize: 10, fontWeight: 900,
          }}>in</span>
          Connect on LinkedIn
        </a>
      </div>
    </div>
  );
}
