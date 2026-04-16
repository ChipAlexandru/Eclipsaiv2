import { C } from "../theme.js";

// Shared stat callout box — value + label + optional sub-text.
// Used in StandardSlide (with animation) and ArticleSection (static).
export function StatCallout({ value, label, sub, style }) {
  return (
    <div style={{
      padding: "24px 28px", borderRadius: 14,
      background: C.accentBg, border: `1px solid ${C.accentBorder}`,
      display: "flex", alignItems: "center", gap: 24,
      ...style,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: C.accent, lineHeight: 1.1 }}>
          {value}
        </div>
        {label && (
          <div style={{
            fontSize: 11, color: C.textMuted, marginTop: 4,
            textTransform: "uppercase", letterSpacing: 1.2,
          }}>
            {label}
          </div>
        )}
      </div>
      {sub && (
        <>
          <div style={{ width: 1, height: 44, background: C.accentBorder }} />
          <div style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6 }}>
            {sub}
          </div>
        </>
      )}
    </div>
  );
}
