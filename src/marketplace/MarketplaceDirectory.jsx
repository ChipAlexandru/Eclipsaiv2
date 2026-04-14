import { useState, useMemo } from "react";
import { SkillCard } from "./SkillCard.jsx";
import { INDUSTRIES, FUNCTIONS } from "./constants.js";
import { getSkills } from "./data.js";

// Interactive directory slide — condensed for the deck's 840-wide canvas.
// Industry filter (single-select sidebar) + function filter (multi-select pills).
// The card grid scrolls inside its own region so filters + header stay pinned.
//
// Behavior mirrors the original skills-marketplace/app/page.js. Dropped for
// space: About popover (deck already has its own About), maturity and example
// expanders (promoted to their own slide — see MarketplaceExplainer).
export function MarketplaceDirectory() {
  const allSkills = useMemo(() => getSkills(), []);
  const [ind, setInd] = useState(null);
  const [fns, setFns] = useState([]);

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
  const anyFilter = !!(ind || fns.length);

  // Sidebar industries — only show ones with skills, sorted by count DESC.
  const activeIndustries = INDUSTRIES
    .filter((i) => cnt(i.id) > 0)
    .sort((a, b) => cnt(b.id) - cnt(a.id));

  const gradient = "linear-gradient(160deg,#0f0f0f 0%,#1a1a1a 30%,#8b2500 100%)";

  return (
    <div
      style={{
        background: "#fafafa",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,.18)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        border: "1px solid rgba(0,0,0,.06)",
      }}
    >
      {/* Intro strip — dark gradient band with the Anthropic attribution.
          Slide title + eyebrow now come from SlideTemplate chrome. */}
      <div style={{ background: gradient, color: "#fff", padding: "10px 22px 11px" }}>
        <p
          style={{
            fontSize: 11,
            fontStyle: "italic",
            color: "#d4a574",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          "Turn expertise into reusable capabilities so Claude can apply them automatically."
          <span style={{ fontStyle: "normal", fontWeight: 600, color: "#fb923c", marginLeft: 8 }}>— Anthropic</span>
        </p>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", gap: 18, padding: "14px 22px 18px", alignItems: "flex-start" }}>
        {/* SIDEBAR — industries */}
        <aside style={{ width: 170, flexShrink: 0 }}>
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#a1a1aa",
              textTransform: "uppercase",
              letterSpacing: ".08em",
              margin: "0 0 6px",
              paddingLeft: 8,
            }}
          >
            Industry
          </p>
          <button
            onClick={() => setInd(null)}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "5px 8px",
              borderRadius: 6,
              border: "none",
              background: !ind ? "#fff7ed" : "transparent",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: 11.5,
                fontWeight: !ind ? 600 : 400,
                color: !ind ? "#c2410c" : "#71717a",
                textAlign: "left",
              }}
            >
              All industries
            </span>
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                fontSize: 9,
                color: !ind ? "#ea580c" : "#d4d4d8",
              }}
            >
              {allSkills.length}
            </span>
          </button>
          {activeIndustries.map((item) => {
            const active = ind === item.id;
            const c = cnt(item.id);
            return (
              <button
                key={item.id}
                onClick={() => setInd(active ? null : item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "5px 8px",
                  borderRadius: 6,
                  border: "none",
                  background: active ? "#fff7ed" : "transparent",
                  cursor: "pointer",
                  marginTop: 1,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    background: item.color,
                    marginRight: 7,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 11.5,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#c2410c" : "#18181b",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, monospace",
                    fontSize: 9,
                    color: active ? "#ea580c" : "#a1a1aa",
                  }}
                >
                  {c}
                </span>
              </button>
            );
          })}
        </aside>

        {/* MAIN — function pills + chips + grid */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Function pills */}
          <div style={{ marginBottom: 10 }}>
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#a1a1aa",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                margin: "0 0 5px",
              }}
            >
              Function
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {FUNCTIONS.map((fn) => {
                const active = fns.includes(fn.id);
                const hasSkills = allSkills.some((s) => s.functions.includes(fn.id));
                return (
                  <button
                    key={fn.id}
                    onClick={() => (hasSkills ? togFn(fn.id) : null)}
                    style={{
                      padding: "3px 9px",
                      borderRadius: 6,
                      border: `1.5px solid ${
                        active ? fn.color + "50" : hasSkills ? "#e4e4e7" : "#f4f4f5"
                      }`,
                      background: active
                        ? fn.color + "0a"
                        : hasSkills
                        ? "#fff"
                        : "#fafafa",
                      cursor: hasSkills ? "pointer" : "default",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: active ? 700 : 500,
                        color: active ? fn.color : hasSkills ? "#52525b" : "#d4d4d8",
                        lineHeight: 1.2,
                      }}
                    >
                      {fn.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active filter chips + clear */}
          {anyFilter && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              {ind &&
                (() => {
                  const item = INDUSTRIES.find((i) => i.id === ind);
                  return (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 10.5,
                        fontWeight: 600,
                        padding: "3px 9px",
                        borderRadius: 20,
                        background: `${item.color}10`,
                        color: item.color,
                        border: `1px solid ${item.color}25`,
                      }}
                    >
                      {item.label}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setInd(null);
                        }}
                        style={{ cursor: "pointer", opacity: 0.5, marginLeft: 2 }}
                      >
                        ×
                      </span>
                    </span>
                  );
                })()}
              {fns.map((fid) => {
                const fn = FUNCTIONS.find((f) => f.id === fid);
                return (
                  <span
                    key={fid}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: 20,
                      background: `${fn.color}10`,
                      color: fn.color,
                      border: `1px solid ${fn.color}25`,
                    }}
                  >
                    {fn.label}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        togFn(fid);
                      }}
                      style={{ cursor: "pointer", opacity: 0.5, marginLeft: 2 }}
                    >
                      ×
                    </span>
                  </span>
                );
              })}
              <button
                onClick={clear}
                style={{
                  fontSize: 10.5,
                  fontWeight: 500,
                  color: "#a1a1aa",
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  cursor: "pointer",
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Card grid — scrolls internally */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 9,
              maxHeight: 360,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {filtered.map((p, i) => (
              <SkillCard key={p.id} skill={p} index={i} />
            ))}
          </div>

          {!filtered.length && (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                fontSize: 12,
                color: "#a1a1aa",
              }}
            >
              No skills match these filters.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
