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
import { resolveSlideSub } from "../../../_og/sub.js";

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
  const sub = resolveSlideSub(slide, chapter);

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
