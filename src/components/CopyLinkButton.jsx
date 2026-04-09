import { useState } from "react";
import { C } from "../theme.js";

// Small top-right pill that copies the current URL. Mounted on cover + slide
// views (not home, not about) so anyone reading a deep-linked slide can share
// it verbatim. Intentionally minimal chrome — this is not the page's focus.
export function CopyLinkButton() {
  const [ok, setOk] = useState(false);

  const copy = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setOk(true);
    setTimeout(() => setOk(false), 1800);
  };

  return (
    <button
      onClick={copy}
      aria-label="Copy link to this slide"
      style={{
        position: "absolute",
        top: 14,
        right: 18,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 999,
        border: `1px solid ${ok ? "#16a34a" : C.border}`,
        background: ok ? "#f0fdf4" : C.surface,
        color: ok ? "#16a34a" : C.textMuted,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        cursor: "pointer",
        transition: "all .18s",
        zIndex: 100,
      }}
    >
      {ok ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Copy link
        </>
      )}
    </button>
  );
}
