"use client";
import { useState, useEffect } from "react";
import { C } from "../../theme.js";
import { linearScale, autoTicks, formatValue } from "./scales.js";
import { ChartCard } from "./ChartCard.jsx";
import { LineSeries } from "./LineSeries.jsx";
import { BarSeries } from "./BarSeries.jsx";

// ── Main chart component ────────────────────────────────────────────
// Renders a chart card with SVG grid/axes and dispatches to the right
// series renderer (line, bar). Add more series types here as needed.
//
// Props (from slide data):
//   chart.type       "line" | "bar"
//   chart.title      Card header label
//   chart.unit       e.g. "USD, billions"
//   chart.yMax       Max Y value (auto-detected if omitted)
//   chart.yTicks     Array of Y tick values (auto-generated if omitted)
//   chart.yFormat    Template like "${}B" (optional)
//   chart.xLabels    Array of { label, at } for X-axis (line) or strings (bar)
//   chart.series     Array of series objects
//   chart.legend     Array of { label, style, color } (optional)
//   chart.showArea   default true for line charts
//
// Series object:
//   { label, style: "solid"|"dashed", color, showDots, showValues, showArea,
//     points: [{ x, xVal, value, label, showValue }] }
//
// For line charts: points use xVal (numeric position on X axis).
// For bar charts: points use implicit index matching chart.xLabels order.

// Sample N items evenly from an array, always keeping first and last.
// Used to thin x-axis labels on narrow charts so they don't collide.
function thinLabels(arr, maxCount) {
  if (arr.length <= maxCount) return arr;
  if (maxCount < 2) return [arr[0]];
  const step = (arr.length - 1) / (maxCount - 1);
  const out = [];
  for (let i = 0; i < maxCount; i++) out.push(arr[Math.round(i * step)]);
  return out;
}

const DESKTOP = {
  margin: { top: 30, right: 20, bottom: 40, left: 48 },
  W: 760,
  defaultH: 180,
  fontSize: 10,
};
const MOBILE = {
  margin: { top: 20, right: 12, bottom: 30, left: 36 },
  W: 380,
  defaultH: 140,
  fontSize: 14,
};

export function Chart({ chart, isActive }) {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isActive !== false) {
      const t = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [isActive]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const cfg = isMobile ? MOBILE : DESKTOP;
  const MARGIN = cfg.margin;
  const W = cfg.W;
  const FONT_SIZE = cfg.fontSize;

  const { type = "line", series = [] } = chart;
  const H = isMobile ? (chart.mobileHeight || cfg.defaultH) : (chart.height || cfg.defaultH);
  const plotW = W - MARGIN.left - MARGIN.right;
  const plotH = H - MARGIN.top - MARGIN.bottom;

  // ── Compute Y range ──
  const allValues = series.flatMap((s) => s.points.map((p) => p.value));
  const dataMax = Math.max(...allValues, 0);
  const yMax = chart.yMax || Math.ceil(dataMax * 1.15);
  const yMin = 0;
  const yTicks = chart.yTicks || autoTicks(yMax);
  const yScale = linearScale(yMin, yMax, MARGIN.top + plotH, MARGIN.top);

  // ── Compute X range ──
  let xScale, xLabels;

  if (type === "bar") {
    // Bar: categories are evenly spaced
    const cats = chart.xLabels || [];
    const catCount = cats.length || series[0]?.points.length || 1;
    xScale = (idx) => MARGIN.left + (plotW / catCount) * (idx + 0.5);
    xLabels = cats.map((label, i) => ({
      label: typeof label === "string" ? label : label.label,
      x: xScale(i),
    }));
  } else {
    // Line: continuous X axis from data
    const allX = series.flatMap((s) =>
      s.points.map((p) => (p.xVal != null ? p.xVal : 0))
    );
    const xMin = chart.xMin != null ? chart.xMin : Math.min(...allX);
    const xMax = chart.xMax != null ? chart.xMax : Math.max(...allX);
    xScale = linearScale(xMin, xMax, MARGIN.left, MARGIN.left + plotW);

    // Attach xVal to each point for the series renderer
    series.forEach((s) => {
      s.points.forEach((p, i) => {
        if (p.xVal == null) p.xVal = i;
      });
    });

    xLabels = (chart.xLabels || []).map((item) => {
      const label = typeof item === "string" ? item : item.label;
      const at = typeof item === "string" ? 0 : item.at;
      return { label, x: xScale(at) };
    });
  }

  // ── X label thinning ──
  // On narrow viewports, drop intermediate labels so they don't collide.
  // Always keeps first and last; samples evenly in between. Generic — works
  // for any chart without per-chart config. Default cap is 4 on mobile.
  const visibleXLabels = isMobile && xLabels.length > 4
    ? thinLabels(xLabels, chart.mobileMaxXLabels || 4)
    : xLabels;

  // ── Legend ──
  const legend = chart.legend || series.filter((s) => s.label).map((s) => ({
    label: s.label,
    style: s.style || "solid",
    color: s.color,
  }));

  return (
    <ChartCard title={chart.title} unit={chart.unit} legend={legend} visible={visible}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", overflow: "visible" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines + Y labels */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={MARGIN.left} x2={W - MARGIN.right}
              y1={yScale(v)} y2={yScale(v)}
              stroke={C.borderLight} strokeWidth={1}
              strokeDasharray="4 3"
            />
            <text
              x={MARGIN.left - 8} y={yScale(v) + 3}
              textAnchor="end"
              style={{ fontSize: FONT_SIZE, fill: C.textMuted, fontFamily: "'Inter', -apple-system, sans-serif" }}
            >
              {formatValue(chart.yFormat, v)}
            </text>
          </g>
        ))}

        {/* Baseline */}
        <line
          x1={MARGIN.left} x2={W - MARGIN.right}
          y1={yScale(yMin)} y2={yScale(yMin)}
          stroke="rgba(74,28,42,0.2)" strokeWidth={1}
        />

        {/* X labels + tick marks */}
        {visibleXLabels.map((item, i) => (
          <g key={i}>
            <text
              x={item.x} y={H - 4}
              textAnchor="middle"
              style={{
                fontSize: FONT_SIZE, fill: C.textMuted,
                fontFamily: "'Inter', -apple-system, sans-serif",
                fontWeight: 600,
              }}
            >
              {item.label}
            </text>
            <line
              x1={item.x} x2={item.x}
              y1={yScale(yMin)} y2={yScale(yMin) + 5}
              stroke="rgba(74,28,42,0.15)" strokeWidth={1}
            />
          </g>
        ))}

        {/* Series */}
        {type === "line" && (
          <LineSeries
            series={series}
            xScale={xScale}
            yScale={yScale}
            yMin={yMin}
            plotH={plotH}
            margin={MARGIN}
            visible={visible}
          />
        )}
        {type === "bar" && (
          <BarSeries
            series={series}
            categories={chart.xLabels || []}
            xScale={xScale}
            yScale={yScale}
            yMin={yMin}
            plotW={plotW}
            margin={MARGIN}
            visible={visible}
          />
        )}
      </svg>
    </ChartCard>
  );
}
