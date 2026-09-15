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

function renderProfitBrainPhrase(value) {
  return String(value).split(/(the profit brain|profit brain)/gi).map((part, index) =>
    /^(?:the )?profit brain$/i.test(part)
      ? <span className="homepage-demo-brand-phrase" key={`${part}-${index}`}>{part}</span>
      : part,
  );
}

function ProfitBrainGraphic({ labels }) {
  const sceneRef = useRef(null);
  const platformFirstRef = useRef(null);
  const platformLastRef = useRef(null);
  const systemFirstRef = useRef(null);
  const systemLastRef = useRef(null);
  const readLabelRef = useRef(null);
  const implementLabelRef = useRef(null);
  const [connectors, setConnectors] = useState(null);

  useEffect(() => {
    const elements = [sceneRef, platformFirstRef, platformLastRef, systemFirstRef, systemLastRef, readLabelRef, implementLabelRef]
      .map((ref) => ref.current);
    if (elements.some((element) => !element)) return undefined;
    let active = true;
    const update = () => {
      if (!active) return;
      const scene = sceneRef.current.getBoundingClientRect();
      const position = (element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left - scene.left,
          right: rect.right - scene.left,
          top: rect.top - scene.top,
          bottom: rect.bottom - scene.top,
          centerY: rect.top - scene.top + rect.height / 2,
        };
      };
      const firstPlatform = position(platformFirstRef.current);
      const lastPlatform = position(platformLastRef.current);
      const firstSystem = position(systemFirstRef.current);
      const lastSystem = position(systemLastRef.current);
      const readLabel = position(readLabelRef.current);
      const implementLabel = position(implementLabelRef.current);
      const inset = Math.min(34, scene.width * .075);
      const leftLoop = Math.max(10, Math.min(firstPlatform.left, firstSystem.left) - inset);
      const rightLoop = Math.min(scene.width - 10, Math.max(lastPlatform.right, lastSystem.right) + inset);
      const bend = Math.min(42, scene.height * .1);
      const labelGap = Math.max(6, scene.height * .01);
      setConnectors({
        width: scene.width,
        height: scene.height,
        leftLower: `M${firstSystem.left} ${firstSystem.centerY} Q${leftLoop} ${firstSystem.centerY} ${leftLoop} ${firstSystem.centerY - bend} L${leftLoop} ${readLabel.bottom + labelGap}`,
        leftUpper: `M${leftLoop} ${readLabel.top - labelGap} L${leftLoop} ${firstPlatform.centerY + bend} Q${leftLoop} ${firstPlatform.centerY} ${firstPlatform.left} ${firstPlatform.centerY}`,
        rightUpper: `M${lastPlatform.right} ${lastPlatform.centerY} Q${rightLoop} ${lastPlatform.centerY} ${rightLoop} ${lastPlatform.centerY + bend} L${rightLoop} ${implementLabel.top - labelGap}`,
        rightLower: `M${rightLoop} ${implementLabel.bottom + labelGap} L${rightLoop} ${lastSystem.centerY - bend} Q${rightLoop} ${lastSystem.centerY} ${lastSystem.right} ${lastSystem.centerY}`,
        topArrow: `M${firstPlatform.left - 10} ${firstPlatform.centerY - 6} L${firstPlatform.left} ${firstPlatform.centerY} L${firstPlatform.left - 10} ${firstPlatform.centerY + 6}`,
        bottomArrow: `M${lastSystem.right + 10} ${lastSystem.centerY - 6} L${lastSystem.right} ${lastSystem.centerY} L${lastSystem.right + 10} ${lastSystem.centerY + 6}`,
      });
    };
    const observer = new ResizeObserver(update);
    elements.forEach((element) => observer.observe(element));
    document.fonts.ready.then(update);
    update();
    return () => { active = false; observer.disconnect(); };
  }, []);

  return (
    <figure className="homepage-demo-profit-graphic" aria-label={labels.ariaLabel}>
      <div className="homepage-demo-profit-graphic-scene" ref={sceneRef}>
        {connectors && (
          <svg className="homepage-demo-profit-graphic-arrows" viewBox={`0 0 ${connectors.width} ${connectors.height}`} fill="none" aria-hidden="true">
            <path d={connectors.leftLower} /><path d={connectors.leftUpper} />
            <path d={connectors.rightUpper} /><path d={connectors.rightLower} />
            <path d={connectors.topArrow} /><path d={connectors.bottomArrow} />
          </svg>
        )}
        <span className="homepage-demo-profit-graphic-title">The Profit Brain</span>
        <div className="homepage-demo-profit-graphic-platform">
          <span ref={platformFirstRef}>{labels.correlate}</span>
          <span>{labels.measure}</span>
          <span ref={platformLastRef}>{labels.actions}</span>
        </div>
        <span className="homepage-demo-profit-graphic-read" ref={readLabelRef}>{labels.read}</span>
        <span className="homepage-demo-profit-graphic-implement" ref={implementLabelRef}>{labels.implement}</span>
        <div className="homepage-demo-profit-graphic-company">
          <span>{labels.systems}</span>
          <div className="homepage-demo-profit-graphic-systems">
            <span ref={systemFirstRef}>ERP</span><span>POS</span><span>CRM</span><span>{labels.production}</span><span ref={systemLastRef}>{labels.ops}</span>
          </div>
        </div>
      </div>
    </figure>
  );
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

function PerformanceTrackerEvidence({ variant = "evidence", labels, locale }) {
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
  const formatNumber = (value) => value.toLocaleString(localeTag(locale));
  const formatShare = (value) => new Intl.NumberFormat(localeTag(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value) + "%";
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
      <div className="homepage-demo-performance-period">{labels.period}</div>

      <div className="homepage-demo-performance-readings" aria-live="polite">
        <div className="homepage-demo-performance-reading">
          <span className="homepage-demo-performance-key">
            <span>{labels.cash}{projectionActive ? `, ${labels.projected}` : ""}</span>
            <small>{labels.ingredients}</small>
          </span>
          <span className="homepage-demo-performance-reading-value">
            <span className="homepage-demo-performance-value">CHF {formatNumber(currentValue("cash"))}</span>
            <span className="homepage-demo-performance-change">{formatShare(0.7)} {labels.ofSales}</span>
          </span>
        </div>

        <div className="homepage-demo-performance-reading">
          <span className="homepage-demo-performance-key">
            <span>{labels.economic}{projectionActive ? `, ${labels.projected}` : ""}</span>
            <small>{labels.economics}</small>
          </span>
          <span className="homepage-demo-performance-reading-value">
            <span className="homepage-demo-performance-value">CHF {formatNumber(currentValue("economic"))}</span>
            <span className="homepage-demo-performance-change">{formatShare(1.4)} {labels.ofSales}</span>
          </span>
        </div>

        <div className="homepage-demo-performance-reading">
          <span className="homepage-demo-performance-key">
            <span>{labels.waste}{projectionActive ? `, ${labels.projected}` : ""}</span>
            <small>{projectionActive ? labels.fullYear : labels.measured}</small>
          </span>
          <span className="homepage-demo-performance-reading-value">
            <span className="homepage-demo-performance-value">{formatNumber(currentValue("waste"))} {labels.units}</span>
            <span className="homepage-demo-performance-change">24% → 21% {labels.wasteRate}</span>
          </span>
        </div>
      </div>

      <div className="homepage-demo-performance-projection">
        <div className="homepage-demo-performance-projection-control">
          <button type="button" onClick={toggleProjection} disabled={isProjecting}>
            {!isProjected && <span className="homepage-demo-performance-triangle" aria-hidden="true" />}
            <span>{isProjected ? labels.actuals : labels.annualized}</span>
          </button>
        </div>
        <div className="homepage-demo-performance-track" aria-hidden="true">
          <span className="homepage-demo-performance-fill" style={{ width: `${projectionProgress * 100}%` }} />
          <span
            className="homepage-demo-performance-dot"
            style={{ left: `${projectionProgress * 100}%`, opacity: projectionActive ? 1 : 0 }}
          />
        </div>
        <div className="homepage-demo-performance-axis"><span aria-hidden="true" /><span>{labels.fullYearAxis}</span></div>
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
  const [hasResolvedLiveResults, setHasResolvedLiveResults] = useState(false);
  const c = content;
  const embeddedDemoLocale = c.locale === "de" ? "de" : "en";

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
      .catch(() => {})
      .finally(() => {
        if (active) setHasResolvedLiveResults(true);
      });
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
    const updateNav = () => {
      nav?.classList.toggle("is-scrolled", window.scrollY > 40);
    };

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
      frame.contentWindow?.postMessage({ type: "eclipsai-demo-set-language", lang: embeddedDemoLocale }, "*");
      frame.contentWindow?.postMessage(
        index === showcaseIndex
          ? DEMO_SLIDES[index].replay
            ? { type: "eclipsai-demo-activate-chapter", animation: DEMO_SLIDES[index].replay }
            : { type: "eclipsai-demo-resume-chapter" }
          : { type: "eclipsai-demo-deactivate-chapter" },
        "*",
      );
    });
  }, [showcaseIndex, isDemoOpen, embeddedDemoLocale]);

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
    frame.contentWindow?.postMessage({ type: "eclipsai-demo-set-language", lang: embeddedDemoLocale }, "*");
    frame.contentWindow?.postMessage(
      index === showcaseIndex
        ? DEMO_SLIDES[index].replay
          ? { type: "eclipsai-demo-activate-chapter", animation: DEMO_SLIDES[index].replay }
          : { type: "eclipsai-demo-resume-chapter" }
        : { type: "eclipsai-demo-deactivate-chapter" },
      "*",
    );
  };

  const hasCopyRefresh = Boolean(
    c.hero.h1Primary
    && c.hero.h1Support
    && c.product.h2Primary
    && c.product.h2Secondary
  );

  return (
    <div
      ref={rootRef}
      lang={c.locale}
      className={`homepage-demo ffh${hasCopyRefresh ? " homepage-demo-copy-refresh" : ""} homepage-demo-english-hero ${newsreader.variable} ${manrope.variable} ${dmMono.variable}`}
    >
      <nav className="homepage-demo-nav" aria-label={c.nav.ariaLabel}>
        <div className="homepage-demo-nav-inner">
          <a className="homepage-demo-logo" href="#top" aria-label={c.nav.homeAriaLabel}>
            <img src="/assets/eclipsai-wordmark-light.svg" alt="" />
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
            <p className="homepage-demo-hero-product-label">{renderProfitBrainPhrase(c.hero.h1Primary)}</p>
            <h1>{c.hero.h1Support}</h1>

            <div className="homepage-demo-hero-lower">
              <div className="homepage-demo-hero-intro">
                <p>
                  <strong className="homepage-demo-hero-category">{c.hero.eyebrow}</strong>
                  {" "}{c.hero.copy}
                </p>
              </div>

              <aside className="homepage-demo-results" aria-label={c.live.ariaLabel} aria-busy={!hasResolvedLiveResults}>
                {!hasResolvedLiveResults ? (
                  <div className="homepage-demo-results-loading" aria-hidden="true">
                    <i /><i /><i /><i />
                  </div>
                ) : (
                  <>
                    <div className="homepage-demo-result homepage-demo-result-profit">
                      <b>{formatPercent(liveResults.profit_impact_share_of_sales, c.locale)}</b>
                      <span>{c.live.profitImpact}</span>
                    </div>
                    <div className="homepage-demo-result">
                      <b>{formatPercent(-liveResults.estimated_waste_reduction_share, c.locale)}</b>
                      <span>{c.live.wasteReduction}</span>
                    </div>
                    <div className="homepage-demo-result">
                      <b>{liveResults.production_lines_changed.toLocaleString(localeTag(c.locale))}</b>
                      <span>{c.live.linesChanged}</span>
                    </div>
                    <div className="homepage-demo-results-footer">
                      <span className="homepage-demo-results-period">
                        <span>{c.live.period}</span>
                        <span className={`homepage-demo-live-label${liveResults.display_status === "live" ? "" : " is-snapshot"}`}>
                          {liveResults.display_status === "live" ? c.live.live : c.live.snapshot}
                        </span>
                      </span>
                      <span>{c.live.updated} {formatUpdatedAt(liveResults.updated_at, c.locale)}</span>
                    </div>
                  </>
                )}
              </aside>

            </div>
          </div>
        </header>

        <section className="homepage-demo-approach" id="approach">
          <div className="homepage-demo-wrap">
            <div className="homepage-demo-approach-head">
              <h2>
                {renderProfitBrainPhrase(c.product.h2)}
              </h2>
            </div>

            <div className="homepage-demo-approach-stage">
              <div className="homepage-demo-approach-copy">
                <ol className="homepage-demo-approach-list">
                  {c.product.items.map((item) => (
                    <li key={item.strong}>
                      <h3>{item.strong}</h3>
                      <p>{renderProfitBrainPhrase(item.text)}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="homepage-demo-approach-media">
                <ProfitBrainGraphic labels={c.product.diagram} />
                <button
                  className="homepage-demo-open-demo"
                  type="button"
                  onClick={() => {
                    setShowcaseIndex(0);
                    setIsDemoOpen(true);
                  }}
                >
                  {c.demo.open}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="homepage-demo-evidence" id="proof">
          <div className="homepage-demo-wrap">
            <h2>{c.proof.h2Before}<span className="homepage-demo-nowrap">{c.proof.h2Value}</span>{c.proof.h2After}</h2>
            {c.proof.lede && <p className="homepage-demo-evidence-subtitle">{c.proof.lede}</p>}

            <PerformanceTrackerEvidence labels={c.proof.tracker} locale={c.locale} />
          </div>
        </section>

        <section className="section vision" id="vision">
          <div className="wrap">
            <h2 className="reveal">{c.vision.h2}</h2>
            <p className="vision-intro reveal">{renderProfitBrainPhrase(c.vision.intro)}</p>
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
              <h2 className="reveal">{c.faq.h2}</h2>
            </div>
            <div className="reveal">
              {c.faq.items.map((item) => (
                <details key={item.q}>
                  <summary>{renderProfitBrainPhrase(item.q)}</summary>
                  <p>{renderProfitBrainPhrase(item.a)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section offer" id="start">
          <div className="wrap homepage-demo-final-cta">
            <h2 className="reveal">{renderProfitBrainPhrase(c.offer.h2)}</h2>
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
              <h2 id="homepage-demo-overlay-title">{c.demo.open}</h2>
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
                      key={c.demo.slides[index]}
                      className={`homepage-demo-showcase-report${index === showcaseIndex ? " is-active" : ""}`}
                      aria-label={c.demo.slides[index]}
                    >
                      <h3>{c.demo.slides[index]}</h3>
                      <div className="homepage-demo-showcase-report-body">
                        <PerformanceTrackerEvidence variant="demo" labels={c.proof.tracker} locale={c.locale} />
                      </div>
                    </section>
                  ) : (
                    <iframe
                      key={`${slide.chapter}-${slide.embed}`}
                      ref={(node) => { demoFrameRefs.current[index] = node; }}
                      className={index === showcaseIndex ? "is-active" : ""}
                      src={`/demo-common/engine.html?demo=generic&lang=${embeddedDemoLocale}&chapter=${slide.chapter}&embed=${slide.embed}&mode=${slide.replay ? "ready" : "done"}&v=homepage-showcase-5-${index}`}
                      title={c.demo.slides[index]}
                      loading="eager"
                      onLoad={() => activateDemoFrame(index)}
                    />
                  )
                ))}
              </div>
              <div className="homepage-demo-showcase-progress" aria-label={c.demo.chooseView}>
                {DEMO_SLIDES.map((slide, index) => (
                  <button
                    key={c.demo.slides[index]}
                    className={index === showcaseIndex ? "is-active" : ""}
                    type="button"
                    aria-label={`${index + 1} ${c.demo.viewOf} ${DEMO_SLIDES.length}: ${c.demo.slides[index]}`}
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
          <p>{c.footer.location}</p>
        </div>
      </footer>
    </div>
  );
}
