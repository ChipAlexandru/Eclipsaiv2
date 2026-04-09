import { useState, useEffect, useCallback, useRef } from "react";
import { C, FONT, GLOBAL_CSS } from "./theme.js";
import { shelf, getDeck } from "./decks/index.js";
import { LeftRail } from "./components/LeftRail.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { CoverPage } from "./pages/CoverPage.jsx";
import { SlidePage } from "./pages/SlidePage.jsx";

// ─── MAIN APP SHELL ──────────────────────────────────────────────────
// Routing + state + keyboard/scroll navigation + vertical transitions.
//
// State shape (milestone 1 — in-memory only, URL routing lands in the
// Next.js migration milestone):
//   view        : "home" | "cover" | "slides"
//   activeDeck  : deck id (ignored on home)
//   chapterIdx  : index into the active deck's chapters
//   slideIdx    : index into the current chapter's slides
//
// For now the shelf has a single deck, so activeDeck defaults to the first one
// and deep-linking from Home sets it via openFeatured().
export default function App() {
  const [view, setView] = useState("home");
  const [activeDeckId, setActiveDeckId] = useState(shelf.decks[0].id);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [transition, setTransition] = useState("none");
  const scrollCooldown = useRef(false);
  const contentRef = useRef(null);
  const rootRef = useRef(null);
  const pendingNav = useRef(null);

  useEffect(() => {
    if (rootRef.current) rootRef.current.focus();
  }, []);

  const deck = getDeck(activeDeckId);
  const chapter = deck.chapters[chapterIdx];
  const slide = chapter.slides[slideIdx];
  const totalSlides = chapter.slides.length;

  // ── Animated navigation helper ────────────────────────────────────
  const animatedNav = useCallback((direction, navFn) => {
    if (transition !== "none") return;
    pendingNav.current = navFn;
    setTransition(direction === "forward" ? "out-up" : "out-down");
  }, [transition]);

  useEffect(() => {
    if (transition === "out-up" || transition === "out-down") {
      const t = setTimeout(() => {
        if (pendingNav.current) pendingNav.current();
        pendingNav.current = null;
        setTransition(transition === "out-up" ? "in-up" : "in-down");
      }, 220);
      return () => clearTimeout(t);
    }
    if (transition === "in-up" || transition === "in-down") {
      const t = setTimeout(() => setTransition("none"), 280);
      return () => clearTimeout(t);
    }
  }, [transition]);

  // ── Navigation commands ───────────────────────────────────────────
  const enterChapter = useCallback((ci) => {
    animatedNav("forward", () => { setView("slides"); setChapterIdx(ci); setSlideIdx(0); });
  }, [animatedNav]);

  const goHome = useCallback(() => {
    animatedNav("backward", () => { setView("home"); });
  }, [animatedNav]);

  const goCover = useCallback(() => {
    animatedNav("forward", () => { setView("cover"); });
  }, [animatedNav]);

  // Intra-deck navigation (used by rail + Cover cards).
  const navigate = useCallback((chId, sIdx) => {
    const ci = deck.chapters.findIndex(c => c.id === chId);
    if (ci < 0) return;
    if (view !== "slides") {
      animatedNav("forward", () => { setView("slides"); setChapterIdx(ci); setSlideIdx(sIdx || 0); });
    } else {
      const goForward = ci > chapterIdx || (ci === chapterIdx && sIdx > slideIdx);
      animatedNav(goForward ? "forward" : "backward", () => { setChapterIdx(ci); setSlideIdx(sIdx || 0); });
    }
  }, [view, chapterIdx, slideIdx, animatedNav, deck]);

  // Cross-deck deep link from Home's featured picks.
  // Switches deck, chapter, and slide in a single nav.
  const openFeatured = useCallback((deckId, chapterId, sIdx) => {
    const targetDeck = getDeck(deckId);
    if (!targetDeck) return;
    const ci = targetDeck.chapters.findIndex(c => c.id === chapterId);
    if (ci < 0) return;
    animatedNav("forward", () => {
      setActiveDeckId(deckId);
      setChapterIdx(ci);
      setSlideIdx(sIdx || 0);
      setView("slides");
    });
  }, [animatedNav]);

  const next = useCallback(() => {
    if (view === "home") {
      animatedNav("forward", () => setView("cover"));
      return;
    }
    if (view === "cover") {
      animatedNav("forward", () => { setView("slides"); setChapterIdx(0); setSlideIdx(0); });
      return;
    }
    if (slideIdx < totalSlides - 1) {
      animatedNav("forward", () => setSlideIdx(s => s + 1));
    } else if (chapterIdx < deck.chapters.length - 1) {
      animatedNav("forward", () => { setChapterIdx(c => c + 1); setSlideIdx(0); });
    }
  }, [view, slideIdx, totalSlides, chapterIdx, animatedNav, deck]);

  const prev = useCallback(() => {
    if (view === "home") return;
    if (view === "cover") {
      animatedNav("backward", () => setView("home"));
      return;
    }
    if (slideIdx === 0 && chapterIdx === 0) {
      animatedNav("backward", () => setView("cover"));
      return;
    }
    if (slideIdx > 0) {
      animatedNav("backward", () => setSlideIdx(s => s - 1));
    } else if (chapterIdx > 0) {
      animatedNav("backward", () => {
        setChapterIdx(c => c - 1);
        setSlideIdx(deck.chapters[chapterIdx - 1].slides.length - 1);
      });
    }
  }, [view, slideIdx, chapterIdx, animatedNav, deck]);

  // ── Keyboard + wheel navigation ───────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (transition !== "none") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
      e.preventDefault(); next();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault(); prev();
    }
  }, [next, prev, transition]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      if (transition !== "none" || scrollCooldown.current) return;
      scrollCooldown.current = true;
      if (e.deltaY > 0) next();
      else if (e.deltaY < 0) prev();
      setTimeout(() => { scrollCooldown.current = false; }, 900);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [next, prev, transition]);

  // ── Slide transition styles ───────────────────────────────────────
  const getSlideStyle = () => {
    const base = { transition: "opacity 0.22s ease, transform 0.22s ease" };
    switch (transition) {
      case "out-up": return { ...base, opacity: 0, transform: "translateY(-50px)" };
      case "out-down": return { ...base, opacity: 0, transform: "translateY(50px)" };
      case "in-up": return { ...base, opacity: 0, transform: "translateY(50px)", animation: "slideEnterFromBelow 0.28s ease forwards" };
      case "in-down": return { ...base, opacity: 0, transform: "translateY(-50px)", animation: "slideEnterFromAbove 0.28s ease forwards" };
      default: return { ...base, opacity: 1, transform: "translateY(0)" };
    }
  };

  const isHome = view === "home";
  const isCover = view === "cover";
  const isSlides = view === "slides";

  // Flat index for progress bar: home = 0, cover = 1, slides = 2+
  const totalContentSlides = deck.chapters.reduce((a, ch) => a + ch.slides.length, 0);
  const flatTotal = 2 + totalContentSlides;
  let flatIdx = 0;
  if (isHome) flatIdx = 0;
  else if (isCover) flatIdx = 1;
  else {
    let counter = 2;
    for (let ci = 0; ci < deck.chapters.length; ci++) {
      for (let si = 0; si < deck.chapters[ci].slides.length; si++) {
        if (ci === chapterIdx && si === slideIdx) { flatIdx = counter; break; }
        counter++;
      }
      if (ci === chapterIdx) break;
    }
  }

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={{
        display: "flex", height: "100vh", background: C.bg,
        fontFamily: FONT.sans, color: C.text, outline: "none",
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* Left rail — hidden on Home, slides in on cover/slides */}
      {!isHome && (
        <div style={{ animation: "railSlideIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
          <LeftRail
            chapters={deck.chapters}
            activeChapter={chapter.id}
            activeSlide={slideIdx}
            onNavigate={navigate}
            onGoHome={goHome}
            onGoCover={goCover}
            isCoverActive={isCover}
            isSlides={isSlides}
          />
        </div>
      )}

      {/* Main Content */}
      <div ref={contentRef} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar: progress */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ height: 3, background: C.borderLight }}>
            <div style={{
              height: "100%", background: C.accent,
              width: `${((flatIdx + 1) / flatTotal) * 100}%`,
              transition: "width 0.5s ease", borderRadius: "0 2px 2px 0",
            }} />
          </div>
        </div>

        {/* Slide canvas */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: isSlides ? "flex-start" : "center",
          justifyContent: "center",
          padding: isSlides
            ? "clamp(24px, 4vh, 48px) clamp(20px, 4vw, 48px) clamp(16px, 3vh, 40px)"
            : "clamp(16px, 3vh, 40px) clamp(20px, 4vw, 48px)",
          overflow: "hidden",
        }}>
          <div style={{
            maxWidth: isHome ? 900 : 840,
            width: "100%",
            maxHeight: "calc(100vh - 120px)",
            ...getSlideStyle(),
          }}>
            {isHome && <HomePage shelf={shelf} onNavigate={openFeatured} />}
            {isCover && <CoverPage deck={deck} onEnterChapter={enterChapter} />}
            {isSlides && <SlidePage chapter={chapter} slide={slide} slideKey={slide.id} />}
          </div>
        </div>

        {/* Bottom: progress dots */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "14px 32px", flexShrink: 0,
        }}>
          {isSlides && chapter.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => navigate(chapter.id, i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === slideIdx ? 24 : 7, height: 7, borderRadius: 4, border: "none",
                background: i === slideIdx ? C.accent : C.border,
                cursor: "pointer", transition: "all 0.3s", padding: 0,
              }}
            />
          ))}
          {isSlides && <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 4 }}>{slideIdx + 1}/{totalSlides}</span>}
          {isHome && <span style={{ fontSize: 11, color: "transparent" }}>·</span>}
          {isCover && <span style={{ fontSize: 11, color: "transparent" }}>·</span>}
        </div>
      </div>
    </div>
  );
}
