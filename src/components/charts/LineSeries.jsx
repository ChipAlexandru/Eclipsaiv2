import { useRef, useEffect } from "react";
import { C } from "../../theme.js";

// Animated SVG line chart series.
// Draws solid lines, dashed (projected) lines, area fills, dots, and value labels.
// Animation: lines draw via stroke-dashoffset, dots + labels stagger in, areas fade.
export function LineSeries({ series, xScale, yScale, yMin, plotH, margin, visible }) {
  const solidRefs = useRef([]);
  const dashedRefs = useRef([]);
  const areaRefs = useRef([]);
  const dotRefs = useRef([]);

  useEffect(() => {
    if (!visible) return;

    // Animate solid lines drawing
    solidRefs.current.forEach((el, i) => {
      if (!el) return;
      const len = el.getTotalLength();
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
      el.style.transition = `stroke-dashoffset 1400ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 200}ms`;
      requestAnimationFrame(() => { el.style.strokeDashoffset = "0"; });
    });

    // Animate dashed lines drawing
    dashedRefs.current.forEach((el, i) => {
      if (!el) return;
      const len = el.getTotalLength();
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
      el.style.transition = `stroke-dashoffset 1000ms cubic-bezier(0.16, 1, 0.3, 1) ${1200 + i * 200}ms`;
      requestAnimationFrame(() => { el.style.strokeDashoffset = "0"; });
    });

    // Fade in area fills
    areaRefs.current.forEach((el, i) => {
      if (!el) return;
      setTimeout(() => {
        el.style.transition = "opacity 0.6s ease";
        el.style.opacity = el.dataset.targetOpacity || "0.08";
      }, 800 + i * 400);
    });

    // Stagger dots + labels
    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      setTimeout(() => {
        el.style.transition = "opacity 0.3s ease";
        el.style.opacity = "1";
      }, 600 + i * 80);
    });
  }, [visible]);

  const solidIdx = { current: 0 };
  const dashedIdx = { current: 0 };
  const areaIdx = { current: 0 };
  const dotIdx = { current: 0 };

  // Baseline Y for area fills
  const baseY = yScale(yMin);

  return (
    <g>
      {series.map((s, si) => {
        const color = s.color || C.accent;
        const isDashed = s.style === "dashed";
        const pts = s.points.map((p) => ({
          x: xScale(p.xVal != null ? p.xVal : p.xIdx),
          y: yScale(p.value),
          value: p.value,
          label: p.label,
          showValue: p.showValue,
        }));

        if (pts.length === 0) return null;
        const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

        // Area path
        const areaD = `M${pts[0].x},${baseY} ` +
          pts.map((p) => `L${p.x},${p.y}`).join(" ") +
          ` L${pts[pts.length - 1].x},${baseY} Z`;

        const areaOpacity = isDashed ? "0.04" : "0.08";

        // Refs for animation
        const lineRefIdx = isDashed ? dashedIdx.current++ : solidIdx.current++;
        const areaRefIdx = areaIdx.current++;

        return (
          <g key={si}>
            {/* Area fill */}
            {s.showArea !== false && (
              <path
                ref={(el) => { areaRefs.current[areaRefIdx] = el; }}
                d={areaD}
                fill={color}
                opacity={0}
                data-target-opacity={areaOpacity}
              />
            )}

            {/* Line */}
            <path
              ref={(el) => {
                if (isDashed) dashedRefs.current[lineRefIdx] = el;
                else solidRefs.current[lineRefIdx] = el;
              }}
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={isDashed ? "8 5" : "none"}
            />

            {/* Dots + value labels */}
            {s.showDots !== false && pts.map((p, pi) => {
              const dri = dotIdx.current++;
              return (
                <g key={pi}>
                  <circle
                    ref={(el) => { dotRefs.current[dri] = el; }}
                    cx={p.x} cy={p.y} r={4.5}
                    fill={isDashed ? C.surface : color}
                    stroke={isDashed ? color : C.surface}
                    strokeWidth={2}
                    opacity={0}
                  />
                  {p.showValue && (
                    <text
                      ref={(el) => { dotRefs.current[dotIdx.current++] = el; }}
                      x={p.x} y={p.y - 12}
                      textAnchor="middle"
                      style={{
                        fontSize: 10, fill: color,
                        fontFamily: "'Inter', -apple-system, sans-serif",
                        fontWeight: 700,
                      }}
                      opacity={0}
                    >
                      {p.label || p.value}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
