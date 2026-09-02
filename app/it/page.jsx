// /it — the fresh-food homepage in Italian.
// Shares the current fresh-food homepage with "/" and the other locales; content
// comes from the validated freshFoodContent.it.js dictionary.
import { FreshFoodHomepage } from "../../src/views/homepage-demo/HomepageDemo.jsx";
import { getContent } from "../../src/views/fresh-food/locales.js";
import { buildFreshFoodMetadata, freshFoodViewport } from "../../src/views/fresh-food/metadata.js";

export const metadata = buildFreshFoodMetadata("it");
export const viewport = freshFoodViewport;

export default function ItalianHomePage() {
  return <FreshFoodHomepage content={getContent("it")} />;
}
