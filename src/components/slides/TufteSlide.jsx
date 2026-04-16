import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { C, FONT } from "../../theme.js";
import { AnimNum } from "../AnimNum.jsx";
import { useDelayedVisible } from "../../hooks/useDelayedVisible.js";

// Try to parse a marker like "70%" or "1%" into { number, unit }.
// Returns null for text markers like "10–15 → 5 min".
function parseNumericMarker(marker) {
  const m = marker.match(/^(\d+(?:\.\d+)?)\s*(%|×|x)?$/);
  if (!m) return null;
  return { number: parseFloat(m[1]), unit: m[2] || "" };
}

// "tufte" slide type — 58% body paragraphs + 34% expandable sidenote column.
// Notes toggle on click or Enter. Numeric markers animate on mount.
export function TufteSlide({ slide }) {
  const [expanded, setExpanded] = useState({});
  const visible = useDelayedVisible(200);
  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="tufte-layout" style={{ display: "flex", gap: 48 }}>
      <div className="tufte-col" style={{ flex: "0 0 58%", maxWidth: "58%" }}>
        {slide.paragraphs.map((p, i) => {
          const text = typeof p === "string" ? p : p.text;
          const italic = typeof p === "object" && p.italic;
          const prev = i > 0 ? slide.paragraphs[i - 1] : null;
          const prevIsItalic = prev && typeof prev === "object" && prev.italic;
          // Italic quotes tuck directly under the paragraph they support (2px).
          // After an italic quote, the next non-italic paragraph gets extra
          // breathing room (28px) to visually separate the pairs.
          let marginTop = 0;
          if (i > 0) {
            if (italic) marginTop = 2;           // quote tucks under its parent
            else if (prevIsItalic) marginTop = 20; // new thought after a quote pair
            else marginTop = 14;                   // normal paragraph gap
          }
          return (
            <p key={i} style={{
              fontSize: 15, color: C.text, lineHeight: 1.6,
              fontFamily: FONT.serif, fontWeight: 700,
              fontStyle: italic ? "italic" : "normal",
              margin: 0,
              marginTop,
            }}>
              {text}
            </p>
          );
        })}
      </div>
      <div className="tufte-col" style={{ flex: "0 0 34%", maxWidth: "34%", paddingTop: 4 }}>
        {slide.notes.map((n, i) => {
          const parsed = parseNumericMarker(n.marker);
          return (
          <div key={i} style={{
            marginBottom: 18,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
          }}>
            <div
              onClick={() => toggle(i)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") toggle(i); }}
              style={{
                cursor: "pointer",
                padding: "10px 12px",
                borderLeft: `2px solid ${expanded[i] ? C.accent : C.accentBorder}`,
                background: expanded[i] ? C.accentBg : "transparent",
                borderRadius: "0 4px 4px 0",
                transition: "all 0.3s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <ChevronRight
                  size={12}
                  color={C.accent}
                  style={{
                    transform: expanded[i] ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.25s",
                    marginTop: 3,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <span style={{ fontSize: 17, fontWeight: 800, color: C.accent, display: "block", lineHeight: 1.2, marginBottom: 2 }}>
                    {parsed
                      ? <AnimNum value={parsed.number} unit={parsed.unit} visible={visible} />
                      : n.marker}
                  </span>
                  <span style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>
                    {n.label}
                  </span>
                </div>
              </div>
              {expanded[i] && (
                <div style={{
                  marginTop: 10, paddingTop: 10,
                  borderTop: `1px solid ${C.accentBorder}`,
                  fontSize: 12, color: C.textLight, lineHeight: 1.75,
                }}>
                  {n.detail}
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
