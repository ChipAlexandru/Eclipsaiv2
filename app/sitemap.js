// sitemap.xml — auto-generated from shelf + skills data at build time.
// Next.js 15 App Router convention: this file exports a default function
// that returns the sitemap entries; Next serves it at /sitemap.xml.
import { shelf } from "../src/decks/index.js";
import { getAllSlugs } from "../src/marketplace/data.js";

const SITE_URL = "https://eclipsai.com";

export default function sitemap() {
  const now = new Date();

  const staticEntries = [
    { url: `${SITE_URL}/`,       changeFrequency: "monthly", priority: 1.0, lastModified: now },
    { url: `${SITE_URL}/about`,  changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${SITE_URL}/skills`, changeFrequency: "weekly",  priority: 0.9, lastModified: now },
  ];

  const deckEntries = [];
  for (const deck of shelf.decks) {
    deckEntries.push({
      url: `${SITE_URL}/${deck.id}`,
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: now,
    });
    for (const chapter of deck.chapters) {
      for (const slide of chapter.slides) {
        deckEntries.push({
          url: `${SITE_URL}/${deck.id}/${chapter.id}/${slide.id}`,
          changeFrequency: "monthly",
          priority: 0.6,
          lastModified: now,
        });
      }
    }
  }

  const skillEntries = getAllSlugs().map((slug) => ({
    url: `${SITE_URL}/skills/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: now,
  }));

  return [...staticEntries, ...deckEntries, ...skillEntries];
}
