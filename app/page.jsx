// Root route / — the Eclipsai product home page. A self-contained client
// component (vertical scroll-snap deck) ported from the finished mockup.
// Default metadata for this route is set in app/layout.jsx; the legacy
// playbook/insights experience now lives at /insights (app/insights/page.jsx).
import { ProductHome } from "../src/views/ProductHome.jsx";

export default function HomePage() {
  return <ProductHome />;
}
