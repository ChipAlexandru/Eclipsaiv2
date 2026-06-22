// Root route "/" — now the retail-focused homepage. It renders the same shared
// RetailHome component as /retail (one source of truth, see src/views/RetailHome.jsx).
// The previous/general movie homepage is preserved unchanged at /general
// (app/general/page.jsx, rendering src/views/MovieHome.jsx). Production <head>
// essentials live here (title, description, canonical, OG/Twitter) and in
// app/layout.jsx (favicon via app/icon.svg, theme-color, JSON-LD, analytics).
import { RetailHome } from "../src/views/RetailHome.jsx";

const TITLE =
  "Eclipsai — Turn the weekly retail performance pack into owner-ready actions";
const DESCRIPTION =
  "Eclipsai builds company-specific AI workflows that turn the weekly retail performance pack into owner-ready actions — analyzing your sources, applying your checks, and naming the owner, question, and deadline for each one.";

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
  return <RetailHome />;
}
