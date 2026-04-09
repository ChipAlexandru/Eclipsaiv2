import { C } from "../theme.js";

// Left navigation rail — brand mark (home button) + Cover link + chapter list with sub-bullets.
// Extracted verbatim from definitive.jsx. The collapsible behavior promised by the brief
// (toggle to icon-only on narrow viewports) lands in a later polish pass — milestone 1
// is a behavior-preserving refactor only.
export function LeftRail({
  chapters,
  activeChapter,
  activeSlide,
  onNavigate,
  onGoHome,
  onGoCover,
  isCoverActive,
  isSlides,
}) {
  return (
    <div className="leftRailDesktop" style={{
      width: 220, flexShrink: 0, padding: "24px 0 24px 20px", overflowY: "auto",
      borderRight: `1px solid ${C.border}`, background: C.bg,
      display: "flex", flexDirection: "column",
    }}>
      {/* Eclipsai masthead — persistent signature AND home button */}
      <button onClick={onGoHome} style={{
        padding: "2px 12px 18px 2px", marginBottom: 10,
        background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div style={{
          fontSize: 13, fontWeight: 800, color: C.wine,
          letterSpacing: 3, textTransform: "uppercase",
        }}>
          Eclipsai
        </div>
        <div style={{ width: 32, height: 2, background: C.accent, marginTop: 7 }} />
      </button>

      {/* Cover (deck title) button */}
      <button onClick={onGoCover} style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
        background: isCoverActive ? C.accentBg : "transparent", marginBottom: 10,
        transition: "background 0.2s",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: isCoverActive ? C.accent : C.textMuted,
          letterSpacing: 2, textTransform: "uppercase",
        }}>
          Cover
        </div>
      </button>

      <div style={{ height: 1, background: C.border, marginBottom: 14, marginRight: 20 }} />

      {chapters.map((ch) => {
        const isActive = ch.id === activeChapter && isSlides;
        return (
          <div key={ch.id} style={{ marginBottom: 12, position: "relative" }}>
            {isActive && (
              <div style={{
                position: "absolute", left: 0, top: 4, bottom: 4, width: 3,
                background: C.accent, borderRadius: 2,
              }} />
            )}
            <button onClick={() => onNavigate(ch.id, 0)} style={{
              display: "block", width: "100%",
              padding: "6px 12px 6px 14px", borderRadius: 6, border: "none", cursor: "pointer", textAlign: "left",
              background: "transparent",
              transition: "background 0.2s",
              fontSize: 12,
              fontWeight: 700,
              color: isActive ? C.text : C.textLight,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ color: C.textMuted, marginRight: 6, fontWeight: 700 }}>{ch.num}</span>
              {ch.title}
            </button>
            <div style={{ padding: "2px 0 2px 14px" }}>
              {ch.slides.slice(0, 4).map((sl, si) => {
                const isCurrentSlide = isActive && si === activeSlide;
                return (
                  <button key={sl.id} onClick={() => onNavigate(ch.id, si)} style={{
                    display: "block", width: "100%", padding: "3px 10px", borderRadius: 4, border: "none",
                    cursor: "pointer", textAlign: "left", fontSize: 11, lineHeight: 1.4,
                    color: isCurrentSlide ? C.accent : C.textMuted,
                    fontWeight: 500,
                    background: "transparent",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {sl.title.length > 34 ? sl.title.slice(0, 32) + "…" : sl.title}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
