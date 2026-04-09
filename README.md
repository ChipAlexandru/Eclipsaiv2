# Eclipsai Offering — v2

Next.js 15 App Router app that backs `eclipsai.com`. Combines a Stripe Press–
style pitch deck with the full skills marketplace (which replaced the old
`skills-marketplace` repo in m4).

## Status

- **m1 — structure split** ✅
- **m2 — types.js + runtime shelf validation** ✅
- **m3 — drop Chapter 5, promote to shelf-level /about page** ✅
- **m3.5 — Vite dev harness** ✅
- **m4 — skills marketplace migrated into v2 + explainer and directory slides** ✅
- **m5.1 — Vite → Next.js 15 scaffold** ✅
- **m5.2 — /skills + /skills/[slug] with rich data migration** ✅
- **m5.3 — deep-linkable deck routes (/[deck]/[chapter]/[slide]) + /about + per-slide OG meta** ✅
- **m5.4 — OG image, sitemap, robots, JSON-LD, Copy link, Plausible — deploy-ready** ✅

## Routes

| Path                             | Purpose                                                              |
|----------------------------------|----------------------------------------------------------------------|
| `/`                              | Home — wordmark, headline, featured cards, About popup               |
| `/about`                         | Full About page (promoted from old Chapter 5)                        |
| `/[deck]`                        | Deck cover (e.g. `/ai-transformation`)                               |
| `/[deck]/[chapter]/[slide]`      | Deep-linkable slide; per-slide `generateMetadata`                    |
| `/skills`                        | Full marketplace directory (14 skills)                               |
| `/skills/[slug]`                 | Per-skill detail page with long_description, use_cases, tools, etc.  |
| `/sitemap.xml`                   | Auto-generated from shelf + skills                                   |
| `/robots.txt`                    | Permissive; points at the sitemap                                    |
| `/opengraph-image`               | Default OG image rendered with `next/og` ImageResponse               |

All dynamic routes use `generateStaticParams` so every slide, cover, and
skill slug is pre-rendered at build time. Next.js serves pre-rendered HTML
from the edge; the App shell hydrates for in-session navigation + transitions.

## Architecture

```
app/
  layout.jsx                  root metadata + JSON-LD + Plausible
  page.jsx                    /  — mounts App with initialView="home"
  about/page.jsx              /about
  [deck]/page.jsx             /[deck] — cover
  [deck]/[chapter]/[slide]/page.jsx   /[deck]/[chapter]/[slide] — slide deep link
  skills/page.jsx             /skills
  skills/[slug]/page.jsx      /skills/[slug]
  sitemap.js                  /sitemap.xml
  robots.js                   /robots.txt
  opengraph-image.jsx         /opengraph-image (next/og)

src/
  App.jsx                     shell: state, in-session nav, URL sync via replaceState
  theme.js                    palette, fonts, global CSS
  types.js                    JSDoc typedefs + runtime shelf validation
  components/
    AnimNum.jsx, AboutPopup.jsx, VideoCard.jsx
    LeftRail.jsx, SlideTemplate.jsx
    CopyLinkButton.jsx        (m5.4)
    slides/ { StandardSlide, TufteSlide, ScrollSlide }
  views/
    HomePage.jsx, CoverPage.jsx, SlidePage.jsx, AboutPage.jsx
    # renamed from src/pages/ in m5.4 — "pages" is reserved by Next.js
    # Pages Router even under src/, so the build tried to treat these
    # as routes.
  decks/
    index.js                  shelf (decks + about + featured)
    ai-transformation.js
  marketplace/
    data-full.js              verbatim migration of the old lib/skills.js
    data.js                   adapter over data-full.js — only this file
                              changes if we split per-skill later
    constants.js              INDUSTRIES, FUNCTIONS, RATING_*
    SignalBars.jsx, RatingPill.jsx, SkillCard.jsx
    MarketplaceExplainer.jsx  custom slide — maturity framework + example
    MarketplaceDirectory.jsx  custom slide — interactive directory inside deck
    MarketplaceFullDirectory.jsx   /skills full-page version
    SkillDetailView.jsx       /skills/[slug] client view
```

### Routing model

1. Every route is a Next.js server component that computes metadata + static
   params and mounts the single shared `App` client component with initial
   state props.
2. `App` runs the in-session navigation (arrow keys, wheel, rail, progress
   dots, vertical transitions) via its own state machine.
3. A `useEffect` in `App` mirrors state → URL via `history.replaceState`, so
   Copy link and reloads always reflect the current slide. Browser back
   intentionally exits the site rather than stepping through slides.

### Architectural decisions (locked)

- **1C** — Home is global, Cover is per-deck
- **2A** — Slides are deck-local; no shared library
- **3D** — Flat shelf with optional tags
- **4A** — Global visual template; content variation via writing, not layout
- **m5-1** — Root `/` is the Home deck; no `/offering` prefix
- **m5-2** — Route shape B (deep-linkable URLs, router-driven metadata)
- **m5-3** — Marketplace data migration via adapter pattern (data.js wraps data-full.js)

## Local development

```
npm install
npm run dev       # http://localhost:3000
npm run build     # static pre-render for deploy
npm run start     # serve the build locally
```

## Deploy

The production domain is `eclipsai.com`. Target repo:
`https://github.com/ChipAlexandru/Eclipsaiv2`.

1. Push v2 to the repo (first time only):
   ```
   cd v2
   git remote add origin https://github.com/ChipAlexandru/Eclipsaiv2.git
   git push -u origin main
   ```
2. Create a new Vercel project pointing at that repo.
3. Framework preset: Next.js. Root directory: repo root (this `v2/` folder
   becomes the repo root once pushed). No env vars are required.
4. Point `eclipsai.com` at the new project; disconnect the old
   skills-marketplace Vercel project from the domain.
5. Plausible: the site tag `eclipsai.com` is hard-wired in `app/layout.jsx`;
   create the site in Plausible with that exact domain so events land.

## Reference

The original monolith lives at `../definitive.jsx` — preserved per brief.
Do not delete. The old `skills-marketplace` repo is being retired — this
app is the single source of truth for both the deck and the marketplace.
