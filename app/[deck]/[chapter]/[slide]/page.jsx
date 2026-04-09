// /[deck]/[chapter]/[slide] — specific slide deep link.
// Server wrapper: generateStaticParams pre-renders every slide in every deck,
// generateMetadata pulls the slide title + chapter subtitle so LinkedIn/Slack
// previews show actual slide content, not the generic site title. The App
// shell mounts with matching initialView/initialDeckId/initialChapterId/
// initialSlideIdx and continues to drive in-session navigation via its own
// state machine (arrow keys, wheel, rail, progress dots).
import { notFound } from "next/navigation";
import App from "../../../../src/App.jsx";
import { shelf, getDeck } from "../../../../src/decks/index.js";

export function generateStaticParams() {
  const params = [];
  for (const deck of shelf.decks) {
    for (const chapter of deck.chapters) {
      for (let i = 0; i < chapter.slides.length; i++) {
        params.push({ deck: deck.id, chapter: chapter.id, slide: String(i) });
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
  const idx = Number.parseInt(params.slide, 10);
  if (!Number.isFinite(idx) || idx < 0 || idx >= chapter.slides.length) return null;
  return { deck, chapter, slide: chapter.slides[idx], idx };
}

export async function generateMetadata({ params }) {
  const hit = resolve(await params);
  if (!hit) return { title: "Not found — Eclipsai" };
  const { deck, chapter, slide } = hit;
  // Custom slides (marketplace explainer + directory) have no title of their
  // own — fall back to the chapter label so OG previews stay meaningful.
  const slideLabel = slide.title || chapter.title;
  return {
    title: `${slideLabel} — ${deck.title} — Eclipsai`,
    description: chapter.subtitle || deck.title,
  };
}

export default async function SlideDeepLinkPage({ params }) {
  const hit = resolve(await params);
  if (!hit) notFound();
  return (
    <App
      initialView="slides"
      initialDeckId={hit.deck.id}
      initialChapterId={hit.chapter.id}
      initialSlideIdx={hit.idx}
    />
  );
}
