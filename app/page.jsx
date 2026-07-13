// Root route "/" — the approved fresh-food homepage ("The profit brain for
// fresh food"), English locale. One shared implementation
// (src/views/FreshFoodHome.jsx) renders every locale from a validated content
// dictionary; the translated routes live at /de, /fr, /it and /ro.
//
// The previous homepages are preserved at explicit routes:
//   /general — ProductHome (generic "one deliverable, then a workflow that stays")
//   /finance — MovieHome (finance/treasury-led cinematic version)
//   /retail  — RetailHome (retail commercial-performance version)
import { FreshFoodHome } from "../src/views/FreshFoodHome.jsx";
import { getContent } from "../src/views/fresh-food/locales.js";
import { buildFreshFoodMetadata, freshFoodViewport } from "../src/views/fresh-food/metadata.js";

export const metadata = buildFreshFoodMetadata("en");
export const viewport = freshFoodViewport;

export default function HomePage() {
  return <FreshFoodHome content={getContent("en")} />;
}
