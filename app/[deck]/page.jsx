// /[deck] — deck cover page. E.g. /ai-transformation.
// Server wrapper: generateStaticParams pre-renders all deck covers at build
// time, generateMetadata gives each deck its own title. The actual rendering
// reuses the App shell with initialView="cover".
import { notFound } from "next/navigation";
import App from "../../src/App.jsx";
import { shelf, getDeck } from "../../src/decks/index.js";

export function generateStaticParams() {
  return shelf.decks.map((d) => ({ deck: d.id }));
}

export function generateMetadata({ params }) {
  const deck = getDeck(params.deck);
  if (!deck) return { title: "Not found — Eclipsai" };
  return {
    title: `${deck.title} — Eclipsai`,
    description: deck.chapters[0]?.subtitle || "Strategy consulting for AI transformation.",
  };
}

export default function DeckCoverPage({ params }) {
  const deck = getDeck(params.deck);
  if (!deck) notFound();
  return <App initialView="cover" initialDeckId={deck.id} />;
}
