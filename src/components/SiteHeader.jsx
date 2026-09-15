"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { C, FONT } from "../theme.js";

// ─── SHARED SITE HEADER ──────────────────────────────────────────────
// One masthead used identically across every Eclipsai surface: the product
// home, the insights home, the deck slides, and the /about page. Wordmark
// (→ /) plus Home / About / Insights.
//
//  - `active`: "home" | "insights" | null — the current destination renders in
//    dark ink; the rest in vermillion. About is a popup trigger, never "active".
//  - `onAboutOpen`: opens the shared <AboutPopup> the host surface renders, so
//    there is exactly one popup per page even when the header repeats per
//    section (the product scroll-deck).
//
// Pure inline styles + clamp() responsiveness (no media queries) so the same
// component works inside the product deck's `.ep-scroller` and the App shell
// without depending on either's CSS.
export function SiteHeader({ active = null, onAboutOpen, style }) {
  const pathname = usePathname();

  // On the product home, the wordmark/Home smooth-scroll the deck to the top
  // rather than firing a route navigation to the page you're already on.
  const onHomeClick = (e) => {
    if (pathname === "/") {
      e.preventDefault();
      const scroller = document.querySelector(".ep-scroller");
      (scroller || window).scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navItem = (isActive) => ({
    fontSize: "clamp(13px, 1.4vw, 15px)",
    fontWeight: 600,
    fontFamily: FONT.sans,
    textDecoration: "none",
    color: isActive ? C.text : C.accent,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1.2,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        width: "100%",
        ...style,
      }}
    >
      <Link href="/" onClick={onHomeClick} aria-label="Eclipsai — home" style={{ textDecoration: "none", display: "inline-flex", flexShrink: 0, background: "#19171F", borderRadius: 4, padding: "5px 8px" }}>
        <img
          src="/assets/eclipsai-wordmark-ink.svg"
          alt=""
          style={{ width: "clamp(105px, 12vw, 130px)", height: "auto", display: "block" }}
        />
      </Link>
      <nav style={{ display: "flex", gap: "clamp(13px, 2vw, 22px)", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Link href="/" onClick={onHomeClick} style={navItem(active === "home")}>Home</Link>
        <button type="button" onClick={onAboutOpen} style={navItem(false)}>About</button>
        <Link href="/insights" style={navItem(active === "insights")}>Insights</Link>
      </nav>
    </div>
  );
}
