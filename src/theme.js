// ─── PALETTE ─────────────────────────────────────────────────────────
// Global house style per decision 4A. All decks inherit these tokens.
// Do not fork. Content varies, chrome does not.
export const C = {
  bg: "#F8F4EE",
  surface: "#FFFCF7",
  surfaceHover: "#F5F1EB",
  border: "rgba(74,28,42,0.1)",
  borderLight: "rgba(74,28,42,0.06)",
  text: "#4A1C2A",
  textMed: "#6B4B5A",
  textLight: "#8A7A76",
  textMuted: "#8A7A76",
  accent: "#D04A28",
  accentBg: "rgba(208,74,40,0.05)",
  accentBorder: "rgba(208,74,40,0.16)",
  wine: "#8C3A4F",
  wineBg: "rgba(140,58,79,0.05)",
  wineBorder: "rgba(140,58,79,0.16)",
};

// Font stacks — Georgia serif for titles, system sans for body.
export const FONT = {
  serif: "'Georgia', serif",
  sans: "'Inter', -apple-system, sans-serif",
};

// Global CSS string — injected once at the App root.
// Contains keyframes and responsive rules referenced across components.
export const GLOBAL_CSS = `
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(74,28,42,0.12); border-radius: 3px; }
  button:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
  @media (max-width: 768px) {
    .leftRailDesktop { display: none !important; }
    .slideContent { padding: 16px 20px !important; }
    .featuredGrid { grid-template-columns: 1fr !important; }
    /* Canvas: top-align + native scroll on mobile (relax the "1 viewport = 1 slide" rule) */
    .slide-canvas { align-items: flex-start !important; padding: 12px 16px 8px !important; overflow-y: auto !important; }
    /* Slide title: smaller + 3-line clamp on mobile */
    .slide-title-zone { min-height: 0 !important; }
    .slide-title-h1 { font-size: 22px !important; -webkit-line-clamp: 3 !important; line-height: 1.22 !important; letter-spacing: -0.2px !important; }
    /* ScrollSlide: stats stack to 1 column as horizontal cards */
    .scroll-stat-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
    .scroll-stat-card { flex-direction: row !important; align-items: center !important; text-align: left !important; gap: 14px !important; padding: 14px 16px !important; }
    .scroll-stat-value { min-width: 70px !important; text-align: left !important; font-size: 28px !important; }
    .scroll-stat-label { margin-top: 0 !important; font-size: 13px !important; }
    .scroll-stat-desc { margin-top: 2px !important; font-size: 11px !important; }
    /* TufteSlide: stack paragraphs + notes vertically */
    .tufte-layout { flex-direction: column !important; gap: 14px !important; }
    .tufte-col { flex: 0 0 auto !important; max-width: 100% !important; width: 100% !important; }
    .tufte-notes-head { display: block !important; }
    /* ChartCard: tighter padding */
    .chart-card-wrap { padding: 12px 14px 10px !important; }
    .chart-card-header { margin-bottom: 8px !important; }
    /* ArticleSection: slightly smaller title */
    .article-title-h2 { font-size: 20px !important; }
  }
  @media (min-width: 769px) and (max-width: 960px) {
    .featuredGrid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (min-width: 769px) {
    .leftRailDesktop { display: flex !important; }
  }
  @keyframes cardSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideEnterFromBelow {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideEnterFromAbove {
    from { opacity: 0; transform: translateY(-50px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes railSlideIn {
    from { opacity: 0; transform: translateX(-24px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes drawerSlideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  @keyframes drawerScrimIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .mp-skill-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); transform: translateY(-1px); }
`;
