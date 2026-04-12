import { C } from "../../theme.js";

// Animated SVG vertical bar chart.
// Bars grow from baseline with staggered delay. Supports grouped series.
export function BarSeries({ series, categories, xScale, yScale, yMin, plotW, margin, visible }) {
  const seriesCount = series.length;
  const catCount = categories.length;
  if (catCount === 0) return null;

  // Bar geometry
  const groupWidth = (plotW / catCount) * 0.7;
  const barWidth = seriesCount > 1 ? groupWidth / seriesCount - 2 : groupWidth;
  const baseY = yScale(yMin);

  return (
    <g>
      {series.map((s, si) => {
        const color = s.color || C.accent;
        return s.points.map((p, pi) => {
          const catIdx = typeof p.xIdx === "number" ? p.xIdx : pi;
          const cx = xScale(catIdx);
          const groupStart = cx - groupWidth / 2;
          const barX = seriesCount > 1
            ? groupStart + si * (groupWidth / seriesCount) + 1
            : groupStart;
          const barY = yScale(p.value);
          const barH = baseY - barY;
          const delay = 0.15 + pi * 0.08 + si * 0.04;

          return (
            <g key={`${si}-${pi}`}>
              <rect
                x={barX}
                y={visible ? barY : baseY}
                width={barWidth}
                height={visible ? barH : 0}
                rx={3}
                fill={color}
                opacity={visible ? (s.opacity || 0.85) : 0}
                style={{
                  transition: `y 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, height 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity 0.4s ease ${delay}s`,
                }}
              />
              {/* Value label above bar */}
              {s.showValues !== false && (
                <text
                  x={barX + barWidth / 2}
                  y={visible ? barY - 8 : baseY - 8}
                  textAnchor="middle"
                  style={{
                    fontSize: 10,
                    fill: color,
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontWeight: 700,
                    opacity: visible ? 1 : 0,
                    transition: `opacity 0.4s ease ${delay + 0.3}s, y 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
                  }}
                >
                  {p.label || p.value}
                </text>
              )}
            </g>
          );
        });
      })}
    </g>
  );
}
