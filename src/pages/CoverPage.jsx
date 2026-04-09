import { useState } from "react";
import { C, FONT } from "../theme.js";

// Per-deck Cover (decision 1C). Renders the deck title + a grid of its chapter cards.
// Behavior-preserving from definitive.jsx. Brief polish items (drop eyebrow, promote
// serif numeric anchor, 4-card grid after Chapter 5 drop, vermillion rule upgrade,
// remove "Scroll to begin") are applied in later milestones — not here.
export function CoverPage({ deck, onEnterChapter }) {
  const [hovered, setHovered] = useState(null);
  const mainChapters = deck.chapters.slice(0, deck.chapters.length);

  return (
    <div style={{ maxWidth: 840, width: "100%", margin: "0 auto" }}>
      <div style={{ marginBottom: 32, animation: "cardSlideUp 0.5s ease 0.05s both" }}>
        <div style={{ width: 48, height: 3, background: C.accent, marginBottom: 18, borderRadius: 2 }} />
        <h1 style={{ fontSize: 46, fontWeight: 900, margin: 0, lineHeight: 1.05, color: C.text, letterSpacing: -1.2 }}>
          {deck.title}
        </h1>
        <p style={{ fontSize: 14, color: C.textLight, marginTop: 12, maxWidth: 540, lineHeight: 1.6 }}>
          Pick a starting point — or scroll through in order.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {mainChapters.map((ch, i) => {
          const isH = hovered === i;
          return (
            <button
              key={ch.id}
              onClick={() => onEnterChapter(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "relative", overflow: "hidden",
                padding: "24px 24px 22px", borderRadius: 14,
                border: `1px solid ${isH ? C.accentBorder : C.border}`,
                background: isH ? C.surfaceHover : C.surface,
                cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column",
                transform: isH ? "translateY(-2px)" : "translateY(0)",
                boxShadow: isH
                  ? "0 12px 36px rgba(74,28,42,0.07), 0 2px 8px rgba(74,28,42,0.03)"
                  : "0 1px 3px rgba(74,28,42,0.03)",
                transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                animation: `cardSlideUp 0.5s ease ${0.1 + i * 0.06}s both`,
                minHeight: 130,
              }}
            >
              {/* Chapter number — serif numeric anchor top-right */}
              <div style={{
                position: "absolute", top: 14, right: 20,
                fontSize: 38, fontWeight: 900,
                color: isH ? C.accent : C.wine,
                opacity: isH ? 0.85 : 0.18,
                lineHeight: 1, pointerEvents: "none", userSelect: "none",
                fontFamily: FONT.serif,
                transition: "all 0.35s",
              }}>
                {ch.num}
              </div>

              <div style={{ paddingRight: 56 }}>
                <div style={{
                  fontSize: 19, fontWeight: 800, color: C.text,
                  marginBottom: 6, lineHeight: 1.2, letterSpacing: -0.3,
                  fontFamily: FONT.serif,
                }}>
                  {ch.title}
                </div>
                <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.55 }}>
                  {ch.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
