import { useState, useEffect, useRef } from "react";
import { C } from "../../theme.js";
import { AnimNum } from "../AnimNum.jsx";

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
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${slide.stats.length}, 1fr)`,
        gap: 14,
        marginBottom: 24,
      }}>
        {slide.stats.map((s, i) => (
          <div key={i} style={{
            padding: "24px 16px", borderRadius: 12,
            background: C.surface, border: `1px solid ${C.border}`, textAlign: "center",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`,
          }}>
            <div style={{
              fontSize: 32, fontWeight: 800, color: C.accent,
              lineHeight: 1.1, fontVariantNumeric: "tabular-nums",
            }}>
              <AnimNum value={s.value} unit={s.unit} visible={visible} isText={slide.isText} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 8 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      {slide.body && (
        <p style={{
          fontSize: 15, color: C.textLight, lineHeight: 1.75, margin: 0, maxWidth: 700,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s",
        }}>
          {slide.body}
        </p>
      )}
    </div>
  );
}
