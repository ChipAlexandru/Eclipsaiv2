import { C } from "../theme.js";
import { NavList } from "./NavList.jsx";

// Left navigation rail — brand mark (home button) + chapter list with sub-bullets.
export function LeftRail({
  deckTitle,
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

      <div style={{ height: 1, background: C.border, marginBottom: 14, marginRight: 20 }} />

      <NavList
        chapters={chapters}
        activeChapter={activeChapter}
        activeSlide={activeSlide}
        isSlides={isSlides}
        onNavigate={onNavigate}
        size="compact"
      />
    </div>
  );
}
