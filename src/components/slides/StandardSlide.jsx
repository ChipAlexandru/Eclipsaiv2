import { C, FONT } from "../../theme.js";
import { Chart } from "../charts/Chart.jsx";
import { StatCallout } from "../StatCallout.jsx";
import { useDelayedVisible } from "../../hooks/useDelayedVisible.js";

// "standard" slide type — body + optional callout + optional pillars grid.
// Callout fades in on mount; pillars stagger.
export function StandardSlide({ slide }) {
  const visible = useDelayedVisible(250);
  return (
    <div>
      {slide.body && (
        <p style={{ fontSize: 15, color: C.text, lineHeight: 1.75, margin: "0 0 24px 0", maxWidth: 700, fontFamily: FONT.serif, fontWeight: 700 }}>
          {slide.body}
        </p>
      )}
      {slide.bodyLines && (
        <div style={{ margin: "0 0 24px 0", maxWidth: 700 }}>
          {slide.bodyLines.map((line, i) => (
            <p key={i} style={{ fontSize: 15, color: C.text, lineHeight: 1.75, margin: i < slide.bodyLines.length - 1 ? "0 0 14px 0" : 0, fontFamily: FONT.serif, fontWeight: 700 }}>
              {line}
            </p>
          ))}
        </div>
      )}
      {slide.callout && !slide.callout.text && (
        <StatCallout
          value={slide.callout.value}
          label={slide.callout.label}
          sub={slide.callout.sub}
          style={{
            marginBottom: 24,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
            transition: "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s",
          }}
        />
      )}
      {slide.chart && <Chart chart={slide.chart} isActive={visible} />}
      {slide.pillars && slide.pillarsLayout === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: slide.callout?.text ? 18 : 0 }}>
          {slide.pillars.map((p, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: `${slide.listTitleWidth || 170}px 1fr`,
              gap: 20, alignItems: "baseline",
              padding: "12px 16px 12px 14px",
              background: C.surface, border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.accent}`,
              borderRadius: 8,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              transition: `opacity 0.4s ease ${0.08 + i * 0.08}s, transform 0.4s ease ${0.08 + i * 0.08}s`,
            }}>
              <div style={{
                fontFamily: FONT.serif,
                fontSize: 14, fontWeight: 800, color: C.text,
                lineHeight: 1.3, letterSpacing: -0.2,
              }}>{p.title}</div>
              <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.55 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      )}
      {slide.pillars && slide.pillarsLayout !== "list" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: slide.pillarsLayout === "grid-2x2"
            ? "1fr 1fr"
            : `repeat(${Math.min(slide.pillars.length, 3)}, 1fr)`,
          gap: 12,
        }}>
          {slide.pillars.map((p, i) => (
            <div key={i} style={{
              padding: "16px 18px", borderRadius: 12,
              background: C.surface, border: `1px solid ${C.border}`,
              borderTop: `3px solid ${C.accent}`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.45s ease ${0.1 + i * 0.1}s, transform 0.45s ease ${0.1 + i * 0.1}s`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.55 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      )}
      {slide.callout?.text && (
        <div style={{
          padding: "16px 22px 16px 44px", borderRadius: 12,
          background: C.accentBg, border: `1px solid ${C.accentBorder}`,
          position: "relative",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s ease 0.55s, transform 0.5s ease 0.55s",
        }}>
          <div style={{
            position: "absolute", left: 14, top: 6,
            fontFamily: FONT.serif, fontSize: 34, lineHeight: 1,
            color: C.accent, opacity: 0.35,
          }}>“</div>
          <p style={{
            margin: 0, fontFamily: FONT.serif,
            fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.6,
          }}>
            {slide.callout.text}
          </p>
        </div>
      )}
    </div>
  );
}
