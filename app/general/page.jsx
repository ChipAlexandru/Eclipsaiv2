// /general — the generic "one deliverable, then a workflow that stays"
// homepage. Renders the existing ProductHome component (the eight-section
// product scroll deck) unchanged. The cinematic MovieHome that previously
// rendered here now lives at /finance, and the root route carries the
// fresh-food homepage (app/page.jsx → src/views/FreshFoodHome.jsx).
import { ProductHome } from "../../src/views/ProductHome.jsx";

const TITLE = "Eclipsai — One deliverable, then a workflow that stays";
const DESCRIPTION =
  "Eclipsai turns the AI tools your team already uses into recurring work you can trust: one deliverable, proven against your standard, then a workflow that stays.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
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

// ProductHome opens on the cream product deck, matching the app-shell default.
export const viewport = {
  themeColor: "#F8F4EE",
};

export default function GeneralHomePage() {
  return <ProductHome />;
}
