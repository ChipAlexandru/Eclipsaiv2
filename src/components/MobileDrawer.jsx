import { useEffect } from "react";
import { X, Home as HomeIcon } from "lucide-react";
import { C } from "../theme.js";

// Full-screen nav drawer for mobile. Mirrors LeftRail content (Home, deck title,
// chapter list with sub-bullets) but sized for touch (44px row minimum).
// Renders nothing when !open. Locks body scroll while open.
export function MobileDrawer({
  open,
  onClose,
  deckTitle,
  chapters,
  activeChapter,
  activeSlide,
  onNavigate,
  onGoHome,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(26,10,18,0.45)",
          zIndex: 50,
          animation: "drawerScrimIn 0.2s ease both",
        }}
      />
      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label="Navigation"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: "min(86vw, 320px)",
          background: C.bg,
          borderRight: `1px solid ${C.border}`,
          boxShadow: "20px 0 40px rgba(0,0,0,0.18)",
          zIndex: 51,
          padding: "22px 18px 28px",
          overflowY: "auto",
          display: "flex", flexDirection: "column",
          animation: "drawerSlideIn 0.26s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* Eclipsai mark + close */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: 18,
        }}>
          <div>
            <div style={{
              fontSize: 13, fontWeight: 800, color: C.wine,
              letterSpacing: 3, textTransform: "uppercase",
            }}>
              Eclipsai
            </div>
            <div style={{ width: 32, height: 2, background: C.accent, marginTop: 7 }} />
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 44, height: 44,
              background: "transparent", border: "none", borderRadius: 10,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: C.text,
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Home button */}
        <button
          onClick={() => { onClose(); onGoHome(); }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px", minHeight: 44,
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            cursor: "pointer", textAlign: "left",
            fontSize: 14, fontWeight: 700, color: C.text,
            marginBottom: 18,
          }}
        >
          <HomeIcon size={16} />
          Home
        </button>

        {/* Deck title */}
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.textMuted,
          letterSpacing: 2, textTransform: "uppercase",
          padding: "0 4px", marginBottom: 10,
        }}>
          {deckTitle || "Cover"}
        </div>

        {chapters.map((ch) => {
          const isActive = ch.id === activeChapter;
          return (
            <div key={ch.id} style={{ marginBottom: 12, position: "relative" }}>
              {isActive && (
                <div style={{
                  position: "absolute", left: 0, top: 6, bottom: 6, width: 3,
                  background: C.accent, borderRadius: 2,
                }} />
              )}
              <button
                onClick={() => { onClose(); onNavigate(ch.id, 0); }}
                style={{
                  display: "block", width: "100%",
                  padding: "12px 12px 12px 14px", minHeight: 44,
                  background: "transparent", border: "none", borderRadius: 6,
                  cursor: "pointer", textAlign: "left",
                  fontSize: 13, fontWeight: 700,
                  color: isActive ? C.text : C.textLight,
                  letterSpacing: 0.4, textTransform: "uppercase", lineHeight: 1.3,
                }}
              >
                <span style={{ color: C.textMuted, marginRight: 6 }}>{ch.num}</span>
                {ch.title}
              </button>
              <div style={{ padding: "2px 0 2px 14px" }}>
                {ch.slides.map((sl, si) => {
                  const isCurrent = isActive && si === activeSlide;
                  const rawLabel = sl.title || sl.component || "Slide";
                  const label = rawLabel.length > 38 ? rawLabel.slice(0, 36) + "…" : rawLabel;
                  return (
                    <button
                      key={sl.id}
                      onClick={() => { onClose(); onNavigate(ch.id, si); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        width: "100%", padding: "10px 12px", minHeight: 44,
                        background: isCurrent ? C.accentBg : "transparent",
                        border: "none", borderRadius: 6,
                        cursor: "pointer", textAlign: "left",
                        fontSize: 13, lineHeight: 1.4,
                        color: isCurrent ? C.accent : C.textMuted,
                        fontWeight: isCurrent ? 600 : 500,
                      }}
                    >
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {label}
                      </span>
                      {sl.article && (
                        <span style={{
                          display: "inline-block", flexShrink: 0,
                          width: 5, height: 5, borderRadius: "50%",
                          background: C.wine, opacity: 0.6,
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
