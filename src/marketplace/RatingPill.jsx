import { SignalBars } from "./SignalBars.jsx";
import { RATING_LABELS, RATING_COLOR } from "./constants.js";

// Inline bars + rating label, used on SkillCard. Renders nothing for null.
export function RatingPill({ rating }) {
  if (!rating) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <SignalBars rating={rating} />
      <span style={{ fontSize: 11, fontWeight: 600, color: RATING_COLOR[rating] }}>
        {RATING_LABELS[rating]}
      </span>
    </div>
  );
}
