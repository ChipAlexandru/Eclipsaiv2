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
import { resolveSlideSub } from "../../../_og/sub.js";

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
  const idx = chapter.slides.findIndex((s) => s.id === params.slide);
  if (idx < 0) return null;
  return { deck, chapter, slide: chapter.slides[idx], idx };
}

export async function generateMetadata({ params }) {
  const hit = resolve(await params);
  if (!hit) return { title: "Not found — Eclipsai" };
  const { deck, chapter, slide } = hit;
  // Custom slides (marketplace explainer + directory) have no title of their
  // own — fall back to the chapter label so OG previews stay meaningful.
  const slideLabel = slide.title || chapter.title;
  // The browser <title> keeps the long form for clarity; the LinkedIn/Slack
  // OG card uses the slide title alone (brand is implied by the eclipsai.com
  // domain row that those previews render automatically).
  const sub = resolveSlideSub(slide, chapter);
  return {
    title: `${slideLabel} — ${deck.title} — Eclipsai`,
    description: sub,
    openGraph: {
      title: slideLabel,
      description: sub,
    },
    twitter: {
      title: slideLabel,
      description: sub,
    },
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
      initialSlideId={hit.slide.id}
    />
  );
}
