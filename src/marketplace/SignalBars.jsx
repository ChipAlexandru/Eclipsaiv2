import { RATING_COLOR } from "./constants.js";

// Three ascending bars that fill based on the rating (1–3). Empty bars render
// in light grey. Used in both the RatingPill on cards and the maturity
// explainer slide. Preserved pixel-for-pixel from the original marketplace.
export function SignalBars({ rating }) {
  const bars = [5, 9, 13];
  const w = 5, gap = 3;
  const totalW = w * 3 + gap * 2;
  const totalH = 13;
  const filled = RATING_COLOR[rating] || "#d4d4d8";
  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      style={{ display: "block", flexShrink: 0 }}
    >
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * (w + gap)}
          y={totalH - h}
          width={w}
          height={h}
          rx={1.5}
          fill={i < rating ? filled : "#e4e4e7"}
        />
      ))}
    </svg>
  );
}
