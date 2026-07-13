"use client";

// FreshFoodHome — the approved fresh-food homepage ("Eclipse & Signal"
// operating-ledger system), ported natively from the standalone reference
// (index-eclipse-ledger.html, 2026-07-13). Rendered at "/".
//
// Markup and copy are transcribed verbatim; styles live in
// fresh-food/freshFood.css, scoped under the .ffh root so legacy routes
// (/general, /finance, /retail) are unaffected. The replay chart is built
// declaratively in JSX from the same day-level data as the reference and
// reconciles to 988 sales / 319 current waste / 189 proposed waste /
// 130 fewer waste units.
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

// ─── Replay chart (flagship artifact) ────────────────────────────────
// Same data and geometry as the reference script. Dots: 1 dot = 5 units;
// sold cobalt, waste-under-current persimmon, proposed order line eclipse ink.
// Reconciliation (sum over days): sales 988; max(0, current−sales) = 319;
// max(0, proposed−sales) = 189; delta 130 fewer waste units.
const DAYS = ["M 23", "T 24", "W 25", "T 26", "F 27", "S 28", "S 29", "M 30", "T 1", "W 2", "T 3", "F 4", "S 5", "S 6"];
const SALES = [61, 74, 81, 63, 59, 70, 88, 62, 78, 72, 82, 79, 65, 54];
const CURRENT = [85, 85, 97, 85, 125, 90, 85, 85, 85, 97, 85, 125, 90, 85];
const PROPOSED = [68, 83, 84, 85, 100, 82, 85, 68, 83, 84, 85, 100, 82, 85];

function ReplayChart() {
  const left = 58;
  const right = 952;
  const top = 16;
  const bottom = 286;
  const max = 130;
  const x = (index) => left + index * ((right - left) / (DAYS.length - 1));
  const y = (value) => bottom - (value / max) * (bottom - top);

  const gridTicks = [0, 50, 100, 125];
  const proposedPoints = PROPOSED.map((value, index) => `${x(index)},${y(value)}`).join(" ");

  return (
    <svg className="replay-chart" viewBox="0 0 980 340" role="img" aria-labelledby="replay-title replay-desc">
      <title id="replay-title">Croissant production decision replay</title>
      <desc id="replay-desc">
        Fourteen days of croissant sales shown in blue dots, waste under the current order shown in orange dots and a
        solid proposed order line. The proposal keeps 988 sales while reducing waste from 319 to 189 units.
      </desc>
      {gridTicks.map((tick) => (
        <line key={`grid-${tick}`} className="grid" x1={left} x2={right} y1={y(tick)} y2={y(tick)} />
      ))}
      {gridTicks.map((tick) => (
        <text key={`tick-${tick}`} className="axis-label" x={left - 12} y={y(tick) + 4} textAnchor="end">
          {tick}
        </text>
      ))}
      {DAYS.map((day, index) => {
        const soldDots = Math.round(SALES[index] / 5);
        const wasteDots = Math.max(0, Math.round((CURRENT[index] - SALES[index]) / 5));
        return (
          <g key={day}>
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

export function FreshFoodHome() {
  const rootRef = useRef(null);

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
      html.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  return (
    <div ref={rootRef} className={`ffh ${newsreader.variable} ${manrope.variable} ${dmMono.variable}`}>
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-inner">
          <a className="logo" href="#top" aria-label="Eclipsai home">
            <img src={`${ASSETS}/eclipsai-wordmark-mineral-solar.svg`} alt="" />
          </a>
          <div className="nav-links">
            <a href="#product">How it works</a>
            <a href="#proof">Evidence</a>
            <a href="#vision">Beyond production</a>
            <a className="nav-cta" href="#start">Find the profit leak</a>
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
            <p className="eyebrow">The profit brain for fresh food</p>
            <h1>Know what to make tomorrow. Waste less. Sell more.</h1>
            <p className="hero-copy">
              Eclipsai proposes changes based on sales, production, deliveries and what your team sees. We measure the
              result of each change in cash.
            </p>
            <div className="hero-actions">
              <a className="button" href="#start">Find the profit leak</a>
            </div>
            <small className="hero-audience">Built for growing fresh-food operators with 2 to 20 locations.</small>
          </div>
        </header>

        <section className="section time-section time-1845" id="problem">
          <div className="wrap intro-grid">
            <div className="clock-shell">
              <div className="clock reveal">
                <span className="clock-value">18:45</span>
                <p className="clock-quote">
                  The till records the sale. Not the empty shelf, the leftovers or the question at the counter. That is
                  where the profit leak hides.
                </p>
              </div>
            </div>
            <div>
              <p className="eyebrow reveal">What systems miss and owners know</p>
              <h2 className="reveal">Tomorrow is decided before today is understood.</h2>
              <p className="lede reveal">
                At closing, tomorrow&apos;s quantities are set from what is left, past averages, special orders and
                experience. That locks in the profit decision.
              </p>
              <div className="steps reveal">
                <div className="step time-beat active" data-time="18:45" data-state="time-1845">
                  <time>18:45</time>
                  <div>
                    <h3>Count what is left</h3>
                    <p>What cannot stay on the shelf goes into surprise bags or the bin, rarely recorded.</p>
                  </div>
                </div>
                <div className="step time-beat" data-time="19:00" data-state="time-1900">
                  <time>19:00</time>
                  <div>
                    <h3>Set tomorrow&apos;s order</h3>
                    <p>Averages, templates and memory compete for attention while the shop still needs cleaning.</p>
                  </div>
                </div>
                <div className="step time-beat" data-time="02:00" data-state="time-0200">
                  <time>02:00</time>
                  <div>
                    <h3>Production starts</h3>
                    <p>Yesterday&apos;s decision becomes today&apos;s perishable stock.</p>
                  </div>
                </div>
                <div className="step time-beat" data-time="11:40" data-state="time-1140">
                  <time>11:40</time>
                  <div>
                    <h3>The tray goes empty</h3>
                    <p>It looks like success. Customers keep asking for it.</p>
                  </div>
                </div>
              </div>
              <p className="clock-quote mobile-clock-quote">
                The till records the sale. Not the empty shelf, the leftovers or the question at the counter. That is
                where the profit leak hides.
              </p>
              <div className="loop-close" data-time="18:45" data-state="time-close" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="section product-section" id="product">
          <div className="wrap">
            <div className="product-top">
              <div>
                <p className="eyebrow reveal">The always-on profit brain</p>
                <h2 className="reveal">It watches every shop, every day. It asks when it needs to.</h2>
              </div>
              <p className="lede reveal">
                Eclipsai connects sales, production, deliveries and what your team sees. When a change is being tested,
                it asks the right person what happened. It brings the decisions worth making into a weekly review and
                answers questions at any time.
              </p>
            </div>
            <div className="product-stage">
              <div
                className="product-media reveal"
                aria-label="Example of Eclipsai monitoring a production decision through a familiar team channel"
              >
                <video className="product-video" autoPlay muted loop playsInline preload="metadata">
                  <source src={`${ASSETS}/product-conversation.mp4`} type="video/mp4" />
                </video>
              </div>
              <div className="product-copy reveal">
                <p className="eyebrow">What changes</p>
                <ul className="number-list">
                  <li>
                    <span>01</span>
                    <div>
                      <strong>Captures what is needed.</strong>Leftovers, sellouts and customer requests.
                    </div>
                  </li>
                  <li>
                    <span>02</span>
                    <div>
                      <strong>Monitors every shop, product and day.</strong>Finds opportunities in waste, costs and
                      sales.
                    </div>
                  </li>
                  <li>
                    <span>03</span>
                    <div>
                      <strong>Proposes and responds.</strong>Surfaces the changes worth making next week and answers
                      questions when you ask.
                    </div>
                  </li>
                  <li>
                    <span>04</span>
                    <div>
                      <strong>Reports the results.</strong>Shows store performance and scores every decision against
                      the alternative, in cash.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section proof" id="proof">
          <div className="wrap">
            <div className="proof-head">
              <div>
                <p className="metadata">Evidence from one operator · 16 months</p>
                <h2>
                  We found a <span className="no-break">€40-60K</span> annual profit opportunity at one operator.
                </h2>
              </div>
              <p className="lede reveal">
                A multi-site fresh-food operator opened its records. We connected the POS and production systems and
                followed every product across every shop and day.
              </p>
            </div>
            <div className="evidence-ledger" aria-label="Evidence ledger from one operator">
              <article className="evidence-row">
                <span className="evidence-index">01</span>
                <h3>We followed every piece</h3>
                <strong className="evidence-value">860,000</strong>
                <p className="evidence-copy">
                  Sixteen months of sales and deliveries, matched between till and production. 92% of all pieces
                  covered.
                </p>
              </article>
              <article className="evidence-row">
                <span className="evidence-index">02</span>
                <h3>
                  We found what never sold{" "}
                  <span className="piece-ratio" aria-label="One in four pieces never sold">
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                  </span>
                </h3>
                <strong className="evidence-value">1 in 4</strong>
                <p className="evidence-copy">
                  One in four delivered pieces never sold. Hard to see day to day, unmistakable across products, shops
                  and weekdays.
                </p>
              </article>
              <article className="evidence-row">
                <span className="evidence-index">03</span>
                <h3>We sized the opportunity</h3>
                <strong className="evidence-value">€40-60K</strong>
                <p className="evidence-copy">
                  The credible annual opportunity was concentrated in stale, repeated production patterns. The full
                  unsold ingredient pool was €190K.
                </p>
              </article>
              <article className="evidence-row">
                <span className="evidence-index">04</span>
                <h3>We tested the fixes</h3>
                <strong className="evidence-value">86%</strong>
                <p className="evidence-copy">
                  When the strongest rule recommended making less, the shelf still lasted the day 86 times in 100.
                </p>
              </article>
            </div>
            <p className="proof-bridge conclusion">
              Not every unsold piece is a mistake. Avoiding lost sales requires a cushion. The €40-60K sat in repeated
              patterns nobody had time to see.
            </p>
            <p className="proof-note">
              From one multi-site operator&apos;s records, 2024 to 2025. Specific to that business, not a promise.
            </p>
            <div className="lesson reveal">
              <h3>What we learned</h3>
              <div className="lesson-text">
                Forecasting alone <strong>lost money</strong>. Low-volume demand is noisy, and a missed sale costs more
                than excess ingredients. The stronger approach was selective: find the few decisions worth changing,
                make a reversible change and measure the result.
              </div>
            </div>
          </div>
        </section>

        <section className="section loop-section">
          <div className="wrap">
            <p className="eyebrow reveal">What we do</p>
            <h2 className="reveal">How a profit leak gets fixed.</h2>
            <p className="lede reveal">
              The same loop used on sixteen months of history can run continuously across your shops.
            </p>
            <div className="loop-line reveal" aria-label="Decision loop">
              <div className="loop-step">
                <span>01</span>
                <b>Count.</b>
                <p>Sales and production records are matched into one piece-level history.</p>
              </div>
              <div className="loop-step">
                <span>02</span>
                <b>Find.</b>
                <p>
                  Repeated patterns surface: the product wasted every Friday, the Saturday sellout and the standing
                  order that has gone stale.
                </p>
              </div>
              <div className="loop-step">
                <span>03</span>
                <b>Propose.</b>
                <p>Small, reversible changes arrive in the weekly note. Reasons attached.</p>
              </div>
              <div className="loop-step">
                <span>04</span>
                <b>Score.</b>
                <p>Every call is checked against real sales, in cash.</p>
              </div>
              <div className="loop-step">
                <span>05</span>
                <b>Fix the plan.</b>
                <p>Changes that prove out are kept. The rest are revised or retired.</p>
              </div>
              <div className="loop-step">
                <span>06</span>
                <b>Keep watch.</b>
                <p>The counting never stops, so nothing quietly creeps back.</p>
              </div>
            </div>
            <div className="replay-artifact reveal">
              <div className="replay-head">
                <div>
                  <h3>Proposed croissant orders for 7-13 July</h3>
                </div>
                <div className="replay-change">
                  <strong>130 fewer</strong>
                  <span>waste units</span>
                </div>
              </div>
              <div className="replay-plot-head">
                <span>1 dot = 5 units</span>
              </div>
              <ReplayChart />
              <div className="replay-legend" aria-hidden="true">
                <span>
                  <i className="legend-dot sold"></i>Sold
                </span>
                <span>
                  <i className="legend-dot waste"></i>Waste under current
                </span>
                <span>
                  <i className="legend-line"></i>Proposed order
                </span>
              </div>
              <table className="replay-results" aria-label="Decision replay results">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Sales</th>
                    <th>Waste</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Current</th>
                    <td>988</td>
                    <td>319</td>
                  </tr>
                  <tr>
                    <th>Proposed</th>
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
            <p className="eyebrow reveal">Beyond production</p>
            <h2 className="reveal">Expand to every decision that drives profit.</h2>
            <p className="vision-intro reveal">
              Production comes first because the decision repeats every day and the result is visible quickly.
            </p>
            <div className="vision-path" aria-label="Eclipsai expansion path">
              <article className="vision-step">
                <span className="vision-index">01 · Now</span>
                <h3>Production and waste</h3>
                <p>
                  Protect sales without repeating avoidable waste. Repair stale production plans and measure every
                  change in cash.
                </p>
              </article>
              <article className="vision-step">
                <span className="vision-index">02 · Next</span>
                <h3>Buying and pricing</h3>
                <p>Catch supplier cost increases, weak margins and prices that no longer cover costs.</p>
              </article>
              <article className="vision-step">
                <span className="vision-index">03 · Then</span>
                <h3>Labour and operations</h3>
                <p>See when smaller batches save waste but add work, or when understaffing costs sales.</p>
              </article>
              <article className="vision-step">
                <span className="vision-index">04 · As you grow</span>
                <h3>The next location</h3>
                <p>Apply everything Eclipsai has learned from your shops to the next one.</p>
              </article>
            </div>
            <p className="loop-close-line conclusion">
              One decision at a time, Eclipsai helps you keep more of what your business earns.
            </p>
          </div>
        </section>

        <section className="section offer" id="start">
          <div className="wrap offer-grid">
            <div>
              <p className="eyebrow reveal">See it in your own shops</p>
              <h2 className="reveal">Find the profit leaks worth fixing first.</h2>
              <p className="offer-copy reveal">
                Eclipsai starts with the sales and production records you already have. We find repeated waste, missed
                sales and production plans that no longer fit, then show what each is worth in cash.
              </p>
            </div>
            <div className="offer-card reveal">
              <h3>Your first review</h3>
              <ul>
                <li>The leaks worth fixing first</li>
                <li>The evidence behind each one</li>
                <li>The cash opportunity</li>
                <li>The first reversible changes to test</li>
              </ul>
              <p className="offer-reassurance">No new system for your team. Nothing changes until the evidence is clear.</p>
              <p className="offer-audience">For growing fresh-food operators with 2 to 20 locations.</p>
              <a
                className="button"
                href="mailto:chip.alexandru@eclipsai.com?subject=Find%20the%20profit%20leak&body=Number%20of%20sites%3A%0AWho%20sets%20tomorrow's%20order%3A%0ACurrent%20systems%3A%0A"
              >
                Find the profit leak
              </a>
            </div>
          </div>
        </section>

        <section className="section faq">
          <div className="wrap faq-grid">
            <div>
              <p className="eyebrow reveal">Common questions</p>
              <h2 className="reveal">What owners want to know before starting.</h2>
            </div>
            <div className="reveal">
              <details>
                <summary>Will making less cause us to sell out?</summary>
                <p>
                  Eclipsai measures both risks. Waste costs ingredients, while a missed sale costs most of the selling
                  price. We propose small changes and check what actually happened before changing the standing plan.
                </p>
              </details>
              <details>
                <summary>Our system already recommends quantities. What is different?</summary>
                <p>
                  Most systems produce a forecast or suggested order. Eclipsai also captures what the team sees,
                  proposes the decisions worth changing and measures whether each change made or lost money.
                </p>
              </details>
              <details>
                <summary>How much work does the team have to do?</summary>
                <p>
                  Very little. Eclipsai uses the records you already have and asks short, targeted questions only when
                  an important signal is missing, such as a sellout, unusual leftovers or a local event.
                </p>
              </details>
              <details>
                <summary>What if our data is messy?</summary>
                <p>
                  That is normal. We match what is reliable, identify the gaps and show what the evidence can support
                  before recommending a change.
                </p>
              </details>
              <details>
                <summary>Do we have to change every shop at once?</summary>
                <p>
                  No. We start with small, reversible changes for specific products and locations. A change expands
                  only after the result supports it.
                </p>
              </details>
              <details>
                <summary>How do you charge?</summary>
                <p>
                  A monthly fee per location. The scope depends on the number of shops, systems and decisions being
                  monitored.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-inner">
          <div>
            <a className="logo" href="#top" aria-label="Eclipsai home">
              <img src={`${ASSETS}/eclipsai-wordmark-mineral-solar.svg`} alt="" />
            </a>
            <p>The profit brain for fresh food.</p>
          </div>
          <p>
            <a href="mailto:chip.alexandru@eclipsai.com">chip.alexandru@eclipsai.com</a> · Zürich, Switzerland
          </p>
        </div>
      </footer>
    </div>
  );
}
