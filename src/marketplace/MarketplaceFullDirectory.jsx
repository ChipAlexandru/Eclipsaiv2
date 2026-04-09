"use client";
// Full-page marketplace directory at /skills.
// Ported from the old skills-marketplace repo (app/page.js) as part of the m5.2
// migration. The deck-embedded slide version (MarketplaceDirectory.jsx) stays
// condensed for 840×620; this version is the full page with wider sidebar,
// bigger cards, and About popover. Both read from the same data adapter.
import { useState } from "react";
import Link from "next/link";
import { getSkills } from "./data.js";
import { INDUSTRIES, FUNCTIONS, BADGE_COLORS, RATING_LABELS, RATING_COLOR, RATING_DESCRIPTIONS } from "./constants.js";
import { SignalBars } from "./SignalBars.jsx";
import { RatingPill } from "./RatingPill.jsx";

const ChevronIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function FullSkillCard({ skill, index }) {
  const bc = skill.badge ? BADGE_COLORS[skill.badge] : "#e4e4e7";
  return (
    <Link href={`/skills/${skill.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        className="mp-full-card"
        style={{
          background: "#fff",
          border: "1px solid #e4e4e7",
          borderLeft: `3px solid ${bc}`,
          borderRadius: 10,
          padding: "20px 22px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          transition: "all .15s",
          cursor: "pointer",
          height: "100%",
          animation: `fadeUp .35s ease ${index * 0.04}s both`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#18181b" }}>{skill.name}</span>
              {skill.badge && (
                <span style={{ fontSize: 10, fontWeight: 700, color: bc, background: `${bc}12`, border: `1px solid ${bc}30`, padding: "1px 8px", borderRadius: 4 }}>
                  {skill.badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: "#a1a1aa" }}>{skill.author}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <RatingPill rating={skill.rating} />
            <span className="mp-full-card-arrow" style={{ color: "#d4d4d8", transition: "color .15s" }}>
              <ArrowIcon />
            </span>
          </div>
        </div>
        <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#52525b", margin: 0, flex: 1 }}>{skill.description}</p>
      </div>
    </Link>
  );
}

export function MarketplaceFullDirectory() {
  const allSkills = getSkills();
  const [ind, setInd] = useState(null);
  const [fns, setFns] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  const [showMaturity, setShowMaturity] = useState(false);

  const togFn = (id) => setFns((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const clear = () => {
    setInd(null);
    setFns([]);
  };

  const filtered = allSkills.filter((p) => {
    if (ind && !p.industries.includes(ind)) return false;
    if (fns.length && !fns.some((f) => p.functions.includes(f))) return false;
    return true;
  });

  const cnt = (id) => allSkills.filter((p) => p.industries.includes(id)).length;
  const any = !!(ind || fns.length);
  const activeIndustries = INDUSTRIES.filter((i) => cnt(i.id) > 0).sort((a, b) => cnt(b.id) - cnt(a.id));

  const gradient = "linear-gradient(160deg,#0f0f0f 0%,#1a1a1a 30%,#8b2500 100%)";

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        .mp-full-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.06); transform: translateY(-1px); }
        .mp-full-card:hover .mp-full-card-arrow { color: #c2410c !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: gradient, color: "#fff" }}>
        <nav style={{ maxWidth: 1140, margin: "0 auto", padding: "18px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-.02em", textDecoration: "none" }}>
            Business Skills for Claude Cowork
          </Link>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/about" style={{ fontSize: 13, fontWeight: 500, color: "#fb923c", textDecoration: "none" }}>
              About
            </Link>
          </div>
        </nav>

        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "14px 36px 22px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <p style={{ fontSize: 18, fontStyle: "italic", color: "#a1a1aa", textAlign: "right", marginBottom: 18, lineHeight: 1.5 }}>
            "Turn expertise, procedures, and best practices into reusable capabilities so Claude can apply them automatically, every time."
            <br />
            <span style={{ fontStyle: "normal", fontWeight: 600 }}>Anthropic</span>
          </p>

          <button
            onClick={() => setShowMaturity(!showMaturity)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fb923c" }}>
              {showMaturity ? "Hide" : "What do the"} maturity ratings mean?
            </span>
            <ChevronIcon open={showMaturity} />
          </button>

          {showMaturity && (
            <div style={{ marginTop: 10, width: "100%", maxWidth: 860, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[3, 2, 1].map((level) => (
                <div key={level} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <SignalBars rating={level} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: RATING_COLOR[level] }}>
                      Level {level} — {RATING_LABELS[level]}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: "#d4d4d8", margin: 0 }}>{RATING_DESCRIPTIONS[level]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "16px 36px 60px", display: "flex", gap: 36, alignItems: "flex-start" }}>
        {/* SIDEBAR — industries */}
        <aside style={{ width: 220, flexShrink: 0, position: "sticky", top: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, paddingLeft: 10 }}>
            Industry
          </p>
          <button
            onClick={() => setInd(null)}
            style={{ display: "flex", alignItems: "center", width: "100%", padding: "8px 10px", borderRadius: 7, border: "none", background: !ind ? "#fff7ed" : "transparent", cursor: "pointer" }}
          >
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: !ind ? 600 : 400, color: !ind ? "#c2410c" : "#71717a", textAlign: "left" }}>All industries</span>
            <span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 10, color: !ind ? "#ea580c" : "#d4d4d8" }}>{allSkills.length}</span>
          </button>
          {activeIndustries.map((item) => {
            const a = ind === item.id;
            const c = cnt(item.id);
            return (
              <button
                key={item.id}
                onClick={() => setInd(a ? null : item.id)}
                style={{ display: "flex", alignItems: "center", width: "100%", padding: "8px 10px", borderRadius: 7, border: "none", background: a ? "#fff7ed" : "transparent", cursor: "pointer", marginTop: 1 }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 3, background: item.color, marginRight: 8, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: a ? 600 : 400, color: a ? "#c2410c" : "#18181b", textAlign: "left" }}>{item.label}</span>
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 10, color: a ? "#ea580c" : "#a1a1aa" }}>{c}</span>
              </button>
            );
          })}
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
              Function
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {FUNCTIONS.map((fn) => {
                const a = fns.includes(fn.id);
                const hasSkills = allSkills.some((s) => s.functions.includes(fn.id));
                return (
                  <button
                    key={fn.id}
                    onClick={() => (hasSkills ? togFn(fn.id) : null)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 7,
                      border: `1.5px solid ${a ? fn.color + "50" : hasSkills ? "#e4e4e7" : "#f4f4f5"}`,
                      background: a ? fn.color + "0a" : hasSkills ? "#fff" : "#fafafa",
                      cursor: hasSkills ? "pointer" : "default",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: a ? 700 : 500, color: a ? fn.color : hasSkills ? "#52525b" : "#d4d4d8", lineHeight: 1.2 }}>
                      {fn.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {any && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {ind &&
                (() => {
                  const item = INDUSTRIES.find((i) => i.id === ind);
                  return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: `${item.color}10`, color: item.color, border: `1px solid ${item.color}25` }}>
                      {item.label}
                      <span onClick={() => setInd(null)} style={{ cursor: "pointer", opacity: 0.5 }}>
                        <CloseIcon />
                      </span>
                    </span>
                  );
                })()}
              {fns.map((fid) => {
                const fn = FUNCTIONS.find((f) => f.id === fid);
                return (
                  <span
                    key={fid}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: `${fn.color}10`, color: fn.color, border: `1px solid ${fn.color}25` }}
                  >
                    {fn.label}
                    <span onClick={() => togFn(fid)} style={{ cursor: "pointer", opacity: 0.5 }}>
                      <CloseIcon />
                    </span>
                  </span>
                );
              })}
              <button
                onClick={clear}
                style={{ fontSize: 12, fontWeight: 500, color: "#a1a1aa", background: "none", border: "none", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}
              >
                Clear all
              </button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {filtered.map((p, i) => (
              <FullSkillCard key={p.id} skill={p} index={i} />
            ))}
          </div>

          {!filtered.length && (
            <div style={{ padding: "64px 0", textAlign: "center", fontSize: 14, color: "#a1a1aa" }}>
              No skills match these filters.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
