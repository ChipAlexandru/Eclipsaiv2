"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { C, FONT, GLOBAL_CSS } from "./theme.js";
import { shelf, getDeck } from "./decks/index.js";
import { LeftRail } from "./components/LeftRail.jsx";
import { CopyLinkButton } from "./components/CopyLinkButton.jsx";
import { HomePage } from "./views/HomePage.jsx";
import { CoverPage } from "./views/CoverPage.jsx";
import { SlidePage } from "./views/SlidePage.jsx";
import { AboutPage } from "./views/AboutPage.jsx";

// ─── MAIN APP SHELL ──────────────────────────────────────────────────
// Routing + state + keyboard/scroll navigation + vertical transitions.
//
// State shape:
//   view        : "home" | "cover" | "slides" | "about"
//   activeDeck  : deck id (ignored on home + about)
//   chapterIdx  : index into the active deck's chapters
//   slideIdx    : index into the current chapter's slides
//
// URL model (m5.3): the app is mounted from multiple Next.js routes, each
// passing initialView/initialDeckId/initialChapterId/initialSlideIdx as props
// so direct hits deep-link into the right state. In-session navigation still
// runs through setState + animatedNav (for smooth transitions); a useEffect
// mirrors state → URL via history.replaceState so Copy link + reloads keep
// the user where they are without a full route re-mount. Browser back/forward
// is intentionally not a slide navigator — it goes to the previous document.
//
// "about" is a shelf-level page (not a deck slide). It takes over the whole
// viewport — no rail, no progress bar, no kbd/scroll capture — and exits via
// its own back button.
export default function App({
  initialView = "home",
  initialDeckId,
  initialChapterId,
  initialSlideId,
}) {
  const startDeckId = initialDeckId || shelf.decks[0].id;
  const startDeck = getDeck(startDeckId) || shelf.decks[0];
  const startChapterIdx = initialChapterId
    ? Math.max(0, startDeck.chapters.findIndex((c) => c.id === initialChapterId))
    : 0;
  const startChapter = startDeck.chapters[startChapterIdx];
  const startSlideIdx = initialSlideId
    ? Math.max(0, startChapter.slides.findIndex((s) => s.id === initialSlideId))
    : 0;

  const [view, setView] = useState(initialView);
  const [activeDeckId, setActiveDeckId] = useState(startDeck.id);
  const [chapterIdx, setChapterIdx] = useState(startChapterIdx);
  const [slideIdx, setSlideIdx] = useState(startSlideIdx);
  const [transition, setTransition] = useState("none");
  const [articleOpen, setArticleOpen] = useState(
    typeof window !== "undefined" && window.location.hash === "#article"
  );
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

  // Mirror state → URL so Copy link + reloads drop the user at the same place.
  // replaceState (not pushState) means browser back doesn't step through slides,
  // it steps out of the site — that's intentional for a single-page deck feel.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let path = "/";
    if (view === "about") path = "/about";
    else if (view === "cover") path = `/${activeDeckId}`;
    else if (view === "slides") path = `/${activeDeckId}/${chapter.id}/${slide.id}`;
    const hash = articleOpen ? "#article" : "";
    const fullPath = path + hash;
    if (window.location.pathname + window.location.hash !== fullPath) {
      window.history.replaceState(null, "", fullPath);
    }
  }, [view, activeDeckId, chapterIdx, slideIdx, chapter.id, slide.id, articleOpen]);

  // ── Animated navigation helper ────────────────────────────────────
  const animatedNav = useCallback((direction, navFn) => {
    if (transition !== "none") return;
    setArticleOpen(false);
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
  // Switches deck, chapter, and slide in a single nav. Slide is identified by
  // its stable id so reordering chapters never breaks shared links.
  const openFeatured = useCallback((deckId, chapterId, slideId) => {
    const targetDeck = getDeck(deckId);
    if (!targetDeck) return;
    const ci = targetDeck.chapters.findIndex(c => c.id === chapterId);
    if (ci < 0) return;
    const si = slideId
      ? Math.max(0, targetDeck.chapters[ci].slides.findIndex(s => s.id === slideId))
      : 0;
    animatedNav("forward", () => {
      setActiveDeckId(deckId);
      setChapterIdx(ci);
      setSlideIdx(si);
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
  const closeArticle = useCallback(() => {
    setArticleOpen(false);
    const canvas = document.querySelector("[data-slide-canvas]");
    if (canvas) canvas.scrollTo(0, 0);
  }, []);

  const openArticle = useCallback(() => {
    setArticleOpen(true);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (articleOpen && e.key === "Escape") {
      e.preventDefault();
      closeArticle();
      return;
    }
    if (articleOpen) return; // let browser handle scroll naturally
    if (transition !== "none") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
      e.preventDefault(); next();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault(); prev();
    }
  }, [next, prev, transition, articleOpen, closeArticle]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handler = (e) => {
      // When article is expanded, let the browser handle all scrolling.
      if (articleOpen) return;
      // If the slide canvas is scrollable, allow native scroll until the
      // user reaches the top/bottom edge — only then trigger slide nav.
      const canvas = el.querySelector("[data-slide-canvas]");
      if (canvas && canvas.scrollHeight > canvas.clientHeight + 2) {
        const atTop = canvas.scrollTop <= 0;
        const atBottom = canvas.scrollTop + canvas.clientHeight >= canvas.scrollHeight - 2;
        if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
      }
      e.preventDefault();
      if (transition !== "none" || scrollCooldown.current) return;
      scrollCooldown.current = true;
      if (e.deltaY > 0) next();
      else if (e.deltaY < 0) prev();
      setTimeout(() => { scrollCooldown.current = false; }, 900);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [next, prev, transition, articleOpen]);

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
  const isAbout = view === "about";

  // About is a shelf-level page — no rail, no progress, no kbd/wheel capture.
  // Early-return before the main shell so the AboutPage owns the viewport.
  if (isAbout) {
    return (
      <div style={{ fontFamily: FONT.sans }}>
        <style>{GLOBAL_CSS}</style>
        <AboutPage
          about={shelf.about}
          onBack={() => setView("home")}
        />
      </div>
    );
  }

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
            deckTitle={deck.title}
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
      <div ref={contentRef} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* Copy link — only meaningful on cover/slide routes, hidden on home */}
        {(isCover || isSlides) && <CopyLinkButton />}
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
        <div
          data-slide-canvas
          style={{
          flex: 1,
          display: "flex",
          alignItems: isSlides ? "flex-start" : "center",
          justifyContent: "center",
          padding: isSlides
            ? "clamp(24px, 4vh, 48px) clamp(20px, 4vw, 48px) clamp(16px, 3vh, 40px)"
            : "clamp(16px, 3vh, 40px) clamp(20px, 4vw, 48px)",
          overflow: isSlides ? "auto" : "hidden",
        }}>
          <div style={{
            maxWidth: isHome ? 900 : 840,
            width: "100%",
            ...getSlideStyle(),
          }}>
            {isHome && <HomePage shelf={shelf} onNavigate={openFeatured} onOpenAbout={() => setView("about")} />}
            {isCover && <CoverPage deck={deck} onEnterChapter={enterChapter} />}
            {isSlides && <SlidePage chapter={chapter} slide={slide} slideKey={slide.id} articleOpen={articleOpen} onArticleOpen={openArticle} onArticleClose={closeArticle} />}
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
