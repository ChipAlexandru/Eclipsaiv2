import { SignalBars } from "./SignalBars.jsx";
import { RATING_LABELS, RATING_COLOR, RATING_DESCRIPTIONS } from "./constants.js";

// Explainer slide — what a skill is + the 3-level maturity framework + a
// working example. Full-bleed dark marketplace palette so it visually pairs
// with the directory slide that follows. Content lifted from the expanders
// in the original marketplace page header and promoted to slide-scale copy.
//
// Lives inside the deck's 840-wide slide canvas, so sizes are condensed from
// the original page treatment.
export function MarketplaceExplainer() {
  const gradient = "linear-gradient(160deg,#0f0f0f 0%,#1a1a1a 30%,#8b2500 100%)";

  return (
    <div
      style={{
        background: gradient,
        borderRadius: 14,
        padding: "26px 30px 28px",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow: "0 12px 40px rgba(0,0,0,.18)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "#fb923c",
            marginBottom: 6,
          }}
        >
          Skills for Claude Cowork
        </div>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#fff",
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "-.02em",
          }}
        >
          Tested skills, rated for production readiness
        </h2>
        <p
          style={{
            fontSize: 12.5,
            lineHeight: 1.55,
            color: "#d4a574",
            margin: "8px 0 0",
            maxWidth: 620,
          }}
        >
          Every skill is evaluated against real work using a blind-test methodology. Each gets
          a maturity rating so you know exactly what you're installing — not a demo, a benchmark.
        </p>
      </div>

      {/* Maturity cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[3, 2, 1].map((level) => (
          <div
            key={level}
            style={{
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <SignalBars rating={level} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: RATING_COLOR[level] }}>
                Level {level} — {RATING_LABELS[level]}
              </span>
            </div>
            <p style={{ fontSize: 10.5, lineHeight: 1.55, color: "#d4d4d8", margin: 0 }}>
              {RATING_DESCRIPTIONS[level]}
            </p>
          </div>
        ))}
      </div>

      {/* Example row */}
      <div
        style={{
          background: "rgba(255,255,255,.06)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 8,
          padding: "10px 18px",
          display: "flex",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            paddingRight: 18,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 10.5,
            lineHeight: 1.85,
            color: "#d4d4d8",
          }}
        >
          <div>
            <span style={{ color: "#fb923c" }}>name:</span>{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>Vendor Scorecard</span>
          </div>
          <div>
            <span style={{ color: "#fb923c" }}>description:</span>{" "}
            <span style={{ color: "#e4e4e7" }}>Evaluate and rank supplier performance</span>
          </div>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,.1)", flexShrink: 0 }} />
        <div style={{ flex: 1, paddingLeft: 18, fontSize: 11.5, lineHeight: 1.55, color: "#e4e4e7" }}>
          Score suppliers on <strong style={{ color: "#fff" }}>delivery</strong>,{" "}
          <strong style={{ color: "#fff" }}>quality</strong>,{" "}
          <strong style={{ color: "#fff" }}>cost</strong>, and{" "}
          <strong style={{ color: "#fff" }}>responsiveness</strong>. Flag anyone below 60%.
          Return a ranked table.
        </div>
      </div>

      {/* How it works row */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { title: "Install", desc: "Pick a skill from the directory and add it to Claude Cowork or Code in one click." },
          { title: "Use", desc: "Work normally. When your question matches a skill, Claude draws on that expertise automatically." },
          { title: "Customize", desc: "Edit any skill to match your company's frameworks, terminology, and standards." },
        ].map((s) => (
          <div
            key={s.title}
            style={{
              flex: 1,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
              {s.title}
            </div>
            <div style={{ fontSize: 10.5, lineHeight: 1.5, color: "#d4a574" }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
