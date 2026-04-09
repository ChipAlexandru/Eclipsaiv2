import { RatingPill } from "./RatingPill.jsx";
import { BADGE_COLORS } from "./constants.js";

// Single skill card — light surface, left accent rule colored by badge (or
// neutral when no badge). Click is wired by the parent (slide preview does
// nothing; the eventual /skills/[slug] route in m5 will navigate).
export function SkillCard({ skill, index, onClick }) {
  const bc = skill.badge ? BADGE_COLORS[skill.badge] : "#e4e4e7";
  return (
    <div
      onClick={onClick}
      className="mp-skill-card"
      style={{
        background: "#fff",
        border: "1px solid #e4e4e7",
        borderLeft: `3px solid ${bc}`,
        borderRadius: 10,
        padding: "14px 16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        cursor: onClick ? "pointer" : "default",
        transition: "all .15s",
        animation: `fadeUp .35s ease ${index * 0.035}s both`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 1, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#18181b" }}>{skill.name}</span>
            {skill.badge && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: bc,
                  background: `${bc}12`,
                  border: `1px solid ${bc}30`,
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                {skill.badge}
              </span>
            )}
          </div>
          <span style={{ fontSize: 10.5, color: "#a1a1aa" }}>{skill.author}</span>
        </div>
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          <RatingPill rating={skill.rating} />
        </div>
      </div>
      <p style={{ fontSize: 11.5, lineHeight: 1.55, color: "#52525b", margin: 0 }}>
        {skill.description}
      </p>
    </div>
  );
}
