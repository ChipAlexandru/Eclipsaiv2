import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { C, FONT } from "../theme.js";
import { AnimNum } from "../components/AnimNum.jsx";

// /about — shelf-level page promoted from the old Chapter 5 in milestone 3.
// Not a slide: no eyebrow/title/divider chrome, no prev/next, no scroll-snap.
// Scrollable long-form content: headline, intro, capabilities grid, five-phase
// methodology, big-number credential, LinkedIn CTA.
//
// Reached two ways: "Read more →" from the Home About popup, or direct nav in
// milestone 5 when URL routing lands (/offering/about).
export function AboutPage({ about, onBack }) {
  return (
    <div style={{
      height: "100vh",
      overflowY: "auto",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.sans,
    }}>
      <div style={{
        maxWidth: 760, margin: "0 auto",
        padding: "clamp(40px, 8vh, 96px) clamp(24px, 5vw, 56px) 96px",
      }}>
        {/* Back button — slim, vermillion, top-left */}
        <button
          onClick={onBack}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", cursor: "pointer",
            color: C.accent, fontSize: 13, fontWeight: 600,
            padding: "4px 0", marginBottom: 32,
          }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Wordmark — subtle, ties to the Home masthead */}
        <div style={{ marginBottom: 28, animation: "cardSlideUp 0.5s ease both" }}>
          <div style={{
            fontSize: 13, fontWeight: 800, color: C.wine,
            letterSpacing: 3, textTransform: "uppercase",
          }}>
            Eclipsai
          </div>
          <div style={{ width: 32, height: 2, background: C.accent, marginTop: 7 }} />
        </div>

        {/* Headline */}
        <div style={{ animation: "cardSlideUp 0.5s ease 0.08s both" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.textMuted,
            letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14,
          }}>
            About
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 5.2vw, 56px)",
            fontWeight: 900, margin: 0,
            lineHeight: 1.05, color: C.text, letterSpacing: -1.2,
            fontFamily: FONT.serif,
          }}>
            {about.headline}
          </h1>
          <div style={{ width: 60, height: 3, background: C.accent, marginTop: 22, borderRadius: 2 }} />
        </div>

        {/* Name + intro */}
        <div style={{ marginTop: 36, animation: "cardSlideUp 0.5s ease 0.16s both" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>
            {about.name}
          </div>
          <div style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>
            {about.blurb}
          </div>
          <p style={{
            fontSize: 16, color: C.text, lineHeight: 1.75, marginTop: 22,
            fontFamily: FONT.serif,
          }}>
            {about.intro}
          </p>
        </div>

        {/* Capabilities grid — 3 cards, vermillion top-border */}
        {about.capabilities?.length > 0 && (
          <div style={{ marginTop: 56, animation: "cardSlideUp 0.5s ease 0.24s both" }}>
            <SectionLabel>What we do</SectionLabel>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14, marginTop: 18,
            }}>
              {about.capabilities.map((cap, i) => (
                <div key={i} style={{
                  padding: "20px 18px", borderRadius: 12,
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderTop: `3px solid ${C.accent}`,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 6, fontFamily: FONT.serif }}>
                    {cap.title}
                  </div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
                    {cap.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Five-phase methodology — numbered list, no cards */}
        {about.phases?.length > 0 && (
          <div style={{ marginTop: 56, animation: "cardSlideUp 0.5s ease 0.32s both" }}>
            <SectionLabel>Five-phase methodology</SectionLabel>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, maxWidth: 620, marginTop: 10 }}>
              Traditional consulting rigor combined with rapid AI iteration. Most consultants lack technical depth; most technical teams lack consulting structure. Eclipsai bridges both.
            </p>
            <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 20 }}>
              {about.phases.map((ph) => (
                <div key={ph.num} style={{
                  display: "flex", gap: 22,
                  paddingBottom: 18,
                  borderBottom: `1px solid ${C.borderLight}`,
                }}>
                  <div style={{
                    flex: "0 0 54px",
                    fontSize: 38, fontWeight: 900,
                    color: C.wine, opacity: 0.35,
                    lineHeight: 1, fontFamily: FONT.serif,
                  }}>
                    {ph.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: FONT.serif, marginBottom: 4 }}>
                      {ph.title}
                    </div>
                    <div style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7 }}>
                      {ph.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credential callout */}
        {about.credential && (
          <CredentialCallout credential={about.credential} />
        )}

        {/* LinkedIn CTA */}
        <div style={{ marginTop: 48, animation: "cardSlideUp 0.5s ease 0.48s both" }}>
          <a
            href={about.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 8,
              background: C.accent, color: "#fff",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 16, height: 16, borderRadius: 2,
              background: "rgba(255,255,255,0.22)",
              fontSize: 10, fontWeight: 900,
            }}>in</span>
            Connect on LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}

// Credential callout with IntersectionObserver-triggered number animation.
function CredentialCallout({ credential }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  // Parse leading number from value like "15+"
  const m = String(credential.value).match(/^(\d+)(.*)$/);
  return (
    <div ref={ref} style={{ marginTop: 52, animation: "cardSlideUp 0.5s ease 0.4s both" }}>
      <div style={{
        padding: "26px 30px", borderRadius: 14,
        background: C.accentBg, border: `1px solid ${C.accentBorder}`,
        display: "flex", alignItems: "center", gap: 26,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: C.accent, lineHeight: 1, fontFamily: FONT.serif }}>
            {m ? <AnimNum value={parseInt(m[1], 10)} unit={m[2]} visible={visible} /> : credential.value}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: 1.2 }}>
            {credential.label}
          </div>
        </div>
        <div style={{ width: 1, height: 52, background: C.accentBorder }} />
        <div style={{ fontSize: 14, color: C.textLight, lineHeight: 1.65 }}>
          {credential.sub}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: C.textMuted,
      letterSpacing: 2, textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}
