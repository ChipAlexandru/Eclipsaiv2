// /general — preserves the previous/general Eclipsai homepage exactly as it was
// before the retail version took over "/". This renders the same MovieHome
// component the root route used to render; nothing about it changed. The retail
// homepage now lives at "/" and "/retail" (see app/page.jsx, app/retail/page.jsx).
import { MovieHome } from "../../src/views/MovieHome.jsx";

const TITLE = "Eclipsai — Managed AI workflows for recurring work";
const DESCRIPTION =
  "Eclipsai builds company-specific AI skills that support commercial, financial, and operational decisions by analyzing company data, preparing recommendations, and proposing next steps.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Relative canonical resolves against metadataBase (https://eclipsai.com) so
  // it stays consistent with the rest of the site's non-www convention.
  alternates: { canonical: "/general" },
  openGraph: {
    type: "website",
    url: "https://eclipsai.com/general",
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

export default function GeneralHomePage() {
  return <MovieHome />;
}
