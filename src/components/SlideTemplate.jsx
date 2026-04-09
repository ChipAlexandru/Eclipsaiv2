import { C } from "../theme.js";

// The global slide chrome (decision 4A). Every content slide renders inside this.
// Fixed zones:
//   - Eyebrow (32px) — "<num> · <chapter title>", uppercase wine, letter-spaced
//   - Title     (84px) — action title, serif, 2 lines max via -webkit-line-clamp
//   - Divider rule — 1px border below the title zone
//   - Body region — children, starts at the same Y on every slide
//
// Note: the brief's locked type spec says 32px eyebrow / 84px title / vermillion 60×3px divider.
// The current prototype uses smaller inline font sizes (10/28) inside 32/84 height zones and
// a full-width 1px divider instead of 60×3px. Milestone 1 is a behavior-preserving refactor —
// those spec upgrades land in a later polish pass, not here.
export function SlideTemplate({ eyebrow, title, children }) {
  return (
    <>
      {/* Eyebrow zone — fixed 32px */}
      <div style={{
        height: 32, display: "flex", alignItems: "center",
        fontSize: 10, fontWeight: 700, color: C.textMuted,
        textTransform: "uppercase", letterSpacing: 2,
      }}>
        {eyebrow}
      </div>
      {/* Title zone — fixed 84px, 2 lines max */}
      <div style={{
        height: 84, display: "flex", alignItems: "flex-start", paddingTop: 4,
      }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: C.text, margin: 0,
          lineHeight: 1.22, letterSpacing: -0.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {title}
        </h1>
      </div>
      {/* Divider rule */}
      <div style={{ height: 1, background: C.border, margin: "4px 0 24px 0" }} />
      {/* Body region */}
      {children}
    </>
  );
}
