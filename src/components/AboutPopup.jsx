"use client";
import { useEffect } from "react";
import { ABOUT } from "../aboutContent.js";
import { C, FONT } from "../theme.js";

// ─── SHARED ABOUT POPUP ──────────────────────────────────────────────
// One popup, rendered once per surface and opened from the SiteHeader's About
// link (and the product-home footer). Fixed top-right card (responsive width)
// with a full-screen click-catcher behind it; Esc closes. Copy is single-
// sourced from aboutContent.js so it matches the /about page verbatim.
//
// `position: fixed` (not anchored to a specific button) means it shows
// correctly even on the product deck, where the header repeats on every
// section — the host renders just one popup and it lands under the visible
// header regardless of which section is in view.
export function AboutPopup({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const { paras, name, blurb, linkedinUrl } = ABOUT;

  return (
    <>
      {/* Click-outside catcher */}
      <button
        type="button"
        aria-label="Close About"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 1999, background: "transparent", border: 0, padding: 0, cursor: "default" }}
      />
      <div
        role="dialog"
        aria-label="About Eclipsai"
        style={{
          position: "fixed",
          top: 64,
          right: "clamp(16px, 4vw, 48px)",
          zIndex: 2000,
          width: "min(420px, calc(100vw - 32px))",
          maxHeight: "calc(100dvh - 88px)",
          overflowY: "auto",
          background: "#FFFCF7",
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "26px 30px 24px",
          boxShadow: "0 16px 48px rgba(74,28,42,0.18)",
          fontFamily: FONT.sans,
          textAlign: "left",
          animation: "cardSlideUp 0.2s ease both",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{ position: "absolute", top: 8, right: 10, background: "transparent", border: 0, cursor: "pointer", color: C.textLight, padding: 4, lineHeight: 1, fontSize: 16, fontFamily: FONT.sans }}
        >
          ×
        </button>
        {paras.map((para, i) => (
          <p key={i} style={{ fontSize: 14, lineHeight: 1.54, color: C.textMed, margin: i === 0 ? 0 : "10px 0 0" }}>
            {para}
          </p>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
          <div>
            <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>{name}</span>
            <span style={{ display: "block", fontSize: 13, color: C.textLight, lineHeight: 1.55, marginTop: 4 }}>{blurb}</span>
          </div>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.accent, fontSize: 12, fontWeight: 700, color: "#fff", textDecoration: "none", flexShrink: 0 }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: 2, background: "rgba(255,255,255,0.22)", fontSize: 9, fontWeight: 900 }}>in</span>
            LinkedIn
          </a>
        </div>
      </div>
    </>
  );
}
