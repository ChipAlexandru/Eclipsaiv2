import { useState, useEffect, useRef } from "react";
import { C, FONT } from "../../theme.js";
import { AnimNum } from "../AnimNum.jsx";
import { Chart } from "../charts/Chart.jsx";

// "scroll" slide type — a row of big animated stat cards + optional body paragraph.
// When the slide becomes active, cards fade/lift in staggered, then body fades in.
export function ScrollSlide({ slide, isActive }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => setVisible(true), 200);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [isActive]);

  return (
    <div ref={ref}>
      <div
        className="scroll-stat-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${slide.stats.length}, 1fr)`,
          gap: 10,
          marginBottom: 14,
        }}
      >
        {slide.stats.map((s, i) => (
          <div
            key={i}
            className="scroll-stat-card"
            style={{
              padding: "14px 12px", borderRadius: 12,
              background: C.surface, border: `1px solid ${C.border}`,
              display: "flex", flexDirection: "column", textAlign: "center",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`,
            }}
          >
            <div
              className="scroll-stat-value"
              style={{
                fontSize: 28, fontWeight: 800, color: C.accent,
                lineHeight: 1.1, fontVariantNumeric: "tabular-nums",
              }}
            >
              <AnimNum value={s.value} unit={s.unit} visible={visible} isText={slide.isText || s.isText} />
            </div>
            <div>
              <div className="scroll-stat-label" style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 8 }}>{s.label}</div>
              <div className="scroll-stat-desc" style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      {slide.chart && <Chart chart={slide.chart} isActive={visible} />}
      {slide.body && (
        <p style={{
          fontSize: 13, color: C.text, lineHeight: 1.4,
          margin: 0,
          fontFamily: FONT.serif, fontWeight: 700,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: `opacity 0.5s ease ${slide.chart ? "1.8s" : "0.4s"}, transform 0.5s ease ${slide.chart ? "1.8s" : "0.4s"}`,
        }}>
          {slide.body}
        </p>
      )}
    </div>
  );
}
