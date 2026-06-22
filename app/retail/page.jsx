// /retail — the retail-focused homepage. Renders the shared RetailHome
// component (also used by "/") so the two routes never drift. Its own canonical
// points at /retail.
import { RetailHome } from "../../src/views/RetailHome.jsx";

const TITLE =
  "Eclipsai for retail — Commercial performance action workflows";
const DESCRIPTION =
  "Eclipsai builds company-specific AI workflows that turn the weekly retail performance pack into owner-ready actions — for commercial, category, and store operations teams across multi-site retail.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/retail" },
  openGraph: {
    type: "website",
    url: "https://eclipsai.com/retail",
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

// Opens on the dark hero photo, so the mobile browser chrome should be dark.
export const viewport = {
  themeColor: "#1c1413",
};

export default function RetailPage() {
  return <RetailHome />;
}
