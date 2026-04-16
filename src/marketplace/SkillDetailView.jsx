"use client";
// Client view for /skills/[slug]. Ported from the old skills-marketplace repo
// (app/skill/[slug]/page.js) as part of m5.2. The server component at
// v2/app/skills/[slug]/page.jsx fetches the skill and passes it here; we keep
// this client-side because the CopyBtn uses navigator.clipboard + local state.
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Copy, Check, ArrowRight } from "lucide-react";
import { MP, FONT } from "../theme.js";
import { SignalBars } from "./SignalBars.jsx";
import { RATING_LABELS, RATING_COLOR, RATING_DESCRIPTIONS } from "./constants.js";

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 2000);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: 5,
        border: `1px solid ${MP.border}`,
        background: ok ? MP.successBg : MP.cardBg,
        color: ok ? MP.success : MP.textFaint,
        fontFamily: FONT.sans,
        fontSize: 11,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all .15s",
      }}
    >
      {ok ? (
        <>
          <Check size={13} color={MP.success} /> Copied
        </>
      ) : (
        <>
          <Copy size={13} /> Copy
        </>
      )}
    </button>
  );
}

function RatingDisplay({ rating }) {
  if (!rating) return null;
  const color = RATING_COLOR[rating] || MP.textMuted;
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: MP.textFaint, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
        Maturity
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <SignalBars rating={rating} />
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{RATING_LABELS[rating]}</span>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.6, color: MP.textMuted, margin: 0, maxWidth: 260 }}>{RATING_DESCRIPTIONS[rating]}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 0 }}>
      <div style={{ padding: "24px 0 10px", borderBottom: `2px solid ${MP.text}`, marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: MP.text, textTransform: "uppercase", letterSpacing: ".1em", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function SkillDetailView({ skill }) {
  if (!skill) {
    return (
      <div style={{ padding: "100px 0", textAlign: "center", color: MP.textFaint, fontFamily: FONT.sans }}>
        Skill not found.
      </div>
    );
  }

  const useCases = skill.use_cases || [];
  const inputs = skill.inputs || [];
  const outputs = skill.outputs || [];
  const howItWorks = skill.how_it_works || [];
  const installCmd = `/plugin install ${skill.slug}`;

  return (
    <div style={{ minHeight: "100vh", background: MP.bg, fontFamily: FONT.sans }}>
      {/* HEADER */}
      <div style={{ background: MP.headerGradient, color: "#fff" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "14px 36px 24px" }}>
          <Link
            href="/skills"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              color: MP.accent,
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
              marginBottom: 18,
            }}
          >
            <ArrowLeft size={14} /> Back to directory
          </Link>
          {skill.category && (
            <div style={{ fontSize: 11, fontWeight: 700, color: MP.accent, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
              {skill.category}
            </div>
          )}
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-.02em", margin: 0 }}>{skill.name}</h1>
        </div>
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 36px 60px" }}>
        {/* HERO CARD */}
        <div
          style={{
            background: MP.cardBg,
            border: `1px solid ${MP.border}`,
            borderRadius: 10,
            padding: "24px 28px",
            marginTop: 16,
            marginBottom: 8,
            boxShadow: "0 2px 12px rgba(0,0,0,.04)",
          }}
        >
          <div style={{ display: "flex", gap: 32, alignItems: "flex-start", marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${MP.borderLight}` }}>
            <div style={{ flex: 1, display: "flex", gap: 32 }}>
              {skill.version && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MP.textFaint, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>
                    Version
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: MP.text }}>{skill.version}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: MP.textFaint, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>
                  Publisher
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: MP.text }}>{skill.author}</div>
              </div>
              {skill.category && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MP.textFaint, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>
                    Category
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: MP.text }}>{skill.category}</div>
                </div>
              )}
            </div>
            {skill.rating && <RatingDisplay rating={skill.rating} />}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: MP.textMed, margin: 0 }}>{skill.description}</p>
        </div>

        {/* WHAT IT DOES */}
        <Section title="What it does">
          <p style={{ fontSize: 14, lineHeight: 1.75, color: MP.textMed, margin: "0 0 8px" }}>{skill.long_description || skill.description}</p>
        </Section>

        {/* WHAT YOU CAN ASK */}
        {useCases.length > 0 && (
          <Section title="What you can ask">
            <div style={{ display: "flex", padding: "0 16px 8px" }}>
              <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: MP.textFaint, textTransform: "uppercase", letterSpacing: ".06em" }}>
                Prompt
              </span>
              <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: MP.textFaint, textTransform: "uppercase", letterSpacing: ".06em" }}>
                What you get
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  style={{ display: "flex", background: MP.cardBg, border: `1px solid ${MP.border}`, borderRadius: 8, padding: "14px 16px", gap: 20 }}
                >
                  <p style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: MP.text, lineHeight: 1.55, margin: 0 }}>&ldquo;{uc.ask}&rdquo;</p>
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ flexShrink: 0, marginTop: 2 }}>
                      <ArrowRight size={16} color={MP.accent} />
                    </span>
                    <p style={{ fontSize: 12.5, lineHeight: 1.6, color: MP.textMuted, margin: 0 }}>{uc.returns}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* INPUTS */}
        {inputs.length > 0 && (
          <Section title="Inputs">
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              {inputs.map((inp, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 13.5, lineHeight: 1.65, color: MP.textMed }}>
                  <span style={{ color: MP.accent, fontSize: 18, lineHeight: 1, flexShrink: 0 }}>&bull;</span>
                  <span>
                    <span style={{ fontWeight: 700, color: MP.text }}>{inp.label}</span> — {inp.detail}
                    {inp.required ? " (required)" : ""}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* OUTPUT */}
        {outputs.length > 0 && (
          <Section title="Output">
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              {outputs.map((out, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 13.5, lineHeight: 1.65, color: MP.textMed }}>
                  <span style={{ color: MP.accent, fontSize: 18, lineHeight: 1, flexShrink: 0 }}>&bull;</span>
                  <span>
                    <span style={{ fontWeight: 700, color: MP.text }}>{out.label}</span> — {out.detail}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* TOOLS & INTEGRATIONS */}
        {skill.tools && (
          <Section title="Tools & Integrations">
            <p style={{ fontSize: 14, lineHeight: 1.75, color: MP.textMed, margin: "0 0 8px" }}>{skill.tools}</p>
          </Section>
        )}

        {/* HOW IT WORKS */}
        {howItWorks.length > 0 && (
          <Section title="How it works">
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
              {howItWorks.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      background: "#1a1a1a",
                      color: MP.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 13.5, lineHeight: 1.65, color: MP.textMed, margin: 0 }}>
                    <span style={{ fontWeight: 700, color: MP.text }}>{step.title}</span> — {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* SKILLS */}
        {skill.skills_summary && (
          <Section title="Skills">
            <p style={{ fontSize: 14, lineHeight: 1.75, color: MP.textMed, margin: "0 0 8px" }}>{skill.skills_summary}</p>
          </Section>
        )}
        {skill.skills_list && skill.skills_list.length > 0 && (
          <Section title="Skills">
            <div style={{ display: "flex", padding: "0 0 8px", gap: 12 }}>
              <span style={{ width: 160, fontSize: 11, fontWeight: 700, color: MP.textFaint, textTransform: "uppercase", letterSpacing: ".06em" }}>
                Skill
              </span>
              <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: MP.textFaint, textTransform: "uppercase", letterSpacing: ".06em" }}>
                Description
              </span>
              <span
                style={{
                  width: 80,
                  fontSize: 11,
                  fontWeight: 700,
                  color: MP.textFaint,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  textAlign: "right",
                }}
              >
                Type
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
              {skill.skills_list.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    padding: "10px 14px",
                    background: MP.cardBg,
                    border: `1px solid ${MP.border}`,
                    borderRadius: 6,
                  }}
                >
                  <span
                    style={{
                      width: 146,
                      fontFamily: MP.mono,
                      fontSize: 12,
                      fontWeight: 600,
                      color: MP.text,
                      flexShrink: 0,
                    }}
                  >
                    {s.name}
                  </span>
                  <span style={{ flex: 1, fontSize: 12.5, lineHeight: 1.5, color: MP.textMed }}>{s.description}</span>
                  <span
                    style={{
                      width: 80,
                      textAlign: "right",
                      fontSize: 10,
                      fontWeight: 700,
                      flexShrink: 0,
                      color: s.type === "Invocable" ? MP.accentDeep : "#71717a",
                    }}
                  >
                    {s.type}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* INSTALL */}
        <Section title="Install">
          {skill.install_steps ? (
            <div style={{ background: MP.cardBg, border: `1px solid ${MP.border}`, borderRadius: 8, padding: "18px 20px", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: MP.text, marginBottom: 10 }}>Cowork</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {skill.install_steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <span
                      style={{
                        fontFamily: MP.mono,
                        fontSize: 12,
                        fontWeight: 700,
                        color: MP.accent,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <span style={{ fontSize: 13, lineHeight: 1.55, color: MP.textMed }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ flex: 1, background: MP.cardBg, border: `1px solid ${MP.border}`, borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: MP.text, marginBottom: 6 }}>Cowork</div>
                <div
                  style={{
                    fontFamily: MP.mono,
                    fontSize: 11,
                    color: MP.textMed,
                    background: MP.borderLight,
                    padding: "6px 10px",
                    borderRadius: 5,
                    marginBottom: 12,
                  }}
                >
                  Customize &rarr; Add marketplace &rarr; paste repo URL
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: MP.text, marginBottom: 6 }}>Claude Code</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <code
                    style={{
                      flex: 1,
                      fontFamily: MP.mono,
                      fontSize: 11,
                      color: MP.textMed,
                      background: MP.borderLight,
                      padding: "6px 10px",
                      borderRadius: 5,
                    }}
                  >
                    {installCmd}
                  </code>
                  <CopyBtn text={installCmd} />
                </div>
              </div>
              {skill.repo_url && (
                <a
                  href={skill.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 160,
                    background: MP.text,
                    borderRadius: 8,
                    padding: "16px",
                    textDecoration: "none",
                    color: "#fff",
                    gap: 8,
                  }}
                >
                  <ExternalLink size={13} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>View on GitHub</span>
                </a>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
