import { X, ArrowRight } from "lucide-react";
import { C } from "../theme.js";

// About popup — anchored to the About link in the Home masthead.
// Preserves the exact styling from definitive.jsx: cream #FFFCF7, drops downward,
// z-index 1001 on the masthead row so it wins the stacking context against the headline.
// The caller is responsible for rendering this inside a positioned ancestor with
// zIndex: 1001, and for wiring the open/close state + LinkedIn URL from the shelf.
//
// The popup stays deliberately thin. The full /about content (methodology, phases,
// credentials — promoted from the old Chapter 5 in m3) lives on the AboutPage,
// reached via the "Read more →" link at the bottom.
export function AboutPopup({ open, onClose, name, blurb, linkedinUrl, onReadMore }) {
  if (!open) return null;
  return (
    <>
      {/* Click-outside catcher */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 999 }}
      />
      <div style={{
        position: "absolute", top: "calc(100% + 12px)", right: 0,
        zIndex: 1000,
        width: 280,
        background: "#FFFCF7",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "18px 20px 18px",
        boxShadow: "0 16px 48px rgba(74,28,42,0.18)",
        animation: "cardSlideUp 0.2s ease both",
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 8, right: 10,
            background: "transparent", border: "none",
            cursor: "pointer", color: C.textMuted,
            padding: 4, lineHeight: 0,
          }}
        >
          <X size={14} />
        </button>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>
          {name}
        </div>
        <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.55, marginTop: 8 }}>
          {blurb}
        </div>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 14,
            padding: "7px 12px",
            borderRadius: 6,
            background: C.accent,
            fontSize: 12, fontWeight: 700, color: "#fff",
            textDecoration: "none",
          }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 14, height: 14, borderRadius: 2,
            background: "rgba(255,255,255,0.22)",
            fontSize: 9, fontWeight: 900,
          }}>in</span>
          LinkedIn
        </a>

        {/* Read more — navigates to the full /about page */}
        {onReadMore && (
          <>
            <div style={{ height: 1, background: C.border, margin: "14px 0 10px" }} />
            <button
              onClick={() => { onReadMore(); onClose(); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "transparent", border: "none", cursor: "pointer",
                color: C.accent, fontSize: 12, fontWeight: 600, padding: 0,
              }}
            >
              Read more
              <ArrowRight size={12} />
            </button>
          </>
        )}
      </div>
    </>
  );
}
