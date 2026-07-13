"use client";

// FreshFoodHome — the approved fresh-food homepage ("Eclipse & Signal"
// operating-ledger system), ported natively from the standalone reference
// (index-eclipse-ledger.html, 2026-07-13).
//
// One shared implementation serves every locale: the route pages ("/", "/de",
// "/fr", "/it", "/ro") pass a validated content dictionary (see
// fresh-food/locales.js — a missing translation key fails the build). All
// user-visible and accessibility-facing strings render from that dictionary;
// the wrapper carries lang={content.locale}. Evidence numbers in the replay
// chart live below as shared data arrays — locales translate labels only.
//
// The language selector is the approved details/summary disclosure from the
// mock: real links (work without JavaScript), locale names in their own
// language, code chips, solar active treatment, no flags. JS enhancements:
// Escape-to-close, close on outside click/focus, and section-hash
// preservation when switching locale.
//
// Interaction lifecycle (one effect, fully cleaned up on unmount):
//  - smooth anchor scrolling applied to <html> only while mounted
//  - nav "scrolled" + "past-hero" classes (CTA hidden until past the hero)
//  - the sticky scroll clock (desktop only, 18:45 → 19:00 → 02:00 → 11:40 →
//    18:45 close), driven by scroll + rAF exactly like the reference
//  - prefers-reduced-motion: autoplay is stopped (CSS hides the hero video
//    and shows the poster/background still instead)
import { useEffect, useRef } from "react";
import { Newsreader, Manrope, DM_Mono } from "next/font/google";
import { LOCALES } from "./fresh-food/locales.js";
import "./fresh-food/freshFood.css";

// Newsreader and Manrope are variable fonts (full weight range; Newsreader
// additionally carries its optical-size axis). DM Mono is static 400/500.
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  display: "swap",
  variable: "--ff-newsreader",
});
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--ff-manrope",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--ff-dm-mono",
});

const ASSETS = "/assets/fresh-food";

// In-page anchors that are preserved when switching language (/#proof →
// /de#proof). The locale URL itself stays the source of truth.
const SECTION_HASHES = new Set(["#top", "#problem", "#product", "#proof", "#vision", "#start"]);

// ─── Replay chart (flagship artifact) ────────────────────────────────
// Same data and geometry as the reference script, shared across locales.
// Dots: 1 dot = 5 units; sold cobalt, waste-under-current persimmon, proposed
// order line eclipse ink. Reconciliation (sum over days): sales 988;
// max(0, current−sales) = 319; max(0, proposed−sales) = 189; delta 130 fewer.
const SALES = [61, 74, 81, 63, 59, 70, 88, 62, 78, 72, 82, 79, 65, 54];
const CURRENT = [85, 85, 97, 85, 125, 90, 85, 85, 85, 97, 85, 125, 90, 85];
const PROPOSED = [68, 83, 84, 85, 100, 82, 85, 68, 83, 84, 85, 100, 82, 85];

function ReplayChart({ replay }) {
  const left = 58;
  const right = 952;
  const top = 16;
  const bottom = 286;
  const max = 130;
  const x = (index) => left + index * ((right - left) / (replay.days.length - 1));
  const y = (value) => bottom - (value / max) * (bottom - top);

  const gridTicks = [0, 50, 100, 125];
  const proposedPoints = PROPOSED.map((value, index) => `${x(index)},${y(value)}`).join(" ");

  return (
    <svg className="replay-chart" viewBox="0 0 980 340" role="img" aria-labelledby="replay-title replay-desc">
      <title id="replay-title">{replay.ariaTitle}</title>
      <desc id="replay-desc">{replay.ariaDesc}</desc>
      {gridTicks.map((tick) => (
        <line key={`grid-${tick}`} className="grid" x1={left} x2={right} y1={y(tick)} y2={y(tick)} />
      ))}
      {gridTicks.map((tick) => (
        <text key={`tick-${tick}`} className="axis-label" x={left - 12} y={y(tick) + 4} textAnchor="end">
          {tick}
        </text>
      ))}
      {replay.days.map((day, index) => {
        const soldDots = Math.round(SALES[index] / 5);
        const wasteDots = Math.max(0, Math.round((CURRENT[index] - SALES[index]) / 5));
        return (
          <g key={`${day}-${index}`}>
            {Array.from({ length: soldDots }, (_, dot) => (
              <circle key={`s-${dot}`} className="sold" cx={x(index)} cy={y((dot + 0.5) * 5)} r="4.4" />
            ))}
            {Array.from({ length: wasteDots }, (_, dot) => (
              <circle key={`w-${dot}`} className="waste" cx={x(index)} cy={y((soldDots + dot + 0.5) * 5)} r="4.4" />
            ))}
            <text className="day-label" x={x(index)} y={318} textAnchor="middle">
              {day}
            </text>
          </g>
        );
      })}
      <polyline className="proposed-line" points={proposedPoints} />
    </svg>
  );
}

// ─── Language selector ───────────────────────────────────────────────
// Native <details> disclosure so language links work without JavaScript.
// The client enhancement (in the page effect) adds Escape/outside-close.
function LanguageSwitcher({ content }) {
  const active = content.locale;

  // Preserve the current section hash across the language switch. Plain href
  // (no hash) remains the no-JS behavior.
  const switchLocale = (event, path) => {
    const hash = window.location.hash;
    if (hash && SECTION_HASHES.has(hash)) {
      event.preventDefault();
      window.location.assign(path === "/" ? `/${hash}` : `${path}${hash}`);
    }
  };

  return (
    <details className="language-switcher">
      <summary aria-label={content.nav.chooseLanguage}>{active.toUpperCase()}</summary>
      <div className="language-menu" aria-label={content.nav.availableLanguages}>
        {LOCALES.map((l) => (
          <a
            key={l.code}
            className={l.code === active ? "language-option current" : "language-option"}
            href={l.path}
            lang={l.code}
            aria-current={l.code === active ? "page" : undefined}
            onClick={(event) => switchLocale(event, l.path)}
          >
            <span>{l.name}</span>
            <small>{l.code.toUpperCase()}</small>
          </a>
        ))}
      </div>
    </details>
  );
}

export function FreshFoodHome({ content }) {
  const rootRef = useRef(null);
  const c = content;

  const mailHref = `mailto:chip.alexandru@eclipsai.com?subject=${encodeURIComponent(c.offer.mailSubject)}&body=${encodeURIComponent(c.offer.mailBody)}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Smooth anchor scrolling for the page's #-links, applied to <html> only
    // while this page is mounted (the reference set it globally in CSS).
    const html = document.documentElement;
    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = reducedMotion ? "auto" : "smooth";

    // Autoplaying media. React does not always serialize the `muted`
    // attribute into SSR markup, so enforce it before nudging playback; under
    // reduced motion stop autoplay entirely (CSS shows the hero still).
    const videos = [...root.querySelectorAll("video[autoplay]")];
    videos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      if (reducedMotion) {
        video.autoplay = false;
        video.pause();
      } else if (video.paused) {
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
    });

    // Fixed navigation: background after 40px, CTA revealed past the hero.
    const nav = root.querySelector(".nav");
    const hero = root.querySelector(".hero");
    const updateNav = () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
      nav.classList.toggle("past-hero", window.scrollY > hero.offsetHeight - 120);
    };
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });

    // Language switcher enhancements: Escape closes and refocuses the
    // trigger; pointer or keyboard focus moving outside closes. The <details>
    // element itself keeps working without any of this.
    const switcher = root.querySelector(".language-switcher");
    const closeSwitcher = () => {
      if (switcher) switcher.open = false;
    };
    // Pointerdown (not click) so the menu closes as soon as an outside
    // interaction starts; presses inside the menu are unaffected.
    const onDocumentPointerDown = (event) => {
      if (switcher && switcher.open && !switcher.contains(event.target)) closeSwitcher();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape" && switcher && switcher.open) {
        closeSwitcher();
        switcher.querySelector("summary")?.focus();
      }
    };
    // Close only when focus verifiably lands OUTSIDE the switcher (keyboard
    // Tab-out always sets relatedTarget). When relatedTarget is null — which
    // Safari produces for clicks on links, because it does not focus them —
    // do nothing, or the menu would collapse mid-click and swallow the
    // language selection. Outside pointer interactions are already covered
    // by the pointerdown handler above.
    const onFocusOut = (event) => {
      if (switcher && event.relatedTarget && !switcher.contains(event.relatedTarget)) closeSwitcher();
    };
    document.addEventListener("pointerdown", onDocumentPointerDown);
    document.addEventListener("keydown", onKeyDown);
    switcher?.addEventListener("focusout", onFocusOut);

    // Sticky scroll clock (desktop only, matching the reference's one-time
    // min-width check). The beat nearest the 43%-viewport focus line wins.
    const timeSection = root.querySelector(".time-section");
    const clockValue = root.querySelector(".clock-value");
    const timeBeats = [...root.querySelectorAll(".time-beat")];
    const closeMarker = root.querySelector(".loop-close");
    const timeStates = ["time-1845", "time-1900", "time-0200", "time-1140", "time-close"];

    let clockFrame = 0;
    let updateClock = null;
    if (timeSection && clockValue && window.matchMedia("(min-width: 901px)").matches) {
      const setTime = (target) => {
        const state = target.dataset.state;
        clockValue.textContent = target.dataset.time;
        timeSection.classList.remove(...timeStates);
        timeSection.classList.add(state);
        timeSection.classList.toggle("loop-closed", state === "time-close");
        timeBeats.forEach((beat) => beat.classList.toggle("active", beat === target));
      };

      updateClock = () => {
        cancelAnimationFrame(clockFrame);
        clockFrame = requestAnimationFrame(() => {
          const sectionRect = timeSection.getBoundingClientRect();
          if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) return;
          const focusLine = window.innerHeight * 0.43;
          const candidates = closeMarker ? [...timeBeats, closeMarker] : timeBeats;
          const closest = candidates.reduce((best, item) => {
            const distance = Math.abs(item.getBoundingClientRect().top - focusLine);
            return !best || distance < best.distance ? { item, distance } : best;
          }, null);
          if (closest) setTime(closest.item);
        });
      };

      updateClock();
      window.addEventListener("scroll", updateClock, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", updateNav);
      if (updateClock) window.removeEventListener("scroll", updateClock);
      cancelAnimationFrame(clockFrame);
      document.removeEventListener("pointerdown", onDocumentPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      switcher?.removeEventListener("focusout", onFocusOut);
      html.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      lang={c.locale}
      className={`ffh ${newsreader.variable} ${manrope.variable} ${dmMono.variable}`}
    >
      <nav className="nav" aria-label={c.nav.ariaLabel}>
        <div className="nav-inner">
          <a className="logo" href="#top" aria-label={c.nav.homeAriaLabel}>
            <img src={`${ASSETS}/eclipsai-wordmark-mineral-solar.svg`} alt="" />
          </a>
          <div className="nav-links">
            <a href="#product">{c.nav.product}</a>
            <a href="#proof">{c.nav.proof}</a>
            <a href="#vision">{c.nav.vision}</a>
            <LanguageSwitcher content={c} />
            <a className="nav-cta" href="#start">{c.nav.cta}</a>
          </div>
        </div>
      </nav>

      <main>
        <header className="hero" id="top">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={`${ASSETS}/hero-closing-hour-v2.jpg`}
            aria-hidden="true"
          >
            <source src={`${ASSETS}/hero-video.mp4`} type="video/mp4" />
          </video>
          <div className="hero-inner">
            <p className="eyebrow">{c.hero.eyebrow}</p>
            <h1>{c.hero.h1}</h1>
            <p className="hero-copy">{c.hero.copy}</p>
            <div className="hero-actions">
              <a className="button" href="#start">{c.hero.cta}</a>
            </div>
            <small className="hero-audience">{c.hero.audience}</small>
          </div>
        </header>

        <section className="section time-section time-1845" id="problem">
          <div className="wrap intro-grid">
            <div className="clock-shell">
              <div className="clock reveal">
                <span className="clock-value">18:45</span>
                <p className="clock-quote">{c.problem.quote}</p>
              </div>
            </div>
            <div>
              <p className="eyebrow reveal">{c.problem.eyebrow}</p>
              <h2 className="reveal">{c.problem.h2}</h2>
              <p className="lede reveal">{c.problem.lede}</p>
              <div className="steps reveal">
                {c.problem.steps.map((step, i) => (
                  <div
                    key={step.state}
                    className={i === 0 ? "step time-beat active" : "step time-beat"}
                    data-time={step.time}
                    data-state={step.state}
                  >
                    <time>{step.time}</time>
                    <div>
                      <h3>{step.h3}</h3>
                      <p>{step.p}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="clock-quote mobile-clock-quote">{c.problem.quote}</p>
              <div className="loop-close" data-time="18:45" data-state="time-close" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="section product-section" id="product">
          <div className="wrap">
            <div className="product-top">
              <div>
                <p className="eyebrow reveal">{c.product.eyebrow}</p>
                <h2 className="reveal">{c.product.h2}</h2>
              </div>
              <p className="lede reveal">{c.product.lede}</p>
            </div>
            <div className="product-stage">
              <div className="product-media reveal" aria-label={c.product.mediaLabel}>
                <video className="product-video" autoPlay muted loop playsInline preload="metadata">
                  <source src={`${ASSETS}/product-conversation.mp4`} type="video/mp4" />
                </video>
              </div>
              <div className="product-copy reveal">
                <p className="eyebrow">{c.product.whatChanges}</p>
                <ul className="number-list">
                  {c.product.items.map((item) => (
                    <li key={item.n}>
                      <span>{item.n}</span>
                      <div>
                        <strong>{item.strong}</strong>
                        {item.text}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section proof" id="proof">
          <div className="wrap">
            <div className="proof-head">
              <div>
                <p className="metadata">{c.proof.metadata}</p>
                <h2>
                  {c.proof.h2Before}
                  <span className="no-break">{c.proof.h2Value}</span>
                  {c.proof.h2After}
                </h2>
              </div>
              <p className="lede reveal">{c.proof.lede}</p>
            </div>
            <div className="evidence-ledger" aria-label={c.proof.ledgerLabel}>
              {c.proof.rows.map((row) => (
                <article key={row.index} className="evidence-row">
                  <span className="evidence-index">{row.index}</span>
                  <h3>
                    {row.h3}
                    {row.ratioLabel ? (
                      <>
                        {" "}
                        <span className="piece-ratio" aria-label={row.ratioLabel}>
                          <i></i>
                          <i></i>
                          <i></i>
                          <i></i>
                        </span>
                      </>
                    ) : null}
                  </h3>
                  <strong className="evidence-value">{row.value}</strong>
                  <p className="evidence-copy">{row.copy}</p>
                </article>
              ))}
            </div>
            <p className="proof-bridge conclusion">
              {c.proof.bridgeBefore}
              <span className="no-break">{c.proof.bridgeValue}</span>
              {c.proof.bridgeAfter}
            </p>
            <p className="proof-note">{c.proof.note}</p>
            <div className="lesson reveal">
              <h3>{c.proof.lessonHeading}</h3>
              <div className="lesson-text">
                {c.proof.lessonBefore}
                <strong>{c.proof.lessonStrong}</strong>
                {c.proof.lessonAfter}
              </div>
            </div>
          </div>
        </section>

        <section className="section loop-section">
          <div className="wrap">
            <p className="eyebrow reveal">{c.loop.eyebrow}</p>
            <h2 className="reveal">{c.loop.h2}</h2>
            <p className="lede reveal">{c.loop.lede}</p>
            <div className="loop-line reveal" aria-label={c.loop.listLabel}>
              {c.loop.steps.map((step) => (
                <div key={step.n} className="loop-step">
                  <span>{step.n}</span>
                  <b>{step.b}</b>
                  <p>{step.p}</p>
                </div>
              ))}
            </div>
            <div className="replay-artifact reveal">
              <div className="replay-head">
                <div>
                  <h3>{c.replay.title}</h3>
                </div>
                <div className="replay-change">
                  <strong>{c.replay.changeStrong}</strong>
                  <span>{c.replay.changeSpan}</span>
                </div>
              </div>
              <div className="replay-plot-head">
                <span>{c.replay.dotKey}</span>
              </div>
              <ReplayChart replay={c.replay} />
              <div className="replay-legend" aria-hidden="true">
                <span>
                  <i className="legend-dot sold"></i>
                  {c.replay.legendSold}
                </span>
                <span>
                  <i className="legend-dot waste"></i>
                  {c.replay.legendWaste}
                </span>
                <span>
                  <i className="legend-line"></i>
                  {c.replay.legendProposed}
                </span>
              </div>
              <table className="replay-results" aria-label={c.replay.tableLabel}>
                <thead>
                  <tr>
                    <th>{c.replay.thPlan}</th>
                    <th>{c.replay.thSales}</th>
                    <th>{c.replay.thWaste}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>{c.replay.rowCurrent}</th>
                    <td>988</td>
                    <td>319</td>
                  </tr>
                  <tr>
                    <th>{c.replay.rowProposed}</th>
                    <td>988</td>
                    <td>189</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section vision" id="vision">
          <div className="wrap">
            <p className="eyebrow reveal">{c.vision.eyebrow}</p>
            <h2 className="reveal">{c.vision.h2}</h2>
            <p className="vision-intro reveal">{c.vision.intro}</p>
            <div className="vision-path" aria-label={c.vision.pathLabel}>
              {c.vision.steps.map((step) => (
                <article key={step.index} className="vision-step">
                  <span className="vision-index">{step.index}</span>
                  <h3>{step.h3}</h3>
                  <p>{step.p}</p>
                </article>
              ))}
            </div>
            <p className="loop-close-line conclusion">{c.vision.closing}</p>
          </div>
        </section>

        <section className="section offer" id="start">
          <div className="wrap offer-grid">
            <div>
              <p className="eyebrow reveal">{c.offer.eyebrow}</p>
              <h2 className="reveal">{c.offer.h2}</h2>
              <p className="offer-copy reveal">{c.offer.copy}</p>
            </div>
            <div className="offer-card reveal">
              <h3>{c.offer.cardH3}</h3>
              <ul>
                {c.offer.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="offer-reassurance">{c.offer.reassurance}</p>
              <p className="offer-audience">{c.offer.audience}</p>
              <a className="button" href={mailHref}>
                {c.offer.cta}
              </a>
            </div>
          </div>
        </section>

        <section className="section faq">
          <div className="wrap faq-grid">
            <div>
              <p className="eyebrow reveal">{c.faq.eyebrow}</p>
              <h2 className="reveal">{c.faq.h2}</h2>
            </div>
            <div className="reveal">
              {c.faq.items.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-inner">
          <div>
            <a className="logo" href="#top" aria-label={c.nav.homeAriaLabel}>
              <img src={`${ASSETS}/eclipsai-wordmark-mineral-solar.svg`} alt="" />
            </a>
            <p>{c.footer.tagline}</p>
          </div>
          <p>
            <a href="mailto:chip.alexandru@eclipsai.com">chip.alexandru@eclipsai.com</a> · {c.footer.location}
          </p>
        </div>
      </footer>
    </div>
  );
}
