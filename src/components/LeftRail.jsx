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
      {/* Wordmark/home now live in the global SiteHeader; the rail opens with
          the chapter list. */}
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
