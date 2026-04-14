import { C, FONT } from "../../theme.js";

// Card chrome that wraps every chart: header (title + unit), SVG slot, legend.
export function ChartCard({ title, unit, legend, visible, children }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: "16px 20px 14px",
      marginBottom: 6,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
    }}>
      {(title || unit) && (
        <div style={{
          display: "flex", alignItems: "baseline",
          justifyContent: "space-between", marginBottom: 14,
        }}>
          {title && (
            <div style={{
              fontSize: 13, fontWeight: 700, color: C.text,
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              {title}
            </div>
          )}
          {unit && (
            <div style={{ fontSize: 11, color: C.textMuted }}>{unit}</div>
          )}
        </div>
      )}

      {children}

      {legend && legend.length > 0 && (
        <div style={{
          display: "flex", gap: 18, marginTop: 14,
          paddingTop: 10, borderTop: `1px solid ${C.borderLight}`,
        }}>
          {legend.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, color: C.textMuted,
            }}>
              <div style={{
                width: 18, height: 0,
                borderTop: `2.5px ${item.style === "dashed" ? "dashed" : "solid"} ${item.color || C.accent}`,
              }} />
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
