import { useState } from "react";
import { ArrowDown as ArrowDownIcon } from "lucide-react";
import { C, FONT } from "../theme.js";
import { AboutPopup } from "../components/AboutPopup.jsx";
import { VideoCard } from "../components/VideoCard.jsx";

// Global Home (decision 1C). One home for the whole shelf.
// Renders: masthead (wordmark + About link), headline, three featured cards, scroll hint.
// Featured cards deep-link into specific slides in specific decks via `shelf.featured`.
//
// The about popup's stacking context fix (zIndex 1001 on the masthead row) is preserved here.
export function HomePage({ shelf, onNavigate, onOpenAbout }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const { about, featured } = shelf;

  return (
    <div style={{
      maxWidth: 960, width: "100%", margin: "0 auto",
      display: "flex", flexDirection: "column", gap: "clamp(28px, 4vh, 48px)",
      padding: "8px 4px",
      position: "relative",
    }}>
      {/* Masthead row — wordmark left, About link right.
          zIndex 1001 wins the stacking contest against the headline below. */}
      <div style={{
        animation: "cardSlideUp 0.5s ease both",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 24,
        position: "relative", zIndex: 1001,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.wine, letterSpacing: 3.5, textTransform: "uppercase" }}>
            Eclipsai
          </div>
          <div style={{ width: 44, height: 2, background: C.accent, marginTop: 8 }} />
        </div>
        <div style={{ position: "relative", zIndex: 1001 }}>
          <button
            onClick={() => setAboutOpen(v => !v)}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 15, fontWeight: 600, color: C.accent,
              padding: "4px 0",
            }}
          >
            About
          </button>
          <AboutPopup
            open={aboutOpen}
            onClose={() => setAboutOpen(false)}
            name={about.name}
            blurb={about.blurb}
            linkedinUrl={about.linkedinUrl}
            onReadMore={onOpenAbout}
          />
        </div>
      </div>

      {/* Headline — the always-true statement of what we're about */}
      <div style={{ animation: "cardSlideUp 0.6s ease 0.12s both" }}>
        <h1 style={{
          fontSize: "clamp(32px, 5.2vw, 60px)",
          fontWeight: 900,
          margin: 0,
          lineHeight: 1.05,
          color: C.text,
          letterSpacing: -1.4,
          maxWidth: 820,
        }}>
          Most AI programs stall at pilots.{" "}
          <span style={{ color: C.accent }}>Ours don't.</span>
        </h1>
      </div>

      {/* Three editorial picks. Two slide cards + video, video last. */}
      <div style={{ animation: "cardSlideUp 0.5s ease 0.28s both" }}>
        <div
          className="featuredGrid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        >
          {featured.map((f, i) => {
            if (f.kind === "video") {
              return <VideoCard key={i} title={f.title} src={f.src} poster={f.poster} />;
            }
            return (
              <button
                key={i}
                onClick={() => onNavigate(f.deckId, f.chapterId, f.slideIdx)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  padding: "28px 24px 22px",
                  borderRadius: 12,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.25s",
                  minHeight: 220,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = C.accent;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <div style={{
                  fontSize: 22, fontWeight: 800, color: C.text,
                  lineHeight: 1.22, letterSpacing: -0.5, marginBottom: 14,
                  fontFamily: FONT.serif,
                }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, flex: 1 }}>
                  {f.blurb}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll hint — deck-agnostic, the shelf may grow */}
      <div style={{
        animation: "cardSlideUp 0.5s ease 0.42s both",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 28, height: 1, background: C.textMuted, opacity: 0.35 }} />
        <span style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
          Or scroll to begin
        </span>
        <ArrowDownIcon size={12} color={C.textMuted} style={{ opacity: 0.55 }} />
      </div>
    </div>
  );
}
