// Root route "/" — the approved fresh-food homepage ("The profit brain for
// fresh food"), ported natively from the standalone Eclipse & Signal reference
// (index-eclipse-ledger.html, 2026-07-13) in src/views/FreshFoodHome.jsx.
//
// The previous homepages are preserved at explicit routes:
//   /general — ProductHome (generic "one deliverable, then a workflow that stays")
//   /finance — MovieHome (finance/treasury-led cinematic version)
//   /retail  — RetailHome (retail commercial-performance version)
import { FreshFoodHome } from "../src/views/FreshFoodHome.jsx";

const TITLE = "Eclipsai | The profit brain for fresh food";
const DESCRIPTION =
  "Eclipsai helps growing fresh-food operators decide what to make tomorrow, reduce waste and measure each change in cash.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://eclipsai.com",
    siteName: "Eclipsai",
    title: TITLE,
    description: "Know what to make tomorrow. Waste less. Sell more.",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "Know what to make tomorrow. Waste less. Sell more.",
  },
};

// The homepage opens on the eclipse-ink hero, so the mobile browser chrome
// should be ink here (other routes default to cream in app/layout.jsx).
export const viewport = {
  themeColor: "#19171F",
};

export default function HomePage() {
  return <FreshFoodHome />;
}
