# Eclipsai Offering — v2

Refactor of `../definitive.jsx` into the modular structure defined in `../CLAUDE_CODE_BRIEF.md`.

## Status

- **Milestone 1 — structure split** ✅ (behavior-preserving)
- Milestone 2 — types
- Milestone 3 — drop Chapter 5, promote to shelf-level /about
- Milestone 4 — MarketplaceSlide (rebuilt from `10. Marketplace/files/skills-marketplace`)
- Milestone 5 — Next.js migration + Vercel deployment

## Tree

```
src/
  App.jsx                    shell: state, routing, kbd/scroll, transitions
  main.jsx                   React entry
  theme.js                   palette C, font stacks, global CSS
  components/
    AnimNum.jsx              animated number counter
    AboutPopup.jsx           cream popup anchored to the About link
    VideoCard.jsx            dark autoplay video card (Home)
    LeftRail.jsx             navigation rail
    SlideTemplate.jsx        eyebrow + title + divider chrome (4A)
    slides/
      StandardSlide.jsx
      TufteSlide.jsx
      ScrollSlide.jsx
  pages/
    HomePage.jsx             global home
    CoverPage.jsx            per-deck cover
    SlidePage.jsx            dispatches content/custom slides
  decks/
    index.js                 shelf (decks + about + featured)
    ai-transformation.js     the deck, preserved incl. Chapter 5 for now
```

## Architectural decisions (locked)

- **1C** — Home is global, Cover is per-deck
- **2A** — Slides are deck-local; no shared library
- **3D** — Flat shelf with optional tags
- **4A** — Global visual template; content variation via writing, not layout

Mental model: Stripe Press / The Browser Company.

## Reference

The original monolith lives at `../definitive.jsx` — preserved per brief. Do not delete.
