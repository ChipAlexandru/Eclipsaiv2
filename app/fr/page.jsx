// /fr — the fresh-food homepage in French (European/Swiss French).
// Shares src/views/FreshFoodHome.jsx with "/" and the other locales; content
// comes from the validated freshFoodContent.fr.js dictionary.
import { FreshFoodHome } from "../../src/views/FreshFoodHome.jsx";
import { getContent } from "../../src/views/fresh-food/locales.js";
import { buildFreshFoodMetadata, freshFoodViewport } from "../../src/views/fresh-food/metadata.js";

export const metadata = buildFreshFoodMetadata("fr");
export const viewport = freshFoodViewport;

export default function FrenchHomePage() {
  return <FreshFoodHome content={getContent("fr")} />;
}
