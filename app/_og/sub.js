// Shared helper used by both the per-slide OG image generator and the per-slide
// HTML <meta> generator. Centralises how a slide's "sub line" / OG description
// is derived so the OG card image and the LinkedIn/Slack link card always agree.
//
// Cascade (first non-empty wins):
//   1. slide.ogDescription       — explicit author override
//   2. slide.body                — short serif intro on standard slides
//   3. slide.callout?.text       — text-style pull-quote callouts
//   4. slide.article.sections[0].body — first paragraph of the long-read article
//   5. chapter.subtitle          — last-resort fallback so the slot is never blank
//
// Strings are normalised (collapsed whitespace) and trimmed to ~120 chars on a
// word boundary so they fit OG cards and LinkedIn previews without wrapping.

export function truncate(s, n = 120) {
  if (!s) return null;
  const clean = s.replace(/\s+/g, " ").trim();
  if (clean.length <= n) return clean;
  const cut = clean.slice(0, n);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > 60 ? lastSpace : n) + "…";
}

export function resolveSlideSub(slide, chapter) {
  return (
    slide.ogDescription
    || truncate(slide.body)
    || truncate(slide.callout?.text)
    || truncate(slide.article?.sections?.[0]?.body)
    || chapter.subtitle
  );
}
