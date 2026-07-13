// /finance — the finance/treasury-led cinematic homepage. Renders the same
// MovieHome component that previously served "/" (and then "/general"),
// unchanged. The root route now carries the fresh-food homepage
// (app/page.jsx → src/views/FreshFoodHome.jsx).
import { MovieHome } from "../../src/views/MovieHome.jsx";

const TITLE = "Eclipsai for finance — Managed AI workflows for recurring work";
const DESCRIPTION =
  "Eclipsai builds company-specific AI skills that support commercial, financial, and operational decisions by analyzing company data, preparing recommendations, and proposing next steps.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/finance" },
  openGraph: {
    type: "website",
    url: "https://eclipsai.com/finance",
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

export default function FinanceHomePage() {
  return <MovieHome />;
}
