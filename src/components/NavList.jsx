import { C } from "../theme.js";

// Shared chapter + slide navigation list used by both LeftRail (compact) and
// MobileDrawer (touch). The `size` prop switches between compact desktop sizing
// and larger touch-friendly targets.
export function NavList({
  chapters,
  activeChapter,
  activeSlide,
  isSlides = true,
  onNavigate,
  onBeforeNavigate,
  size = "compact",
}) {
  const isTouch = size === "touch";
  const truncateAt = isTouch ? 38 : 34;

  const handleNav = (chId, si) => {
    if (onBeforeNavigate) onBeforeNavigate();
    onNavigate(chId, si);
  };

  return (
    <>
      {chapters.map((ch) => {
        const isActive = isTouch ? ch.id === activeChapter : (ch.id === activeChapter && isSlides);
        return (
          <div key={ch.id} style={{ marginBottom: 12, position: "relative" }}>
            {isActive && (
              <div style={{
                position: "absolute", left: 0,
                top: isTouch ? 6 : 4,
                bottom: isTouch ? 6 : 4,
                width: 3,
                background: C.accent, borderRadius: 2,
              }} />
            )}
            <button
              onClick={() => handleNav(ch.id, 0)}
              style={{
                display: "block", width: "100%",
                padding: isTouch ? "12px 12px 12px 14px" : "6px 12px 6px 14px",
                minHeight: isTouch ? 44 : undefined,
                borderRadius: 6, border: "none", cursor: "pointer", textAlign: "left",
                background: "transparent",
                transition: "background 0.2s",
                fontSize: isTouch ? 13 : 12,
                fontWeight: 700,
                color: isActive ? C.text : C.textLight,
                letterSpacing: isTouch ? 0.4 : 0.3,
                textTransform: "uppercase",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onMouseEnter={!isTouch ? (e => { if (!isActive) e.currentTarget.style.background = C.surfaceHover; }) : undefined}
              onMouseLeave={!isTouch ? (e => { e.currentTarget.style.background = "transparent"; }) : undefined}
            >
              <span style={{ color: C.textMuted, marginRight: 6, fontWeight: 700 }}>{ch.num}</span>
              {ch.title}
            </button>
            <div style={{ padding: "2px 0 2px 14px" }}>
              {ch.slides.map((sl, si) => {
                const isCurrent = isActive && si === activeSlide;
                const rawLabel = sl.title || sl.component || "Slide";
                const label = rawLabel.length > truncateAt ? rawLabel.slice(0, truncateAt - 2) + "\u2026" : rawLabel;
                return (
                  <button
                    key={sl.id}
                    onClick={() => handleNav(ch.id, si)}
                    style={{
                      display: "flex", alignItems: "center", gap: isTouch ? 6 : 4,
                      width: "100%",
                      padding: isTouch ? "10px 12px" : "3px 10px",
                      minHeight: isTouch ? 44 : undefined,
                      borderRadius: isTouch ? 6 : 4,
                      border: "none",
                      cursor: "pointer", textAlign: "left",
                      fontSize: isTouch ? 13 : 11,
                      lineHeight: 1.4,
                      color: isCurrent ? C.accent : C.textMuted,
                      fontWeight: isTouch ? (isCurrent ? 600 : 500) : 500,
                      background: isTouch && isCurrent ? C.accentBg : "transparent",
                      transition: isTouch ? undefined : "color 0.2s",
                      whiteSpace: isTouch ? undefined : "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <span style={{ flex: isTouch ? 1 : undefined, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
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
    </>
  );
}
