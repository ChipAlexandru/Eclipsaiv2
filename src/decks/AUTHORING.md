# Slide & Article Authoring Guide

Rules for adding new slides and inline articles to a deck.

**Slide content design** — before writing the JS object, design the slide surface content using Step 6 of `seo-ai-discoverability/04-Article-Production-Process.md`. That step covers how to define what the slide should say, in context of the existing deck, before choosing a type and mapping to fields here.

## Slide basics

Each slide lives in a chapter's `slides` array. Required fields:

```js
{
  id: "kebab-case-id",        // unique across the deck, used in URL
  dateAdded: "YYYY-MM-DD",    // drives the "Latest" section on the homepage
  type: "standard" | "tufte" | "scroll" | "custom",
  title: "Slide title",
  source: "Attribution shown at slide bottom",
}
```

### Slide types

| Type | Use when | Extra fields |
|------|----------|-------------|
| `standard` | Short text + optional single stat | `bodyLines[]`, `stat { label, value, unit, desc }` |
| `tufte` | Narrative left + sidebar stats right | `paragraphs[]`, `sidebarStats[]` |
| `scroll` | Stat cards grid + optional chart + optional body | `stats[]`, `chart {}`, `body` |
| `custom` | Full-bleed custom component | `component: "ComponentName"` |

### Stats array (scroll type)

```js
stats: [
  { label: "Label", value: 50, unit: "%", desc: "optional description" },
  { label: "Text stat", value: "50%+", isText: true, desc: "..." },
]
```

- Numeric values animate from 0. Text values (set `isText: true` on the stat) render as-is.
- `isText` can be set per-stat or at slide level.

### Chart (scroll type)

```js
chart: {
  title: "CHART TITLE",
  unit: "USD, billions",
  height: 150,              // optional, default 180 — use lower values on dense slides
  yMax: 32,
  yTicks: [0, 10, 20, 30],
  yFormat: "${}B",
  xMin: 2023.3,
  series: [
    { type: "line", color: "#8C3A4F", strokeWidth: 3, data: [[x, y], ...] },
    { type: "area", ... },
    { type: "bar", ... },
  ],
  annotations: [{ x, y, label: "$1B" }, ...],
  xLabels: [{ pos: 2023, label: "2023" }, ...],
}
```

### Body text (scroll type)

`body` renders as a bold serif one-liner below the chart. Keep it short (one line at ~840px width). On dense slides with chart + article, this is the tightest constraint.

## Viewport budget

All non-custom slide content MUST fit in a single MacBook viewport (no scrolling). A dev-mode red dashed "fold" line marks the bottom edge. If content crosses it, reduce spacing or chart height.

Chrome budget (fixed):
- Progress bar: 3px
- Canvas top padding: ~14px (clamp)
- Canvas bottom padding: ~8px (clamp)  
- Dots bar: ~30px
- SlideTemplate eyebrow: 22px
- SlideTemplate title: ~56px min
- Divider + margin: ~13px
- Source line: ~17px

Remaining for slide content: ~400-420px depending on title wrap.

## Inline articles

Articles expand below the slide on "Continue reading" click. They have NO viewport constraint — length is unlimited.

### Article data structure

```js
article: {
  title: "Article H1 title",
  sections: [
    { body: "Paragraph without subhead" },
    { subhead: "Section heading", body: "First paragraph of section" },
    { body: "Continuation paragraph (no subhead = same section visually)" },
    { type: "callout", value: "27%", label: "description of the stat" },
    { type: "pullquote", text: "Quote text", source: "Attribution" },
  ],
  sources: [
    { label: "Display text for the link", url: "https://..." },
    { label: "Source without link" },  // renders as plain text
  ],
}
```

### Article authoring rules

1. **Use the full source article.** Do not summarize or condense. Every paragraph from the KB article should appear as its own `{ body: "..." }` section entry.

2. **Title** — use the article's H1 as `article.title`. This renders as a serif heading at the top of the expanded article.

3. **Subheads** — map each H2 from the source to a `subhead` field on the first paragraph of that section. Subsequent paragraphs under the same H2 get their own section entries without a subhead.

4. **Callouts and pullquotes** — use sparingly for emphasis. Place them between the paragraphs where they naturally fall in the source.

5. **Sources** — use the `sources` array (not `source` string) with `label` + `url` for each reference. Copy the exact URLs from the source article's references section.

6. **Source file location** — KB articles live in `Knowledge/kb/outputs/articles/`. The filename convention is `p{chapter}-{slide-number}-{slug}.md`.

### Reading time

Reading time is auto-calculated from section word counts (~200 wpm). No need to set it manually unless you want to override via `article.readingTime`.
