import { C } from "../../theme.js";

// "standard" slide type — body + optional callout + optional pillars grid.
// Behavior-preserving extraction.
export function StandardSlide({ slide }) {
  return (
    <div>
      {slide.body && (
        <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.75, margin: "0 0 24px 0", maxWidth: 700 }}>
          {slide.body}
        </p>
      )}
      {slide.callout && (
        <div style={{
          padding: "24px 28px", borderRadius: 14,
          background: C.accentBg, border: `1px solid ${C.accentBorder}`,
          display: "flex", alignItems: "center", gap: 24, marginBottom: 24,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: C.accent, lineHeight: 1.1 }}>
              {slide.callout.value}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: 1.2 }}>
              {slide.callout.label}
            </div>
          </div>
          <div style={{ width: 1, height: 44, background: C.accentBorder }} />
          <div style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6 }}>
            {slide.callout.sub}
          </div>
        </div>
      )}
      {slide.pillars && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(slide.pillars.length, 3)}, 1fr)`, gap: 12 }}>
          {slide.pillars.map((p, i) => (
            <div key={i} style={{
              padding: "20px 18px", borderRadius: 12,
              background: C.surface, border: `1px solid ${C.border}`,
              borderTop: `3px solid ${C.accent}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
