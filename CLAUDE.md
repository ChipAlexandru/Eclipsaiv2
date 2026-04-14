# Eclipsai Offering — v2 (Next.js 15 App Router)

## Key references

- **Slide & article authoring guide**: `src/decks/AUTHORING.md` — read this before adding or modifying any slide or inline article. It covers slide types, viewport budget, article structure, and source linking.
- **KB source articles**: `../Knowledge/kb/outputs/articles/` — these are the full-text sources for inline articles. When adding an article to a slide, use the complete text from the KB file. Do not summarize or condense.
- **KB CLAUDE.md**: `../Knowledge/kb/CLAUDE.md` — taxonomy, quality ratings, and ingest workflows for the knowledge base.

## Rules

- All non-custom slide content must fit in a single MacBook viewport without scrolling. A dev-mode fold overlay (red dashed line) marks the limit.
- Inline articles have no length constraint — they expand below the fold on click.
- When converting a KB article to an inline article: preserve every paragraph, use the H1 as `article.title`, map H2s to `subhead` fields, and add `sources` with URLs from the article's references section.
