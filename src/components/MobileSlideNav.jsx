import { ChevronLeft, ChevronRight } from "lucide-react";
import { C } from "../theme.js";

// Mobile bottom bar — prev/next chevrons flanking progress dots.
// Extracted from App.jsx to keep the shell focused on state + routing.
export function MobileSlideNav({
  chapter,
  slideIdx,
  chapterIdx,
  totalChapters,
  onPrev,
  onNext,
  onNavigate,
}) {
  const totalSlides = chapter.slides.length;
  const isFirst = chapterIdx === 0 && slideIdx === 0;
  const isLastInChapter = slideIdx === totalSlides - 1;
  const isLastEverywhere = isLastInChapter && chapterIdx === totalChapters - 1;
  const nextEntersNewChapter = isLastInChapter && !isLastEverywhere;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px 10px", flexShrink: 0,
      gap: 6,
    }}>
      <button
        onClick={onPrev}
        disabled={isFirst}
        aria-label="Previous slide"
        style={{
          width: 52, height: 52, borderRadius: 999,
          background: C.surface,
          border: `1px solid ${C.border}`,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          cursor: isFirst ? "default" : "pointer",
          opacity: isFirst ? 0.35 : 1,
          color: C.accent, padding: 0, flexShrink: 0,
        }}
      >
        <ChevronLeft size={22} />
      </button>

      <div style={{
        display: "flex", alignItems: "center", gap: 2,
        flex: 1, justifyContent: "center",
        overflow: "hidden",
      }}>
        {chapter.slides.map((_, i) => (
          <button
            key={i}
            onClick={() => onNavigate(chapter.id, i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: 28, height: 44, padding: 0,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "none", cursor: "pointer",
            }}
          >
            <span style={{
              display: "block",
              width: i === slideIdx ? 26 : 8,
              height: 8,
              borderRadius: 5,
              background: i === slideIdx ? C.accent : C.border,
              transition: "all 0.3s",
            }} />
          </button>
        ))}
        <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 8, whiteSpace: "nowrap" }}>
          {slideIdx + 1}/{totalSlides}
        </span>
      </div>

      <button
        onClick={onNext}
        disabled={isLastEverywhere}
        aria-label="Next slide"
        style={{
          width: 52, height: 52, borderRadius: 999,
          background: nextEntersNewChapter ? C.accent : C.surface,
          border: `1px solid ${nextEntersNewChapter ? C.accent : C.border}`,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          cursor: isLastEverywhere ? "default" : "pointer",
          opacity: isLastEverywhere ? 0.35 : 1,
          color: nextEntersNewChapter ? "#FFFCF7" : C.accent,
          padding: 0, flexShrink: 0,
          transition: "background 0.3s, color 0.3s, border-color 0.3s",
        }}
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}
