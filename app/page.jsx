// Root route / — the 8-scene Eclipsai movie homepage (managed AI workflows),
// ported faithfully from the approved prototype. The previous product-deck home
// is backed up under _archive/homepage-2026-06-15/ and its component
// (src/views/ProductHome.jsx) is retained. Production <head> essentials live
// here (title, description, canonical, OG/Twitter) and in app/layout.jsx
// (favicon via app/icon.svg, theme-color, JSON-LD, analytics).
import { MovieHome } from "../src/views/MovieHome.jsx";

const TITLE = "Eclipsai — Managed AI workflows for recurring work";
const DESCRIPTION =
  "Some work should not be done by hand — it should simply be ready. Eclipsai turns the AI tools your team already uses into a recurring deliverable, proven against your standard, then a workflow that stays.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://eclipsai.com",
    siteName: "Eclipsai",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// The homepage opens on the dark hero photo, so the mobile browser chrome
// should be dark here (other routes default to cream in app/layout.jsx).
export const viewport = {
  themeColor: "#1c1413",
};

export default function HomePage() {
  return <MovieHome />;
}
