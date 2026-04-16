import { useState } from "react";
import { ArrowDown as ArrowDownIcon } from "lucide-react";
import { C, FONT } from "../theme.js";
import { AboutPopup } from "../components/AboutPopup.jsx";
import { getLatestSlides } from "../decks/index.js";
import { useIsMobile } from "../hooks/useIsMobile.js";

// Global Home (decision 1C). One home for the whole shelf.
// Renders: masthead, headline, three chapter cards, Latest row, scroll hint.
//
// Chapter cards link to the first slide in each chapter (kind: "chapter").
// Latest cards auto-pick the 3 most recently added slides by dateAdded.
export function HomePage({ shelf, onNavigate, onOpenAbout }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const isMobile = useIsMobile();
  const { about, featured } = shelf;
  const latest = getLatestSlides();

  // Format "2026-04-10" → "Apr 10"
  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div style={{
      maxWidth: 960, width: "100%", margin: "0 auto",
      display: "flex", flexDirection: "column", gap: "clamp(28px, 4vh, 48px)",
      padding: "8px 4px",
      position: "relative",
    }}>
      {/* Masthead row — wordmark left, About link right. */}
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
            onReadMore={process.env.NODE_ENV === "development" ? onOpenAbout : undefined}
          />
        </div>
      </div>

      {/* Headline */}
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
          <span style={{ color: C.accent }}>The Playbook:</span>{" "}
          every role, dramatically{" "}<span style={{ color: C.accent }}>more capable.</span>
        </h1>
      </div>

      {/* Chapter cards — 3 cards, each links to first slide in that chapter */}
      <div style={{ animation: "cardSlideUp 0.5s ease 0.28s both" }}>
        <div
          className="featuredGrid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        >
          {featured.map((f, i) => (
            <button
              key={i}
              className="hover-lift"
              onClick={() => onNavigate(f.deckId, f.chapterId, f.kind === "slide" ? f.slideId : undefined)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                padding: "28px 24px 22px",
                borderRadius: 12,
                background: C.surface,
                border: `1px solid ${C.border}`,
                cursor: "pointer", textAlign: "left",
                minHeight: 220,
              }}
            >
              {f.label && (
                <div style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: 2,
                  textTransform: "uppercase", color: C.accent,
                  marginBottom: 12,
                }}>
                  {f.label}
                </div>
              )}
              <div style={{
                fontSize: 22, fontWeight: 800, color: C.text,
                lineHeight: 1.22, letterSpacing: -0.5, marginBottom: 14,
                fontFamily: FONT.serif,
                // Reserve two lines so blurbs align across cards whether
                // the title wraps or not.
                minHeight: "2.44em",
              }}>
                {f.title}
              </div>
              <div style={{ fontSize: 15, color: C.textLight, lineHeight: 1.6, flex: 1 }}>
                {f.blurb}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Latest — auto-picks the 3 most recently added slides */}
      {latest.length > 0 && (
        <div style={{ animation: "cardSlideUp 0.5s ease 0.36s both" }}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: 2,
            textTransform: "uppercase", color: C.textMuted,
            marginBottom: 12,
          }}>
            Latest
          </div>
          <div
            className="featuredGrid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
          >
            {latest.map((s, i) => (
              <button
                key={i}
                className="hover-lift"
                onClick={() => onNavigate(s.deckId, s.chapterId, s.slideId)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  padding: "20px 20px 16px",
                  borderRadius: 12,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{
                  fontSize: 16, fontWeight: 700, color: C.text,
                  lineHeight: 1.3, letterSpacing: -0.3,
                  fontFamily: FONT.serif,
                  marginBottom: 10,
                  // Reserve two lines so the date row aligns across cards
                  // whether the title wraps or not.
                  minHeight: "2.6em",
                }}>
                  {s.title}
                </div>
                {s.sortDate && (
                  <div style={{ fontSize: 12, color: C.textMuted }}>
                    {s.dateUpdated ? `Updated ${fmtDate(s.sortDate)}` : fmtDate(s.sortDate)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scroll/tap hint — copy switches by input modality */}
      <div style={{
        animation: "cardSlideUp 0.5s ease 0.46s both",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 28, height: 1, background: C.textMuted, opacity: 0.35 }} />
        <span style={{ fontSize: 10, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
          {isMobile ? "Tap a chapter to begin" : "Or scroll to begin"}
        </span>
        {!isMobile && <ArrowDownIcon size={12} color={C.textMuted} style={{ opacity: 0.55 }} />}
      </div>
    </div>
  );
}
