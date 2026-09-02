"use client";

import { useEffect, useRef, useState } from "react";
import { DM_Mono, Manrope, Newsreader } from "next/font/google";
import { en as originalContent } from "../fresh-food/freshFoodContent.en.js";
import { LOCALES } from "../fresh-food/locales.js";
import initialLiveResults from "../../../public/homepage-live-results.json";
import "../fresh-food/freshFood.css";
import "./homepageDemo.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  display: "swap",
  variable: "--demo-newsreader",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--demo-manrope",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--demo-dm-mono",
});

const ASSETS = "/assets/fresh-food";
const CALENDLY_URL = "https://calendly.com/chip-alexandru/discovery-call";
const LIVE_RESULTS_SCHEMA = "eclipsai-homepage-live-results-v1";
const LOCALE_TAGS = {
  en: "en-GB",
  de: "de-CH",
  fr: "fr-CH",
  it: "it-CH",
  ro: "ro-RO",
};
const SECTION_HASHES = new Set(["#top", "#approach", "#proof", "#vision", "#start"]);

function validLiveResults(value) {
  return Boolean(
    value
    && value.schema_version === LIVE_RESULTS_SCHEMA
    && value.status === "live"
    && Number.isInteger(value.production_lines_changed)
    && Number.isFinite(value.profit_impact_share_of_sales)
    && Number.isFinite(value.estimated_waste_reduction_share)
    && typeof value.updated_label === "string"
  );
}

function localeTag(locale) {
  return LOCALE_TAGS[locale] || LOCALE_TAGS.en;
}

function formatPercent(value, locale) {
  return new Intl.NumberFormat(localeTag(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "always",
  }).format(Number(value) * 100) + "%";
}

function formatUpdatedAt(value, locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Zurich",
    timeZoneName: "short",
  }).format(date);
}

function HomepageLanguageSwitcher({ content }) {
  const active = content.locale;
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
        {LOCALES.map((locale) => (
          <a
            key={locale.code}
            className={locale.code === active ? "language-option current" : "language-option"}
            href={locale.path}
            lang={locale.code}
            aria-current={locale.code === active ? "page" : undefined}
            onClick={(event) => switchLocale(event, locale.path)}
          >
            <span>{locale.name}</span>
            <small>{locale.code.toUpperCase()}</small>
          </a>
        ))}
      </div>
    </details>
  );
}

const DEMO_SLIDES = [
  {
    chapter: "0",
    embed: "panel",
    title: "Build a daily picture of the business",
    duration: 5200,
  },
  {
    chapter: "1",
    embed: "panel",
    title: "Propose production quantities",
    duration: 5200,
  },
  {
    chapter: "1",
    embed: "source",
    title: "Implement directly in production systems (API or computer use for older systems)",
    duration: 10800,
    replay: "orders",
  },
  {
    chapter: "2",
    embed: "analysis",
    title: "Analyze results daily",
    duration: 5600,
  },
  {
    kind: "tracker",
    title: "Report profit and waste",
    duration: 5600,
  },
];

const PERFORMANCE_TRACKER_VALUES = {
  actual: { cash: 800, economic: 1600, waste: 700 },
  projected: { cash: 19900, economic: 40600, waste: 17200 },
};

function PerformanceTrackerEvidence({ variant = "evidence" }) {
  const trackerRef = useRef(null);
  const introStartedRef = useRef(false);
  const [introProgress, setIntroProgress] = useState(0);
  const [projectionProgress, setProjectionProgress] = useState(0);
  const [isProjecting, setIsProjecting] = useState(false);
  const [isProjected, setIsProjected] = useState(false);

  useEffect(() => {
    const tracker = trackerRef.current;
    if (!tracker) return undefined;

    let frame;
    const startCount = () => {
      if (introStartedRef.current) return;
      introStartedRef.current = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setIntroProgress(1);
        return;
      }
      const startsAt = performance.now() + 200;
      const duration = 1100;
      const step = (time) => {
        if (time < startsAt) {
          frame = window.requestAnimationFrame(step);
          return;
        }
        const progress = Math.min(1, (time - startsAt) / duration);
        setIntroProgress(1 - Math.pow(1 - progress, 3));
        if (progress < 1) frame = window.requestAnimationFrame(step);
      };
      frame = window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCount();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(tracker);
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isProjecting) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProjectionProgress(1);
      setIsProjecting(false);
      setIsProjected(true);
      return undefined;
    }

    let frame;
    const startsAt = performance.now();
    const duration = 4000;
    const step = (time) => {
      const progress = Math.min(1, (time - startsAt) / duration);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      setProjectionProgress(eased);
      if (progress < 1) frame = window.requestAnimationFrame(step);
      else {
        setIsProjecting(false);
        setIsProjected(true);
      }
    };
    frame = window.requestAnimationFrame(step);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [isProjecting]);

  const projectionActive = isProjecting || isProjected;
  const currentValue = (key) => {
    const actual = PERFORMANCE_TRACKER_VALUES.actual[key];
    const projected = PERFORMANCE_TRACKER_VALUES.projected[key];
    return Math.round((actual + (projected - actual) * projectionProgress) * introProgress);
  };
  const formatNumber = (value) => value.toLocaleString("en-US");
  const toggleProjection = () => {
    if (isProjecting) return;
    if (isProjected) {
      setIsProjected(false);
      setProjectionProgress(0);
      return;
    }
    setProjectionProgress(0);
    setIsProjecting(true);
  };

  return (
    <div
      ref={trackerRef}
      className={`homepage-demo-performance-tracker${variant === "demo" ? " is-demo" : ""}${projectionActive ? " is-projected" : ""}`}
    >
      <div className="homepage-demo-performance-period">19 August–2 September 2026</div>

      <div className="homepage-demo-performance-readings" aria-live="polite">
        <div className="homepage-demo-performance-reading">
          <span className="homepage-demo-performance-key">
            <span>{projectionActive ? "Cash impact, projected" : "Cash impact"}</span>
            <small>Ingredients</small>
          </span>
          <span className="homepage-demo-performance-reading-value">
            <span className="homepage-demo-performance-value">CHF {formatNumber(currentValue("cash"))}</span>
            <span className="homepage-demo-performance-change">0.7% of sales</span>
          </span>
        </div>

        <div className="homepage-demo-performance-reading">
          <span className="homepage-demo-performance-key">
            <span>{projectionActive ? "Economic profit, projected" : "Economic profit"}</span>
            <small>Ingredients + standard labor + energy</small>
          </span>
          <span className="homepage-demo-performance-reading-value">
            <span className="homepage-demo-performance-value">CHF {formatNumber(currentValue("economic"))}</span>
            <span className="homepage-demo-performance-change">1.4% of sales</span>
          </span>
        </div>

        <div className="homepage-demo-performance-reading">
          <span className="homepage-demo-performance-key">
            <span>{projectionActive ? "Waste avoided, projected" : "Waste avoided"}</span>
            <small>{projectionActive ? "Full year" : "Measured impact"}</small>
          </span>
          <span className="homepage-demo-performance-reading-value">
            <span className="homepage-demo-performance-value">{formatNumber(currentValue("waste"))} units</span>
            <span className="homepage-demo-performance-change">24% → 21% waste rate</span>
          </span>
        </div>
      </div>

      <div className="homepage-demo-performance-projection">
        <div className="homepage-demo-performance-projection-control">
          <button type="button" onClick={toggleProjection} disabled={isProjecting}>
            {!isProjected && <span className="homepage-demo-performance-triangle" aria-hidden="true" />}
            <span>{isProjected ? "ACTUALS" : "ANNUALIZED IMPACT"}</span>
          </button>
        </div>
        <div className="homepage-demo-performance-track" aria-hidden="true">
          <span className="homepage-demo-performance-fill" style={{ width: `${projectionProgress * 100}%` }} />
          <span
            className="homepage-demo-performance-dot"
            style={{ left: `${projectionProgress * 100}%`, opacity: projectionActive ? 1 : 0 }}
          />
        </div>
        <div className="homepage-demo-performance-axis"><span aria-hidden="true" /><span>FULL YEAR</span></div>
      </div>
    </div>
  );
}

export function FreshFoodHomepage({ content = originalContent }) {
  const rootRef = useRef(null);
  const demoFrameRefs = useRef([]);
  const demoCloseRef = useRef(null);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [liveResults, setLiveResults] = useState({ ...initialLiveResults, display_status: "snapshot" });
  const c = content;

  useEffect(() => {
    let active = true;
    fetch("/api/homepage-live-results", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Live results are unavailable.");
        return response.json();
      })
      .then((results) => {
        if (active && validLiveResults(results)) setLiveResults(results);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = c.locale;
    return () => {
      document.documentElement.lang = previousLanguage;
    };
  }, [c.locale]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroVideo = root.querySelector(".homepage-demo-hero-video");
    if (heroVideo) {
      heroVideo.muted = true;
      heroVideo.defaultMuted = true;
      if (reducedMotion) heroVideo.pause();
      else heroVideo.play().catch(() => {});
    }

    const nav = root.querySelector(".homepage-demo-nav");
    const hero = root.querySelector(".homepage-demo-hero");
    const updateNav = () => {
      nav?.classList.toggle("is-scrolled", window.scrollY > 40);
      nav?.classList.toggle("is-past-hero", window.scrollY > hero.offsetHeight - 120);
    };

    const pageCtas = [...root.querySelectorAll("[data-page-book-call]")];
    const visiblePageCtas = new Set();
    const updateNavCta = () => {
      nav?.classList.add("is-cta-ready");
      nav?.classList.toggle("has-visible-page-cta", visiblePageCtas.size > 0);
    };
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visiblePageCtas.add(entry.target);
          else visiblePageCtas.delete(entry.target);
        });
        updateNavCta();
      },
      { threshold: 0.35 },
    );
    pageCtas.forEach((cta) => ctaObserver.observe(cta));

    const switcher = root.querySelector(".language-switcher");
    const closeSwitcher = () => {
      if (switcher) switcher.open = false;
    };
    const closeSwitcherFromOutside = (event) => {
      if (switcher?.open && !switcher.contains(event.target)) closeSwitcher();
    };
    const closeSwitcherOnEscape = (event) => {
      if (event.key === "Escape" && switcher?.open) {
        closeSwitcher();
        switcher.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeSwitcherFromOutside);
    document.addEventListener("keydown", closeSwitcherOnEscape);
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateNav);
      document.removeEventListener("pointerdown", closeSwitcherFromOutside);
      document.removeEventListener("keydown", closeSwitcherOnEscape);
      ctaObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isDemoOpen) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const showcaseTimer = window.setTimeout(
      () => setShowcaseIndex((index) => (index + 1) % DEMO_SLIDES.length),
      DEMO_SLIDES[showcaseIndex].duration,
    );
    return () => window.clearTimeout(showcaseTimer);
  }, [showcaseIndex, isDemoOpen]);

  useEffect(() => {
    if (!isDemoOpen) return;
    DEMO_SLIDES.forEach((_, index) => {
      const frame = demoFrameRefs.current[index];
      if (!frame) return;
      frame.contentWindow?.postMessage({ type: "eclipsai-demo-set-language", lang: "en" }, "*");
      frame.contentWindow?.postMessage(
        index === showcaseIndex
          ? DEMO_SLIDES[index].replay
            ? { type: "eclipsai-demo-activate-chapter", animation: DEMO_SLIDES[index].replay }
            : { type: "eclipsai-demo-resume-chapter" }
          : { type: "eclipsai-demo-deactivate-chapter" },
        "*",
      );
    });
  }, [showcaseIndex, isDemoOpen]);

  useEffect(() => {
    if (!isDemoOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsDemoOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    demoCloseRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDemoOpen]);

  const activateDemoFrame = (index) => {
    const frame = demoFrameRefs.current[index];
    if (!frame) return;
    frame.contentWindow?.postMessage({ type: "eclipsai-demo-set-language", lang: "en" }, "*");
    frame.contentWindow?.postMessage(
      index === showcaseIndex
        ? DEMO_SLIDES[index].replay
          ? { type: "eclipsai-demo-activate-chapter", animation: DEMO_SLIDES[index].replay }
          : { type: "eclipsai-demo-resume-chapter" }
        : { type: "eclipsai-demo-deactivate-chapter" },
      "*",
    );
  };

  return (
    <div
      ref={rootRef}
      lang={c.locale}
      className={`homepage-demo ffh ${newsreader.variable} ${manrope.variable} ${dmMono.variable}`}
    >
      <nav className="homepage-demo-nav" aria-label={c.nav.ariaLabel}>
        <div className="homepage-demo-nav-inner">
          <a className="homepage-demo-logo" href="#top" aria-label={c.nav.homeAriaLabel}>
            <img src={`${ASSETS}/eclipsai-wordmark-mineral-solar.svg`} alt="" />
          </a>
          <div className="homepage-demo-nav-links">
            <a href="#approach">{c.nav.product}</a>
            <a href="#proof">{c.nav.proof}</a>
            <a href="#vision">{c.nav.vision}</a>
            <HomepageLanguageSwitcher content={c} />
            <a className="homepage-demo-nav-cta" href={CALENDLY_URL} target="_blank" rel="noreferrer">
              {c.nav.cta}
            </a>
          </div>
        </div>
      </nav>

      <main>
        <header className="homepage-demo-hero" id="top">
          <video
            className="homepage-demo-hero-video"
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
          <div className="homepage-demo-hero-inner">
            <p className="homepage-demo-eyebrow">{c.hero.eyebrow}</p>
            <h1>{c.hero.h1}</h1>

            <div className="homepage-demo-hero-lower">
              <div className="homepage-demo-hero-intro">
                <p>{c.hero.copy}</p>
                <a className="homepage-demo-button" data-page-book-call href={CALENDLY_URL} target="_blank" rel="noreferrer">
                  {c.nav.cta}
                </a>
                <small>{c.hero.audience}</small>
              </div>

              <aside className="homepage-demo-results" aria-label={c.live.ariaLabel}>
                <div className="homepage-demo-results-head">
                  <strong>
                    <span>{c.live.period}</span>
                    <span className={`homepage-demo-live-label${liveResults.display_status === "live" ? "" : " is-snapshot"}`}>
                      {liveResults.display_status === "live" ? c.live.live : c.live.snapshot}
                    </span>
                  </strong>
                </div>
                <div className="homepage-demo-result">
                  <b>{liveResults.production_lines_changed.toLocaleString(localeTag(c.locale))}</b>
                  <span>{c.live.linesChanged}</span>
                </div>
                <div className="homepage-demo-result">
                  <b>{formatPercent(liveResults.profit_impact_share_of_sales, c.locale)}</b>
                  <span>{c.live.profitImpact}</span>
                </div>
                <div className="homepage-demo-result">
                  <b>{formatPercent(-liveResults.estimated_waste_reduction_share, c.locale)}</b>
                  <span>{c.live.wasteReduction}</span>
                </div>
                <p>{c.live.updated} {formatUpdatedAt(liveResults.updated_at, c.locale)}</p>
              </aside>

              <div className="homepage-demo-hero-mobile-cta">
                <a className="homepage-demo-button" data-page-book-call href={CALENDLY_URL} target="_blank" rel="noreferrer">
                  {c.nav.cta}
                </a>
                <small>{c.hero.audience}</small>
              </div>
            </div>
          </div>
        </header>

        <section className="homepage-demo-approach" id="approach">
          <div className="homepage-demo-wrap">
            <div className="homepage-demo-approach-head">
              <p className="homepage-demo-eyebrow">{c.product.eyebrow}</p>
              <h2>{c.product.h2}</h2>
            </div>

            <div className="homepage-demo-approach-stage">
              <div className="homepage-demo-approach-media" aria-label={c.product.mediaLabel}>
                <video autoPlay muted loop playsInline preload="metadata">
                  <source src={`${ASSETS}/product-conversation-v2.mp4`} type="video/mp4" />
                </video>
              </div>

              <div className="homepage-demo-approach-copy">
                <ol className="homepage-demo-approach-list">
                  {c.product.items.map((item) => (
                    <li key={item.strong}>
                      <h3>{item.strong}</h3>
                      <p>{item.text}</p>
                    </li>
                  ))}
                </ol>
                <button
                  className="homepage-demo-open-demo"
                  type="button"
                  onClick={() => {
                    setShowcaseIndex(0);
                    setIsDemoOpen(true);
                  }}
                >
                  {c.demo.open}
                  <span aria-hidden="true">▶</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="homepage-demo-evidence" id="proof">
          <div className="homepage-demo-wrap">
            <p className="homepage-demo-eyebrow">{c.proof.metadata}</p>
            <h2>{c.proof.h2Before}<span className="homepage-demo-nowrap">{c.proof.h2Value}</span>{c.proof.h2After}</h2>
            <p className="homepage-demo-evidence-subtitle">{c.proof.lede}</p>

            <PerformanceTrackerEvidence />
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

        <section className="section offer" id="start">
          <div className="wrap homepage-demo-final-cta">
            <h2 className="reveal">{c.offer.h2}</h2>
            <a className="button" data-page-book-call href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
              {c.nav.cta}
            </a>
          </div>
        </section>
      </main>

      {isDemoOpen && (
        <div
          className="homepage-demo-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsDemoOpen(false);
          }}
        >
          <section
            className="homepage-demo-overlay-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="homepage-demo-overlay-title"
          >
            <header className="homepage-demo-overlay-header">
              <span aria-hidden="true" />
              <h2 id="homepage-demo-overlay-title">Demo</h2>
              <button ref={demoCloseRef} type="button" onClick={() => setIsDemoOpen(false)}>
                {c.demo.close}
              </button>
            </header>

            <div
              className="homepage-demo-showcase-stage"
              style={{ "--showcase-duration": `${DEMO_SLIDES[showcaseIndex].duration}ms` }}
            >
              <div className="homepage-demo-showcase-visual" aria-live="polite">
                {DEMO_SLIDES.map((slide, index) => (
                  slide.kind === "tracker" ? (
                    <section
                      key={slide.title}
                      className={`homepage-demo-showcase-report${index === showcaseIndex ? " is-active" : ""}`}
                      aria-label={slide.title}
                    >
                      <h3>{slide.title}</h3>
                      <div className="homepage-demo-showcase-report-body">
                        <PerformanceTrackerEvidence variant="demo" />
                      </div>
                    </section>
                  ) : (
                    <iframe
                      key={`${slide.chapter}-${slide.embed}`}
                      ref={(node) => { demoFrameRefs.current[index] = node; }}
                      className={index === showcaseIndex ? "is-active" : ""}
                      src={`/demo-common/engine.html?demo=generic&lang=en&chapter=${slide.chapter}&embed=${slide.embed}&mode=${slide.replay ? "ready" : "done"}&v=homepage-showcase-5-${index}`}
                      title={slide.title}
                      loading="eager"
                      onLoad={() => activateDemoFrame(index)}
                    />
                  )
                ))}
              </div>
              <div className="homepage-demo-showcase-progress" aria-label="Choose demo view">
                {DEMO_SLIDES.map((slide, index) => (
                  <button
                    key={slide.title}
                    className={index === showcaseIndex ? "is-active" : ""}
                    type="button"
                    aria-label={`${index + 1} of ${DEMO_SLIDES.length}: ${slide.title}`}
                    aria-current={index === showcaseIndex ? "step" : undefined}
                    onClick={() => setShowcaseIndex(index)}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      <footer>
        <div className="footer-inner">
          <div>
            <a className="logo" href="#top" aria-label={c.nav.homeAriaLabel}>
              <img src={`${ASSETS}/eclipsai-wordmark-mineral-solar.svg`} alt="" />
            </a>
            <p>{c.footer.tagline}</p>
          </div>
          <p>{c.footer.location}</p>
        </div>
      </footer>
    </div>
  );
}
