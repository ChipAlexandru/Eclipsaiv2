// /it — the fresh-food homepage in Italian.
// Shares src/views/FreshFoodHome.jsx with "/" and the other locales; content
// comes from the validated freshFoodContent.it.js dictionary.
import { FreshFoodHome } from "../../src/views/FreshFoodHome.jsx";
import { getContent } from "../../src/views/fresh-food/locales.js";
import { buildFreshFoodMetadata, freshFoodViewport } from "../../src/views/fresh-food/metadata.js";

export const metadata = buildFreshFoodMetadata("it");
export const viewport = freshFoodViewport;

export default function ItalianHomePage() {
  return <FreshFoodHome content={getContent("it")} />;
}
