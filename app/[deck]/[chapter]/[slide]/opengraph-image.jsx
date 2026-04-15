// Per-slide OG image. Co-located under the deepest dynamic segment so Next 15's
// OG resolver picks it over the deck-level and root OG files for any URL
// matching /[deck]/[chapter]/[slide]. The chip row adapts to the slide kind:
//
//   tufte             → slide.notes[].marker    (e.g. "15–30%")
//   scroll            → slide.stats[].value     (e.g. "40%")
//   standard+pillars  → slide.pillars[].title   (label-only chips)
//   standard+callout  → slide.callout.value     (single big chip)
//   custom            → empty (falls through to footer text)
//
// Custom slides now carry their own title/ogDescription via m6.2, so they no
// longer collapse to the chapter title.
import { ImageResponse } from "next/og";
import { shelf, getDeck } from "../../../../src/decks/index.js";
import { renderOgCard, OG_SIZE, THEME_CREAM } from "../../../_og/card.jsx";

export const runtime = "nodejs";
export const alt = "Eclipsai slide";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  const params = [];
  for (const deck of shelf.decks) {
    for (const chapter of deck.chapters) {
      for (const slide of chapter.slides) {
        params.push({ deck: deck.id, chapter: chapter.id, slide: slide.id });
      }
    }
  }
  return params;
}

function resolve(params) {
  const deck = getDeck(params.deck);
  if (!deck) return null;
  const chapter = deck.chapters.find((c) => c.id === params.chapter);
  if (!chapter) return null;
  const slide = chapter.slides.find((s) => s.id === params.slide);
  if (!slide) return null;
  return { deck, chapter, slide };
}

// Pull 0–3 chips for the card's visual row. Different slide kinds store
// their headline numbers in different fields — this normalises them.
function accentChips(slide) {
  if (slide.notes?.length) {
    return slide.notes.slice(0, 3).map((n) => ({ big: n.marker, small: n.label }));
  }
  if (slide.stats?.length) {
    return slide.stats.slice(0, 3).map((s) => ({
      big: `${s.value}${s.unit || ""}`,
      small: s.label,
    }));
  }
  if (slide.pillars?.length) {
    // Pillar titles alone look sparse — show the first sentence of desc too.
    return slide.pillars.slice(0, 3).map((p) => ({
      small: p.title,
    }));
  }
  if (slide.callout) {
    return [{ big: String(slide.callout.value), small: slide.callout.label }];
  }
  return [];
}

// Trim a long body/article paragraph down to ~120 chars on a word boundary
// so it fits the OG card's sub line without wrapping awkwardly.
function truncate(s, n = 120) {
  if (!s) return null;
  const clean = s.replace(/\s+/g, " ").trim();
  if (clean.length <= n) return clean;
  const cut = clean.slice(0, n);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > 60 ? lastSpace : n) + "…";
}

// Resolve the OG sub line from slide content, falling back to chapter subtitle.
// Order: explicit override → body → text-style callout → first article paragraph
// → chapter subtitle. Lets every slide carry its own context without authors
// having to maintain an `ogDescription` field by hand.
function resolveSub(slide, chapter) {
  return (
    slide.ogDescription
    || truncate(slide.body)
    || truncate(slide.callout?.text)
    || truncate(slide.article?.sections?.[0]?.body)
    || chapter.subtitle
  );
}

export default async function SlideOg({ params }) {
  const hit = resolve(await params);
  if (!hit) {
    return new ImageResponse(
      renderOgCard({ theme: THEME_CREAM, headline: "Eclipsai" }),
      { ...size },
    );
  }
  const { deck, chapter, slide } = hit;
  const eyebrow = `${chapter.num} · ${chapter.title}`.toUpperCase();
  const headline = slide.title || chapter.title;
  const sub = resolveSub(slide, chapter);

  return new ImageResponse(
    renderOgCard({
      theme: THEME_CREAM,
      topRight: deck.title,
      eyebrow,
      headline,
      sub,
      chips: accentChips(slide),
      footer: slide.article ? "Long read available" : undefined,
    }),
    { ...size },
  );
}
