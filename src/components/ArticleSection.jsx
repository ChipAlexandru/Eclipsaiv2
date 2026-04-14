import { useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { C, FONT } from "../theme.js";

// Compute reading time from article sections.
function computeReadingTime(sections) {
  const words = sections.reduce((acc, s) => {
    const text = s.body || s.text || "";
    return acc + text.split(/\s+/).filter(Boolean).length;
  }, 0);
  return Math.max(1, Math.ceil(words / 200)) + " min read";
}

// ── "Continue reading" trigger ─────────────────────────────────────
export function ArticleTrigger({ article, onOpen }) {
  const readingTime = article.readingTime || computeReadingTime(article.sections);
  return (
    <button
      onClick={onOpen}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", maxWidth: 700,
        padding: "10px 0",
        marginTop: 6,
        borderTop: `1px solid ${C.border}`,
        border: "none", borderTop: `1px solid ${C.border}`,
        background: "transparent",
        cursor: "pointer",
        transition: "background 0.2s",
        borderRadius: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = C.accentBg; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ChevronDown size={14} color={C.accent} />
        <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>
          Continue reading
        </span>
      </span>
      <span style={{ fontSize: 12, color: C.textMuted }}>{readingTime}</span>
    </button>
  );
}

// ── Expanded article content ───────────────────────────────────────
export function ArticleContent({ article, onClose }) {
  const articleRef = useRef(null);

  useEffect(() => {
    // Scroll the article into view after mount
    if (articleRef.current) {
      articleRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div
      ref={articleRef}
      style={{
        maxWidth: 660,
        marginTop: 24,
        opacity: 0,
        transform: "translateY(20px)",
        animation: "articleEnter 0.3s ease forwards",
      }}
    >
      {/* Inline keyframes */}
      <style>{`
        @keyframes articleEnter {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Sticky "Back to slide" bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: C.bg,
        padding: "8px 0",
        borderBottom: `1px solid ${C.borderLight}`,
        marginBottom: 24,
        boxShadow: "0 2px 8px rgba(74,28,42,0.04)",
      }}>
        <button
          onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", cursor: "pointer",
            padding: "4px 0",
          }}
        >
          <ChevronUp size={14} color={C.accent} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.accent }}>
            Back to slide view
          </span>
        </button>
      </div>

      {/* Accent separator */}
      <div style={{ width: 48, height: 1, background: C.accentBorder, marginBottom: 28 }} />

      {/* Article title */}
      {article.title && (
        <h2 className="article-title-h2" style={{
          fontSize: 22, fontWeight: 800, color: C.text,
          lineHeight: 1.3, margin: "0 0 24px 0",
          fontFamily: FONT.serif,
        }}>
          {article.title}
        </h2>
      )}

      {/* Sections */}
      {article.sections.map((section, i) => {
        if (section.type === "pullquote") {
          return (
            <div key={i} style={{
              borderLeft: `3px solid ${C.accent}`,
              paddingLeft: 20,
              margin: "24px 0",
            }}>
              <p style={{
                fontSize: 17, fontStyle: "italic", color: C.wine,
                lineHeight: 1.7, margin: 0,
                fontFamily: FONT.serif,
              }}>
                {section.text}
              </p>
              {section.source && (
                <p style={{
                  fontSize: 12, color: C.textMuted, marginTop: 8,
                  fontStyle: "normal",
                }}>
                  — {section.source}
                </p>
              )}
            </div>
          );
        }

        if (section.type === "callout") {
          return (
            <div key={i} style={{
              padding: "24px 28px", borderRadius: 14,
              background: C.accentBg, border: `1px solid ${C.accentBorder}`,
              display: "flex", alignItems: "center", gap: 24,
              margin: "24px 0",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.accent, lineHeight: 1.1 }}>
                  {section.value}
                </div>
                {section.label && (
                  <div style={{
                    fontSize: 11, color: C.textMuted, marginTop: 4,
                    textTransform: "uppercase", letterSpacing: 1.2,
                  }}>
                    {section.label}
                  </div>
                )}
              </div>
              {section.sub && (
                <>
                  <div style={{ width: 1, height: 44, background: C.accentBorder }} />
                  <div style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6 }}>
                    {section.sub}
                  </div>
                </>
              )}
            </div>
          );
        }

        // Default: prose section (optional subhead + body + optional bullet list)
        return (
          <div key={i} style={{ marginTop: i > 0 ? 0 : 0 }}>
            {section.subhead && (
              <h3 style={{
                fontSize: 20, fontWeight: 700, color: C.text,
                fontFamily: FONT.serif,
                margin: 0, marginTop: i > 0 ? 32 : 0, marginBottom: 12,
                lineHeight: 1.3,
              }}>
                {section.subhead}
              </h3>
            )}
            {section.body && (
              <p style={{
                fontSize: 15, color: C.text, lineHeight: 1.85,
                fontFamily: FONT.serif,
                margin: 0, marginTop: section.subhead ? 0 : (i > 0 ? 18 : 0),
              }}>
                {section.body}
              </p>
            )}
            {section.items && section.items.length > 0 && (
              <ul style={{
                margin: 0, marginTop: (section.subhead || section.body) ? 12 : (i > 0 ? 18 : 0),
                paddingLeft: 22,
                fontSize: 15, color: C.text, lineHeight: 1.75,
                fontFamily: FONT.serif,
              }}>
                {section.items.map((item, j) => (
                  <li key={j} style={{ marginBottom: 6 }}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {/* Footer sources */}
      {article.sources && article.sources.length > 0 && (
        <div style={{ marginTop: 32, borderTop: `1px solid ${C.borderLight}`, paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            Sources
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {article.sources.map((s, i) => (
              <li key={i} style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: "none" }}>
                    {s.label}
                  </a>
                ) : s.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Legacy plain-text source */}
      {!article.sources && article.source && (
        <div style={{
          marginTop: 32, fontSize: 12, fontStyle: "italic", color: C.textMuted,
        }}>
          Source: {article.source}
        </div>
      )}

      {/* Bottom spacer */}
      <div style={{ height: 48 }} />
    </div>
  );
}
