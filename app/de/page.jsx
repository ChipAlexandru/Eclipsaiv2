// /de — the fresh-food homepage in German (Swiss-compatible Standard German).
// Shares src/views/FreshFoodHome.jsx with "/" and the other locales; content
// comes from the validated freshFoodContent.de.js dictionary.
import { FreshFoodHome } from "../../src/views/FreshFoodHome.jsx";
import { getContent } from "../../src/views/fresh-food/locales.js";
import { buildFreshFoodMetadata, freshFoodViewport } from "../../src/views/fresh-food/metadata.js";

export const metadata = buildFreshFoodMetadata("de");
export const viewport = freshFoodViewport;

export default function GermanHomePage() {
  return <FreshFoodHome content={getContent("de")} />;
}
