// Per-deck OG image for /[deck] cover routes. Next 15 routes /ai-transformation
// to this file (closer than the root app/opengraph-image.jsx). Chips show the
// four chapter titles as a mini table of contents.
import { ImageResponse } from "next/og";
import { shelf, getDeck } from "../../src/decks/index.js";
import { renderOgCard, OG_SIZE, THEME_CREAM } from "../_og/card.jsx";

export const runtime = "nodejs";
export const alt = "Eclipsai deck";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return shelf.decks.map((d) => ({ deck: d.id }));
}

export default async function DeckOg({ params }) {
  const { deck: deckId } = await params;
  const deck = getDeck(deckId);
  if (!deck) {
    return new ImageResponse(
      renderOgCard({ theme: THEME_CREAM, headline: "Eclipsai" }),
      { ...size },
    );
  }

  // Chapters → chips. Big = chapter num ("01"), small = chapter title.
  const chips = deck.chapters.slice(0, 4).map((ch) => ({
    big: ch.num,
    small: ch.title,
  }));

  return new ImageResponse(
    renderOgCard({
      theme: THEME_CREAM,
      eyebrow: "THE PLAYBOOK",
      headline: deck.title,
      sub: deck.chapters[0]?.subtitle,
      chips,
    }),
    { ...size },
  );
}
