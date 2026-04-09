import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { C, FONT } from "../../theme.js";

// "tufte" slide type — 58% body paragraphs + 34% expandable sidenote column.
// Notes toggle on click or Enter. Behavior-preserving extraction.
export function TufteSlide({ slide }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={{ display: "flex", gap: 48 }}>
      <div style={{ flex: "0 0 58%", maxWidth: "58%" }}>
        {slide.paragraphs.map((p, i) => (
          <p key={i} style={{
            fontSize: 15, color: C.text, lineHeight: 1.8,
            fontFamily: FONT.serif,
            margin: i < slide.paragraphs.length - 1 ? "0 0 18px 0" : 0,
          }}>
            {p}
          </p>
        ))}
      </div>
      <div style={{ flex: "0 0 34%", maxWidth: "34%", paddingTop: 4 }}>
        {slide.notes.map((n, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
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
                    {n.marker}
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
        ))}
      </div>
    </div>
  );
}
